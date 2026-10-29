// -------------------------------------------------------------
// ARTIFACTS TRAY & SECRET RINGS UI COMPONENT
// Modular UI Component: renderArtifacts.js
// -------------------------------------------------------------
import { CHAOS_EMERALDS_CATALOG, SECRET_RINGS_CATALOG } from '../data/artifacts.js';

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

export function isDarkspineModeUnlocked() {
  const state = getSecretRingsState();
  return Object.values(state).every(v => v === true);
}

export function renderArtifactsTray() {
  const container = document.querySelector('.container');
  const pilotCard = document.querySelector('.pilot-exp-card');
  if (!container || !pilotCard) return;

  let trayWrap = document.getElementById('dualArtifactsWrapper');
  if (!trayWrap) {
    trayWrap = document.createElement('div');
    trayWrap.id = 'dualArtifactsWrapper';
    trayWrap.className = 'artifacts-container';
    pilotCard.parentNode.insertBefore(trayWrap, pilotCard.nextSibling);
  }

  const emeraldState = getChaosEmeraldsState();
  const ringState = getSecretRingsState();
  const emeraldsClaimed = Object.values(emeraldState).filter(Boolean).length;
  const ringsClaimed = Object.values(ringState).filter(Boolean).length;
  const superActive = isSuperModeUnlocked();
  const darkspineActive = isDarkspineModeUnlocked();

  trayWrap.innerHTML = `
    <!-- CHAOS VAULT TRAY -->
    <div class="artifact-tray-card chaos-tray">
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
      <div id="superModeBadge" class="transformation-badge-active ${superActive ? 'super-mode-active' : ''}">
        ⚡ SUPER MODE ACTIVE // 1.25x EXP MULTIPLIER UNLOCKED ⚡
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
        🔥 DARKSPINE MODE ACTIVE // TIME BRAKE REST FLUSH & +500 EXP SURGE 🔥
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

// Bind to window for global access/debugging
window.showArtifactIntel = showArtifactIntel;
