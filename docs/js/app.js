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
import { fetchSheetTelemetry, syncSessionToSheets, promptWebhookUrl } from './core/sync.js';
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
import { BAND_CONFIG, getPackedBandIds, setPackedBandIds, canPerformBandMovement } from './data/bandConfigs.js';
import { getBandEquivalent, SLOT_BAND_EXTRAS } from './data/bandEquivalents.js';
import { resolveInitialBandPreset, solveBestBandCombination, solveOverdriveBandBridge } from './engine/bandSolver.js';
import { renderBandSelector, isBandMovement, getSelectedBandCombo, clearBandSelections, setActiveBandSelection } from './ui/renderBandSelector.js';
import { MOVEMENT_INTEL, getDefaultGymLoad } from './data/movementIntel.js';
import { renderCalculator } from './ui/renderCalculator.js';
import { getRotatorMode, setRotatorMode, resolveSlotPreset, resolveFocusNextStep, recordSlotRotationHistory, getExerciseMuscleTags } from './engine/slotRotator.js';
import { renderBiometricsUI } from './ui/renderBiometrics.js';

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
  const slotStr = (defaultSlotTarget || '');
  const slotLower = slotStr.toLowerCase();

  // 1. Zone 2 Continuous Cardio (Minutes) — e.g. "10-12 Mins @ Zone 2"
  if (slotLower.includes('min') || name.includes('zone 2')) {
    return { targetText: "1 × 10-12 Mins (Zone 2)", defaultReps: 12 };
  }

  // 2. Surge Intervals (Rounds) — e.g. "6-8 Rounds (30s on / 60s off)" or "(30s/60s)"
  if (
    slotLower.includes('round') || 
    name.includes('30s/60s') || 
    name.includes('30s on') || 
    name.includes('surge') || 
    (name.includes('sprint') && !name.includes('500m'))
  ) {
    return { targetText: "6-8 Rounds (30s On / 60s Off)", defaultReps: 8 };
  }

  // 3. Timed Sets & Apex Sprints (45s High Knees / 45s TUT / 90s AMRAP / 500m Sprint)
  if (name.includes('500m')) {
    return { targetText: "1 × 500m Sprint (Sub-1:45)", defaultReps: 105 };
  }
  if (name.includes('90s') || slotLower.includes('90s')) {
    return { targetText: "1 × 90s Max Effort", defaultReps: 90 };
  }
  if (name.includes('45s') || slotLower.includes('45s')) {
    return { targetText: "3 × 45s Time-Under-Tension", defaultReps: 45 };
  }

  // 4. Embedded specific rep/hold notes in name: (12r/side), (5s hold), (25r), (20r), etc.
  const matchReps = exerciseName.match(/\((\d+r\/side|\d+[-–—]\d+|\d+s hold|\d+s|\d+r|\d+\s*reps?)/i);
  if (matchReps) {
    const raw = matchReps[1];
    const numMatch = raw.match(/\d+/);
    return {
      targetText: `3 × ${raw}`,
      defaultReps: numMatch ? parseInt(numMatch[0], 10) : 10
    };
  }

  // 5. Carries & Locomotion (Paces) — excludes Treadmill & Power Walks
  if (
    name.includes('carry') || 
    name.includes('waiter') || 
    name.includes('suitcase march') || 
    name.includes('march in place') ||
    (name.includes('walk') && !name.includes('treadmill') && !name.includes('power walk')) || 
    name.includes('crawl')
  ) {
    return { targetText: "3 × 40-50 paces", defaultReps: 50 };
  }

  // 6. Static Flexibility, Isometric Holds & Core Bracing (Seconds)
  if (name.includes('stretch') || name.includes('pigeon')) {
    return { targetText: "2 × 30-45s hold", defaultReps: 35 };
  }
  if (name.includes('hold') || name.includes('plank') || slotLower.includes('hold')) {
    return { targetText: "3 × 20-30s hold", defaultReps: 30 };
  }

  // 7. Deadbugs (Controlled Reps per Side)
  if (name.includes('deadbug')) {
    return { targetText: "3 × 8-10 / side", defaultReps: 10 };
  }

  // 7.5. Segmental Spine Mobility Exception (Jefferson Curls stay in slow 6–8 rep mobility range)
  if (name.includes('jefferson')) {
    return { targetText: "3 × 6-8", defaultReps: 8 };
  }

  // 8. Isolation, Hip Armor & Accessories (Adduction, Abduction, Flyes, Raises, Curls, Extensions)
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

  // 9. Trunk & Core Compression
  if (name.includes('crunch') || name.includes('pallof')) {
    return { targetText: "3 × 10-12", defaultReps: 12 };
  }

  // 10. Inherit the stage slot definition if no specific movement override matched
  const slotMatch = slotStr.match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (slotMatch) {
    const minR = parseInt(slotMatch[1], 10);
    const maxR = parseInt(slotMatch[2], 10);
    return { targetText: `3 × ${minR}-${maxR}`, defaultReps: maxR };
  }
if (name.includes('z-press') || name.includes('z press')) {
    return { targetText: '3x8-10', defaultReps: 10 };
  }
  return { targetText: defaultSlotTarget, defaultReps: 8 };

function renderBagInventoryChecklist() {
  const mount = document.getElementById('bagChecklistMount');
  if (!mount) return;
  const packed = getPackedBandIds();

  mount.innerHTML = Object.values(BAND_CONFIG).map(band => {
    const checked = packed.has(band.id) ? 'checked' : '';
    const typeTag = band.type === '41_loop' ? '41"' : band.type === 'mini' ? 'Mini' : 'Tube';
    const displayName = band.name || band.label || band.id;
    return `
      <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #e2e8f0; background: rgba(30, 41, 59, 0.7); padding: 5px 7px; border-radius: 5px; cursor: pointer;">
        <input type="checkbox" class="bag-band-checkbox" data-band-id="${band.id}" ${checked} style="accent-color: #38bdf8;" />
        <span>${displayName} <span style="color: #94a3b8; font-size: 10px;">(${typeTag})</span></span>
      </label>
    `;
  }).join('');

  mount.querySelectorAll('.bag-band-checkbox').forEach(cb => {
    cb.onchange = () => {
      const current = getPackedBandIds();
      if (cb.checked) current.add(cb.dataset.bandId);
      else current.delete(cb.dataset.bandId);
      setPackedBandIds(current);

      // Immediately refresh active dropdown and band pills if in BANDS mode
      if (currentSlotGearMode === 'BANDS') {
        hydrateExerciseDropdown();
        syncEquipmentInputs();
        syncLRSplitVisibility(document.getElementById('exerciseSelect')?.value || '');
      }
    };
  });
}

function hydrateExerciseDropdown() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];
  const select = document.getElementById('exerciseSelect');
  if (!select) return;

  // TSK-14: Auto-select exercise based on FRESH vs. cumulative FOCUS mode
  const recommendedExercise = resolveSlotPreset(
    activeStageKey,
    slotDef,
    activeSlotIndex,
    activeSession?.sets || []
  );

  select.innerHTML = '';

  if (currentSlotGearMode === 'GYM') {
    slotDef.alts.forEach(alt => {
      const opt = document.createElement('option');
      opt.value = alt;
      opt.innerText = alt;
      select.appendChild(opt);
    });
    select.value = recommendedExercise;
  } else {
    // Mode is BANDS: Combine mapped equivalents + slot extras, then filter to packed bag
    const mappedAlts = slotDef.alts.map(alt => getBandEquivalent(alt));
    const extras = SLOT_BAND_EXTRAS[slotDef.slot] || [];
    const uniqueAll = [...new Set([...mappedAlts, ...extras])];
    const availableAlts = uniqueAll.filter(ex => canPerformBandMovement(ex));
    const listToRender = availableAlts.length > 0 ? availableAlts : uniqueAll;

    listToRender.forEach(bandAlt => {
      const opt = document.createElement('option');
      opt.value = bandAlt;
      opt.innerText = bandAlt;
      select.appendChild(opt);
    });

    const preferred = getBandEquivalent(recommendedExercise);
    select.value = listToRender.includes(preferred) ? preferred : listToRender[0];
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

let isLRSplitActive = false;

export function isUnilateralOrDBMovement(exerciseName = '') {
  const n = String(exerciseName).toLowerCase();
  return (
    /\bdb\b/.test(n) ||
    n.includes('dumbbell') ||
    n.includes('single-arm') ||
    n.includes('single arm') ||
    n.includes('iso-lateral') ||
    n.includes('unilateral') ||
    n.includes('suitcase')
  );
}

export function isIsometricOrTimedMovement(exerciseName = '') {
  const n = String(exerciseName).toLowerCase();
  return (
    n.includes('isometric') ||
    n.includes('hold') ||
    n.includes('plank') ||
    /\(\d+(-\d+)?s\)/.test(n)
  );
}

export function syncLRSplitVisibility(exerciseName) {
  const bar = document.getElementById('lrSplitToggleBar');
  const container = document.getElementById('lrSplitInputContainer');
  const standardRow = document.getElementById('standardInputRow');

  const eligible = isUnilateralOrDBMovement(exerciseName) && !isIsometricOrTimedMovement(exerciseName);
  if (!eligible) {
    isLRSplitActive = false;
    if (bar) bar.style.display = 'none';
    if (container) container.style.display = 'none';
    if (standardRow) standardRow.style.display = '';
    return;
  }

  if (bar) bar.style.display = 'flex';
  updateLRSplitDOM();
}

function updateLRSplitDOM() {
  const btn = document.getElementById('lrSplitToggleBtn');
  const container = document.getElementById('lrSplitInputContainer');
  const standardRow = document.getElementById('standardInputRow');

  if (isLRSplitActive) {
    const baseLoad = document.getElementById('loadInput')?.value || '';
    const baseReps = document.getElementById('repsInput')?.value || '';
    const baseRpe = document.getElementById('rpeSelect')?.value || '7.5';

    if (document.getElementById('leftLoadInput')) document.getElementById('leftLoadInput').value = baseLoad;
    if (document.getElementById('rightLoadInput')) document.getElementById('rightLoadInput').value = baseLoad;
    if (document.getElementById('leftRepsInput')) document.getElementById('leftRepsInput').value = baseReps;
    if (document.getElementById('rightRepsInput')) document.getElementById('rightRepsInput').value = baseReps;
    if (document.getElementById('leftRpeSelect')) document.getElementById('leftRpeSelect').value = baseRpe;
    if (document.getElementById('rightRpeSelect')) document.getElementById('rightRpeSelect').value = baseRpe;

    if (btn) {
      btn.innerText = '⚖️ L/R SPLIT ON';
      btn.style.background = '#a78bfa';
      btn.style.color = '#0f172a';
    }
    if (container) container.style.display = 'flex';
    if (standardRow) standardRow.style.display = 'none';
  } else {
    if (btn) {
      btn.innerText = 'SYNCED (MATCHED)';
      btn.style.background = 'rgba(56, 189, 248, 0.14)';
      btn.style.color = '#38bdf8';
    }
    if (container) container.style.display = 'none';
    if (standardRow) standardRow.style.display = '';
  }
}

export function toggleLRSplitMode() {
  isLRSplitActive = !isLRSplitActive;
  updateLRSplitDOM();
}
window.toggleLRSplitMode = toggleLRSplitMode;

function getFocusFatigueMultiplier(exerciseName) {
  if (getRotatorMode() !== 'FOCUS' || !Array.isArray(activeSession?.sets) || activeSession.sets.length === 0) {
    return 1.0;
  }

  const targetTags = new Set(getExerciseMuscleTags(exerciseName).filter(t => t !== 'general'));
  if (targetTags.size === 0) return 1.0;

  // Count how many prior sets in this session worked overlapping muscles
  let overlappingSets = 0;
  for (const s of activeSession.sets) {
    if (!s.exercise || s.exercise === exerciseName) continue;
    const priorTags = getExerciseMuscleTags(s.exercise);
    if (priorTags.some(tag => targetTags.has(tag))) {
      overlappingSets++;
    }
  }

  const overlapBlocks = Math.floor(overlappingSets / 3);
  if (overlapBlocks <= 0) return 1.0;
  if (overlapBlocks === 1) return 0.90;  // -10% load taper for 2nd synergistic movement
  return 0.825;                          // -17.5% load taper for 3rd+ synergistic movement
}

function loadSlotData() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];

  const currentSlotTag = document.getElementById('currentSlotTag');
  const currentTargetTag = document.getElementById('currentTargetTag');
  if (currentSlotTag) currentSlotTag.innerText = `SLOT ${slotDef.slot}`;

  // Clear previous slot's pill selections, but KEEP currentSlotGearMode sticky across slots
  clearBandSelections();
  activeBandCombo = { nominalLoad: 0, comboLabel: 'None' };

  const gymBtn = document.getElementById('gearModeGymBtn');
  const bandBtn = document.getElementById('gearModeBandBtn');
  if (gymBtn && bandBtn) {
    if (currentSlotGearMode === 'BANDS') {
      bandBtn.style.background = '#38bdf8';
      bandBtn.style.color = '#0f172a';
      gymBtn.style.background = 'transparent';
      gymBtn.style.color = '#94a3b8';
    } else {
      gymBtn.style.background = '#38bdf8';
      gymBtn.style.color = '#0f172a';
      bandBtn.style.background = 'transparent';
      bandBtn.style.color = '#94a3b8';
    }
  }

  // Hydrates dropdown using TSK-14 Fresh/Focus rotator + active gear mode
  hydrateExerciseDropdown();
  syncEquipmentInputs();

  const select = document.getElementById('exerciseSelect');
  const activeExercise = select ? select.value : slotDef.primary;

  // Resolve dynamic target bracket & default reps for the selected movement
  const resolved = resolveExerciseTarget(activeExercise, slotDef.target);
  if (currentTargetTag) {
    currentTargetTag.innerText = resolved.targetText.startsWith('TARGET:')
      ? resolved.targetText
      : `TARGET: ${resolved.targetText}`;
  }

  const repsInput = document.getElementById('repsInput');
  if (repsInput) repsInput.value = resolved.defaultReps;

 const focusMultiplier = getFocusFatigueMultiplier(activeExercise);
  const loadInput = document.getElementById('loadInput');

  if (currentSlotGearMode === 'BANDS' || isBandMovement(activeExercise)) {
    const taperedDefault = Math.max(10, Math.round(((slotDef.defaultLoad || 50) * focusMultiplier) / 5) * 5);
    const { selectedKeys, nominalTotal } = resolveInitialBandPreset(
      activeExercise,
      slotDef.primary,
      slotDef.target,
      taperedDefault
    );
    if (selectedKeys && selectedKeys.length > 0 && typeof setActiveBandSelection === 'function') {
      setActiveBandSelection(selectedKeys);
    }
    if (loadInput && nominalTotal > 0) {
      loadInput.value = nominalTotal;
    }
  } else {
    const prVault = getPRVault();
    const pr = prVault[activeExercise];
    const baseTargetLoad = pr && pr.e1rm > 0
      ? calculateTargetLoad(pr.e1rm, slotDef.target, slotDef.defaultLoad, activeExercise)
      : slotDef.defaultLoad;
    const taperedLoad = Math.max(5, Math.round((baseTargetLoad * focusMultiplier) / 5) * 5);
    if (loadInput) loadInput.value = taperedLoad;
  }

  if (focusMultiplier < 1.0) {
    const pctOff = Math.round((1 - focusMultiplier) * 100);
    showToast(`🎯 FOCUS TAPER: Load scaled -${pctOff}% for pre-fatigued muscles`);
  }

  renderMovementIntel(activeExercise);
  updateInputLabelsForExercise(activeExercise);
  syncLRSplitVisibility(activeExercise);
  updateLogButtonText();
}

export function selectStage(stageKey, resetIfNew = true) {
  if (resetIfNew && stageKey !== activeStageKey) {
    if (activeSession.sets.length > 0 && !confirm("Switching stages will start a new session. Proceed?")) return;
    activeSession = { stage: stageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
    activeSlotIndex = 0;
    currentSlotGearMode = 'GYM';
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
  syncFinisherButtonVisibility();
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

export function syncFinisherButtonVisibility() {
  const bar = document.getElementById('finisherBar');
  if (!bar) return;

  const stageDef = STAGES[activeStageKey];
  const isLiftingDay = ['DAY_A', 'DAY_B', 'DAY_C', 'DAY_D', 'DAY_E'].includes(activeStageKey);
  const alreadyAttached = stageDef?.slots?.some(s => s.isModularFinisher);

  bar.style.display = (isLiftingDay && !alreadyAttached) ? 'flex' : 'none';
}

export function appendCardioFinisherSlot() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef) return;

  if (stageDef.slots.some(s => s.isModularFinisher)) {
    showToast('Zone 2 Finisher already attached to this sortie.');
    return;
  }

  const slotPrefix = activeStageKey.replace('DAY_', '');
  const finisherSlot = {
    slot: `${slotPrefix}5`,
    target: "10-12 Mins @ Zone 2",
    primary: "Stationary Bike (Zone 2 Cadence)",
    defaultLoad: 8,
    isModularFinisher: true,
    alts: [
      "Stationary Bike (Zone 2 Cadence)",
      "Incline Treadmill Walk (Zone 2)",
      "Rower (Zone 2 Steady State)",
      "Low-Impact Shadow Boxing Flow (Zone 2)",
      "March in Place (Paced Zone 2 Cadence)"
    ]
  };

  stageDef.slots.push(finisherSlot);
  syncFinisherButtonVisibility();
  renderSlotStepper();
  activeSlotIndex = stageDef.slots.length - 1;
  saveSessionState();
  renderSlotStepper();
  loadSlotData();
  showToast(`⚡ SLOT ${slotPrefix}5: ZONE 2 FINISHER ATTACHED`);
}

window.appendCardioFinisherSlot = appendCardioFinisherSlot;
window.syncFinisherButtonVisibility = syncFinisherButtonVisibility;

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

  const setsInSlot = activeSession.sets.filter(s => s.slot === slotDef.slot).length + 1;
  const isCardio = !!CARDIO_CONFIGS[exercise];
  const isIsometric = isIsometricOrTimedMovement(exercise);
  const isUnilateral = isUnilateralOrDBMovement(exercise) && !isIsometric;

  let load = parseFloat(document.getElementById('loadInput')?.value) || 0;
  let reps = parseInt(document.getElementById('repsInput')?.value, 10) || 0;
  let rpe = parseFloat(document.getElementById('rpeSelect')?.value) || 7.5;

  let leftTelemetry = null;
  let rightTelemetry = null;
  let setE1RM = 0;
  let displayMetric = `${load}lbs × ${reps}r`;

  if (isUnilateral && isLRSplitActive) {
    const lLoad = parseFloat(document.getElementById('leftLoadInput')?.value) || 0;
    const lReps = parseInt(document.getElementById('leftRepsInput')?.value, 10) || 0;
    const lRpe  = parseFloat(document.getElementById('leftRpeSelect')?.value) || 7.5;

    const rLoad = parseFloat(document.getElementById('rightLoadInput')?.value) || 0;
    const rReps = parseInt(document.getElementById('rightRepsInput')?.value, 10) || 0;
    const rRpe  = parseFloat(document.getElementById('rightRpeSelect')?.value) || 7.5;

    const leftE1RM  = calculateE1RM(lLoad, lReps, lRpe);
    const rightE1RM = calculateE1RM(rLoad, rReps, rRpe);

    leftTelemetry  = { load: lLoad, reps: lReps, rpe: lRpe, e1rm: leftE1RM };
    rightTelemetry = { load: rLoad, reps: rReps, rpe: rRpe, e1rm: rightE1RM };

    const leftIsLimiting = leftE1RM <= rightE1RM;
    load = leftIsLimiting ? lLoad : rLoad;
    reps = leftIsLimiting ? lReps : rReps;
    rpe  = Math.max(lRpe, rRpe);
    setE1RM = Math.min(leftE1RM, rightE1RM);
    displayMetric = `L: ${lLoad}×${lReps} @${lRpe} | R: ${rLoad}×${rReps} @${rRpe}`;
  } else if (!isCardio && !isIsometric) {
    setE1RM = calculateE1RM(load, reps, rpe);
    if (isUnilateral) {
      leftTelemetry  = { load, reps, rpe, e1rm: setE1RM };
      rightTelemetry = { load, reps, rpe, e1rm: setE1RM };
    }
  } else if (isIsometric) {
    setE1RM = 0;
    displayMetric = load > 0 ? `${load}lbs × ${reps}s hold` : `BW × ${reps}s hold`;
  }

  // PR VAULT TRACKING — Isolated to exact `exercise` name
  const prVault = getPRVault();
  const currentPR = prVault[exercise] ? (prVault[exercise].e1rm || 0) : 0;
  let isNewPR = false;

  if (setE1RM > currentPR && tempoClean && !currentSetPain && !isCardio && !isIsometric) {
    prVault[exercise] = {
      e1rm: setE1RM,
      load,
      reps,
      bestSet: isUnilateral && isLRSplitActive ? displayMetric : `${load}lbs × ${reps}r @ RPE ${rpe}`,
      leftE1RM: leftTelemetry ? leftTelemetry.e1rm : undefined,
      rightE1RM: rightTelemetry ? rightTelemetry.e1rm : undefined,
      date: new Date().toISOString().split('T')[0]
    };
    savePRVault(prVault);
    isNewPR = true;
    showToast(`★ NEW 1RM PR: ${exercise} → ${setE1RM} LBS!`);
  }

  let equivReps = reps;
  let equivVolume = Math.round(load * reps);

  if (isCardio) {
    const cMetrics = CARDIO_CONFIGS[exercise].calcEquiv(load, reps);
    equivReps = cMetrics.equivReps;
    equivVolume = cMetrics.equivVolume;
    displayMetric = cMetrics.display;
  }

  const resolved = resolveExerciseTarget(exercise, slotDef.target);
  const intel = (typeof MOVEMENT_INTEL !== 'undefined' && MOVEMENT_INTEL[exercise]) ? MOVEMENT_INTEL[exercise] : {};

  const completedSetObj = {
    slot: slotDef.slot,
    exercise,
    setNum: setsInSlot,
    load,
    reps,
    target: resolved.targetText,
    contraction: intel.contraction || 'Balanced', // <-- Passes contraction bias to autoReg
    equivReps,
    equivVolume,
    displayMetric,
    rpe,
    e1rm: setE1RM,
    isNewPR,
    tempoClean,
    jointPain: currentSetPain
  };

  activeSession.sets.push(completedSetObj);
  recordSlotRotationHistory(activeStageKey, slotDef.slot, exercise);
  checkSecretRingTriggers(completedSetObj, showToast);

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

  // Count sets logged for the CURRENT EXERCISE in this slot (so stacking a 2nd exercise gets its own 3-set block)
  const setsOfCurrentExercise = activeSession.sets.filter(
    s => s.slot === slotDef.slot && s.exercise === completedSetObj.exercise
  ).length;

  if (setsOfCurrentExercise >= 3) {
    const mode = getRotatorMode();

    if (mode === 'FOCUS') {
      const nextStep = resolveFocusNextStep(activeStageKey, stageDef, activeSlotIndex, activeSession.sets);
      if (nextStep) {
        const stayedInSlot = nextStep.slotIndex === activeSlotIndex;
        activeSlotIndex = nextStep.slotIndex;
        saveSessionState();
        renderSlotStepper();
        loadSlotData();
        showToast(
          stayedInSlot
            ? `🎯 FOCUS STACK: Next movement in ${nextStep.slotId}`
            : `🎯 FOCUS JUMP: Routing to Slot ${nextStep.slotId}`
        );
      } else {
        // Fallback if no further synergistic options remain in this stage
        saveSessionState();
        renderSlotStepper();
        updateLogButtonText();
        showToast('🎯 FOCUS: All synergistic targets hit for this stage!');
      }
    } else if (activeSlotIndex < stageDef.slots.length - 1) {
      // FRESH MODE: Standard sequential progression across slots
      activeSlotIndex++;
      saveSessionState();
      renderSlotStepper();
      loadSlotData();
    } else {
      saveSessionState();
      renderSlotStepper();
      updateLogButtonText();
    }
  } else {
    saveSessionState();
    renderSlotStepper();
    updateLogButtonText();
    const autoAdj = autoRegulateNextSet(completedSetObj);
    if (autoAdj) {
      const isBand = (currentSlotGearMode === 'BANDS') || isBandMovement(exercise);
      const activeLoad = typeof finalLoad !== 'undefined' ? finalLoad : load;

      if (isBand && autoAdj.load && autoAdj.load > activeLoad) {
        const currentCombo = typeof getSelectedBandCombo === 'function'
          ? getSelectedBandCombo()
          : { selectedKeys: [] };
        const bridge = solveOverdriveBandBridge(activeLoad, exercise, currentCombo.selectedKeys);

        if (bridge && bridge.nominalTotal > activeLoad) {
          setActiveBandSelection(bridge.selectedKeys);
          syncEquipmentInputs();
          if (document.getElementById('loadInput')) document.getElementById('loadInput').value = bridge.nominalTotal;
          if (autoAdj.reps && document.getElementById('repsInput')) document.getElementById('repsInput').value = autoAdj.reps;
          showToast(`⚡ OVERDRIVE BRIDGE: Stacked to ${bridge.nominalTotal} lbs × ${autoAdj.reps} reps!`);
        } else {
          if (autoAdj.reps && document.getElementById('repsInput')) document.getElementById('repsInput').value = autoAdj.reps;
          showToast(`★ MAX BAND TIER REACHED (${activeLoad} lbs) — Hold ${autoAdj.reps} reps!`);
        }
      } else {
        if (autoAdj.load && document.getElementById('loadInput')) document.getElementById('loadInput').value = autoAdj.load;
        if (autoAdj.reps && document.getElementById('repsInput')) document.getElementById('repsInput').value = autoAdj.reps;
        showToast(autoAdj.message);
      }
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

  const timeBrakeBtn = document.getElementById('timeBrakeBtn');
  if (timeBrakeBtn) {
    const isDarkspineActive = (typeof devDarkspineOverride === 'boolean')
      ? devDarkspineOverride 
      : (isDarkspineModeUnlocked() && ['DAY_G', 'DAY_H', 'DAY_I', 'DAY_J', 'DAY_K'].includes(activeStageKey));

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
    { key: 'DAY_J', label: 'DAY J', className: 'stage-tab' },
    { key: 'DAY_K', label: 'DAY K', className: 'stage-tab' },
    { key: 'CH_1RM', label: '⚡ 1RM TEST', className: 'stage-tab challenge-tab-gold' },
    { key: 'CH_AMRAP', label: '🔥 TO FAILURE', className: 'stage-tab challenge-tab-red' }
  ];

  canonicalOrder.forEach(item => {
    let tab = document.getElementById(`tab-${item.key}`);
    if (!tab) {
      tab = document.createElement('div');
      tab.id = `tab-${item.key}`;
      tab.innerText = item.label;
      tab.onclick = () => selectStage(item.key);
    }

    tab.className = item.className;
    if (item.key === activeStageKey) {
      tab.classList.add('active');
    }

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

    if (isDarkspineModeUnlocked() && ['DAY_G', 'DAY_H', 'DAY_I', 'DAY_J', 'DAY_K'].includes(activeStageKey)) {
      totalScore += (activeSession.sets.length * 500);
    }

    if (isSuperModeSessionActive()) {
      const mult = isSuperSonic2Unlocked() ? 1.50 : 1.25;
      totalScore = Math.round(totalScore * mult);
    }

    const totalSetsLogged = activeSession.sets.length;
    const hasJointStrain = Boolean(activeSession.jointPain || activeSession.sets.some(s => s.jointPain));
    const cleanRatio = totalSetsLogged > 0 ? (ringsBanked / totalSetsLogged) : 0;
    const isPerfectDay = Boolean(
      activeSession.prehabChecked &&
      !hasJointStrain &&
      totalSetsLogged > 0 &&
      ringsBanked >= totalSetsLogged
    );

    const isChallengeStage = ['CH_1RM', 'CH_AMRAP'].includes(activeStageKey);
    const isLowLoadStage = ['DAY_G', 'DAY_J', 'DAY_K'].includes(activeStageKey);

    const sFloor = isChallengeStage ? 75000 : (isLowLoadStage ? 140000 : 155000);
    const aFloor = isChallengeStage ? 62000 : (isLowLoadStage ? 115000 : 125000);
    const bFloor = isChallengeStage ? 50000 : (isLowLoadStage ? 80000 : 85000);

    let rank = "C";
    if (isPerfectDay && totalScore >= sFloor) {
      rank = "S";
    } else if (totalScore >= aFloor && cleanRatio >= 0.75) {
      rank = "A";
    } else if (totalScore >= bFloor) {
      rank = "B";
    }

    const standardRingsEarned = Math.floor(totalScore / 1000);
    addStandardRings(standardRingsEarned);

    const emeraldWon = evaluatePerfectDayEmerald(activeStageKey, rank === 'S', showToast);

    const recordRes = saveStageRecord(activeStageKey, totalScore, rank);
    localStorage.setItem('sonic_last_stage', activeStageKey);
    localStorage.setItem('sonic_last_strain', hasJointStrain ? 'true' : 'false');

    const oldExp = getLifetimeExp();
    const newExp = oldExp + totalScore;
    localStorage.setItem('sonic_lifetime_exp', newExp);
    updatePilotExpUI();

    const oldProg = calculatePilotProgress(oldExp);
    const newProg = calculatePilotProgress(newExp);

    creditVaultRings(activeSession.sets);
    renderVault();
    renderArtifactsTray();

    try {
      const rawHist = localStorage.getItem('sonic_session_history');
      const hist = rawHist ? JSON.parse(rawHist) : [];
      hist.unshift({
        timestamp: new Date().toISOString(),
        stage: activeStageKey,
        jointPain: hasJointStrain,
        sets: [...activeSession.sets]
      });
      localStorage.setItem('sonic_session_history', JSON.stringify(hist.slice(0, 15)));
    } catch (e) {}
    
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
      isNewRecord: recordRes.isNewRecord,
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
      goldRingsEarned: standardRingsEarned,
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
window.promptWebhookUrl = promptWebhookUrl;

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

  const bagBtn = document.getElementById('toggleBagDrawerBtn');
  const bagDrawer = document.getElementById('bagInventoryDrawer');
  if (bagBtn && bagDrawer) {
    renderBagInventoryChecklist();
    bagBtn.onclick = () => {
      const isOpen = bagDrawer.style.display === 'block';
      bagDrawer.style.display = isOpen ? 'none' : 'block';
    };
  }

  const loopsMinisBtn = document.getElementById('bagPresetLoopsMinisBtn');
  if (loopsMinisBtn) {
    loopsMinisBtn.onclick = () => {
      const ids = Object.values(BAND_CONFIG)
        .filter(b => b.type === '41_loop' || b.type === 'mini')
        .map(b => b.id);
      setPackedBandIds(ids);
      renderBagInventoryChecklist();
      if (currentSlotGearMode === 'BANDS') {
        hydrateExerciseDropdown();
        syncEquipmentInputs();
        syncLRSplitVisibility(document.getElementById('exerciseSelect')?.value || '');
      }
    };
  }

  const allGearBtn = document.getElementById('bagPresetAllBtn');
  if (allGearBtn) {
    allGearBtn.onclick = () => {
      setPackedBandIds(Object.keys(BAND_CONFIG));
      renderBagInventoryChecklist();
      if (currentSlotGearMode === 'BANDS') {
        hydrateExerciseDropdown();
        syncEquipmentInputs();
        syncLRSplitVisibility(document.getElementById('exerciseSelect')?.value || '');
      }
    };
  }

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
      syncLRSplitVisibility(document.getElementById('exerciseSelect')?.value || '');
    };

    bandBtn.onclick = () => {
      currentSlotGearMode = 'BANDS';
      bandBtn.style.background = '#38bdf8';
      bandBtn.style.color = '#0f172a';
      gymBtn.style.background = 'transparent';
      gymBtn.style.color = '#94a3b8';

      hydrateExerciseDropdown();

      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef?.slots?.[activeSlotIndex];
      const gymPrimary = slotDef ? slotDef.primary : '';
      const slotTarget = slotDef ? slotDef.target : "3x8-10";
      const currentBandExercise = document.getElementById('exerciseSelect')?.value || '';

      const { selectedKeys, nominalTotal } = resolveInitialBandPreset(
        currentBandExercise,
        gymPrimary,
        slotTarget,
        slotDef?.defaultLoad || 50
      );

      setActiveBandSelection(selectedKeys);
      syncEquipmentInputs();

      renderMovementIntel(currentBandExercise);
      updateInputLabelsForExercise(currentBandExercise);
      syncLRSplitVisibility(currentBandExercise);

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

  function syncRotatorModeUI() {
    const mode = getRotatorMode();
    const freshBtn = document.getElementById('rotatorFreshBtn');
    const focusBtn = document.getElementById('rotatorFocusBtn');
    if (!freshBtn || !focusBtn) return;

    if (mode === 'FOCUS') {
      focusBtn.style.background = '#f59e0b';
      focusBtn.style.borderColor = '#f59e0b';
      focusBtn.style.color = '#0f172a';
      freshBtn.style.background = 'transparent';
      freshBtn.style.borderColor = '#334155';
      freshBtn.style.color = '#94a3b8';
    } else {
      freshBtn.style.background = '#38bdf8';
      freshBtn.style.borderColor = '#38bdf8';
      freshBtn.style.color = '#0f172a';
      focusBtn.style.background = 'transparent';
      focusBtn.style.borderColor = '#334155';
      focusBtn.style.color = '#94a3b8';
    }
  }

  syncRotatorModeUI();

  const freshBtn = document.getElementById('rotatorFreshBtn');
  const focusBtn = document.getElementById('rotatorFocusBtn');
  if (freshBtn && focusBtn) {
    freshBtn.onclick = () => {
      setRotatorMode('FRESH');
      syncRotatorModeUI();
      loadSlotData();
      showToast('⚡ ROTATOR: Fresh Variety Mode Active');
    };
    focusBtn.onclick = () => {
      setRotatorMode('FOCUS');
      syncRotatorModeUI();
      loadSlotData();
      showToast('🎯 ROTATOR: Cumulative Synergy Focus Active');
    };
  }
  
  const exSelect = document.getElementById('exerciseSelect');
  if (exSelect) {
    exSelect.onchange = () => {
      const val = exSelect.value;
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef?.slots?.[activeSlotIndex];
      const defaultTarget = slotDef ? slotDef.target : "3x8-10";

      const resolved = resolveExerciseTarget(val, defaultTarget);
      const targetTag = document.getElementById('currentTargetTag');
      if (targetTag) {
        targetTag.innerText = resolved.targetText.startsWith('TARGET:') 
          ? resolved.targetText 
          : `TARGET: ${resolved.targetText}`;
      }

      const repsInput = document.getElementById('repsInput');
      if (repsInput) repsInput.value = resolved.defaultReps;

      const focusMultiplier = getFocusFatigueMultiplier(val);
      const prVault = getPRVault();
      const pr = prVault[val];
      const isBand = (currentSlotGearMode === 'BANDS') || isBandMovement(val);

      if (isBand) {
        const gymPrimary = slotDef ? slotDef.primary : '';
        const taperedDefault = Math.max(10, Math.round(((slotDef?.defaultLoad || 50) * focusMultiplier) / 5) * 5);
        const { selectedKeys, nominalTotal } = resolveInitialBandPreset(
          val, 
          gymPrimary, 
          defaultTarget, 
          taperedDefault
        );

        setActiveBandSelection(selectedKeys);
        syncEquipmentInputs();

        const loadInput = document.getElementById('loadInput');
        if (loadInput) loadInput.value = nominalTotal;
      } else {
        const baseLoad = slotDef ? slotDef.defaultLoad : 50;
        const baseTargetLoad = pr && pr.e1rm > 0 
          ? calculateTargetLoad(pr.e1rm, defaultTarget, baseLoad, val) 
          : baseLoad;
        const taperedLoad = Math.max(5, Math.round((baseTargetLoad * focusMultiplier) / 5) * 5);

        const loadInput = document.getElementById('loadInput');
        if (loadInput) loadInput.value = taperedLoad;
        syncEquipmentInputs();
      }

      renderMovementIntel(val);
      updateInputLabelsForExercise(val);
      syncLRSplitVisibility(val);
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

      if (data.stages || data.recentSessions || data.biometrics) {
        if (data.stages) {
          localStorage.setItem('sonic_stage_statuses', JSON.stringify(data.stages));
        }
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
      
      renderVault();
      renderArtifactsTray();
      renderBiometricsUI();
      updateHudRingBar();
      if (typeof renderSkillTree === 'function') renderSkillTree();
    }
  });

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
  getPerks: () => [],
  openSkills: () => switchMainTab('skillsTab'),

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

window.appendCardioFinisherSlot = appendCardioFinisherSlot;
window.renderCalculator = renderCalculator;
window.promptWebhookUrl = promptWebhookUrl;
  window.toggleMediaShelf = () => {
  const shelf = document.getElementById('mediaShelf');
  const chev = document.getElementById('dockMusicChevron');
  if (!shelf) return;
  const isOpen = shelf.style.display !== 'none';
  shelf.style.display = isOpen ? 'none' : 'block';
  if (chev) chev.innerText = isOpen ? '▲' : '▼';
};

window.requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    showToast('Notifications not supported on this device.');
    return;
  }
  const perm = await Notification.requestPermission();
  showToast(`Notifications: ${perm.toUpperCase()}`);
};
