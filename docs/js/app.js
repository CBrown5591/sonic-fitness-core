// -------------------------------------------------------------
// SONIC FITNESS HUD // COMMAND CORE RUNTIME ENTRY POINT
// Root Application Module: app.js
// -------------------------------------------------------------
import { STAGES } from './data/stages.js';
import { CARDIO_CONFIGS } from './data/cardioConfigs.js';
import { calculateE1RM, calculateTargetLoad, calculatePilotProgress } from './engine/calc.js';
import { autoRegulateNextSet } from './engine/autoReg.js';
import { checkAndRenderFlightPathPrompt } from './engine/flightPath.js';
import { getStageRecords, saveStageRecord, getPRVault, savePRVault } from './engine/records.js';
import { playRingChime, toggleAudioTheme, getAudioTheme, stopAllFanfare } from './core/audio.js';
import { setTimerDuration, startRestTimer, applyTimeBrake, initTimerBackgroundSync } from './core/timer.js';
import { fetchSheetTelemetry, syncSessionToSheets } from './core/sync.js';
import { showToast, renderStageRecordBanner, renderMovementIntel, updateInputLabelsForExercise } from './ui/renderHud.js';
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
  updateHudRingBar
} from './ui/renderArtifacts.js';
import { getTotalRedRings } from './ui/renderVault.js';
import { renderVault, toggleVaultDrawer, creditVaultRings } from './ui/renderVault.js';

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
  localStorage.setItem('sonic_active_session', JSON.stringify(activeSession));
  localStorage.setItem('sonic_active_stage', activeStageKey);
  updateTonnageDisplay();
}

function loadSlotData() {
  const stageDef = STAGES[activeStageKey];
  if (!stageDef || !stageDef.slots[activeSlotIndex]) return;
  const slotDef = stageDef.slots[activeSlotIndex];

  const currentSlotTag = document.getElementById('currentSlotTag');
  const currentTargetTag = document.getElementById('currentTargetTag');
  if (currentSlotTag) currentSlotTag.innerText = `SLOT ${slotDef.slot}`;
  if (currentTargetTag) currentTargetTag.innerText = `TARGET: ${slotDef.target}`;

  const select = document.getElementById('exerciseSelect');
  if (select) {
    select.innerHTML = '';
    slotDef.alts.forEach(alt => {
      const opt = document.createElement('option');
      opt.value = alt;
      opt.innerText = alt;
      select.appendChild(opt);
    });
    select.value = slotDef.primary;
  }

  const prVault = getPRVault();
  const pr = prVault[slotDef.primary];
  const dynamicLoad = pr && pr.e1rm > 0 ? calculateTargetLoad(pr.e1rm, slotDef.target, slotDef.defaultLoad, slotDef.primary) : slotDef.defaultLoad;
  const loadInput = document.getElementById('loadInput');
  if (loadInput) loadInput.value = dynamicLoad;

  renderMovementIntel(slotDef.primary);
  updateInputLabelsForExercise(slotDef.primary);
  updateLogButtonText();
}

export function selectStage(stageKey, resetIfNew = true) {
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
  checkSecretRingTriggers(completedSetObj, showToast);

  if (currentSetPain) {
    applySuperSonicDamagePenalty('strain');
  } else if (!tempoClean) {
    applySuperSonicDamagePenalty('tempo');
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
  activeSession.prehabChecked = !activeSession.prehabChecked;
  if (activeSession.prehabChecked && navigator.vibrate) navigator.vibrate(35);
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
      activeSession.jointPain = true;
    } else {
      btn.classList.remove('active-red');
      btn.innerText = "Joint Strain: No";
    }
  }
  saveSessionState();
  renderSessionUI();
}

function renderSessionUI() {
  const prehabBox = document.getElementById('prehabBox');
  const statusPill = document.getElementById('prehabStatusPill');
  const prehabTag = document.getElementById('prehabTag');
  if (prehabBox && statusPill && prehabTag) {
    if (activeSession.prehabChecked) {
      prehabBox.classList.add('cleared');
      statusPill.innerText = "CLEARED [✓]";
      prehabTag.innerText = "MISSION COMPLETED";
    } else {
      prehabBox.classList.remove('cleared');
      statusPill.innerText = "PENDING [ ]";
      prehabTag.innerText = "PRE-FLIGHT MISSION";
    }
  }

  const shield = document.getElementById('shieldStatus');
  if (shield) {
    if (activeSession.jointPain) {
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

// Bind interactive handlers to window for HTML compatibility
window.selectStage = selectStage;
window.logActiveSet = logActiveSet;
window.togglePrehab = togglePrehab;
window.toggleTempo = toggleTempo;
window.togglePain = togglePain;
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

// Global bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  ensureStageTabsExist();
  updatePilotExpUI();
  selectStage(activeStageKey, false);
  renderVault();
  renderArtifactsTray();
  initTimerBackgroundSync();
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

  const exSelect = document.getElementById('exerciseSelect');
  if (exSelect) {
    exSelect.onchange = () => {
      const val = exSelect.value;
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
    if (data.goldRings !== undefined && localStorage.getItem('sonic_standard_rings') === null) {
      saveStandardRings(data.goldRings);
    }
      if (data.stages) {
        localStorage.setItem('sonic_stage_statuses', JSON.stringify(data.stages));
        checkAndRenderFlightPathPrompt(activeSession, (nextStage) => {
          selectStage(nextStage);
          showToast(`FLIGHT PATH ENGAGED: ${nextStage.replace('_', ' ')}!`);
        });
      }
      if (data.prVault) savePRVault(data.prVault);
      renderVault();
    }
  });

  const clearBtn = document.getElementById('finishSessionBtn') || document.getElementById('stageClearBtn');
  if (clearBtn) {
    clearBtn.onclick = () => {
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

        // Check Perfect Day for Chaos Emerald Award (Deterministic or 15% Special Stage)
        const isPerfectDay = rank === 'S' && !activeSession.jointPain && !activeSession.sets.some(s => s.jointPain) && ringsBanked >= activeSession.sets.length;
        evaluatePerfectDayEmerald(activeStageKey, isPerfectDay, showToast);
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

// -------------------------------------------------------------
// CHROME DEVTOOLS TESTING CONSOLE HARNESS
// Run in Google Chrome DevTools (F12 / Inspect -> Console)
// -------------------------------------------------------------
window.__sonicDev = {
  // 1. Economy & Wallet inspection
  getWallet: () => ({
    goldRings: getStandardRings(),
    redStarRings: getTotalRedRings(),
    isSuperSonic2Unlocked: isSuperSonic2Unlocked(),
    isSuperActive: isSuperModeSessionActive()
  }),
  // 2. Set Gold Rings directly
  setGoldRings: (amount) => saveStandardRings(amount),
  // 3. Test Perfect Day 15% roll
  testEmeraldRoll: (stageKey = 'DAY_A') => evaluatePerfectDayEmerald(stageKey, true, (msg) => console.log('EMERALD TOAST:', msg)),
  // 4. Test Damage Penalty on Super Form
  testStrainDamage: () => applySuperSonicDamagePenalty('strain'),
  testTempoDamage: () => applySuperSonicDamagePenalty('tempo'),
  // 5. Test Super Transformation
  engageSuper: () => window.activateSuperModeSession(),
  revertSuper: () => window.deactivateSuperModeSession()
};
console.log('⚡ [SONIC HUD] DevTools Testing Suite available at window.__sonicDev');
