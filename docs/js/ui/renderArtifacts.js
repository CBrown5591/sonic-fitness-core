// -------------------------------------------------------------
// ARTIFACTS TRAY & DUAL RING HUD CONTROLS // renderArtifacts.js
// Modular UI Component: renderArtifacts.js
// -------------------------------------------------------------
import { playStageClearFanfare } from '../core/audio.js';
import { toggleSkillTreeDrawer } from './renderSkillTree.js';

// -------------------------------------------------------------
// CONSTANTS & CATALOGS
// -------------------------------------------------------------
export const CHAOS_EMERALDS = [
  { id: 'green',  name: 'Green Chaos Emerald',  color: '#4ade80', symbol: '💎', day: 'DAY_A' },
  { id: 'yellow', name: 'Yellow Chaos Emerald', color: '#facc15', symbol: '💎', day: 'DAY_B' },
  { id: 'purple', name: 'Purple Chaos Emerald', color: '#c084fc', symbol: '💎', day: 'DAY_C' },
  { id: 'blue',   name: 'Blue Chaos Emerald',   color: '#38bdf8', symbol: '💎', day: 'DAY_D' },
  { id: 'cyan',   name: 'Cyan Chaos Emerald',   color: '#22d3ee', symbol: '💎', day: 'DAY_E' },
  { id: 'red',    name: 'Red Chaos Emerald',    color: '#f87171', symbol: '💎', day: 'DAY_F' },
  { id: 'white',  name: 'White Chaos Emerald',  color: '#f8fafc', symbol: '💎', day: 'CH_1RM' }
];

export const WORLD_RINGS = [
  { id: 'prayers',  name: 'Ring of Prayers',  color: '#c084fc', symbol: '💍', emotion: 'Prayers' },
  { id: 'sadness',  name: 'Ring of Sadness',  color: '#38bdf8', symbol: '💍', emotion: 'Sadness' },
  { id: 'rage',     name: 'Ring of Rage',     color: '#f87171', symbol: '💍', emotion: 'Rage' },
  { id: 'hatred',   name: 'Ring of Hatred',   color: '#4ade80', symbol: '💍', emotion: 'Hatred' },
  { id: 'joy',      name: 'Ring of Joy',      color: '#facc15', symbol: '💍', emotion: 'Joy' },
  { id: 'pleasure', name: 'Ring of Pleasure', color: '#22d3ee', symbol: '💍', emotion: 'Pleasure' },
  { id: 'wishes',   name: 'Ring of Wishes',   color: '#f8fafc', symbol: '💍', emotion: 'Wishes' }
];

// -------------------------------------------------------------
// LOCAL STORAGE GETTERS & SETTERS
// -------------------------------------------------------------
export function getStandardRings() {
  const val = localStorage.getItem('sonic_standard_rings');
  if (val !== null) return parseInt(val, 10) || 0;
  const exp = parseInt(localStorage.getItem('sonic_lifetime_exp') || '0', 10);
  return Math.floor(exp / 1000);
}

export function saveStandardRings(count) {
  const safeCount = Math.max(0, parseInt(count, 10) || 0);
  localStorage.setItem('sonic_standard_rings', safeCount.toString());
  updateHudRingBar();
  return safeCount;
}

export function addStandardRings(amount) {
  const current = getStandardRings();
  return saveStandardRings(current + amount);
}

export function getTotalRedRings() {
  const raw = localStorage.getItem('sonic_total_red_rings');
  if (raw !== null) return parseInt(raw, 10) || 0;
  try {
    const vRaw = localStorage.getItem('sonic_mastery_vault');
    if (vRaw) {
      const v = JSON.parse(vRaw);
      return v.reduce((acc, row) => acc + (Number(row.stars) || 0), 0);
    }
  } catch (e) {}
  return 0;
}

export function getSpendableRedRings() {
  const raw = localStorage.getItem('sonic_red_rings_unallocated');
  if (raw !== null) return Math.max(0, parseInt(raw, 10) || 0);
  return getTotalRedRings();
}

export function saveSpendableRedRings(amount) {
  const safe = Math.max(0, parseInt(amount, 10) || 0);
  localStorage.setItem('sonic_red_rings_unallocated', safe.toString());
  updateHudRingBar();
  return safe;
}

export function getChaosEmeralds() {
  try {
    const raw = localStorage.getItem('sonic_chaos_emeralds');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveChaosEmeralds(emeraldsObj) {
  localStorage.setItem('sonic_chaos_emeralds', JSON.stringify(emeraldsObj));
}

export function getSecretRings() {
  try {
    const raw = localStorage.getItem('sonic_secret_rings');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const obj = {};
      parsed.forEach(k => { obj[k] = true; });
      return obj;
    }
    return parsed;
  } catch (e) {
    return {};
  }
}

export function saveSecretRings(ringsObj) {
  localStorage.setItem('sonic_secret_rings', JSON.stringify(ringsObj));
}

// -------------------------------------------------------------
// UNLOCK & TRANSFORMATION STATE CHECKS
// -------------------------------------------------------------
export function isSuperModeUnlocked() {
  const emeralds = getChaosEmeralds();
  return CHAOS_EMERALDS.every(em => !!emeralds[em.id]);
}

export function isSuperSonic2Unlocked() {
  return isSuperModeUnlocked() && getTotalRedRings() >= 50;
}

export function isDarkspineModeUnlocked() {
  const explicit = localStorage.getItem('sonic_darkspine_unlocked') === 'true';
  if (explicit) return true;
  const rings = getSecretRings();
  return WORLD_RINGS.every(r => !!rings[r.id]);
}

export function isSuperModeSessionActive() {
  return sessionStorage.getItem('sonic_super_mode_active') === 'true';
}

// -------------------------------------------------------------
// IN-SESSION TRANSFORMATION ACTIVATION
// -------------------------------------------------------------
export function activateSuperModeSession(showToast) {
  if (!isSuperModeUnlocked()) {
    if (showToast) showToast('⚠️ 7 CHAOS EMERALDS REQUIRED FOR SUPER SONIC');
    return false;
  }

  const currentRings = getStandardRings();
  if (currentRings < 50) {
    if (showToast) showToast(`⚠️ INSUFFICIENT GOLD RINGS: Need 50 (You have ${currentRings})`);
    return false;
  }

  saveStandardRings(currentRings - 50);
  sessionStorage.setItem('sonic_super_mode_active', 'true');
  sessionStorage.setItem('sonic_gold_rings_spent', '50');

  const container = document.querySelector('.container');
  if (container) {
    if (isSuperSonic2Unlocked()) {
      container.classList.add('super-sonic-2-active');
    } else {
      container.classList.add('super-mode-active');
    }
  }

  updateHudRingBar();
  if (showToast) {
    const modeName = isSuperSonic2Unlocked() ? '⚡ SUPER SONIC 2' : '⚡ SUPER SONIC';
    showToast(`${modeName} ACTIVATED! (-50 GOLD RINGS)`);
  }
  return true;
}

export function deactivateSuperModeSession() {
  sessionStorage.removeItem('sonic_super_mode_active');
  const container = document.querySelector('.container');
  if (container) {
    container.classList.remove('super-mode-active');
    container.classList.remove('super-sonic-2-active');
  }
  updateHudRingBar();
}

export function applySuperSonicDamagePenalty(showToast) {
  if (!isSuperModeSessionActive()) return;
  const currentRings = getStandardRings();
  const penalty = 15;
  const updated = Math.max(0, currentRings - penalty);
  saveStandardRings(updated);

  if (showToast) {
    showToast(`💥 HULL STRAIN! Super Sonic lost ${penalty} Gold Rings!`);
  }

  if (updated === 0) {
    deactivateSuperModeSession();
    if (showToast) showToast('⚠️ RING DEPLETION: Super Sonic Reverted!');
  }
}

// -------------------------------------------------------------
// POST-SORTIE REWARD LOGIC: PERFECT DAY EMERALD ROLL
// -------------------------------------------------------------
export function evaluatePerfectDayEmerald(stageKey, isPerfectDay, showToast) {
  if (!isPerfectDay) return null;

  const emeralds = getChaosEmeralds();
  
  const directMatch = CHAOS_EMERALDS.find(em => em.day === stageKey && !emeralds[em.id]);
  if (directMatch) {
    emeralds[directMatch.id] = true;
    saveChaosEmeralds(emeralds);
    renderArtifactsTray();
    if (showToast) showToast(`✨ PERFECT SORTIE: ${directMatch.name} Acquired!`);
    return directMatch.name;
  }

  const lockedEmeralds = CHAOS_EMERALDS.filter(em => !emeralds[em.id]);
  if (lockedEmeralds.length > 0) {
    const roll = Math.random();
    if (roll < 0.35) {
      const awarded = lockedEmeralds[Math.floor(Math.random() * lockedEmeralds.length)];
      emeralds[awarded.id] = true;
      saveChaosEmeralds(emeralds);
      renderArtifactsTray();
      if (showToast) showToast(`🎲 SPECIAL STAGE CLEAR: ${awarded.name} Won!`);
      return awarded.name;
    }
  }

  return null;
}

// -------------------------------------------------------------
// PILLAR 2: RED STAR RING CHAOS EMERALD FORGE
// -------------------------------------------------------------
export function forgeChaosEmeraldWithRedRings(showToast) {
  const spendable = getSpendableRedRings();
  if (spendable < 10) {
    if (showToast) showToast(`⚠️ INSUFFICIENT RED RINGS: Need 10★ (You have ${spendable}★)`);
    return false;
  }

  const emeralds = getChaosEmeralds();
  const locked = CHAOS_EMERALDS.filter(em => !emeralds[em.id]);

  if (locked.length === 0) {
    if (showToast) showToast('✨ ALL 7 CHAOS EMERALDS ARE ALREADY FORGED!');
    return false;
  }

  const target = locked[0];
  saveSpendableRedRings(spendable - 10);
  emeralds[target.id] = true;
  saveChaosEmeralds(emeralds);

  renderArtifactsTray();

  if (showToast) {
    showToast(`💎 EMERALD FORGED: ${target.name}! (-10★ Red Rings)`);
  }

  if (isSuperModeUnlocked()) {
    if (showToast) {
      setTimeout(() => showToast('⚡ ALL 7 EMERALDS SECURED // SUPER SONIC PROTOCOL ONLINE!'), 800);
    }
  }

  return true;
}

// -------------------------------------------------------------
// SECRET RINGS GAMEPLAY TRIGGERS (DARKSPINE PROGRESSION)
// -------------------------------------------------------------
export function checkSecretRingTriggers(sessionData, showToast) {
  const secretRings = getSecretRings();
  let awarded = null;

  if (!secretRings['prayers'] && sessionData.prehab && !sessionData.jointPain) {
    secretRings['prayers'] = true;
    awarded = 'Ring of Prayers (Purple)';
  } else if (!secretRings['sadness'] && sessionData.recoveredStrain) {
    secretRings['sadness'] = true;
    awarded = 'Ring of Sadness (Blue)';
  } else if (!secretRings['rage'] && sessionData.maxRpeHit && sessionData.tempoClean) {
    secretRings['rage'] = true;
    awarded = 'Ring of Rage (Red)';
  } else if (!secretRings['hatred'] && sessionData.ringsBanked >= 4) {
    secretRings['hatred'] = true;
    awarded = 'Ring of Hatred (Green)';
  } else if (!secretRings['joy'] && sessionData.rank === 'S' && !sessionData.jointPain) {
    secretRings['joy'] = true;
    awarded = 'Ring of Joy (Yellow)';
  } else if (!secretRings['pleasure'] && sessionData.conditioningSurge) {
    secretRings['pleasure'] = true;
    awarded = 'Ring of Pleasure (Cyan)';
  } else if (!secretRings['wishes'] && sessionData.isNewRecord) {
    secretRings['wishes'] = true;
    awarded = 'Ring of Wishes (White)';
  }

  if (awarded) {
    saveSecretRings(secretRings);
    renderArtifactsTray();
    if (showToast) showToast(`💍 SECRET RING CLAIMED: ${awarded}!`);
    if (isDarkspineModeUnlocked()) {
      localStorage.setItem('sonic_darkspine_unlocked', 'true');
      if (showToast) {
        setTimeout(() => showToast('🔥 ALL 7 WORLD RINGS CLAIMED // DARKSPINE FORM UNLOCKED!'), 800);
      }
    }
  }
}

// -------------------------------------------------------------
// UI RENDERING: FULL ARTIFACTS TRAY & DUAL RING HUD
// -------------------------------------------------------------
export function renderArtifactsTray() {
  let container = document.getElementById('artifactsTrayMount') || 
                  document.querySelector('.artifacts-container') ||
                  document.getElementById('artifactsContainer') ||
                  document.getElementById('artifactTray');

  if (!container) {
    const parentContainer = document.querySelector('.container') || document.body;
    container = document.createElement('div');
    container.id = 'artifactsTrayMount';
    container.className = 'artifacts-container';
    
    const ref = document.querySelector('.pilot-exp-card') || document.querySelector('.stage-nav');
    if (ref && ref.parentNode) {
      ref.parentNode.insertBefore(container, ref.nextSibling);
    } else {
      parentContainer.prepend(container);
    }
  }

  const emeralds = getChaosEmeralds();
  const secretRings = getSecretRings();
  const goldRings = getStandardRings();
  const totalRed = getTotalRedRings();
  const spendableRed = getSpendableRedRings();
  
  const totalEmeraldsEarned = CHAOS_EMERALDS.filter(em => !!emeralds[em.id]).length;
  const totalRingsEarned = WORLD_RINGS.filter(r => !!secretRings[r.id]).length;

  const canForge = spendableRed >= 10 && totalEmeraldsEarned < 7;
  const forgeBtnStyle = canForge 
    ? 'background: #1e293b; border: 1px solid #f87171; color: #f87171; cursor: pointer;' 
    : 'background: #0d1524; border: 1px solid #334155; color: #64748b; cursor: not-allowed; opacity: 0.6;';

  const isDarkspine = isDarkspineModeUnlocked();

  container.innerHTML = `
    <!-- 1. DUAL RING ECONOMY HUD BAR -->
    <div class="hud-ring-economy-bar" id="hudRingEconomyBar">
      <div class="ring-counter-block">
        <span class="ring-icon-symbol">🪙</span>
        <div class="ring-counter-meta">
          <span id="hudGoldRingsVal" class="ring-count-val">${goldRings.toLocaleString()}</span>
          <span class="ring-counter-lbl">STANDARD RINGS</span>
        </div>
      </div>

      <!-- CLICKABLE RED RING COUNTER + PERKS ACTION -->
      <div class="ring-counter-block" id="hudRedRingsBlock" style="cursor: pointer;" title="Open Frontiers Skill Tree">
        <span class="ring-icon-symbol">⭐</span>
        <div class="ring-counter-meta">
          <span id="hudRedRingsVal" class="ring-count-val" style="color: #f87171;">${totalRed} / 50</span>
          <span class="ring-counter-lbl">RED STAR RINGS ▾</span>
        </div>
      </div>

      <div style="display: flex; gap: 6px; align-items: center;">
        <button id="openSkillTreeHudBtn" class="ring-bar-btn" style="border-color: #f87171; color: #f87171; padding: 7px 10px;" title="Frontiers Skill Tree">
          🌳 PERKS
        </button>
        <button id="hudSuperModeBtn" class="ring-bar-btn">
          ⚡ ENGAGE SUPER SONIC (50🪙)
        </button>
      </div>
    </div>

    <!-- 2. DARKSPINE TRANSFORMATION BADGE -->
    <div id="hudDarkspineBadge" class="transformation-badge-active darkspine-mode-active" style="display: ${isDarkspine ? 'block' : 'none'}; margin-top: 6px; background: rgba(192, 132, 252, 0.15); border: 1px solid #c084fc; color: #c084fc; border-radius: 6px; padding: 6px; text-align: center; font-size: 11px; font-weight: 800;">
      🔥 DARKSPINE SONIC ACTIVE // 3-CHARGE SOUL GAUGE READY 🔥
    </div>

    <!-- 3. CHAOS VAULT (EMERALDS) -->
    <div class="artifact-tray-card" style="margin-top: 8px;">
      <div class="artifact-tray-header">
        <span class="artifact-tray-title">CHAOS VAULT // EMERALDS</span>
        <span class="artifact-tray-counter">${totalEmeraldsEarned} / 7</span>
      </div>

      <div class="artifact-sockets-row">
        ${CHAOS_EMERALDS.map(em => {
          const unlocked = !!emeralds[em.id];
          const style = unlocked
            ? `border-color: ${em.color}; box-shadow: 0 0 10px ${em.color}66; opacity: 1; filter: none;`
            : `opacity: 0.35; filter: grayscale(1);`;
          return `
            <div class="artifact-socket ${unlocked ? 'unlocked' : 'locked'}" style="${style}" title="${em.name} (${em.day})">
              <span class="artifact-icon" style="${unlocked ? `color: ${em.color}; text-shadow: 0 0 8px ${em.color};` : ''}">${em.symbol}</span>
              <span class="artifact-label" style="${unlocked ? `color: ${em.color};` : ''}">${em.id}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- PILLAR 2: 10 RED STAR RING FORGE ACTION -->
      <div class="chaos-forge-action-row" style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #1e293b;">
        <span style="font-size: 10px; font-weight: 800; color: #94a3b8;">
          SPENDABLE: <strong style="color: #f87171; font-family: monospace;">${spendableRed}★</strong>
        </span>
        <button id="forgeEmeraldBtn" style="
          font-size: 10px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 6px;
          letter-spacing: 0.5px;
          transition: 0.15s ease;
          ${forgeBtnStyle}
        " ${!canForge ? 'disabled' : ''}>
          ⚡ FORGE EMERALD (10★)
        </button>
      </div>
    </div>

    <!-- 4. WORLD RINGS / SECRET RINGS TRAY (DARKSPINE) -->
    <div class="artifact-tray-card" style="margin-top: 8px;">
      <div class="artifact-tray-header">
        <span class="artifact-tray-title">WORLD RINGS // SECRET RINGS</span>
        <span class="artifact-tray-counter" style="color: #c084fc;">${totalRingsEarned} / 7</span>
      </div>

      <div class="artifact-sockets-row">
        ${WORLD_RINGS.map(r => {
          const unlocked = !!secretRings[r.id];
          const style = unlocked
            ? `border-color: ${r.color}; box-shadow: 0 0 10px ${r.color}66; opacity: 1; filter: none;`
            : `opacity: 0.35; filter: grayscale(1);`;
          return `
            <div class="artifact-socket ${unlocked ? 'unlocked' : 'locked'}" style="${style}" title="${r.name} (${r.emotion})">
              <span class="artifact-icon" style="${unlocked ? `color: ${r.color}; text-shadow: 0 0 8px ${r.color};` : ''}">${r.symbol}</span>
              <span class="artifact-label" style="${unlocked ? `color: ${r.color};` : ''}">${r.id}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach button handlers
  const forgeBtn = document.getElementById('forgeEmeraldBtn');
  if (forgeBtn && canForge) {
    forgeBtn.onclick = () => {
      forgeChaosEmeraldWithRedRings(window.showToast || console.log);
    };
  }

  const perksBtn = document.getElementById('openSkillTreeHudBtn');
  if (perksBtn) {
    perksBtn.onclick = () => toggleSkillTreeDrawer();
  }

  const redBlock = document.getElementById('hudRedRingsBlock');
  if (redBlock) {
    redBlock.onclick = () => toggleSkillTreeDrawer();
  }

  updateHudRingBar();
}

export function updateHudRingBar() {
  const goldEl = document.getElementById('hudGoldRingsVal');
  if (goldEl) {
    goldEl.innerText = getStandardRings().toLocaleString();
  }

  const redEl = document.getElementById('hudRedRingsVal');
  if (redEl) {
    redEl.innerText = `${getTotalRedRings()} / 50`;
  }

  const superBtn = document.getElementById('hudSuperModeBtn');
  if (superBtn) {
    const isSuperUnlocked = isSuperModeUnlocked();
    const isSS2 = isSuperSonic2Unlocked();
    const isActive = isSuperModeSessionActive();
    const goldCount = getStandardRings();

    if (isActive) {
      superBtn.className = 'ring-bar-btn active-super';
      superBtn.innerText = isSS2 ? '⚡ SUPER SONIC 2 ACTIVE' : '⚡ SUPER SONIC ACTIVE';
      superBtn.disabled = true;
    } else if (!isSuperUnlocked) {
      superBtn.className = 'ring-bar-btn locked';
      superBtn.innerText = '🔒 SUPER FORM LOCKED (0/7 💎)';
      superBtn.disabled = true;
    } else if (goldCount < 50) {
      superBtn.className = 'ring-bar-btn locked';
      superBtn.innerText = `🔒 NEED 50 GOLD RINGS (${goldCount}/50)`;
      superBtn.disabled = true;
    } else {
      superBtn.className = isSS2 ? 'ring-bar-btn super-2' : 'ring-bar-btn';
      superBtn.innerText = isSS2 ? '⚡ ENGAGE SUPER SONIC 2 (50🪙)' : '⚡ ENGAGE SUPER SONIC (50🪙)';
      superBtn.disabled = false;
      superBtn.onclick = () => activateSuperModeSession(window.showToast || console.log);
    }
  }

  const darkspineBadge = document.getElementById('hudDarkspineBadge');
  if (darkspineBadge) {
    darkspineBadge.style.display = isDarkspineModeUnlocked() ? 'block' : 'none';
  }
}

// -------------------------------------------------------------
// WINDOW EXPOSURE FOR DEVTOOLS TESTING
// -------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.renderArtifactsTray = renderArtifactsTray;
  window.activateSuperModeSession = activateSuperModeSession;
  window.deactivateSuperModeSession = deactivateSuperModeSession;
  window.forgeChaosEmeraldWithRedRings = forgeChaosEmeraldWithRedRings;
  window.getStandardRings = getStandardRings;
  window.saveStandardRings = saveStandardRings;
  window.addStandardRings = addStandardRings;
  window.updateHudRingBar = updateHudRingBar;
}
