// -------------------------------------------------------------
// 2-SESSION FLIGHT PATH, BIOMETRIC TELEMETRY & CARDIO ENGINE
// Modular Engine: docs/js/engine/flightPath.js
// -------------------------------------------------------------
import { STAGES } from '../data/stages.js';
import { CARDIO_CONFIGS } from '../data/cardioConfigs.js';
import { getExerciseMuscleTags } from './slotRotator.js';

const DEDICATED_CARDIO_DAYS = ['DAY_G', 'DAY_H', 'DAY_I'];
const LIFTING_STAGES = ['DAY_A', 'DAY_B', 'DAY_C', 'DAY_D', 'DAY_E', 'DAY_F'];

/**
 * Helper: Extracts normalized muscle tags from a historical session record
 */
function getSessionMuscleTags(sessionObj) {
  const tags = [];
  if (Array.isArray(sessionObj?.sets) && sessionObj.sets.length > 0) {
    const seenExercises = new Set();
    for (const s of sessionObj.sets) {
      if (s.exercise && !seenExercises.has(s.exercise)) {
        seenExercises.add(s.exercise);
        tags.push(...getExerciseMuscleTags(s.exercise));
      }
    }
  } else if (sessionObj?.stage && STAGES[sessionObj.stage]?.slots) {
    for (const slot of STAGES[sessionObj.stage].slots) {
      tags.push(...getExerciseMuscleTags(slot.primary));
    }
  }
  return tags;
}

export function computeBodyCompDeltas(biometricsHistory = []) {
  const validScans = [...biometricsHistory]
    .filter(b => Number(b.weightLbs) > 0 && Number(b.bodyFatPct) > 0)
    .sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0))
    .map(b => {
      const weight = Number(b.weightLbs);
      const bfPct = Number(b.bodyFatPct);
      const fatMass = Number((weight * (bfPct / 100)).toFixed(1));
      const leanMass = Number((weight - fatMass).toFixed(1));
      return { ...b, weight, bfPct, fatMass, leanMass };
    });

  if (validScans.length === 0) return null;

  const current = validScans[0];
  const previous = validScans[1] || null;
  const baseline = validScans[validScans.length - 1];

  return {
    current,
    vsPrevious: previous ? {
      deltaWeight: Number((current.weight - previous.weight).toFixed(1)),
      deltaBfPct: Number((current.bfPct - previous.bfPct).toFixed(2)),
      deltaFatMass: Number((current.fatMass - previous.fatMass).toFixed(1)),
      deltaLeanMass: Number((current.leanMass - previous.leanMass).toFixed(1))
    } : null,
    vsBaseline: validScans.length > 1 ? {
      deltaWeight: Number((current.weight - baseline.weight).toFixed(1)),
      deltaBfPct: Number((current.bfPct - baseline.bfPct).toFixed(2)),
      deltaFatMass: Number((current.fatMass - baseline.fatMass).toFixed(1)),
      deltaLeanMass: Number((current.leanMass - baseline.leanMass).toFixed(1))
    } : null
  };
}

/**
 * Evaluates Galaxy Watch8 / Health Connect biometric trends over the last 7 days
 */
export function evaluateBiometricStatus(biometricsHistory = []) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const recentBio = biometricsHistory
    .filter(b => {
      const d = new Date(b.timestamp || b.date);
      return !isNaN(d) && d >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));

  const latest = recentBio[0] || null;
  const weeklyWatchCardioMins = recentBio.reduce((sum, b) => sum + (Number(b.cardioMins) || 0), 0);
  const bodyComp = computeBodyCompDeltas(biometricsHistory);

  let recoveryWarning = null;
  if (latest) {
    const sleep = Number(latest.sleepHrs) || 0;
    const spo2 = Number(latest.spo2Pct) || 0;

    if (sleep > 0 && sleep < 6.0) {
      recoveryWarning = `Low Sleep (${sleep}h) — Recovery Deload Recommended`;
    } else if (spo2 > 0 && spo2 < 94) {
      recoveryWarning = `Low SpO2 (${spo2}%) — Recovery Deload Recommended`;
    }
  }

  return {
    latest,
    weeklyWatchCardioMins,
    hasWatchCardio: weeklyWatchCardioMins >= 15,
    recoveryWarning,
    bodyComp
  };
}

/**
 * Evaluates whether at least one cardio sortie (Days G/H/I, cardio finisher, or Watch8 workout)
 * was completed within the rolling 7-day training window.
 */
export function evaluateWeeklyCardioStatus(sessionHistory = [], biometricsHistory = []) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const recentSessions = sessionHistory.filter(s => {
    const rawDate = s.timestamp || s.date || s.Timestamp;
    if (!rawDate) return false;
    const sessionDate = new Date(rawDate);
    return !isNaN(sessionDate) && sessionDate >= sevenDaysAgo;
  });

  const hasDedicatedCardio = recentSessions.some(s => {
    const stage = (s.stage || s.Stage || '').toUpperCase();
    return DEDICATED_CARDIO_DAYS.includes(stage);
  });

  const hasCardioFinisher = recentSessions.some(s => {
    if (!Array.isArray(s.sets)) return false;
    return s.sets.some(set => CARDIO_CONFIGS[set.exercise] !== undefined);
  });

  const bioStatus = evaluateBiometricStatus(biometricsHistory);
  const cardioFulfilled = hasDedicatedCardio || hasCardioFinisher || bioStatus.hasWatchCardio;

  const daysSinceMonday = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const isUrgent = !cardioFulfilled && daysSinceMonday >= 3; // Escalates starting Thursday

  return {
    cardioFulfilled,
    hasDedicatedCardio,
    hasCardioFinisher,
    hasWatchCardio: bioStatus.hasWatchCardio,
    weeklyWatchCardioMins: bioStatus.weeklyWatchCardioMins,
    isUrgent,
    sessionsInWindow: recentSessions.length
  };
}

/**
 * Recommends the next sortie by analyzing:
 * 1. Weekly Cardio Guarantee (PWA sessions + Watch8 ExerciseSessionRecord)
 * 2. Joint Strain OR Watch8 Sleep/SpO2 Recovery Warning -> elevates Day F
 * 3. 2-Session Cumulative Muscle Freshness (lowest fatigue overlap wins)
 */
export function determineFlightPath(lastStages = [], sessionHistory = [], biometricsHistory = []) {
  const cardioStatus = evaluateWeeklyCardioStatus(sessionHistory, biometricsHistory);
  const bioStatus = evaluateBiometricStatus(biometricsHistory);

  // Normalize last 2 sessions (newest first)
  const sortedHistory = [...sessionHistory].sort(
    (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
  );
  const lastTwoSessions = sortedHistory.slice(0, 2);

  const recentStageIds = [];
  for (const s of lastTwoSessions) {
    const stg = (s.stage || s.Stage || '').toUpperCase();
    if (stg && !recentStageIds.includes(stg)) recentStageIds.push(stg);
  }
  for (const stg of lastStages) {
    const clean = (stg || '').toUpperCase();
    if (clean && !recentStageIds.includes(clean)) recentStageIds.push(clean);
  }
  const lastTwoStageIds = recentStageIds.slice(0, 2);

  // 1. Weekly Cardio Guarantee Override (Mid-to-late week if unfulfilled)
  if (!cardioStatus.cardioFulfilled && cardioStatus.isUrgent) {
    const nextCardio = DEDICATED_CARDIO_DAYS.find(c => !lastTwoStageIds.includes(c)) || 'DAY_G';
    return {
      recommendedStage: nextCardio,
      reason: "Weekly Cardio Guarantee (0 conditioning sorties in 7 days)",
      isCardioOverride: true,
      canPairFinisher: true,
      analyzedSessions: lastTwoSessions.length
    };
  }

  // 2. Joint Strain OR Biometric Sleep/SpO2 Recovery Override -> Day F (Deload)
  const hadRecentStrain =
    lastTwoSessions.some(s => s.jointPain === true || s.jointPain === 'true') ||
    localStorage.getItem('sonic_last_strain') === 'true';

  if ((hadRecentStrain || bioStatus.recoveryWarning) && !lastTwoStageIds.includes('DAY_F') && STAGES.DAY_F) {
    return {
      recommendedStage: 'DAY_F',
      reason: hadRecentStrain
        ? "Joint Shield Recovery — Active Deload after recent strain flag"
        : bioStatus.recoveryWarning,
      isCardioOverride: false,
      canPairFinisher: !cardioStatus.cardioFulfilled,
      analyzedSessions: lastTwoSessions.length
    };
  }

  // 3. 2-Session Cumulative Muscle-Freshness Scoring
  const fatigueWeights = {};
  if (lastTwoSessions.length > 0) {
    lastTwoSessions.forEach((sess, idx) => {
      const weight = idx === 0 ? 1.5 : 1.0;
      const tags = getSessionMuscleTags(sess);
      tags.forEach(tag => {
        if (tag !== 'general') {
          fatigueWeights[tag] = (fatigueWeights[tag] || 0) + weight;
        }
      });
    });
  } else {
    lastTwoStageIds.forEach((stgId, idx) => {
      const weight = idx === 0 ? 1.5 : 1.0;
      const tags = getSessionMuscleTags({ stage: stgId });
      tags.forEach(tag => {
        if (tag !== 'general') {
          fatigueWeights[tag] = (fatigueWeights[tag] || 0) + weight;
        }
      });
    });
  }

  const candidateStages = LIFTING_STAGES.filter(
    stg => STAGES[stg] && !lastTwoStageIds.includes(stg)
  );
  const pool = candidateStages.length > 0 ? candidateStages : LIFTING_STAGES.filter(s => STAGES[s]);

  let bestStage = pool[0] || 'DAY_A';
  let lowestFatigueScore = Infinity;

  pool.forEach(stgId => {
    const stageTags = getSessionMuscleTags({ stage: stgId });
    let overlap = 0;
    stageTags.forEach(tag => {
      if (fatigueWeights[tag]) {
        overlap += fatigueWeights[tag];
      }
    });

    const slotCount = STAGES[stgId]?.slots?.length || 4;
    const normalizedOverlap = overlap / slotCount;

    if (normalizedOverlap < lowestFatigueScore) {
      lowestFatigueScore = normalizedOverlap;
      bestStage = stgId;
    }
  });

  const topFatiguedMuscles = Object.entries(fatigueWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([muscle]) => muscle.replace('_', ' '));

  let reasonText = topFatiguedMuscles.length > 0
    ? `2-Session Freshness Pick (Spares ${topFatiguedMuscles.join(' & ')})`
    : "2-Session Freshness Rotation";

  if (bioStatus.hasWatchCardio) {
    reasonText += ` • Watch Cardio ✓ (${bioStatus.weeklyWatchCardioMins}m)`;
  }

  return {
    recommendedStage: bestStage,
    reason: reasonText,
    isCardioOverride: false,
    canPairFinisher: !cardioStatus.cardioFulfilled,
    analyzedSessions: Math.max(lastTwoSessions.length, lastTwoStageIds.length)
  };
}

/**
 * Renders the compact briefing card directly into #flightPathMount above stage tabs
 */
export function checkAndRenderFlightPathPrompt(activeSession, onSelectStage) {
  const mount = document.getElementById('flightPathMount');
  if (!mount) return;

  let history = [];
  try { history = JSON.parse(localStorage.getItem('sonic_session_history')) || []; } catch (e) {}

  let biometrics = [];
  try { biometrics = JSON.parse(localStorage.getItem('sonic_biometrics_history')) || []; } catch (e) {}

  const lastStage = localStorage.getItem('sonic_last_stage') || 'DAY_A';
  const flight = determineFlightPath([lastStage], history, biometrics);

  mount.innerHTML = `
    <div class="flight-path-card ${flight.isCardioOverride ? 'is-mandate' : ''}">
      <div class="flight-path-info">
        <div class="flight-path-tag">${flight.isCardioOverride ? '🚨 CARDIO MANDATE' : '🧭 FLIGHT PATH RECOMMENDATION'}</div>
        <div class="flight-path-text">
          <b>${flight.recommendedStage.replace('_', ' ')}</b> <span>— ${flight.reason}</span>
        </div>
      </div>
      <button id="acceptFlightPathBtn" class="btn-engage-flight" type="button">ENGAGE</button>
    </div>
  `;

  const btn = document.getElementById('acceptFlightPathBtn');
  if (btn) {
    btn.onclick = () => {
      if (typeof onSelectStage === 'function') {
        onSelectStage(flight.recommendedStage);
      }
      mount.innerHTML = '';
    };
  }
}
