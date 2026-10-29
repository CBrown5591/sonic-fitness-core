// -------------------------------------------------------------
// ARCADE RESULTS DOSSIER (SIMULTANEOUS FANFARE & EXP PROGRESSION)
// Modular UI Component: resultsOverlay.js
// -------------------------------------------------------------
import { calculatePilotProgress } from '../engine/calc.js';
import { playStageClearFanfare, playLevelUpFanfare, playScoreTickSound, playStampImpactSound, stopAllFanfare } from '../core/audio.js';
import { showToast } from './renderHud.js';

function animateNumber(element, start, end, duration, prefix = '', suffix = '', onTick) {
  const startTime = performance.now();
  const diff = end - start;
  if (diff === 0) {
    if (element) element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + diff * ease);
      if (element) element.innerText = `${prefix}${current.toLocaleString()}${suffix}`;
      if (onTick && Math.random() > 0.45) onTick();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (element) element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
        resolve();
      }
    }
    requestAnimationFrame(update);
  });
}

export async function renderResultsOverlay(data, onClose) {
  const overlay = document.getElementById('resultsOverlay');
  if (!overlay) return;

  const stageTitle = document.getElementById('resStageTitle');
  if (stageTitle) stageTitle.innerText = `${data.stage.replace('_', ' ')} // SORTIE CLEARED`;

  const lvlBadge = document.getElementById('resLevelUpBadge');
  if (lvlBadge) lvlBadge.style.display = 'none';

  const rankCircle = document.getElementById('resRankCircle');
  const rankTier = document.getElementById('resRankTier');
  const prehabEl = document.getElementById('resPrehabScore');
  const timeEl = document.getElementById('resTimeScore');
  const forceEl = document.getElementById('resForceScore');
  const ringEl = document.getElementById('resRingScore');
  const totalEl = document.getElementById('resTotalScore');
  const ringsEarnedEl = document.getElementById('resRingsEarned');

  // Launch overlay and immediately trigger fanfare
  overlay.style.display = 'flex';
  playStageClearFanfare();

  if (rankCircle) {
    rankCircle.style.opacity = '0';
    rankCircle.style.transform = 'scale(0)';
    rankCircle.className = 'rank-circle ' + (data.rank === 'S' ? 'rank-s' : (data.rank === 'A' ? 'rank-a' : 'rank-b'));
    rankCircle.innerText = data.rank;
  }

  if (rankTier) {
    rankTier.style.opacity = '0';
    rankTier.innerText = data.isNewRecord ? `★ NEW COURSE RECORD! ★ (${data.rank}-TIER)` : `SONIC RANK: ${data.rank}-TIER`;
  }

  if (prehabEl) prehabEl.innerText = '+0 pts';
  if (timeEl) timeEl.innerText = '+0 pts';
  if (forceEl) forceEl.innerText = '+0 pts';
  if (ringEl) ringEl.innerText = '+0 pts';
  if (totalEl) totalEl.innerText = '0 PTS';
  if (ringsEarnedEl) ringsEarnedEl.style.opacity = '0';

  const sleep = ms => new Promise(res => setTimeout(res, ms));
  let runningTotal = 0;

  const subscores = [
    { el: prehabEl, val: data.ringBonus },
    { el: timeEl, val: data.timeBonus },
    { el: forceEl, val: data.forceBonus },
    { el: ringEl, val: data.redRingBonus }
  ];

  await sleep(250);

  // Score rolling while fanfare plays in background
  for (const item of subscores) {
    const startTotal = runningTotal;
    runningTotal += item.val;

    await Promise.all([
      animateNumber(item.el, 0, item.val, 700, '+', ' pts', playScoreTickSound),
      animateNumber(totalEl, startTotal, runningTotal, 700, '', ' PTS')
    ]);

    if (navigator.vibrate) navigator.vibrate(15);
    await sleep(250);
  }

  // Rings banked
  let stars = '';
  for (let i = 0; i < data.ringsBanked; i++) stars += '★ ';
  for (let i = data.ringsBanked; i < data.totalSets; i++) stars += '☆ ';
  if (ringsEarnedEl) {
    ringsEarnedEl.innerText = `RINGS BANKED: ${stars}(${data.ringsBanked}/${data.totalSets})`;
    ringsEarnedEl.style.transition = 'opacity 0.6s ease';
    ringsEarnedEl.style.opacity = '1';
  }

  await sleep(600);

  // Hydraulic Grade Stamp Drop
  const rankClass = data.rank === 'S' ? 'stamp-slam-s' : (data.rank === 'A' ? 'stamp-slam-a' : 'stamp-slam-b');
  if (rankCircle) {
    rankCircle.classList.remove('stamp-slam-s', 'stamp-slam-a', 'stamp-slam-b');
    void rankCircle.offsetWidth;
    rankCircle.classList.add(rankClass);
    rankCircle.style.opacity = '1';
  }

  setTimeout(() => {
    playStampImpactSound(data.rank);
    if (navigator.vibrate) navigator.vibrate(data.rank === 'S' ? [100, 40, 300] : [60, 30, 150]);
  }, 720);

  await sleep(1100);

  if (rankTier) {
    rankTier.style.transition = 'opacity 0.5s ease';
    rankTier.style.opacity = '1';
  }

  // Check Promotion
  if (data.didLevelUp) {
    await sleep(400);
    stopAllFanfare();
    playLevelUpFanfare();
    if (navigator.vibrate) navigator.vibrate([120, 60, 120, 60, 450]);

    if (lvlBadge) {
      lvlBadge.style.display = 'inline-block';
      lvlBadge.className = 'levelup-alert-badge level-up-flare';
      lvlBadge.innerText = `★ LEVEL UP! PILOT PROMOTED TO LVL ${data.newLevel} ★`;
    }
    showToast(`PILOT PROMOTED TO LEVEL ${data.newLevel}!`);
  }

  const closeBtn = document.getElementById('closeResultsBtn') || document.querySelector('.btn-close-results');
  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.style.display = 'none';
      stopAllFanfare();
      if (onClose) onClose();
    };
  }
}
