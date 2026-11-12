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

  const muscleLabel = info.muscles || inferMuscleGroups(exerciseName);

  intelBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
      <span style="font-weight: 800; color: var(--accent-blue); font-size: 10px; letter-spacing: 0.5px;">TACTICAL CUES // INTEL</span>
      <span style="font-size: 9px; color: var(--accent-gold); font-weight: 700;">TEMPO: 3-0-1</span>
    </div>
    <div style="color: #38bdf8; margin-bottom: 4px; font-size: 11px;">
      <strong>🎯 Target Muscles:</strong> <span style="color: #e2e8f0; font-weight: 600;">${muscleLabel}</span>
    </div>
    <div style="color: var(--text-main); margin-bottom: 4px;"><strong>Setup:</strong> ${info.setup}</div>
    <div style="color: var(--text-dim); margin-bottom: 4px;"><strong>Cue:</strong> ${info.cue}</div>
    <div style="color: var(--accent-red); font-size: 10px;"><strong>Safety Lock:</strong> ${info.safety}</div>
  `;
}

function inferMuscleGroups(name = '') {
  const n = name.toLowerCase();
  if (n.includes('romanian') || n.includes('rdl') || n.includes('hinge') || n.includes('deadlift')) {
    return "Hamstrings & Glute Max (Primary) • Spinal Erectors & Lats (Isometric Brace)";
  }
  if (n.includes('spanish squat') || n.includes('tke') || n.includes('leg extension')) {
    return "Quadriceps / VMO (Primary, Patellar-Sparing)";
  }
  if (n.includes('suitcase squat')) {
    return "Quadriceps & Glutes (Primary) • Obliques, Traps & Grip (Stabilizers)";
  }
  if (n.includes('squat') || n.includes('leg press') || n.includes('split squat') || n.includes('lunge')) {
    return "Quadriceps & Glutes (Primary) • Adductors & Core (Stabilizers)";
  }
  if (n.includes('hamstring curl') || n.includes('glute bridge')) {
    return "Hamstrings & Glute Max (Primary)";
  }
  if (n.includes('incline') && (n.includes('press') || n.includes('bench') || n.includes('push-up'))) {
    return "Upper Chest / Clavicular Pecs & Anterior Delts (Primary) • Triceps";
  }
  if (n.includes('press') || n.includes('push-up') || n.includes('fly')) {
    return "Mid/Inner Pectorals, Anterior Deltoids & Triceps (Primary)";
  }
  if (n.includes('high row') || n.includes('face pull') || n.includes('rear delt') || n.includes('pull-apart') || n.includes('y-t-w')) {
    return "Rear Deltoids, Rhomboids & Mid/Lower Traps (Primary)";
  }
  if (n.includes('row') || n.includes('pulldown')) {
    return "Latissimus Dorsi, Rhomboids & Mid-Traps (Primary) • Biceps & Brachialis";
  }
  if (n.includes('adduction') || n.includes('adductor') || n.includes('copenhagen')) {
    return "Inner Thigh / Hip Adductors (Primary) • Pelvic Floor";
  }
  if (n.includes('monster walk') || n.includes('abduction') || n.includes('clamshell')) {
    return "Gluteus Medius & Lateral Hip Stabilizers (Primary)";
  }
  if (n.includes('march')) {
    return "Hip Flexors / Iliopsoas, Lower Abs & Glute Medius (Stance Leg)";
  }
  if (n.includes('curl')) {
    return "Biceps Brachii & Brachioradialis (Primary)";
  }
  if (n.includes('tricep') || n.includes('pushdown') || n.includes('extension')) {
    return "Triceps Brachii (Primary)";
  }
  if (n.includes('pallof') || n.includes('plank') || n.includes('bird-dog') || n.includes('deadbug') || n.includes('crunch') || n.includes('carry') || n.includes('windmill') || n.includes('woodchopper')) {
    return "Transverse Abdominis, Internal/External Obliques & Deep Spinal Stabilizers";
  }
  return "Full-Body Kinetic Chain & Core Stabilizers";
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

// -------------------------------------------------------------
// PRE-FLIGHT MISSION INSTRUCTIONS RENDERER & ACCORDION TOGGLE
// -------------------------------------------------------------
export function renderPrehabInstructions(targetStageKey) {
  const mount = document.getElementById('prehabInstructionsMount');
  if (!mount) return;

  const stageKey = targetStageKey 
    || window.activeSession?.stage 
    || (document.querySelector('.stage-tab.active')?.id || '').replace('tab-', '')
    || localStorage.getItem('sonic_active_stage')
    || 'DAY_A';

  const stageData = STAGES?.[stageKey];
  const items = stageData?.prehabDetails || [];

  if (items.length > 0) {
    mount.innerHTML = `
      <div class="prehab-instructions" style="display: flex; flex-direction: column; gap: 8px;">
        ${items.map((item, idx) => `
          <div class="prehab-item" style="background: rgba(15, 23, 42, 0.7); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #38bdf8;">
            <div style="font-weight: 800; font-size: 13px; color: #f8fafc;">
              ${idx + 1}. ${item.name}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
              <span style="color: #38bdf8; font-weight: 700;">${item.dose || item.protocol || ''}</span>
              ${item.cue ? `<span style="color: #cbd5e1;"> — ${item.cue}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    mount.innerHTML = `
      <div style="font-size: 12px; color: #94a3b8; padding: 8px;">
        ${stageData?.prehab || 'No specific prehab protocol registered for this stage.'}
      </div>
    `;
  }
}

export function togglePrehabDrawer() {
  const drawer = document.getElementById('prehabDrawer');
  const btn = document.getElementById('prehabDrawerBtn');

  if (!drawer) return;

  const isCurrentlyOpen = drawer.style.display !== 'none';

  if (isCurrentlyOpen) {
    drawer.style.display = 'none';
    drawer.classList.remove('open');
    if (btn) btn.classList.remove('expanded');
    return;
  }

  drawer.style.display = 'block';
  drawer.classList.add('open');
  if (btn) btn.classList.add('expanded');

  renderPrehabInstructions();
}
