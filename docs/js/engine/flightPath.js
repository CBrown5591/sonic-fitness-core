// -------------------------------------------------------------
// 2-SESSION FLIGHT PATH & CUMULATIVE FRESHNESS ENGINE (TSK-13)
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
    // Fallback to stage primary movements if historical row only stored stage ID
    for (const slot of STAGES[sessionObj.stage].slots) {
      tags.push(...getExerciseMuscleTags(slot.primary));
    }
  }
  return tags;
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
 * Recommends the next sortie by analyzing the LAST 2 SESSIONS:
 * 1. Enforces Weekly Cardio Guarantee if urgent.
 * 2. Checks for recent Joint Strain -> elevates Day F (Deload) if fresh.
 * 3. Scores remaining stages by 2-Session Cumulative Muscle Freshness (lowest overlap wins).
 */
export function determineFlightPath(lastStages = [], sessionHistory = []) {
  const cardioStatus = evaluateWeeklyCardioStatus(sessionHistory);

  // Normalize last 2 sessions (newest first)
  const sortedHistory = [...sessionHistory].sort(
    (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
  );
  const lastTwoSessions = sortedHistory.slice(0, 2);

  // Build ordered list of last 2 stage IDs (merging history + fallback localStorage stages)
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

  // 2. Joint Strain Recovery Check across the last 2 sorties
  const hadRecentStrain =
    lastTwoSessions.some(s => s.jointPain === true || s.jointPain === 'true') ||
    localStorage.getItem('sonic_last_strain') === 'true';

  if (hadRecentStrain && !lastTwoStageIds.includes('DAY_F') && STAGES.DAY_F) {
    return {
      recommendedStage: 'DAY_F',
      reason: "Joint Shield Recovery — Active Deload after recent strain flag",
      isCardioOverride: false,
      canPairFinisher: !cardioStatus.cardioFulfilled,
      analyzedSessions: lastTwoSessions.length
    };
  }

  // 3. 2-Session Cumulative Muscle-Freshness Scoring (Fresh Mode cross-session extension)
  const fatigueWeights = {};
  if (lastTwoSessions.length > 0) {
    lastTwoSessions.forEach((sess, idx) => {
      const weight = idx === 0 ? 1.5 : 1.0; // Most recent session carries 1.5x fatigue weight
      const tags = getSessionMuscleTags(sess);
      tags.forEach(tag => {
        if (tag !== 'general') {
          fatigueWeights[tag] = (fatigueWeights[tag] || 0) + weight;
        }
      });
    });
  } else {
    // Fallback if history array is empty: infer from lastTwoStageIds primary slots
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

  // Filter out the last 2 stages played so we never ping-pong back-to-back
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

    // Normalize by number of slots in the stage so 4-slot and 3-slot stages compare fairly
    const slotCount = STAGES[stgId]?.slots?.length || 4;
    const normalizedOverlap = overlap / slotCount;

    if (normalizedOverlap < lowestFatigueScore) {
      lowestFatigueScore = normalizedOverlap;
      bestStage = stgId;
    }
  });

  // Format human-readable reason citing the top fatigued muscles avoided
  const topFatiguedMuscles = Object.entries(fatigueWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([muscle]) => muscle.replace('_', ' '));

  const reasonText =
    topFatiguedMuscles.length > 0
      ? `2-Session Freshness Pick (Spares ${topFatiguedMuscles.join(' & ')})`
      : "2-Session Freshness Rotation";

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

  const rawHistory = localStorage.getItem('sonic_session_history');
  let history = [];
  try { history = JSON.parse(rawHistory) || []; } catch (e) {}

  const lastStage = localStorage.getItem('sonic_last_stage') || 'DAY_A';
  const flight = determineFlightPath([lastStage], history);

  mount.innerHTML = `
    <div class="flight-path-card ${flight.isCardioOverride ? 'is-mandate' : ''}">
      <div class="flight-path-info">
        <div class="flight-path-tag">${flight.isCardioOverride ? '🚨 CARDIO MANDATE' : '🧭 2-SESSION FLIGHT PATH'}</div>
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
