// docs/js/engine/flightPath.js
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

  // Filter sessions logged in the last 7 days
  const recentSessions = sessionHistory.filter(s => {
    const sessionDate = new Date(s.timestamp || s.date || s.Timestamp);
    return !isNaN(sessionDate) && sessionDate >= sevenDaysAgo;
  });

  // Check 1: Did any recent session use Day G, H, or I?
  const hasDedicatedCardio = recentSessions.some(s => {
    const stage = (s.stage || s.Stage || '').toUpperCase();
    return DEDICATED_CARDIO_DAYS.includes(stage);
  });

  // Check 2: Did any lifting session log sets with cardio movements?
  const hasCardioFinisher = recentSessions.some(s => {
    if (!Array.isArray(s.sets)) return false;
    return s.sets.some(set => CARDIO_CONFIGS[set.exercise] !== undefined);
  });

  const cardioFulfilled = hasDedicatedCardio || hasCardioFinisher;
  const daysSinceMonday = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const isUrgent = !cardioFulfilled && daysSinceMonday >= 3; // Urgent starting Thursday

  return {
    cardioFulfilled,
    hasDedicatedCardio,
    hasCardioFinisher,
    isUrgent,
    sessionsInWindow: recentSessions.length
  };
}

/**
 * Recommends the next sortie, elevating Days G/H/I if weekly cardio is pending.
 */
export function determineFlightPath(lastStages = [], sessionHistory = []) {
  const cardioStatus = evaluateWeeklyCardioStatus(sessionHistory);

  // If weekly cardio is unfulfilled and we are mid-to-late week, force Days G/H/I
  if (!cardioStatus.cardioFulfilled && cardioStatus.isUrgent) {
    // Pick the least recently completed cardio stage among G, H, I
    const cardioChoices = ['DAY_G', 'DAY_H', 'DAY_I'];
    const lastCardio = lastStages.find(stg => cardioChoices.includes(stg));
    const nextCardio = cardioChoices.find(c => c !== lastCardio) || 'DAY_G';

    return {
      recommendedStage: nextCardio,
      reason: "WEEKLY CARDIO GUARANTEE: No conditioning logged in 7 days.",
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
    reason: "STANDARD ROTATION FLIGHT PATH",
    isCardioOverride: false,
    canPairFinisher: !cardioStatus.cardioFulfilled
  };
}

/**
 * Checks and renders the prompt banner on HUD startup
 */
export function checkAndRenderFlightPathPrompt(activeSession, onSelectStage) {
  const container = document.getElementById('flightPathMount') || document.getElementById('stageRecordBanner');
  if (!container) return;

  const rawHistory = localStorage.getItem('sonic_session_history');
  let history = [];
  try { history = JSON.parse(rawHistory) || []; } catch (e) {}

  const lastStage = localStorage.getItem('sonic_last_stage') || 'DAY_A';
  const flight = determineFlightPath([lastStage], history);

  // Check if banner already exists
  let banner = document.getElementById('flightPathPromptBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'flightPathPromptBanner';
    banner.className = 'flight-path-banner';
    container.parentNode.insertBefore(banner, container.nextSibling);
  }

  banner.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(14, 165, 233, 0.12); border: 1.5px solid var(--accent-blue, #38bdf8); padding: 10px 14px; border-radius: 8px; margin-bottom: 12px;">
      <div>
        <div style="font-size: 10px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px;">
          ${flight.isCardioOverride ? '🚨 FLIGHT PATH MANDATE' : '🧭 FLIGHT PATH RECOMMENDATION'}
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-top: 2px;">
          ${flight.recommendedStage.replace('_', ' ')}: <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">${flight.reason}</span>
        </div>
      </div>
      <button id="acceptFlightPathBtn" type="button" style="background: #0284c7; border: none; color: #fff; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        ENGAGE
      </button>
    </div>
  `;

  const btn = document.getElementById('acceptFlightPathBtn');
  if (btn) {
    btn.onclick = () => {
      if (typeof onSelectStage === 'function') onSelectStage(flight.recommendedStage);
      banner.style.display = 'none';
    };
  }
}
