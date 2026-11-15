// -------------------------------------------------------------
// 2-SESSION FLIGHT PATH, BIOMETRIC RECOVERY & BP ENGINE
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

/**
 * Extracts the latest non-zero biometric signals (Sleep, SpO2, BP, Scale)
 */
function getLatestBiometricSignals() {
  let bioHistory = [];
  try {
    bioHistory = JSON.parse(localStorage.getItem('sonic_biometrics_history') || '[]');
  } catch (e) {
    bioHistory = [];
  }
  if (!Array.isArray(bioHistory) || bioHistory.length === 0) return null;

  const sorted = [...bioHistory].sort(
    (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
  );

  const nowMs = Date.now();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  // 1. Latest Blood Pressure within last 48 hours
  let latestBp = null;
  for (const row of sorted) {
    const bpRaw = String(row.bp || '').trim();
    if (bpRaw && bpRaw.includes('/')) {
      const [sysStr, diaStr] = bpRaw.split('/');
      const sys = parseInt(sysStr, 10);
      const dia = parseInt(diaStr, 10);
      const ts = new Date(row.timestamp || row.date || 0).getTime();
      if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
        const isRecent = !isNaN(ts) && (nowMs - ts) <= fortyEightHoursMs;
        latestBp = { sys, dia, raw: `${sys}/${dia}`, isRecent };
        break;
      }
    }
  }

  // 2. Latest Sleep & SpO2 within last 48 hours
  const latestSleepRow = sorted.find(r => Number(r.sleepHrs) > 0);
  const latestSpo2Row = sorted.find(r => Number(r.spo2Pct) > 0);

  let recentSleepHrs = null;
  if (latestSleepRow) {
    const ts = new Date(latestSleepRow.timestamp || latestSleepRow.date || 0).getTime();
    if (!isNaN(ts) && (nowMs - ts) <= fortyEightHoursMs) {
      recentSleepHrs = Number(latestSleepRow.sleepHrs);
    }
  }

  let recentSpo2Pct = null;
  if (latestSpo2Row) {
    const ts = new Date(latestSpo2Row.timestamp || latestSpo2Row.date || 0).getTime();
    if (!isNaN(ts) && (nowMs - ts) <= fortyEightHoursMs) {
      recentSpo2Pct = Number(latestSpo2Row.spo2Pct);
    }
  }

  return { latestBp, recentSleepHrs, recentSpo2Pct };
}

/**
 * Evaluates whether at least one cardio sortie (Days G/H/I or cardio finisher)
 * was completed within the rolling 7-day training window.
 */
export function evaluateWeeklyCardioStatus(sessionHistory = []) {
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

  const cardioFulfilled = hasDedicatedCardio || hasCardioFinisher;
  const daysSinceMonday = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const isUrgent = !cardioFulfilled && daysSinceMonday >= 3; // Escalates starting Thursday

  return {
    cardioFulfilled,
    hasDedicatedCardio,
    hasCardioFinisher,
    isUrgent,
    sessionsInWindow: recentSessions.length
  };
}

/**
 * Recommends the next sortie using Biometrics (BP, Sleep, SpO2),
 * Weekly Cardio Guarantee, Joint Strain, and 2-Session Muscle Freshness.
 */
export function determineFlightPath(lastStages = [], sessionHistory = []) {
  const cardioStatus = evaluateWeeklyCardioStatus(sessionHistory);
  const bioSignals = getLatestBiometricSignals();

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

  // 1. HIGH BLOOD PRESSURE OVERRIDE (Tier 1: >= 160/100 within 48h)
  let bpElevatesZone2 = false;
  if (bioSignals?.latestBp?.isRecent) {
    const { sys, dia, raw } = bioSignals.latestBp;
    if (sys >= 160 || dia >= 100) {
      const targetStage = !lastTwoStageIds.includes('DAY_F') && STAGES.DAY_F ? 'DAY_F' : 'DAY_G';
      return {
        recommendedStage: targetStage,
        reason: `BP Alert (${raw} mmHg) — Pause heavy straining; favor ${targetStage === 'DAY_F' ? 'Day F Recovery' : 'Zone 2 Aerobic Base'}`,
        isCardioOverride: true,
        isBiometricAlert: true,
        canPairFinisher: true,
        analyzedSessions: lastTwoSessions.length
      };
    }
    if (sys >= 135 || dia >= 85) {
      bpElevatesZone2 = true;
    }
  }

  // 2. SLEEP / SpO2 / JOINT STRAIN DELOAD OVERRIDE
  const lowSleep = bioSignals?.recentSleepHrs !== null && bioSignals?.recentSleepHrs < 5.5;
  const lowSpo2 = bioSignals?.recentSpo2Pct !== null && bioSignals?.recentSpo2Pct < 93;
  const hadRecentStrain =
    lastTwoSessions.some(s => s.jointPain === true || s.jointPain === 'true') ||
    localStorage.getItem('sonic_last_strain') === 'true';

  if ((lowSleep || lowSpo2 || hadRecentStrain) && !lastTwoStageIds.includes('DAY_F') && STAGES.DAY_F) {
    let deloadReason = "Joint Shield Recovery — Active Deload after recent strain flag";
    if (lowSleep) deloadReason = `Recovery Deload — Low sleep logged (${bioSignals.recentSleepHrs} hrs)`;
    else if (lowSpo2) deloadReason = `Recovery Deload — Low SpO2 logged (${bioSignals.recentSpo2Pct}%)`;

    return {
      recommendedStage: 'DAY_F',
      reason: deloadReason,
      isCardioOverride: false,
      isBiometricAlert: lowSleep || lowSpo2,
      canPairFinisher: !cardioStatus.cardioFulfilled || bpElevatesZone2,
      analyzedSessions: lastTwoSessions.length
    };
  }

  // 3. WEEKLY CARDIO GUARANTEE OVERRIDE (Mid-to-late week if unfulfilled)
  if (!cardioStatus.cardioFulfilled && cardioStatus.isUrgent) {
    const nextCardio = DEDICATED_CARDIO_DAYS.find(c => !lastTwoStageIds.includes(c)) || 'DAY_G';
    return {
      recommendedStage: nextCardio,
      reason: "Weekly Cardio Guarantee (0 conditioning sorties in 7 days)",
      isCardioOverride: true,
      isBiometricAlert: false,
      canPairFinisher: true,
      analyzedSessions: lastTwoSessions.length
    };
  }

  // 4. 2-SESSION CUMULATIVE MUSCLE-FRESHNESS SCORING
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

  let reasonText =
    topFatiguedMuscles.length > 0
      ? `2-Session Freshness Pick (Spares ${topFatiguedMuscles.join(' & ')})`
      : "2-Session Freshness Rotation";

  if (bpElevatesZone2) {
    reasonText += ` • Elevated BP (${bioSignals.latestBp.raw}) — Zone 2 Finisher Advised`;
  }

  return {
    recommendedStage: bestStage,
    reason: reasonText,
    isCardioOverride: false,
    isBiometricAlert: bpElevatesZone2,
    canPairFinisher: !cardioStatus.cardioFulfilled || bpElevatesZone2,
    analyzedSessions: Math.max(lastTwoSessions.length, lastTwoStageIds.length)
  };
}

/**
 * Renders the compact briefing card directly into #flightPathMount above stage tabs
 */
export function checkAndRenderFlightPathPrompt(activeSession, onSelectStage) {
  const mount = document.getElementById('flightPathMount');
  if (!mount) return;

  const rawHistory = localStorage.getItem('sonic_session_history');
  let history = [];
  try { history = JSON.parse(rawHistory) || []; } catch (e) {}

  const lastStage = localStorage.getItem('sonic_last_stage') || 'DAY_A';
  const flight = determineFlightPath([lastStage], history);

  const badgeLabel = flight.isBiometricAlert
    ? '🩺 BIOMETRIC FLIGHT ALERT'
    : (flight.isCardioOverride ? '🚨 CARDIO MANDATE' : '🧭 2-SESSION FLIGHT PATH');

  mount.innerHTML = `
    <div class="flight-path-card ${flight.isCardioOverride || flight.isBiometricAlert ? 'is-mandate' : ''}">
      <div class="flight-path-info">
        <div class="flight-path-tag">${badgeLabel}</div>
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
