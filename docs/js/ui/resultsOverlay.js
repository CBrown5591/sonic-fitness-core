// -------------------------------------------------------------
// STAGE CLEAR RESULTS OVERLAY // ARCADE SCORECARD & REWARD TALLY
// Self-Contained Modular UI Component: resultsOverlay.js
// -------------------------------------------------------------
import { playStageClearFanfare, stopAllFanfare } from '../core/audio.js';

export function renderResultsOverlay(data, onClose) {
  // Remove existing overlay if present
  const existing = document.getElementById('resultsOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'resultsOverlay';
  overlay.className = 'results-overlay-backdrop';

  // 1. 3D Chiseled Metallic Letter Profiles (Deep saturated tones + directional bevel shadows)
  const letterStyles = {
    'S': {
      color: '#facc15',
      shadow: '0 1px 0 #fffbeb, 0 2px 0 #eab308, 0 3px 0 #ca8a04, 0 4px 0 #a16207, 0 5px 0 #854d0e, 0 6px 0 #713f12, 0 7px 2px rgba(0,0,0,0.7), 0 0 26px rgba(250, 204, 21, 0.85)'
    },
    'A': {
      color: '#38bdf8',
      shadow: '0 1px 0 #f0f9ff, 0 2px 0 #0284c7, 0 3px 0 #0369a1, 0 4px 0 #075985, 0 5px 0 #0c4a6e, 0 6px 2px rgba(0,0,0,0.7), 0 0 26px rgba(56, 189, 248, 0.8)'
    },
    'B': {
      color: '#4ade80',
      shadow: '0 1px 0 #f0fdf4, 0 2px 0 #22c55e, 0 3px 0 #16a34a, 0 4px 0 #15803d, 0 5px 0 #14532d, 0 6px 2px rgba(0,0,0,0.7), 0 0 22px rgba(74, 222, 128, 0.75)'
    }
  };

  const rankKey = (data.rank === 'S' || data.rank === 'A' || data.rank === 'B') ? data.rank : 'S';
  const activeLetterStyle = letterStyles[rankKey];
  const goldRings = data.goldRingsEarned || Math.floor((data.totalScore || 0) / 1000);

  let emeraldHtml = '';
  if (data.awardedEmerald) {
    emeraldHtml = `
      <div id="resultsEmeraldBanner" class="results-emerald-banner" style="display: none;">
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

  const expGained = data.totalScore || 0;
  const currentLevel = data.newLevel || 1;
  const expProgressPct = data.expProgressPct !== undefined ? data.expProgressPct : 65;

  overlay.innerHTML = `
    <!-- Self-Contained Overlay Styles -->
    <style>
      .results-overlay-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(7, 11, 18, 0.94);
        backdrop-filter: blur(10px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        animation: overlayFadeIn 0.2s ease-out;
        overflow-y: auto;
      }
      .results-card {
        background: #0b111e;
        border: 1px solid #1f2d45;
        border-radius: 14px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 0 45px rgba(0, 0, 0, 0.9), 0 0 20px rgba(56, 189, 248, 0.2);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
        margin: auto;
      }
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 18px;
        background: #111a2d;
        border-bottom: 1px solid #1f2d45;
      }
      .results-stage-tag {
        font-size: 12px;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: 1.5px;
      }
      .results-x-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
      }
      .results-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .results-hero-rank-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px 0;
      }
      .results-rank-stamp-hidden {
        opacity: 0;
        transform: scale(2.6) rotate(-18deg);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .results-rank-stamp {
        background: #070b12;
        border: 2px solid #243048;
        border-radius: 12px;
        padding: 6px 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-3deg);
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8), 0 4px 15px rgba(0, 0, 0, 0.5);
      }
      .results-rank-label {
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 2.5px;
        margin-top: 6px;
      }
      .results-breakdown-card {
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .breakdown-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 0;
      }
      .breakdown-lbl {
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
      .breakdown-val {
        font-size: 14px;
        font-weight: 800;
        color: #f8fafc;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .breakdown-val.highlight-red {
        color: #f87171;
      }
      .results-total-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 10px;
      }
      .results-total-lbl {
        font-size: 11px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 2px;
      }
      .results-total-num {
        font-size: 34px;
        font-weight: 900;
        color: #38bdf8;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-shadow: 0 0 18px rgba(56, 189, 248, 0.45);
        line-height: 1.1;
        margin-top: 3px;
      }
      .results-exp-block {
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 10px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .results-exp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11.5px;
        font-weight: 800;
      }
      .results-exp-lvl {
        color: #38bdf8;
        letter-spacing: 1px;
      }
      .results-exp-gained {
        color: #facc15;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .results-exp-bar-track {
        width: 100%;
        height: 10px;
        background: #070b12;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid #243048;
      }
      .results-exp-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #38bdf8, #facc15);
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        transition: width 0.1s linear;
      }
      .results-gold-ring-payout {
        background: #0f1828;
        border: 1px dashed #facc15;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
      }
      .gold-ring-payout-label {
        font-size: 9px;
        font-weight: 800;
        color: #facc15;
        letter-spacing: 1.2px;
      }
      .gold-ring-payout-val {
        font-size: 18px;
        font-weight: 900;
        color: #facc15;
        margin-top: 2px;
      }
      .results-continue-btn {
        background: #38bdf8;
        color: #070b12;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 1px;
        cursor: pointer;
        margin-top: 4px;
      }
      .animate-stamp-slam {
        animation: stampSlam 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      @keyframes stampSlam {
        0% { opacity: 0; transform: scale(2.6) rotate(-18deg); }
        70% { opacity: 1; transform: scale(0.94) rotate(-3deg); }
        100% { opacity: 1; transform: scale(1) rotate(-3deg); }
      }
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-pop-in {
        animation: popIn 0.35s ease-out forwards;
      }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-out {
        opacity: 0;
        transition: opacity 0.25s ease-out;
      }
      .results-transform-pill {
        padding: 7px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        text-align: center;
      }
      .results-transform-pill.super {
        background: rgba(250, 204, 21, 0.15);
        border: 1px solid #facc15;
        color: #facc15;
      }
      .results-transform-pill.ss2 {
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
      }
      .results-emerald-banner {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid #4ade80;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
      }
      .emerald-banner-title {
        font-size: 10px;
        font-weight: 800;
        color: #4ade80;
        letter-spacing: 1px;
      }
      .emerald-banner-detail {
        font-size: 13px;
        font-weight: 800;
        color: #f8fafc;
        margin-top: 3px;
      }
      .results-record-badge {
        background: rgba(250, 204, 21, 0.15);
        border: 1px solid #facc15;
        color: #facc15;
        padding: 6px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 800;
        text-align: center;
      }
      .results-levelup-badge {
        background: rgba(56, 189, 248, 0.2);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        padding: 6px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 800;
        text-align: center;
      }
    </style>

    <div class="results-card animate-card-enter">
      <div class="results-header">
        <span class="results-stage-tag">${data.stage.replace('_', ' ')} // SORTIE CLEARED</span>
        <button id="closeResultsXBtn" class="results-x-btn">✕</button>
      </div>

      <div class="results-body">
        ${recordHtml}
        ${levelUpHtml}
        ${transformMultiplierHtml}

        <!-- 1. HERO RANK SECTION (WITH GUARANTEED INLINE METALLIC SHADERS) -->
        <div class="results-hero-rank-container">
          <div id="resultsRankStamp" class="results-rank-stamp-hidden">
            <span id="resultsRankLetter" style="
              display: inline-block;
              font-size: 82px;
              font-weight: 950;
              line-height: 1;
              letter-spacing: -2px;
              color: ${activeLetterStyle.color} !important;
              text-shadow: ${activeLetterStyle.shadow} !important;
            ">${data.rank}</span>
          </div>
          <div id="resultsRankLabel" class="results-rank-label" style="opacity: 0;">SONIC RATING</div>
        </div>

        <!-- 2. FULL-WIDTH BREAKDOWN CARD -->
        <div class="results-breakdown-card">
          <div class="breakdown-row">
            <span class="breakdown-lbl">FORCE BONUS (${data.totalSets || 4} SETS)</span>
            <span class="breakdown-val">+${(data.forceBonus || 0).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-lbl">PRE-FLIGHT ARMOR CLEAR</span>
            <span class="breakdown-val">+${(data.ringBonus || 0).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-lbl">SORTIE COMPLETION BONUS</span>
            <span class="breakdown-val">+${(data.timeBonus || 20000).toLocaleString()} PTS</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-lbl">RED STAR RINGS (${data.ringsBanked || 0} BANKED)</span>
            <span class="breakdown-val highlight-red">+${(data.redRingBonus || 0).toLocaleString()} PTS</span>
          </div>
        </div>

        <!-- 3. TOTAL SCORE BANNER -->
        <div class="results-total-container">
          <div class="results-total-lbl">TOTAL SCORE</div>
          <div id="resultsScoreCounter" class="results-total-num">0 PTS</div>
        </div>

        <!-- 4. EXPERIENCE BAR (FULL WIDTH) -->
        <div class="results-exp-block">
          <div class="results-exp-header">
            <span class="results-exp-lvl">PILOT LVL ${currentLevel}</span>
            <span class="results-exp-gained">+${expGained.toLocaleString()} EXP GAINED</span>
          </div>
          <div class="results-exp-bar-track">
            <div id="resultsExpFill" class="results-exp-bar-fill" style="width: 0%;"></div>
          </div>
        </div>

        <!-- 5. STANDARD GOLD RINGS BANKED -->
        <div class="results-gold-ring-payout">
          <div class="gold-ring-payout-label">STANDARD GOLD RINGS BANKED</div>
          <div id="resultsGoldRingsCounter" class="gold-ring-payout-val">🪙 +0 RINGS</div>
        </div>

        ${emeraldHtml}

        <button id="continueResultsBtn" class="results-continue-btn" style="opacity: 0.5; pointer-events: none;">
          CALCULATING RATING...
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Play Stage Clear Fanfare in the background
  try {
    playStageClearFanfare(data.rank);
  } catch (e) {
    console.warn("Audio fanfare bypassed:", e);
  }

  // Rolling score, gold ring tally & animated EXP bar
  const counterEl = document.getElementById('resultsScoreCounter');
  const goldEl = document.getElementById('resultsGoldRingsCounter');
  const expFillEl = document.getElementById('resultsExpFill');
  const targetScore = data.totalScore || 0;
  const targetGold = goldRings;
  const tallyDuration = 1400; // ms
  const startTime = performance.now();

  function runRollingTally(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / tallyDuration);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    const currentScore = Math.floor(eased * targetScore);
    const currentGold = Math.floor(eased * targetGold);

    if (counterEl) counterEl.innerText = `${currentScore.toLocaleString()} PTS`;
    if (goldEl) goldEl.innerText = `🪙 +${currentGold} RINGS`;
    if (expFillEl) expFillEl.style.width = `${Math.min(100, Math.floor(eased * expProgressPct))}%`;

    if (progress < 1) {
      requestAnimationFrame(runRollingTally);
    } else {
      // Score tally finished -> SLAM THE RANK STAMP DOWN!
      if (counterEl) counterEl.innerText = `${targetScore.toLocaleString()} PTS`;
      if (goldEl) goldEl.innerText = `🪙 +${targetGold} RINGS`;
      if (expFillEl) expFillEl.style.width = `${expProgressPct}%`;
      triggerRankStampSlam();
    }
  }

  function triggerRankStampSlam() {
    const stampEl = document.getElementById('resultsRankStamp');
    const labelEl = document.getElementById('resultsRankLabel');
    const btn = document.getElementById('continueResultsBtn');
    const emeraldBanner = document.getElementById('resultsEmeraldBanner');

    if (stampEl) {
      stampEl.className = 'results-rank-stamp animate-stamp-slam';
    }
    if (labelEl) {
      labelEl.style.transition = 'opacity 0.3s ease';
      labelEl.style.opacity = '1';
    }

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 140]);
    }

    if (emeraldBanner) {
      setTimeout(() => {
        emeraldBanner.style.display = 'block';
        emeraldBanner.classList.add('animate-pop-in');
        if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
      }, 300);
    }

    if (btn) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.innerText = 'CONTINUE TO COMMAND HUB ▶';
    }
  }

  requestAnimationFrame(runRollingTally);

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
