// -------------------------------------------------------------
// STAGE CLEAR RESULTS OVERLAY // ARCADE SCORECARD & REWARD TALLY
// Modular UI Component: resultsOverlay.js
// -------------------------------------------------------------
import { playStageClearFanfare, stopAllFanfare } from '../core/audio.js';

export function renderResultsOverlay(data, onClose) {
  const existing = document.getElementById('resultsOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'resultsOverlay';
  overlay.className = 'results-overlay-backdrop';

  const metallicLetterClass = data.rank === 'S' 
    ? 'rank-letter-gold' 
    : (data.rank === 'A' ? 'rank-letter-chrome' : 'rank-letter-emerald');
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
    <div class="results-card animate-card-enter">
      <div class="results-header">
        <span class="results-stage-tag">${data.stage.replace('_', ' ')} // SORTIE CLEARED</span>
        <button id="closeResultsXBtn" class="results-x-btn">✕</button>
      </div>

      <div class="results-body">
        ${recordHtml}
        ${levelUpHtml}
        ${transformMultiplierHtml}

        <!-- 1. HERO RANK SECTION (SPACIOUS, CENTERED, 3D METALLIC) -->
        <div class="results-hero-rank-container">
          <div id="resultsRankStamp" class="results-rank-stamp-hidden">
            <span class="rank-letter-text ${metallicLetterClass}">${data.rank}</span>
          </div>
          <div id="resultsRankLabel" class="results-rank-label" style="opacity: 0;">SONIC RATING</div>
        </div>

        <!-- 2. FULL-WIDTH BREAKDOWN CARD (GENEROUS HORIZONTAL SPACING) -->
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

  // 1. Kick off Stage Clear Fanfare in the background
  try {
    playStageClearFanfare(data.rank);
  } catch (e) {
    console.warn("Audio fanfare bypassed:", e);
  }

  // 2. Rolling score, gold ring tally & animated EXP bar
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
      // 3. Tally finished -> SLAM THE RANK STAMP DOWN!
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
