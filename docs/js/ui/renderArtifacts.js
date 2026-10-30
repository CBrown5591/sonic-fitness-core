// -------------------------------------------------------------
// ARTIFACTS TRAY, SECRET RINGS & HUD RING COUNTER COMPONENT
// Modular UI Component: renderArtifacts.js
// -------------------------------------------------------------
import { CHAOS_EMERALDS_CATALOG, SECRET_RINGS_CATALOG } from '../data/artifacts.js';
import { getTotalRedRings } from './renderVault.js';

export function getStandardRings() {
  const stored = localStorage.getItem('sonic_standard_rings');
  return stored !== null ? (parseInt(stored, 10) || 0) : 0;
}

export function saveStandardRings(amount) {
  const val = Math.max(0, parseInt(amount, 10) || 0);
  localStorage.setItem('sonic_standard_rings', val);
  updateHudRingBar();
  return val;
}

export function addStandardRings(amount) {
  const cur = getStandardRings();
  return saveStandardRings(cur + amount);
}

export function spendStandardRings(amount) {
  const cur = getStandardRings();
  if (cur < amount) return false;
  saveStandardRings(cur - amount);
  return true;
}

export function getChaosEmeraldsState() {
  const stored = localStorage.getItem('sonic_chaos_emeralds');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {
    "emerald-green": false, "emerald-red": false, "emerald-blue": false,
    "emerald-yellow": false, "emerald-cyan": false, "emerald-purple": false, "emerald-white": false
  };
}

export function saveChaosEmeraldsState(state) {
  localStorage.setItem('sonic_chaos_emeralds', JSON.stringify(state));
}

export function getSecretRingsState() {
  const stored = localStorage.getItem('sonic_secret_rings');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {
    "ring-prayer": false, "ring-sadness": false, "ring-rage": false,
    "ring-hatred": false, "ring-joy": false, "ring-pleasure": false, "ring-wishes": false
  };
}

export function saveSecretRingsState(state) {
  localStorage.setItem('sonic_secret_rings', JSON.stringify(state));
}

export function isSuperModeUnlocked() {
  const state = getChaosEmeraldsState();
  return Object.values(state).every(v => v === true);
}

export function isSuperSonic2Unlocked() {
  return isSuperModeUnlocked() && getTotalRedRings() >= 50;
}

export function isSuperModeSessionActive() {
  return localStorage.getItem('sonic_super_session_active') === 'true';
}

export function activateSuperModeSession() {
  if (!isSuperModeUnlocked()) {
    alert("Super Mode locked! Gather all 7 Chaos Emeralds first.");
    return false;
  }
  if (!spendStandardRings(50)) {
    alert("Insufficient Rings! 50 Standard Gold Rings required to transform.");
    return false;
  }
  localStorage.setItem('sonic_super_session_active', 'true');
  applySuperSonicHudEffects();
  updateHudRingBar();
  return true;
}

export function deactivateSuperModeSession() {
  localStorage.removeItem('sonic_super_session_active');
  removeSuperSonicHudEffects();
  updateHudRingBar();
}

export function applySuperSonicDamagePenalty(type) {
  if (!isSuperModeSessionActive()) return;
  const isSS2 = isSuperSonic2Unlocked();
  // Super Sonic 2 has damage resistance (-10 for strain, -5 for tempo)
  const penalty = type === 'strain' ? (isSS2 ? 10 : 15) : (isSS2 ? 5 : 10);
  const cur = getStandardRings();
  const next = Math.max(0, cur - penalty);
  saveStandardRings(next);

  if (next === 0) {
    deactivateSuperModeSession();
    alert("⚡ ZERO RINGS REMAINING: Reverted to Base Form!");
  }
}

export function isDarkspineModeUnlocked() {
  const state = getSecretRingsState();
  return Object.values(state).every(v => v === true);
}

// -------------------------------------------------------------
// VISIBLE HUD RING BAR (MOUNTED BELOW PILOT EXP CARD)
// -------------------------------------------------------------
export function updateHudRingBar() {
  const pilotCard = document.querySelector('.pilot-exp-card');
  if (!pilotCard) return;

  let ringBar = document.getElementById('hudRingEconomyBar');
  if (!ringBar) {
    ringBar = document.createElement('div');
    ringBar.id = 'hudRingEconomyBar';
    ringBar.className = 'hud-ring-economy-bar';
    pilotCard.parentNode.insertBefore(ringBar, pilotCard.nextSibling);
  }

  const standardRings = getStandardRings();
  const redRings = getTotalRedRings();
  const hasEmeralds = isSuperModeUnlocked();
  const isSS2Unlocked = isSuperSonic2Unlocked();
  const isSuperActive = isSuperModeSessionActive();

  let transformBtnHtml = '';
  if (hasEmeralds) {
    if (isSuperActive) {
      transformBtnHtml = `
        <button id="toggleSuperBtn" class="ring-bar-btn active-super ${isSS2Unlocked ? 'super-2' : ''}" onclick="window.deactivateSuperModeSession()">
          ${isSS2Unlocked ? '⚡ SS2 ACTIVE (1.50x)' : '⚡ SUPER ACTIVE (1.25x)'}
        </button>
      `;
    } else {
      transformBtnHtml = `
        <button id="toggleSuperBtn" class="ring-bar-btn ${standardRings >= 50 ? 'can-activate' : 'locked'}" onclick="window.activateSuperModeSession()">
          ${isSS2Unlocked ? '⚡ ENGAGE SS2 (50 🪙)' : '⚡ ENGAGE SUPER (50 🪙)'}
        </button>
      `;
    }
  }

  ringBar.innerHTML = `
    <div class="ring-counter-block gold-rings">
      <span class="ring-icon-symbol">🪙</span>
      <div class="ring-counter-meta">
        <span class="ring-count-val">${standardRings}</span>
        <span class="ring-counter-lbl">GOLD RINGS</span>
      </div>
    </div>

    <div class="ring-counter-block red-rings">
      <span class="ring-icon-symbol">⭐</span>
      <div class="ring-counter-meta">
        <span class="ring-count-val">${redRings}<span style="font-size: 11px; opacity: 0.7;">/50</span></span>
        <span class="ring-counter-lbl">${isSS2Unlocked ? 'SS2 MASTERED' : 'RED STAR RINGS'}</span>
      </div>
    </div>

    ${transformBtnHtml}
  `;

  if (isSuperActive) {
    applySuperSonicHudEffects();
  } else {
    removeSuperSonicHudEffects();
  }
}

export function applySuperSonicHudEffects() {
  const container = document.querySelector('.container');
  if (!container) return;
  const isSS2 = isSuperSonic2Unlocked();

  container.classList.add('super-mode-active');
  if (isSS2) {
    container.classList.add('super-sonic-2-active');
  } else {
    container.classList.remove('super-sonic-2-active');
  }
}

export function removeSuperSonicHudEffects() {
  const container = document.querySelector('.container');
  if (!container) return;
  container.classList.remove('super-mode-active', 'super-sonic-2-active');
}

export function renderArtifactsTray() {
  updateHudRingBar();

  const ringBar = document.getElementById('hudRingEconomyBar');
  if (!ringBar) return;

  let trayWrap = document.getElementById('dualArtifactsWrapper');
  if (!trayWrap) {
    trayWrap = document.createElement('div');
    trayWrap.id = 'dualArtifactsWrapper';
    trayWrap.className = 'artifacts-container';
    ringBar.parentNode.insertBefore(trayWrap, ringBar.nextSibling);
  }

  const emeraldState = getChaosEmeraldsState();
  const ringState = getSecretRingsState();
  const emeraldsClaimed = Object.values(emeraldState).filter(Boolean).length;
  const ringsClaimed = Object.values(ringState).filter(Boolean).length;
  const superActive = isSuperModeUnlocked();
  const darkspineActive = isDarkspineModeUnlocked();
  const isSS2 = isSuperSonic2Unlocked();
  const isSessionSuper = isSuperModeSessionActive();

  trayWrap.innerHTML = `
    <!-- CHAOS VAULT TRAY -->
    <div class="artifact-tray-card chaos-tray ${isSessionSuper ? (isSS2 ? 'ss2-glow' : 'super-glow') : ''}">
      <div class="artifact-tray-header">
        <span class="artifact-tray-title">💎 THE CHAOS VAULT // STRENGTH TRIALS</span>
        <span class="artifact-tray-counter">${emeraldsClaimed}/7 CLAIMED</span>
      </div>
      <div class="artifact-sockets-row">
        ${CHAOS_EMERALDS_CATALOG.map(item => `
          <div class="artifact-socket ${emeraldState[item.id] ? 'unlocked ' + item.colorClass : 'locked'}" data-type="emerald" data-id="${item.id}">
            <span class="artifact-icon">${item.icon}</span>
            <span class="artifact-label">${item.id.replace('emerald-', '')}</span>
          </div>
        `).join('')}
      </div>
      <div id="superModeBadge" class="transformation-badge-active ${superActive ? 'super-mode-active' : ''} ${isSS2 ? 'ss2-badge' : ''}">
        ${isSS2 
          ? '⚡ SUPER SONIC 2 ENGAGED // CYBER ENERGY UNLEASHED (1.50x EXP) ⚡'
          : '⚡ SUPER MODE READY // 50 RINGS TO ENGAGE (1.25x EXP) ⚡'}
      </div>
    </div>

    <!-- SECRET RINGS TRAY -->
    <div class="artifact-tray-card secret-rings-tray">
      <div class="artifact-tray-header">
        <span class="artifact-tray-title">💍 THE SECRET RINGS // ENDURANCE & WORK CAPACITY</span>
        <span class="artifact-tray-counter">${ringsClaimed}/7 CLAIMED</span>
      </div>
      <div class="artifact-sockets-row">
        ${SECRET_RINGS_CATALOG.map(item => `
          <div class="artifact-socket ${ringState[item.id] ? 'unlocked ' + item.colorClass : 'locked'}" data-type="ring" data-id="${item.id}">
            <span class="artifact-icon">${item.icon}</span>
            <span class="artifact-label">${item.id.replace('ring-', '')}</span>
          </div>
        `).join('')}
      </div>
      <div id="darkspineModeBadge" class="transformation-badge-active ${darkspineActive ? 'darkspine-mode-active' : ''}">
        🔥 DARKSPINE MODE ACTIVE // TIME BRAKE (3 SOUL CHARGES) & +500 EXP SURGE 🔥
      </div>
    </div>
  `;

  // Attach click handlers to all artifact sockets
  trayWrap.querySelectorAll('.artifact-socket').forEach(el => {
    el.onclick = () => {
      const type = el.getAttribute('data-type');
      const id = el.getAttribute('data-id');
      showArtifactIntel(type, id);
    };
  });
}

export function showArtifactIntel(type, id) {
  const catalog = type === 'emerald' ? CHAOS_EMERALDS_CATALOG : SECRET_RINGS_CATALOG;
  const state = type === 'emerald' ? getChaosEmeraldsState() : getSecretRingsState();
  const item = catalog.find(x => x.id === id);
  if (!item) return;

  const isClaimed = !!state[id];
  const statusText = isClaimed ? "STATUS: CLAIMED [✓]" : "STATUS: LOCKED [ ]";
  alert(`${item.name} (${type === 'emerald' ? 'Chaos Emerald' : 'Secret World Ring'})\n\n${statusText}\n\nTRIAL OBJECTIVE:\n${item.trial}\n\nTap OK to close.`);
}

export function checkSecretRingTriggers(setObj, showToastCallback) {
  const rings = getSecretRingsState();
  let changed = false;

  // 1. Ring of Prayer: Zone 2 Incline Walk or Bike >= 12 mins, RPE <= 8.0, clean
  if ((setObj.exercise.includes("Treadmill") || setObj.exercise.includes("Stationary Bike")) &&
      setObj.reps >= 12 && setObj.rpe <= 8.0 && !setObj.jointPain && !rings["ring-prayer"]) {
    rings["ring-prayer"] = true;
    changed = true;
    if (showToastCallback) showToastCallback("💍 SECRET RING UNLOCKED: Ring of Prayer (Mental Stillness)!");
  }

  // 2. Ring of Sadness: Cybex Leg Press >= 25 reps
  if (setObj.exercise.includes("Leg Press") && setObj.reps >= 25 && !setObj.jointPain && !rings["ring-sadness"]) {
    rings["ring-sadness"] = true;
    changed = true;
    if (showToastCallback) showToastCallback("💍 SECRET RING UNLOCKED: Ring of Sadness (Acidosis Grind)!");
  }

  // 3. Ring of Rage: Rower Sprints >= 8 rounds
  if (setObj.exercise.includes("Rower Sprints") && setObj.reps >= 8 && !setObj.jointPain && !rings["ring-rage"]) {
    rings["ring-rage"] = true;
    changed = true;
    if (showToastCallback) showToastCallback("💍 SECRET RING UNLOCKED: Ring of Rage (Spin Dash Intervals)!");
  }

  // 4. Ring of Hatred: Farmer's Carries >= 60 paces @ 60+ lbs
  if (setObj.exercise.includes("Farmer") && setObj.load >= 60 && setObj.reps >= 60 && !setObj.jointPain && !rings["ring-hatred"]) {
    rings["ring-hatred"] = true;
    changed = true;
    if (showToastCallback) showToastCallback("💍 SECRET RING UNLOCKED: Ring of Hatred (Grip Crucible)!");
  }

  // 5. Ring of Pleasure: 45s TUT Lat Pulldown or Cable Pallof Hold
  if ((setObj.exercise.includes("Lat Pulldown") || setObj.exercise.includes("Pallof")) &&
      setObj.reps >= 45 && !setObj.jointPain && !rings["ring-pleasure"]) {
    rings["ring-pleasure"] = true;
    changed = true;
    if (showToastCallback) showToastCallback("💍 SECRET RING UNLOCKED: Ring of Pleasure (Lactic Threshold)!");
  }

  if (changed) {
    saveSecretRingsState(rings);
    renderArtifactsTray();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

/**
 * Evaluates Perfect Day completion for Chaos Emerald acquisition.
 * 1. Targeted Day mapping for Days A-F
 * 2. 15% RNG Special Stage Warp Ring fallback for unearned emeralds
 * 3. White Emerald is 100% exclusive to CH_1RM / CH_AMRAP
 */
export function evaluatePerfectDayEmerald(stageKey, isPerfectDay, showToastCallback) {
  if (!isPerfectDay) return null;

  const emeralds = getChaosEmeraldsState();
  let awardedEmerald = null;

  // Challenge Modes: Guaranteed White Emerald
  if (stageKey === 'CH_1RM' || stageKey === 'CH_AMRAP') {
    if (!emeralds["emerald-white"]) {
      emeralds["emerald-white"] = true;
      awardedEmerald = "White Emerald (The Grand Apex)";
    }
  } else {
    // Deterministic Day Mapping:
    const targetMap = {
      DAY_A: "emerald-red",
      DAY_B: "emerald-green",
      DAY_C: "emerald-blue",
      DAY_D: "emerald-cyan",
      DAY_E: "emerald-yellow",
      DAY_F: "emerald-purple"
    };

    const targetKey = targetMap[stageKey];
    if (targetKey && !emeralds[targetKey]) {
      emeralds[targetKey] = true;
      const item = CHAOS_EMERALDS_CATALOG.find(x => x.id === targetKey);
      awardedEmerald = item ? item.name : "Chaos Emerald";
    } else {
      // Hybrid Option: If deterministic emerald is already claimed, 15% Special Stage Warp Ring roll!
      const unearned = CHAOS_EMERALDS_CATALOG.filter(x => x.id !== "emerald-white" && !emeralds[x.id]);
      if (unearned.length > 0) {
        const roll = Math.random();
        if (roll <= 0.15) { // 15% Special Stage Drop Rate
          const lucky = unearned[Math.floor(Math.random() * unearned.length)];
          emeralds[lucky.id] = true;
          awardedEmerald = `${lucky.name} (Special Stage Warp Ring 15% Drop!)`;
        }
      }
    }
  }

  if (awardedEmerald) {
    saveChaosEmeraldsState(emeralds);
    renderArtifactsTray();
    if (showToastCallback) showToastCallback(`💎 CHAOS EMERALD CLAIMED: ${awardedEmerald}!`);
    if (navigator.vibrate) navigator.vibrate([150, 50, 150, 50, 300]);
  }

  return awardedEmerald;
}

// Window bindings
window.showArtifactIntel = showArtifactIntel;
window.activateSuperModeSession = activateSuperModeSession;
window.deactivateSuperModeSession = deactivateSuperModeSession;
