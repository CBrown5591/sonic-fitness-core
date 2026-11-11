// -------------------------------------------------------------
// RESISTANCE BAND MULTI-SELECT & COMPOUND LOAD ENGINE
// Modular UI Component: docs/js/ui/renderBandSelector.js
// -------------------------------------------------------------
import { BAND_CONFIG } from '../data/bandConfigs.js';

let selectedBandKeys = new Set();
let activeSelectionCallback = null;

/**
 * Filter available bands based on exercise movement mechanics
 */
export function getBandsForMovement(exerciseName = '') {
  const name = (exerciseName || '').toLowerCase();

  // Mini Loop Movements (Hips, Locomotion, Ankles, Core)
  if (
    name.includes('mini') || 
    name.includes('walk') || 
    name.includes('march') || 
    name.includes('deadbug') || 
    name.includes('y-t-w') || 
    name.includes('climber') ||
    name.includes('step-jack')
  ) {
    return Object.values(BAND_CONFIG).filter(b => b.type === 'mini');
  }

  // Door-Anchored Movements -> Handled Tubes Only
  if (
    name.includes('anchor') || 
    name.includes('pulldown') || 
    name.includes('woodchopper') || 
    name.includes('pallof') || 
    name.includes('crunch') || 
    name.includes('face pull') || 
    name.includes('curl') || 
    name.includes('adduction') || 
    name.includes('fly')
  ) {
    return Object.values(BAND_CONFIG).filter(b => b.type === 'tube');
  }

  // Body-Anchored Compound Lifts -> 41" Continuous Loops Only
  return Object.values(BAND_CONFIG).filter(b => b.type === '41_loop');
}

/**
 * Checks whether an exercise requires the resistance band selector
 */
export function isBandMovement(exerciseName = '') {
  const name = (exerciseName || '').toLowerCase();
  return name.includes('band') || name.includes('loop') || name.includes('mini-band') || name.includes('pull-through');
}

/**
 * Derives compounded nominal total and formatted display metric label
 */
export function getSelectedBandCombo() {
  let totalNominal = 0;
  let names = [];
  selectedBandKeys.forEach(k => {
    const b = BAND_CONFIG[k];
    if (b) {
      totalNominal += b.nominal;
      names.push(b.name.replace(' Loop', '').replace('Tube ', '').replace('Mini ', ''));
    }
  });
  return {
    nominalLoad: totalNominal,
    comboLabel: names.length > 0 ? names.join(' + ') : 'None',
    selectedKeys: Array.from(selectedBandKeys)
  };
}

/**
 * Resets active band selections (called on slot reset/transitions)
 */
export function clearBandSelections() {
  selectedBandKeys.clear();
  const mount = document.getElementById('bandSelectorMount');
  if (mount) {
    updateUIAndNotify(mount, activeSelectionCallback);
  }
}

/**
 * Programmatically activates band pills (used by the auto-selection solver)
 */
// docs/js/ui/renderBandSelector.js

export function setActiveBandSelection(keys = []) {
  selectedBandKeys.clear();
  keys.forEach(k => selectedBandKeys.add(k));

  const mount = document.getElementById('bandSelectorMount');
  if (mount) {
    // 1. Immediately toggle active classes & styles on all pill buttons
    mount.querySelectorAll('.band-pill-btn').forEach(btn => {
      const key = btn.dataset.key;
      const isSel = selectedBandKeys.has(key);
      if (isSel) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.28)';
        btn.style.borderColor = '#38bdf8';
        btn.style.color = '#ffffff';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(15, 23, 42, 0.85)';
        btn.style.borderColor = 'rgba(255,255,255,0.15)';
        btn.style.color = '#94a3b8';
      }
    });

    // 2. Refresh total display & notify app callbacks
    updateUIAndNotify(mount, activeSelectionCallback);
  }
}

/**
 * Main UI Mount: Renders interactive pills filtered to the selected exercise
 */
export function renderBandSelector(containerEl, exerciseName, onSelectionChange) {
  if (!containerEl) return;
  activeSelectionCallback = onSelectionChange;

  const relevantBands = getBandsForMovement(exerciseName);

  containerEl.innerHTML = `
    <div style="font-size: 10px; font-weight: 800; color: #38bdf8; margin-bottom: 6px; letter-spacing: 0.5px;">
      STACK RESISTANCE BANDS (TAP TO COMBINE)
    </div>
    <div id="bandPillContainer" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
      ${relevantBands.map(b => {
        const isSel = selectedBandKeys.has(b.id);
        return `
          <button type="button" class="band-pill-btn ${isSel ? 'active' : ''}" data-key="${b.id}"
            style="
              background: ${isSel ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.85)'};
              border: 1px solid ${isSel ? '#38bdf8' : 'rgba(255,255,255,0.15)'};
              color: ${isSel ? '#ffffff' : '#94a3b8'};
              padding: 5px 9px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 5px;
            ">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${b.color}; border: 1px solid rgba(255,255,255,0.3);"></span>
            ${b.name} (${b.nominal} lbs)
          </button>
        `;
      }).join('')}
    </div>
    <div id="bandTotalDisplay" style="font-size: 11px; font-weight: 700; color: #facc15;">
      TOTAL BAND LOAD: 0 LBS
    </div>
  `;

  // Attach button toggle click listeners
  containerEl.querySelectorAll('.band-pill-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const key = btn.dataset.key;
      if (selectedBandKeys.has(key)) {
        selectedBandKeys.delete(key);
      } else {
        selectedBandKeys.add(key);
      }
      updateUIAndNotify(containerEl, onSelectionChange);
    };
  });

  updateUIAndNotify(containerEl, onSelectionChange);
}

function updateUIAndNotify(containerEl, onSelectionChange) {
  const combo = getSelectedBandCombo();

  containerEl.querySelectorAll('.band-pill-btn').forEach(btn => {
    const isSel = selectedBandKeys.has(btn.dataset.key);
    btn.style.background = isSel ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.85)';
    btn.style.borderColor = isSel ? '#38bdf8' : 'rgba(255,255,255,0.15)';
    btn.style.color = isSel ? '#ffffff' : '#94a3b8';
  });

  const totalDisplay = containerEl.querySelector('#bandTotalDisplay');
  if (totalDisplay) {
    totalDisplay.innerHTML = `TOTAL BAND LOAD: <strong>${combo.nominalLoad} LBS</strong> <span style="color: #94a3b8; font-size: 10px;">(${combo.comboLabel})</span>`;
  }

  if (typeof onSelectionChange === 'function') {
    onSelectionChange(combo);
  }
}
