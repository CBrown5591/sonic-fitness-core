// -------------------------------------------------------------
// SONIC FITNESS HUD // COMMAND CORE RUNTIME ENTRY POINT
// Root Application Module: app.js
// -------------------------------------------------------------
import { STAGES } from './data/stages.js';
import { CARDIO_CONFIGS } from './data/cardioConfigs.js';
import { calculateE1RM, calculateTargetLoad, calculatePilotProgress } from './engine/calc.js';
import { autoRegulateNextSet } from './engine/autoReg.js';
import { checkAndRenderFlightPathPrompt } from './engine/flightPath.js';
import { 
  getStageRecords, 
  saveStageRecord, 
  setRuntimeStageRecords, 
  getPRVault, 
  savePRVault 
} from './engine/records.js';
import { playRingChime, toggleAudioTheme, getAudioTheme, stopAllFanfare } from './core/audio.js';
import { setTimerDuration, startRestTimer, applyTimeBrake, initTimerBackgroundSync } from './core/timer.js';
import { fetchSheetTelemetry, syncSessionToSheets } from './core/sync.js';
import { showToast, renderStageRecordBanner, renderMovementIntel, updateInputLabelsForExercise, togglePrehabDrawer, renderPrehabInstructions } from './ui/renderHud.js';
import { openAuditModal } from './ui/auditModal.js';
import { renderResultsOverlay } from './ui/resultsOverlay.js';
import { 
  renderArtifactsTray, 
  checkSecretRingTriggers, 
  isDarkspineModeUnlocked, 
  isSuperModeUnlocked,
  isSuperSonic2Unlocked,
  isSuperModeSessionActive,
  applySuperSonicDamagePenalty,
  evaluatePerfectDayEmerald,
  getStandardRings,
  saveStandardRings,
  addStandardRings,
  updateHudRingBar,
  setRuntimeEmeralds,
  setRuntimeWorldRings,
  setRuntimeUnlockedPerks
} from './ui/renderArtifacts.js';
import { getTotalRedRings } from './ui/renderVault.js';
import { renderVault, creditVaultRings, saveVaultData } from './ui/renderVault.js';
import { renderSkillTree, switchSkillTreeBranch, unlockPerk } from './ui/renderSkillTree.js';
import { switchMainTab } from './ui/renderTabs.js';
import { renderPRVaultUI } from './ui/renderPRVault.js';
import { BAND_EQUIVALENTS, getBandEquivalent } from './data/bandEquivalents.js';
import { renderBandSelector, isBandMovement, getSelectedBandCombo, clearBandSelections } from './ui/renderBandSelector.js';
import { resolveInitialBandPreset } from './engine/bandSolver.js';
import { setActiveBandSelection } from './ui/renderBandSelector.js';
import { getDefaultGymLoad } from './data/movementIntel.js';
import { renderCalculator } from './ui/renderCalculator.js';

let activeStageKey = localStorage.getItem('sonic_active_stage') || "DAY_A";
let activeSlotIndex = 0;
let tempoClean = true;
let currentSetPain = false;
let devDarkspineOverride = null; // null: follow standard logic; true/false: manual force
let currentSlotGearMode = 'GYM'; // Defaults to Gym on every slot load
let activeBandCombo = { nominalLoad: 0, comboLabel: 'None' };

let activeSession = {
  stage: activeStageKey,
  slotIndex: 0,
  prehabChecked: false,
  jointPain: false,
  sets: []
};

// Hydrate saved session from storage so reloads preserve prehabChecked and sets
const savedSession = localStorage.getItem('sonic_active_session');
if (savedSession) {
  try {
    const parsed = JSON.parse(savedSession);
    if (parsed && typeof parsed === 'object') {
      Object.assign(activeSession, parsed);
    }
  } catch (e) {}
}

window.activeSession = activeSession;

function getLifetimeExp() {
  const stored = localStorage.getItem("sonic_lifetime_exp");
  return stored !== null ? (parseInt(stored, 10) || 0) : 0;
}

function updatePilotExpUI() {
  const exp = getLifetimeExp();
  const info = calculatePilotProgress(exp);
  const lvlEl = document.getElementById('hudPilotLevel') || document.querySelector('.lvl-badge');
  const titleEl = document.getElementById('hudPilotTitle') || document.querySelector('.pilot-title');
  const counterEl = document.getElementById('hudExpCounter') || document.querySelector('.exp-counter');
  const fillEl = document.getElementById('hudExpFill') || document.querySelector('.exp-bar-fill');
  const toNextEl = document.getElementById('hudExpToNext');

  if (lvlEl) lvlEl.innerText = `LVL ${info.level}`;
  if (titleEl) titleEl.innerText = info.title;
  if (counterEl) counterEl.innerText = `${info.exp.toLocaleString()} EXP`;
  if (fillEl) fillEl.style.width = `${info.progressPct}%`;
  if (toNextEl) {
    toNextEl.innerText = info.isMax ? "MAX LEVEL" : `${info.expToNext.toLocaleString()} EXP TO LVL ${info.level + 1}`;
  }
}

function updateTonnageDisplay() {
  const totalTonnage = activeSession.sets.reduce((sum, s) => 
    sum + (s.equivVolume !== undefined ? s.equivVolume : ((s.load || 0) * (s.reps || 0))), 0);
  const display = document.getElementById('tonnageDisplay');
  if (display) display.innerText = `VOL: ${totalTonnage.toLocaleString()} LBS`;
}

function saveSessionState() {
  activeSession.stage = activeStageKey;
  activeSession.slotIndex = activeSlotIndex;
  window.activeSession = activeSession;
  localStorage.setItem('sonic_active_session', JSON.stringify(activeSession));
  localStorage.setItem('sonic_active_stage', activeStageKey);
  updateTonnageDisplay();
}

// -------------------------------------------------------------
// DYNAMIC MOVEMENT TARGET & REP PARAMETER RESOLVER
// -------------------------------------------------------------

function resolveExerciseTarget(exerciseName, defaultSlotTarget) {
  if (!exerciseName) return { targetText: defaultSlotTarget, defaultReps: 8 };

  const name = exerciseName.toLowerCase();

  // 1. Embedded specific rep/hold notes in name: (12r/side), (5s hold), (45s), etc.
  const matchReps = exerciseName.match(/\((\d+r\/side|\d+[-–—]\d+|\d+s hold|\d+s|\d+ reps?)/i);
  if (matchReps) {
    const raw = matchReps[1];
    const numMatch = raw.match(/\d+/);
    return {
      targetText: `3 × ${raw}`,
      defaultReps: numMatch ? parseInt(numMatch[0], 10) : 10
    };
  }

  // 2. Carries & Locomotion (Paces)
  if (name.includes('carry') || (name.includes('walk') && !name.includes('treadmill')) || name.includes('crawl')) {
    return { targetText: "3 × 40-50 paces", defaultReps: 50 };
  }

  // 3. Isometric Holds & Core Bracing (Seconds)
  if (name.includes('hold') || name.includes('plank') || name.includes('deadbug')) {
    return { targetText: "3 × 20-30s hold", defaultReps: 30 };
  }

  // 4. Isolation, Hip Armor & Accessories (Adduction, Abduction, Flyes, Raises, Curls, Extensions)
  if (
    name.includes('adduct') || 
    name.includes('abduct') || 
    name.includes('fly') || 
    name.includes('lateral') || 
    name.includes('curl') || 
    name.includes('extension') || 
    name.includes('raise') || 
    name.includes('rotation')
  ) {
    return { targetText: "3 × 12-15", defaultReps: 15 };
  }

  // 5. Trunk & Core Compression
  if (name.includes('crunch') || name.includes('pallof')) {
    return { targetText: "3 × 10-12", defaultReps: 12 };
  }

  // 6. Inherit the stage slot definition if no specific movement override matched
  const slotMatch = (defaultSlotTarget || '').match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (slotMatch) {
    const minR = parseInt(slotMatch[1], 10);
    const maxR = parseInt(slotMatch[2], 10);
    return { targetText: `3 × ${minR}-${maxR}`, defaultReps: maxR };
  }

  return { targetText: defaultSlotTarget, defaultReps: 8 };
}

function hydrateExerciseDropdown() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];
  const select = document.getElementById('exerciseSelect');
  if (!select) return;

  select.innerHTML = '';
  
  if (currentSlotGearMode === 'GYM') {
    slotDef.alts.forEach(alt => {
      const opt = document.createElement('option');
      opt.value = alt;
      opt.innerText = alt;
      select.appendChild(opt);
    });
    select.value = slotDef.primary;
  } else {
    const bandedAlts = slotDef.alts.map(alt => getBandEquivalent(alt));
    bandedAlts.forEach(bandAlt => {
      const opt = document.createElement('option');
      opt.value = bandAlt;
      opt.innerText = bandAlt;
      select.appendChild(opt);
    });
    select.value = getBandEquivalent(slotDef.primary);
  }
}



function syncEquipmentInputs() {
  const loadInputWrapper = document.getElementById('loadInput')?.closest('.input-group') || document.getElementById('loadInput')?.parentElement;
  const bandMount = document.getElementById('bandSelectorMount');
  const exSelect = document.getElementById('exerciseSelect');
  const currentEx = exSelect?.value || '';

  if (currentSlotGearMode === 'BANDS' || isBandMovement(currentEx)) {
    if (loadInputWrapper) loadInputWrapper.style.display = 'none';
    if (bandMount) {
      bandMount.style.display = 'block';
      renderBandSelector(bandMount, currentEx, (combo) => {
        activeBandCombo = combo;
        const loadInput = document.getElementById('loadInput');
        if (loadInput) loadInput.value = combo.nominalLoad;
      });
    }
  } else {
    if (loadInputWrapper) loadInputWrapper.style.display = '';
    if (bandMount) bandMount.style.display = 'none';
  }
}

function loadSlotData() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];

  // Reset gear mode strictly to GYM on each slot load
  currentSlotGearMode = 'GYM';
  clearBandSelections();
  activeBandCombo = { nominalLoad: 0, comboLabel: 'None' };

  const gymBtn = document.getElementById('gearModeGymBtn');
  const bandBtn = document.getElementById('gearModeBandBtn');
  if (gymBtn && bandBtn) {
    gymBtn.style.background = '#38bdf8';
    gymBtn.style.color = '#0f172a';
    bandBtn.style.background = 'transparent';
    bandBtn.style.color = '#94a3b8';
  }

  hydrateExerciseDropdown();
  syncEquipmentInputs();
  
  const currentSlotTag = document.getElementById('currentSlotTag');
  const currentTargetTag = document.getElementById('currentTargetTag');
  if (currentSlotTag) currentSlotTag.innerText = `SLOT ${slotDef.slot}`;

  // Resolve dynamic target and auto-preload rep count for primary movement
  const resolved = resolveExerciseTarget(slotDef.primary, slotDef.target);
  if (currentTargetTag) {
    currentTargetTag.innerText = resolved.targetText.startsWith('TARGET:')
      ? resolved.targetText 
      : `TARGET: ${resolved.targetText}`;
  }

  const prVault = getPRVault();
  const pr = prVault[slotDef.primary];
  const dynamicLoad = pr && pr.e1rm > 0 
    ? calculateTargetLoad(pr.e1rm, slotDef.target, slotDef.defaultLoad, slotDef.primary) 
    : slotDef.defaultLoad;

  const loadInput = document.getElementById('loadInput');
  const repsInput = document.getElementById('repsInput');
  if (loadInput) loadInput.value = dynamicLoad;
  if (repsInput) repsInput.value = resolved.defaultReps;

  renderMovementIntel(slotDef.primary);
  updateInputLabelsForExercise(slotDef.primary);
  updateLogButtonText();
}

export function selectStage(stageKey, resetIfNew = true) {
  if (resetIfNew && stageKey !== activeStageKey) {
    if (activeSession.sets.length > 0 && !confirm("Switching stages will start a new session. Proceed?")) return;
    activeSession = { stage: stageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
    activeSlotIndex = 0;
    window.activeSession = activeSession;
  }
  activeStageKey = stageKey;
  activeSession.stage = stageKey;
  window.activeSession = activeSession;

  document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById(`tab-${stageKey}`);
  if (activeTab) activeTab.classList.add('active');

  const stageDef = STAGES[stageKey];
  if (stageDef) {
    const stageFocus = document.getElementById('stageFocus');
    const stageName = document.getElementById('stageName');
    const prehabLabel = document.getElementById('prehabLabel');

    if (stageFocus) stageFocus.innerText = `STAGE CLEAR ZONE // ${stageKey.replace('_', ' ')}`;
    if (stageName) stageName.innerText = stageDef.name;
    if (prehabLabel) prehabLabel.innerText = stageDef.prehab.replace('Prehab: ', '');
  }

  renderStageRecordBanner(stageKey);
  renderSlotStepper();
  loadSlotData();
  renderPrehabInstructions(stageKey);
  saveSessionState();
  renderSessionUI();
}

function renderSlotStepper() {
  const stepper = document.getElementById('slotStepper');
  if (!stepper) return;
  stepper.innerHTML = '';
  const stageDef = STAGES[activeStageKey];
  if (!stageDef) return;

  stageDef.slots.forEach((slotData, index) => {
    const btn = document.createElement('div');
    btn.className = `slot-btn ${index === activeSlotIndex ? 'active' : ''}`;
    const setsInSlot = activeSession.sets.filter(s => s.slot === slotData.slot).length;
    if (setsInSlot >= 3) btn.classList.add('completed');
    btn.innerText = slotData.slot;
    btn.onclick = () => {
      activeSlotIndex = index;
      saveSessionState();
      renderSlotStepper();
      loadSlotData();
    };
    stepper.appendChild(btn);
  });
}

function updateLogButtonText() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];
  const setsInThisSlot = activeSession.sets.filter(s => s.slot === slotDef.slot).length;
  const logBtn = document.getElementById('logSetBtn');
  if (!logBtn) return;
  if (activeStageKey === 'CH_1RM') {
    logBtn.innerText = `LOG 1RM ATTEMPT (${slotDef.slot}) & REST`;
  } else if (activeStageKey === 'CH_AMRAP') {
    logBtn.innerText = `LOG AMRAP SET (${slotDef.slot}) & REST`;
  } else {
    logBtn.innerText = `LOG SET ${setsInThisSlot + 1} (${slotDef.slot}) & REST`;
  }
}

export function logActiveSet() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];
  const exercise = document.getElementById('exerciseSelect') ? document.getElementById('exerciseSelect').value : slotDef.primary;
  const load = parseFloat(document.getElementById('loadInput').value) || 0;
  const reps = parseInt(document.getElementById('repsInput').value, 10) || 0;
  const rpe = parseFloat(document.getElementById('rpeSelect').value) || 7.5;

  const setsInSlot = activeSession.sets.filter(s => s.slot === slotDef.slot).length + 1;
  const isCardio = !!CARDIO_CONFIGS[exercise];
  const setE1RM = isCardio ? 0 : calculateE1RM(load, reps, rpe);

  const prVault = getPRVault();
  const currentPR = prVault[exercise] ? (prVault[exercise].e1rm || 0) : 0;
  let isNewPR = false;

  if (setE1RM > currentPR && tempoClean && !currentSetPain && !isCardio) {
    prVault[exercise] = {
      e1rm: setE1RM,
      load,
      reps,
      bestSet: `${load}lbs × ${reps}r @ RPE ${rpe}`,
      date: new Date().toISOString().split('T')[0]
    };
    savePRVault(prVault);
    isNewPR = true;
    showToast(`★ NEW 1RM PR: ${exercise} → ${setE1RM} LBS!`);
  }

  let equivReps = reps;
  let finalLoad = load;
  let displayMetric = `${load}lbs × ${reps}r`;

  const isBand = (currentSlotGearMode === 'BANDS') || isBandMovement(exercise);
  if (isBand && activeBandCombo.nominalLoad > 0) {
    finalLoad = activeBandCombo.nominalLoad;
    displayMetric = `${activeBandCombo.comboLabel} (${finalLoad} lbs) × ${reps}r`;
  }
  let equivVolume = Math.round(finalLoad * reps);

  if (isCardio) {
    const cMetrics = CARDIO_CONFIGS[exercise].calcEquiv(load, reps);
    equivReps = cMetrics.equivReps;
    equivVolume = cMetrics.equivVolume;
    displayMetric = cMetrics.display;
  }

  const resolved = resolveExerciseTarget(exercise, slotDef.target);

  const completedSetObj = {
    slot: slotDef.slot,
    exercise,
    setNum: setsInSlot,
    load: finalLoad,                     // Numerical nominal load for e1RM & volume
    reps,
    target: resolved.targetText,
    equivReps,
    equivVolume,                         // Accurately calculated with finalLoad
    displayMetric,                       // "Green + Red (105 lbs) × 8r"
    rpe,
    e1rm: setE1RM,
    isNewPR,
    tempoClean,
    jointPain: currentSetPain
  };

  // 1. Commit the completed set object
  activeSession.sets.push(completedSetObj);
  checkSecretRingTriggers(completedSetObj, showToast);

  // 2. Apply strain penalty ONLY if the logged set recorded joint pain
  if (completedSetObj.jointPain) {
    activeSession.jointPain = true;
    if (typeof applySuperSonicDamagePenalty === 'function') {
      applySuperSonicDamagePenalty('strain');
    }
    showToast('⚠️ JOINT STRAIN LOGGED: Shield integrity depleted to 50%');
  } else if (!completedSetObj.tempoClean) {
    if (typeof applySuperSonicDamagePenalty === 'function') {
      applySuperSonicDamagePenalty('tempo');
    }
  }

  // 3. Reset toggle state and button for the next set
  saveSessionState();
  renderSessionUI();
  playRingChime();
  if (navigator.vibrate) navigator.vibrate(50);

  startRestTimer((secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    const clk = document.getElementById('timerClock');
    if (clk) clk.innerText = `${String(mins).padStart(2,'0')}:${String(rem).padStart(2,'0')}`;
  });

  if (setsInSlot >= 3 && activeSlotIndex < stageDef.slots.length - 1) {
    activeSlotIndex++;
    saveSessionState();
    renderSlotStepper();
    loadSlotData();
  } else {
    saveSessionState();
    renderSlotStepper();
    updateLogButtonText();
    const autoAdj = autoRegulateNextSet(completedSetObj);
    if (autoAdj) {
      if (autoAdj.load && document.getElementById('loadInput')) document.getElementById('loadInput').value = autoAdj.load;
      if (autoAdj.reps && document.getElementById('repsInput')) document.getElementById('repsInput').value = autoAdj.reps;
      showToast(autoAdj.message);
    }
  }

  currentSetPain = false;
  const painBtn = document.getElementById('painBtn');
  if (painBtn) {
    painBtn.classList.remove('active-red');
    painBtn.innerText = "Joint Strain: No";
  }
}

export function togglePrehab() {
  if (!window.activeSession) return;

  activeSession.prehabChecked = !activeSession.prehabChecked;
  if (activeSession.prehabChecked && navigator.vibrate) {
    navigator.vibrate(35);
  }

  saveSessionState();
  renderSessionUI();
}

export function toggleTempo() {
  tempoClean = !tempoClean;
  const btn = document.getElementById('tempoBtn');
  if (btn) {
    if (tempoClean) {
      btn.classList.add('active-green');
      btn.innerText = "Tempo: Clean (3-0-1)";
    } else {
      btn.classList.remove('active-green');
      btn.innerText = "Tempo: Fast / Sloppy";
    }
  }
}

export function togglePain() {
  currentSetPain = !currentSetPain;
  const btn = document.getElementById('painBtn');
  if (btn) {
    if (currentSetPain) {
      btn.classList.add('active-red');
      btn.innerText = "Joint Strain: YES";
    } else {
      btn.classList.remove('active-red');
      btn.innerText = "Joint Strain: No";
    }
  }
  saveSessionState();
  renderSessionUI();
}

function renderSessionUI() {
  // Update Pre-Flight Mission Badge & Button State
  const badge = document.getElementById('prehabStatusBadge');
  const clearBtn = document.getElementById('prehabClearBtn');
  if (badge) {
    badge.textContent = activeSession.prehabChecked ? 'CLEARED' : 'PENDING';
    badge.className = activeSession.prehabChecked ? 'badge cleared' : 'badge pending';
  }
  if (clearBtn) {
    clearBtn.textContent = activeSession.prehabChecked ? '✓ PRE-FLIGHT CLEARED' : 'MARK PRE-FLIGHT CLEARED (+100% SHIELD)';
    clearBtn.style.background = activeSession.prehabChecked ? '#166534' : '';
  }

  const shield = document.getElementById('shieldStatus');
  if (shield) {
    const isStrained = activeSession.jointPain || activeSession.sets.some(s => s.jointPain);
    if (isStrained) {
      shield.innerText = "SHIELD: 50%";
      shield.style.borderColor = "var(--accent-red)";
      shield.style.color = "var(--accent-red)";
    } else {
      shield.innerText = "SHIELD: 100%";
      shield.style.borderColor = "var(--accent-green)";
      shield.style.color = "var(--accent-green)";
    }
  }

  updateTonnageDisplay();
  renderSlotStepper();
  updateLogButtonText();

  const listContainer = document.getElementById('loggedSetsList');
  if (listContainer) {
    listContainer.innerHTML = '';
    activeSession.sets.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'set-row';
      const ringEarned = s.rpe <= 8.0 && s.tempoClean && !s.jointPain;
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="set-tag">${s.slot} • S${s.setNum}</span>
          <span class="set-detail">${s.exercise}: ${s.displayMetric || `${s.load}lbs × ${s.reps}r`} @ RPE ${s.rpe}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="set-badge-ring">${ringEarned ? '★ RING' : 'CHECK'}</span>
        </div>
      `;
      listContainer.appendChild(row);
    });
  }

  // Toggle Time Brake visibility strictly when Darkspine Sonic is active
  const timeBrakeBtn = document.getElementById('timeBrakeBtn');
  if (timeBrakeBtn) {
    const isDarkspineActive = (typeof devDarkspineOverride === 'boolean')
      ? devDarkspineOverride 
      : (isDarkspineModeUnlocked() && ['DAY_G', 'DAY_H', 'DAY_I'].includes(activeStageKey));

    if (isDarkspineActive) {
      timeBrakeBtn.style.setProperty('display', 'inline-block', 'important');
    } else {
      timeBrakeBtn.style.setProperty('display', 'none', 'important');
    }
  }
}

function ensureStageTabsExist() {
  const stageNav = document.querySelector('.stage-nav') || document.querySelector('.stage-tabs');
  if (!stageNav) return;

  // Exact canonical sequence for all stages and challenge sorties
  const canonicalOrder = [
    { key: 'DAY_A', label: 'DAY A', className: 'stage-tab' },
    { key: 'DAY_B', label: 'DAY B', className: 'stage-tab' },
    { key: 'DAY_C', label: 'DAY C', className: 'stage-tab' },
    { key: 'DAY_D', label: 'DAY D', className: 'stage-tab' },
    { key: 'DAY_E', label: 'DAY E', className: 'stage-tab' },
    { key: 'DAY_F', label: 'DAY F', className: 'stage-tab' },
    { key: 'DAY_G', label: 'DAY G', className: 'stage-tab' },
    { key: 'DAY_H', label: 'DAY H', className: 'stage-tab' },
    { key: 'DAY_I', label: 'DAY I', className: 'stage-tab' },
    { key: 'CH_1RM', label: '⚡ 1RM TEST', className: 'stage-tab challenge-tab-gold' },
    { key: 'CH_AMRAP', label: '🔥 TO FAILURE', className: 'stage-tab challenge-tab-red' }
  ];

  canonicalOrder.forEach(item => {
    let tab = document.getElementById(`tab-${item.key}`);
    
    // Create tab element if missing
    if (!tab) {
      tab = document.createElement('div');
      tab.id = `tab-${item.key}`;
      tab.innerText = item.label;
      tab.onclick = () => selectStage(item.key);
    }

    // Ensure styling classes match
    tab.className = item.className;
    if (item.key === activeStageKey) {
      tab.classList.add('active');
    }

    // Re-append in strict canonical order
    stageNav.appendChild(tab);
  });
}

// -------------------------------------------------------------
// CORE STAGE CLEAR WORKFLOW
// -------------------------------------------------------------
export function finishSession() {
  openAuditModal(activeSession, async () => {
    const totalReps = activeSession.sets.reduce((sum, s) => sum + (s.equivReps !== undefined ? s.equivReps : s.reps), 0);
    const forceBonus = totalReps * 75;
    const prehabBonus = activeSession.prehabChecked ? 15000 : 0;
    const ringsBanked = activeSession.sets.filter(s => s.rpe <= 8.0 && s.tempoClean && !s.jointPain).length;
    const redRingBonus = ringsBanked * 10000;
    let totalScore = forceBonus + prehabBonus + 20000 + redRingBonus;

    // Darkspine Conditioning Surge (+500 pts per interval on Days G, H, I)
    if (isDarkspineModeUnlocked() && ['DAY_G', 'DAY_H', 'DAY_I'].includes(activeStageKey)) {
      totalScore += (activeSession.sets.length * 500);
    }

    // Super Sonic / Super Sonic 2 Multiplier (Session Active)
    if (isSuperModeSessionActive()) {
      const mult = isSuperSonic2Unlocked() ? 1.50 : 1.25;
      totalScore = Math.round(totalScore * mult);
    }

    const rank = totalScore >= 75000 ? "S" : (totalScore >= 55000 ? "A" : "B");

    // Award Standard Gold Rings (Total Score / 1000)
    const standardRingsEarned = Math.floor(totalScore / 1000);
    addStandardRings(standardRingsEarned);

    // Check Perfect Day for Chaos Emerald Award
    const isPerfectDay = rank === 'S' && !activeSession.jointPain && !activeSession.sets.some(s => s.jointPain) && ringsBanked >= activeSession.sets.length;
    const emeraldWon = evaluatePerfectDayEmerald(activeStageKey, isPerfectDay, showToast);

    const recordRes = saveStageRecord(activeStageKey, totalScore, rank);
    localStorage.setItem('sonic_last_stage', activeStageKey);
    localStorage.setItem('sonic_last_strain', (activeSession.jointPain || activeSession.sets.some(s => s.jointPain)) ? 'true' : 'false');

    const oldExp = getLifetimeExp();
    const newExp = oldExp + totalScore;
    localStorage.setItem('sonic_lifetime_exp', newExp);
    updatePilotExpUI();

    const oldProg = calculatePilotProgress(oldExp);
    const newProg = calculatePilotProgress(newExp);

    creditVaultRings(activeSession.sets);
    renderVault();
    renderArtifactsTray();

    renderResultsOverlay({
      stage: activeStageKey,
      totalScore,
      rank,
      ringBonus: prehabBonus,
      timeBonus: 20000,
      forceBonus,
      redRingBonus,
      ringsBanked,
      totalSets: activeSession.sets.length,
      didLevelUp: newProg.level > oldProg.level,
      newLevel: newProg.level,
      expProgressPct: newProg.progressPct,
      isNewRecord: recordRes.isNew,
      goldRingsEarned: standardRingsEarned,
      awardedEmerald: emeraldWon,
      isSuperActive: isSuperModeSessionActive(),
      isSS2: isSuperSonic2Unlocked()
    }, () => {
      activeSession = { stage: activeStageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
      activeSlotIndex = 0;
      saveSessionState();
      renderSessionUI();
    });

    syncSessionToSheets({
      stage: activeStageKey,
      totalScore,
      rank,
      ringsBanked,
      totalReps,
      prehab: activeSession.prehabChecked,
      jointPain: activeSession.jointPain,
      sets: activeSession.sets
    });
  });
}

// Global scope window bindings
window.selectStage = selectStage;
window.logActiveSet = logActiveSet;
window.togglePrehab = togglePrehab;
window.togglePrehabDrawer = togglePrehabDrawer;
window.renderPrehabInstructions = renderPrehabInstructions;
window.finishSession = finishSession;
window.toggleTempo = toggleTempo;
window.togglePain = togglePain;
window.switchMainTab = switchMainTab;
window.renderPRVaultUI = renderPRVaultUI; 
window.renderVault = renderVault;
window.renderSkillTree = renderSkillTree;
window.switchSkillTreeBranch = switchSkillTreeBranch;
window.unlockPerk = unlockPerk;

window.applyTimeBrake = () => applyTimeBrake((secs) => {
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  const clk = document.getElementById('timerClock');
  if (clk) clk.innerText = `${String(mins).padStart(2,'0')}:${String(rem).padStart(2,'0')}`;
});

window.toggleAudioTheme = () => {
  const next = toggleAudioTheme();
  showToast(`Audio Theme: ${next === 'modern' ? 'MODERN SONIC ⚡' : '16-BIT CLASSIC 🕹️'}`);
};

// Global DOM Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  ensureStageTabsExist();
  updatePilotExpUI();
  selectStage(activeStageKey, false);
  renderVault();
  renderArtifactsTray();
  initTimerBackgroundSync();

  // File: docs/js/app.js (Inside DOMContentLoaded listener)

  const gymBtn = document.getElementById('gearModeGymBtn');
  const bandBtn = document.getElementById('gearModeBandBtn');

  if (gymBtn && bandBtn) {
    gymBtn.onclick = () => {
      currentSlotGearMode = 'GYM';
      gymBtn.style.background = '#38bdf8';
      gymBtn.style.color = '#0f172a';
      bandBtn.style.background = 'transparent';
      bandBtn.style.color = '#94a3b8';
      hydrateExerciseDropdown();
      syncEquipmentInputs();
    };

bandBtn.onclick = () => {
      currentSlotGearMode = 'BANDS';
      bandBtn.style.background = '#38bdf8';
      bandBtn.style.color = '#0f172a';
      gymBtn.style.background = 'transparent';
      gymBtn.style.color = '#94a3b8';

      // 1. Populate dropdown with banded alternates
      hydrateExerciseDropdown();

      // 2. Fetch parameters
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef?.slots?.[activeSlotIndex];
      const gymPrimary = slotDef ? slotDef.primary : '';
      const slotTarget = slotDef ? slotDef.target : "3x8-10";
      const currentBandExercise = document.getElementById('exerciseSelect')?.value || '';

      // 3. Solve 3-step preset
      const { selectedKeys, nominalTotal } = resolveInitialBandPreset(
        currentBandExercise,
        gymPrimary,
        slotTarget,
        slotDef?.defaultLoad || 50
      );

      // 4. Pre-set active keys in memory THEN mount selector DOM
      setActiveBandSelection(selectedKeys);
      syncEquipmentInputs();

      // 5. Update tactical cues/intel for the newly selected banded exercise!
      renderMovementIntel(currentBandExercise);
      updateInputLabelsForExercise(currentBandExercise);

      // 6. Explicitly assign loadInput
      const loadInput = document.getElementById('loadInput');
      if (loadInput) loadInput.value = nominalTotal;
    };
  }
  checkAndRenderFlightPathPrompt(activeSession, (nextStage) => {
    selectStage(nextStage);
    showToast(`FLIGHT PATH ENGAGED: ${nextStage.replace('_', ' ')}!`);
  });

  const logBtn = document.getElementById('logSetBtn');
  if (logBtn) logBtn.onclick = logActiveSet;

  const prehabBox = document.getElementById('prehabBox');
  if (prehabBox) prehabBox.onclick = togglePrehab;

  const tempoBtn = document.getElementById('tempoBtn');
  if (tempoBtn) tempoBtn.onclick = toggleTempo;

  const painBtn = document.getElementById('painBtn');
  if (painBtn) painBtn.onclick = togglePain;

  const timeBrakeBtn = document.getElementById('timeBrakeBtn');
  if (timeBrakeBtn) timeBrakeBtn.onclick = window.applyTimeBrake;

// docs/js/app.js (inside DOMContentLoaded listener)

  const exSelect = document.getElementById('exerciseSelect');
  if (exSelect) {
    exSelect.onchange = () => {
      const val = exSelect.value;
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef?.slots?.[activeSlotIndex];
      const defaultTarget = slotDef ? slotDef.target : "3x8-10";

      // 1. Dynamic target bracket & rep preload
      const resolved = resolveExerciseTarget(val, defaultTarget);
      const targetTag = document.getElementById('currentTargetTag');
      if (targetTag) {
        targetTag.innerText = resolved.targetText.startsWith('TARGET:') 
          ? resolved.targetText 
          : `TARGET: ${resolved.targetText}`;
      }

      const repsInput = document.getElementById('repsInput');
      if (repsInput) repsInput.value = resolved.defaultReps;

      // 2. Load Resolution & Equipment Autoset
      const prVault = getPRVault();
      const pr = prVault[val];
      const isBand = (currentSlotGearMode === 'BANDS') || isBandMovement(val);

     // docs/js/app.js (inside exSelect.onchange)

      if (isBand) {
        const gymPrimary = slotDef ? slotDef.primary : '';
        const { selectedKeys, nominalTotal } = resolveInitialBandPreset(
          val, 
          gymPrimary, 
          defaultTarget, 
          slotDef?.defaultLoad || 50
        );

        setActiveBandSelection(selectedKeys);
        syncEquipmentInputs();

        const loadInput = document.getElementById('loadInput');
        if (loadInput) loadInput.value = nominalTotal;
      } else {
        const baseLoad = getDefaultGymLoad(val, slotDef?.defaultLoad);
        const dynamicLoad = pr && pr.e1rm > 0 
          ? calculateTargetLoad(pr.e1rm, defaultTarget, baseLoad, val) 
          : baseLoad;

        const loadInput = document.getElementById('loadInput');
        if (loadInput) loadInput.value = dynamicLoad;
        syncEquipmentInputs();
      }

      // 3. Update tactical cues and labels
      renderMovementIntel(val);
      updateInputLabelsForExercise(val);
    };
  }

// Live Sheet Telemetry Sync on boot
  fetchSheetTelemetry().then(data => {
    if (data && data.status === 'success') {
      if (data.lifetimeExp !== undefined) {
        localStorage.setItem('sonic_lifetime_exp', data.lifetimeExp);
        updatePilotExpUI();
      }
      if (data.goldRings !== undefined) {
        saveStandardRings(data.goldRings);
      }
      // Hydrate Red Star Ring ground truth directly from COMMAND_HUB!G3
      if (data.totalRedRings !== undefined) {
        localStorage.setItem('sonic_total_red_rings', data.totalRedRings);
      }
      if (data.stageRecords && typeof data.stageRecords === 'object') {
        setRuntimeStageRecords(data.stageRecords);
        if (typeof renderStageRecordBanner === 'function') {
          renderStageRecordBanner(activeStageKey);
        }
        if (typeof renderAllStageRecords === 'function') {
          renderAllStageRecords();
        }
      }
      
   
      if (data.emeralds || data.chaosEmeralds) {
        setRuntimeEmeralds(data.emeralds || data.chaosEmeralds);
      }
      if (data.worldRings) {
        setRuntimeWorldRings(data.worldRings);
      }
      if (data.unlockedPerks) {
        setRuntimeUnlockedPerks(data.unlockedPerks);
      }
      // =========================================================

      if (data.stages) {
        localStorage.setItem('sonic_stage_statuses', JSON.stringify(data.stages));
        checkAndRenderFlightPathPrompt(activeSession, (nextStage) => {
          selectStage(nextStage);
          showToast(`FLIGHT PATH ENGAGED: ${nextStage.replace('_', ' ')}!`);
        });
      }
      if (data.prVault) {
        savePRVault(data.prVault);
        if (typeof renderPRVaultUI === 'function') {
          renderPRVaultUI();
        }
      }
      if (data.vault && Array.isArray(data.vault) && data.vault.length > 0) {
        saveVaultData(data.vault);
      }

      // Re-render UI views with fresh cloud state
      renderVault();
      renderArtifactsTray();
      updateHudRingBar();
      if (typeof renderSkillTree === 'function') renderSkillTree();
    }
  });

  // Attach clear stage listener to the advance button
  const clearBtn = document.getElementById('stageClearBtn') || document.querySelector('.btn-advance');
  if (clearBtn) {
    clearBtn.onclick = finishSession;
  }
});

// -------------------------------------------------------------
// AUTOMATIC PWA SERVICE WORKER UPDATE ENGINE
// -------------------------------------------------------------
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      if (reg.waiting) {
        showUpdateBanner(reg.waiting);
        return;
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner(newWorker);
          }
        });
      });
    }).catch(err => console.error('[SW] Registration error:', err));
  });
}

function showUpdateBanner(worker) {
  if (document.getElementById('pwaUpdateBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwaUpdateBanner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    border: 1px solid var(--accent-blue, #38bdf8);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
    color: #f8fafc;
    padding: 10px 16px;
    border-radius: 8px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
  `;

  banner.innerHTML = `
    <span>⚡ SYSTEM UPDATE READY</span>
    <button id="pwaReloadBtn" style="
      background: var(--accent-blue, #38bdf8);
      color: #0b0f19;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 11px;
      cursor: pointer;
    ">RELOAD ↻</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('pwaReloadBtn').onclick = () => {
    worker.postMessage({ action: 'skipWaiting' });
    banner.remove();
  };
}

// -------------------------------------------------------------
// CHROME DEVTOOLS TESTING CONSOLE HARNESS
// -------------------------------------------------------------
window.__sonicDev = {
  getWallet: () => ({
    goldRings: getStandardRings(),
    redStarRings: getTotalRedRings(),
    isSuperSonic2Unlocked: isSuperSonic2Unlocked(),
    isSuperActive: isSuperModeSessionActive()
  }),
  setGoldRings: (amount) => saveStandardRings(amount),
  testEmeraldRoll: (stageKey = 'DAY_A') => evaluatePerfectDayEmerald(stageKey, true, (msg) => console.log('EMERALD TOAST:', msg)),
  testStrainDamage: () => applySuperSonicDamagePenalty('strain'),
  testTempoDamage: () => applySuperSonicDamagePenalty('tempo'),
  engageSuper: () => window.activateSuperModeSession(),
  revertSuper: () => window.deactivateSuperModeSession(),
  getPerks: () => getUnlockedPerks(),
  openSkills: () => toggleSkillTreeDrawer(),

  toggleDarkspine: (forceState) => {
    devDarkspineOverride = typeof forceState === 'boolean' ? forceState : !devDarkspineOverride;
    
    const timeBrakeBtn = document.getElementById('timeBrakeBtn');
    if (timeBrakeBtn) {
      if (devDarkspineOverride) {
        timeBrakeBtn.style.setProperty('display', 'inline-block', 'important');
      } else {
        timeBrakeBtn.style.setProperty('display', 'none', 'important');
      }
    }
    
    renderSessionUI();
    console.log(`⚡ [SONIC DEV] Darkspine Mode Override: ${devDarkspineOverride ? 'ENGAGED (Time Brake Visible)' : 'DISENGAGED (Time Brake Hidden)'}`);
    return devDarkspineOverride;
  },
  resetDarkspineOverride: () => {
    devDarkspineOverride = null;
    renderSessionUI();
    console.log('⚡ [SONIC DEV] Darkspine Mode Override Cleared: Following natural stage/unlock rules.');
  },
  testTimeBrake: () => {
    if (window.applyTimeBrake) {
      window.applyTimeBrake();
      console.log('⚡ [SONIC DEV] Time Brake triggered (-15s rest).');
    }
  }
};
console.log('⚡ [SONIC HUD] DevTools Testing Suite available at window.__sonicDev');

export function appendCardioFinisherSlot() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef) return;

  // Prevent duplicating the finisher slot if already added
  const existingFinisher = stageDef.slots.find(s => s.isModularFinisher);
  if (existingFinisher) {
    showToast('Conditioning Finisher already attached to active sortie.');
    return;
  }

  const finisherSlot = {
    slot: `${activeStageKey.replace('DAY_', '')}5`,
    target: "10-12 Mins @ Zone 2",
    primary: "Incline Treadmill Walk (Zone 2)",
    defaultLoad: 10, // 10% incline
    isModularFinisher: true,
    alts: [
      "Incline Treadmill Walk (Zone 2)",
      "Airdyne Bike (Interval Cadence)",
      "Concept2 Rower (Zone 2 Pace)"
    ]
  };

  stageDef.slots.push(finisherSlot);
  renderSlotStepper();
  showToast('⚡ MODULAR CARDIO FINISHER APPENDED TO SORTIE');
}

// Bind to window for HUD or prompt buttons
window.appendCardioFinisherSlot = appendCardioFinisherSlot;
window.renderCalculator = renderCalculator;
