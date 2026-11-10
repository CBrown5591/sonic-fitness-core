// -------------------------------------------------------------
// FLIGHT PATH INTELLIGENCE & WEEKLY CONDITIONING ENGINE
// Modular Engine: flightPath.js
// -------------------------------------------------------------
import { STAGES } from '../data/stages.js';
import { CARDIO_CONFIGS } from '../data/cardioConfigs.js';

const DEDICATED_CARDIO_DAYS = ['DAY_G', 'DAY_H', 'DAY_I'];

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

  // 1. Dedicated stage check (Days G, H, or I)
  const hasDedicatedCardio = recentSessions.some(s => {
    const stage = (s.stage || s.Stage || '').toUpperCase();
    return DEDICATED_CARDIO_DAYS.includes(stage);
  });

  // 2. Intra-session cardio finisher check
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
 * Recommends the next sortie, elevating Days G/H/I if weekly cardio is unfulfilled.
 */
export function determineFlightPath(lastStages = [], sessionHistory = []) {
  const cardioStatus = evaluateWeeklyCardioStatus(sessionHistory);

  // If weekly cardio is unfulfilled and urgent (mid/late week), guarantee Days G/H/I
  if (!cardioStatus.cardioFulfilled && cardioStatus.isUrgent) {
    const lastCardio = lastStages.find(stg => DEDICATED_CARDIO_DAYS.includes(stg));
    const nextCardio = DEDICATED_CARDIO_DAYS.find(c => c !== lastCardio) || 'DAY_G';

    return {
      recommendedStage: nextCardio,
      reason: "Weekly Cardio Guarantee (No conditioning in 7 days)",
      isCardioOverride: true,
      canPairFinisher: true
    };
  }

  // Standard lifting rotation fallback (Day A -> Day B -> Day C -> Day D -> Day E -> Day F)
  const lastStage = lastStages[0] || 'DAY_A';
  const rotation = ['DAY_A', 'DAY_B', 'DAY_C', 'DAY_D', 'DAY_E', 'DAY_F'];
  const nextIdx = (rotation.indexOf(lastStage) + 1) % rotation.length;
  const nextStage = rotation[nextIdx] || 'DAY_A';

  return {
    recommendedStage: nextStage,
    reason: "Standard Rotation Progression",
    isCardioOverride: false,
    canPairFinisher: !cardioStatus.cardioFulfilled
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

  // Build compact card HTML
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
      mount.innerHTML = ''; // Dismiss cleanly once engaged
    };
  }
}
