// -------------------------------------------------------------
// STAGE CLEAR RESULTS OVERLAY // ARCADE SCORECARD & REWARD TALLY
// Modular UI Component: resultsOverlay.js
// -------------------------------------------------------------
import { playStageClearFanfare, stopAllFanfare } from '../core/audio.js';

export function renderResultsOverlay(data, onClose) {
  // Remove existing overlay if present
  const existing = document.getElementById('resultsOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'resultsOverlay';
  overlay.className = 'results-overlay-backdrop';

  const rankColor = data.rank === 'S' ? '#facc15' : (data.rank === 'A' ? '#38bdf8' : '#4ade80');
  const goldRings = data.goldRingsEarned || Math.floor((data.totalScore || 0) / 1000);

  let emeraldHtml = '';
  if (data.awardedEmerald) {
    emeraldHtml = `
      <div class="results-emerald-banner animate-pop">
        <div class="emerald-banner-title">✨ SPECIAL STAGE CLEAR ✨</div>
        <div class="emerald-banner-detail">💎 ${data.awardedEmerald}</div>
      </div>
    `;
  }

  let transformMultiplierHtml = '';
  if (data.isSS2) {
    transformMultiplierHtml = `
      <div class="results-transform-pill ss2">
        ⚡ SUPER SONIC 2: 1.50x EXP SURGE APPLIED ⚡
      </div>
    `;
  } else if (data.isSuperActive) {
    transformMultiplierHtml = `
      <div class="results-transform-pill super">
        ⚡ SUPER SONIC: 1.25x EXP MULTIPLIER APPLIED ⚡
      </div>
    `;
  }

  let recordHtml = data.isNewRecord ? `<div class="results-record-badge">★ NEW STAGE RECORD ★</div>` : '';
  let levelUpHtml = data.didLevelUp ? `<div class="results-levelup-badge">▲ PILOT LEVEL UP → LVL ${data.newLevel} ▲</div>` : '';

  overlay.innerHTML = `
    <div class="results-card animate-slam">
      <div class="results-header">
        <span class="results-stage-tag">${data.stage.replace('_', ' ')} // SORTIE CLEARED</span>
        <button id="closeResultsXBtn" class="results-x-btn">✕</button>
      </div>

      <div class="results-body">
        <div class="results-rank-container">
          <div class="results-rank-stamp animate-stamp" style="color: ${rankColor}; border-color: ${rankColor};">
            ${data.rank}
          </div>
          <div class="results-rank-label">SONIC RATING</div>
        </div>

        ${recordHtml}
        ${levelUpHtml}
        ${transformMultiplierHtml}
        ${emeraldHtml}

        <div class="results-breakdown-list">
          <div class="breakdown-row">
            <span>KINETIC FORCE BONUS (${data.totalSets || 4} SETS)</span>
            <span class="breakdown-val">+${(data.forceBonus || 0).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span>PRE-FLIGHT ARMOR CLEAR</span>
            <span class="breakdown-val">+${(data.ringBonus || 0).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span>SORTIE COMPLETION BONUS</span>
            <span class="breakdown-val">+${(data.timeBonus || 20000).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span>RED STAR RINGS (${data.ringsBanked || 0} BANKED)</span>
            <span class="breakdown-val" style="color: #f87171;">+${(data.redRingBonus || 0).toLocaleString()} PTS</span>
          </div>
        </div>

        <div class="results-gold-ring-payout animate-pulse">
          <div class="gold-ring-payout-label">STANDARD GOLD RINGS BANKED</div>
          <div class="gold-ring-payout-val">🪙 +${goldRings} RINGS</div>
        </div>

        <div class="results-total-container">
          <div class="results-total-lbl">TOTAL SCORE</div>
          <div id="resultsScoreCounter" class="results-total-num">0</div>
        </div>

        <button id="continueResultsBtn" class="results-continue-btn">
          CONTINUE TO COMMAND HUB ▶
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Play stage clear fanfare
  try {
    playStageClearFanfare(data.rank);
  } catch (e) {
    console.warn("Audio fanfare bypassed:", e);
  }

  // Rolling counter animation for total score
  const counterEl = document.getElementById('resultsScoreCounter');
  if (counterEl) {
    const target = data.totalScore || 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function updateScore(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(eased * target);
      counterEl.innerText = `${current.toLocaleString()} PTS`;

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      } else {
        counterEl.innerText = `${target.toLocaleString()} PTS`;
      }
    }
    requestAnimationFrame(updateScore);
  }

  const dismiss = () => {
    stopAllFanfare();
    overlay.classList.add('animate-fade-out');
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 250);
  };

  document.getElementById('continueResultsBtn').onclick = dismiss;
  document.getElementById('closeResultsXBtn').onclick = dismiss;
}

// Bind to window for Chrome DevTools Console testing
window.renderResultsOverlay = renderResultsOverlay;
