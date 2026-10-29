// -------------------------------------------------------------
// HUD RENDERING & INTERFACE CONTROLS
// Modular UI Component: renderHud.js
// -------------------------------------------------------------
import { STAGES } from '../data/stages.js';
import { MOVEMENT_INTEL } from '../data/movementIntel.js';
import { CARDIO_CONFIGS } from '../data/cardioConfigs.js';
import { getStageRecords } from '../engine/records.js';

export function showToast(msg) {
  let toast = document.getElementById('sonicToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sonicToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#141c2e';
    toast.style.border = '1px solid var(--accent-blue)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = '700';
    toast.style.zIndex = '99999';
    toast.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
    toast.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { if (toast) toast.style.display = 'none'; }, 300);
  }, 2500);
}

export function renderStageRecordBanner(stageKey) {
  const records = getStageRecords();
  const rec = records[stageKey];
  const stageNameEl = document.getElementById('stageName');
  if (!stageNameEl) return;

  let banner = document.getElementById('stageRecordBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'stageRecordBanner';
    banner.style.fontSize = '11px';
    banner.style.fontWeight = '700';
    banner.style.color = 'var(--accent-gold)';
    banner.style.marginTop = '4px';
    stageNameEl.parentNode.insertBefore(banner, stageNameEl.nextSibling);
  }

  if (rec && rec.bestScore > 0) {
    banner.innerHTML = `🏆 RECORD: <strong>${rec.bestScore.toLocaleString()} PTS</strong> (${rec.rank}-RANK) • <span style="color: var(--text-dim);">${rec.date}</span>`;
  } else {
    banner.innerHTML = `🎯 TARGET: <em>SET INAUGURAL RECORD</em>`;
  }
}

export function renderMovementIntel(exerciseName) {
  const card = document.querySelector('.movement-card');
  if (!card) return;

  let intelBox = document.getElementById('movementIntelBox');
  if (!intelBox) {
    intelBox = document.createElement('div');
    intelBox.id = 'movementIntelBox';
    intelBox.style.background = '#0b0f19';
    intelBox.style.border = '1px solid var(--border)';
    intelBox.style.borderRadius = '8px';
    intelBox.style.padding = '10px 12px';
    intelBox.style.margin = '10px 0';
    intelBox.style.fontSize = '11px';
    intelBox.style.lineHeight = '1.4';

    const exSelect = document.getElementById('exerciseSelect');
    if (exSelect && exSelect.nextSibling) {
      card.insertBefore(intelBox, exSelect.nextSibling);
    } else {
      card.appendChild(intelBox);
    }
  }

  const info = MOVEMENT_INTEL[exerciseName] || {
    setup: "Athletic stance, neutral spine, core locked.",
    cue: "Control the eccentric phase for 3s; explode through concentric phase with zero momentum.",
    safety: "Discontinue immediately if sharp joint pain occurs."
  };

  intelBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
      <span style="font-weight: 800; color: var(--accent-blue); font-size: 10px; letter-spacing: 0.5px;">TACTICAL CUES // INTEL</span>
      <span style="font-size: 9px; color: var(--accent-gold); font-weight: 700;">TEMPO: 3-0-1</span>
    </div>
    <div style="color: var(--text-main); margin-bottom: 4px;"><strong>Setup:</strong> ${info.setup}</div>
    <div style="color: var(--text-dim); margin-bottom: 4px;"><strong>Cue:</strong> ${info.cue}</div>
    <div style="color: var(--accent-red); font-size: 10px;"><strong>Safety Lock:</strong> ${info.safety}</div>
  `;
}

export function updateInputLabelsForExercise(exerciseName) {
  const cfg = CARDIO_CONFIGS[exerciseName];
  const loadInput = document.getElementById('loadInput');
  const repsInput = document.getElementById('repsInput');
  const rpeSelect = document.getElementById('rpeSelect');

  if (!loadInput || !repsInput) return;

  const label1 = loadInput.parentElement ? loadInput.parentElement.querySelector('label') : null;
  const label2 = repsInput.parentElement ? repsInput.parentElement.querySelector('label') : null;
  const label3 = rpeSelect && rpeSelect.parentElement ? rpeSelect.parentElement.querySelector('label') : null;

  if (cfg) {
    if (label1) label1.innerText = cfg.label1;
    if (label2) label2.innerText = cfg.label2;
    if (label3) label3.innerText = cfg.label3;
    if (loadInput.value === "0" || loadInput.value === "") loadInput.value = cfg.default1;
    if (repsInput.value === "0" || repsInput.value === "") repsInput.value = cfg.default2;
  } else {
    if (label1) label1.innerText = "LOAD (LBS)";
    if (label2) label2.innerText = "REPS";
    if (label3) label3.innerText = "RPE";
  }
}
