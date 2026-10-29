// -------------------------------------------------------------
// SONIC FITNESS HUD // COMMAND CORE RUNTIME ENTRY POINT
// Root Application Module: app.js
// -------------------------------------------------------------
import { STAGES } from './data/stages.js';
import { CARDIO_CONFIGS } from './data/cardioConfigs.js';
import { CHAOS_EMERALDS_CATALOG, SECRET_RINGS_CATALOG } from './data/artifacts.js';
import { calculateE1RM, calculateTargetLoad, calculatePilotProgress } from './engine/calc.js';
import { autoRegulateNextSet } from './engine/autoReg.js';
import { getStageRecords, saveStageRecord, getPRVault, savePRVault } from './engine/records.js';
import { playRingChime, toggleAudioTheme, getAudioTheme, stopAllFanfare } from './core/audio.js';
import { setTimerDuration, startRestTimer, applyTimeBrake, initTimerBackgroundSync } from './core/timer.js';
import { fetchSheetTelemetry, syncSessionToSheets } from './core/sync.js';
import { showToast, renderStageRecordBanner, renderMovementIntel, updateInputLabelsForExercise } from './ui/renderHud.js';
import { openAuditModal } from './ui/auditModal.js';
import { renderResultsOverlay } from './ui/resultsOverlay.js';

let activeStageKey = localStorage.getItem('sonic_active_stage') || "DAY_A";
let activeSlotIndex = 0;
let tempoClean = true;
let currentSetPain = false;

let activeSession = {
  stage: activeStageKey,
  slotIndex: 0,
  prehabChecked: false,
  jointPain: false,
  sets: []
};

function getLifetimeExp() {
  const stored = localStorage.getItem("sonic_lifetime_exp");
  return stored !== null ? (parseInt(stored, 10) || 0) : 0;
}

function updatePilotExpUI() {
  const exp = getLifetimeExp();
  const info = calculatePilotProgress(exp);
  const lvlEl = document.getElementById('hudPilotLevel');
  const titleEl = document.getElementById('hudPilotTitle');
  const counterEl = document.getElementById('hudExpCounter');
  const fillEl = document.getElementById('hudExpFill');
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
  localStorage.setItem('sonic_active_session', JSON.stringify(activeSession));
  localStorage.setItem('sonic_active_stage', activeStageKey);
  updateTonnageDisplay();
}

function loadSlotData() {
  const stageDef = STAGES[activeStageKey];
  const slotDef = stageDef.slots[activeSlotIndex];

  document.getElementById('currentSlotTag').innerText = `SLOT ${slotDef.slot}`;
  document.getElementById('currentTargetTag').innerText = `TARGET: ${slotDef.target}`;

  const select = document.getElementById('exerciseSelect');
  select.innerHTML = '';
  slotDef.alts.forEach(alt => {
    const opt = document.createElement('option');
    opt.value = alt;
    opt.innerText = alt;
    select.appendChild(opt);
  });
  select.value = slotDef.primary;

  const prVault = getPRVault();
  const pr = prVault[slotDef.primary];
  const dynamicLoad = pr && pr.e1rm > 0 ? calculateTargetLoad(pr.e1rm, slotDef.target, slotDef.defaultLoad, slotDef.primary) : slotDef.defaultLoad;
  document.getElementById('loadInput').value = dynamicLoad;

  renderMovementIntel(slotDef.primary);
  updateInputLabelsForExercise(slotDef.primary);
  updateLogButtonText();
}

function selectStage(stageKey, resetIfNew = true) {
  if (resetIfNew && stageKey !== activeStageKey) {
    if (activeSession.sets.length > 0 && !confirm("Switching stages will start a new session. Proceed?")) return;
    activeSession = { stage: stageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
    activeSlotIndex = 0;
  }
  activeStageKey = stageKey;

  document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById(`tab-${stageKey}`);
  if (activeTab) activeTab.classList.add('active');

  const stageDef = STAGES[stageKey];
  document.getElementById('stageFocus').innerText = `STAGE CLEAR ZONE // ${stageKey.replace('_', ' ')}`;
  document.getElementById('stageName').innerText = stageDef.name;
  document.getElementById('prehabLabel').innerText = stageDef.prehab.replace('Prehab: ', '');

  renderStageRecordBanner(stageKey);
  renderSlotStepper();
  loadSlotData();
  saveSessionState();
  renderSessionUI();
}

function renderSlotStepper() {
  const stepper = document.getElementById('slotStepper');
  if (!stepper) return;
  stepper.innerHTML = '';
  const stageDef = STAGES[activeStageKey];

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

function logActiveSet() {
  const stageDef = STAGES[activeStageKey];
  const slotDef = stageDef.slots[activeSlotIndex];
  const exercise = document.getElementById('exerciseSelect').value;
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
  let equivVolume = Math.round(load * reps);
  let displayMetric = `${load}lbs × ${reps}r`;

  if (isCardio) {
    const cMetrics = CARDIO_CONFIGS[exercise].calcEquiv(load, reps);
    equivReps = cMetrics.equivReps;
    equivVolume = cMetrics.equivVolume;
    displayMetric = cMetrics.display;
  }

  const completedSetObj = {
    slot: slotDef.slot,
    exercise,
    setNum: setsInSlot,
    load,
    reps,
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
      if (autoAdj.load) document.getElementById('loadInput').value = autoAdj.load;
      if (autoAdj.reps) document.getElementById('repsInput').value = autoAdj.reps;
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

function renderSessionUI() {
  updateTonnageDisplay();
  renderSlotStepper();
  updateLogButtonText();

  const listContainer = document.getElementById('loggedSetsList');
  if (listContainer) {
    listContainer.innerHTML = '';
    activeSession.sets.forEach((s, idx) => {
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
}

function ensureStageTabsExist() {
  const stageNav = document.querySelector('.stage-nav') || document.querySelector('.stage-tabs');
  if (!stageNav) return;

  ['DAY_G', 'DAY_H', 'DAY_I'].forEach(key => {
    if (!document.getElementById(`tab-${key}`)) {
      const tab = document.createElement('div');
      tab.id = `tab-${key}`;
      tab.className = 'stage-tab';
      tab.innerText = key.replace('_', ' ');
      tab.onclick = () => selectStage(key);

      const ch1rmTab = document.getElementById('tab-CH_1RM');
      if (ch1rmTab) {
        stageNav.insertBefore(tab, ch1rmTab);
      } else {
        stageNav.appendChild(tab);
      }
    }
  });

  if (!document.getElementById('tab-CH_1RM')) {
    const tab1rm = document.createElement('div');
    tab1rm.id = 'tab-CH_1RM';
    tab1rm.className = 'stage-tab challenge-tab-gold';
    tab1rm.innerText = '⚡ 1RM TEST';
    tab1rm.onclick = () => selectStage('CH_1RM');
    stageNav.appendChild(tab1rm);
  }

  if (!document.getElementById('tab-CH_AMRAP')) {
    const tabAmrap = document.createElement('div');
    tabAmrap.id = 'tab-CH_AMRAP';
    tabAmrap.className = 'stage-tab challenge-tab-red';
    tabAmrap.innerText = '🔥 TO FAILURE';
    tabAmrap.onclick = () => selectStage('CH_AMRAP');
    stageNav.appendChild(tabAmrap);
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  ensureStageTabsExist();
  updatePilotExpUI();
  selectStage(activeStageKey, false);

  const logBtn = document.getElementById('logSetBtn');
  if (logBtn) logBtn.onclick = logActiveSet;

  const exSelect = document.getElementById('exerciseSelect');
  if (exSelect) {
    exSelect.onchange = () => {
      const val = exSelect.value;
      renderMovementIntel(val);
      updateInputLabelsForExercise(val);
    };
  }

  const clearBtn = document.getElementById('finishSessionBtn') || document.getElementById('stageClearBtn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      openAuditModal(activeSession, async () => {
        const totalReps = activeSession.sets.reduce((sum, s) => sum + (s.equivReps !== undefined ? s.equivReps : s.reps), 0);
        const forceBonus = totalReps * 75;
        const prehabBonus = activeSession.prehabChecked ? 15000 : 0;
        const ringsBanked = activeSession.sets.filter(s => s.rpe <= 8.0 && s.tempoClean && !s.jointPain).length;
        const redRingBonus = ringsBanked * 10000;
        const totalScore = forceBonus + prehabBonus + 20000 + redRingBonus;
        const rank = totalScore >= 75000 ? "S" : (totalScore >= 55000 ? "A" : "B");

        const recordRes = saveStageRecord(activeStageKey, totalScore, rank);
        const oldExp = getLifetimeExp();
        const newExp = oldExp + totalScore;
        localStorage.setItem('sonic_lifetime_exp', newExp);
        updatePilotExpUI();

        const oldProg = calculatePilotProgress(oldExp);
        const newProg = calculatePilotProgress(newExp);

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
          isNewRecord: recordRes.isNew
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
    };
  }
});
