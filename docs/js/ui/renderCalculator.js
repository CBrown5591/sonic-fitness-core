// docs/js/ui/renderCalculator.js
import { BAND_CONFIG } from '../data/bandConfigs.js';
import { calculateE1RM, calculateTargetLoad } from '../engine/calc.js';
import { EQUIPMENT_LOAD_SCALERS, solveBestBandCombination } from '../engine/bandSolver.js';

let calcSelectedBands = new Set();

export function renderCalculator(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">
        ⚡ TACTICAL LOAD & BAND SOLVER
      </h3>

      <!-- 1. MODE SELECTION -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button id="calcModeGym" type="button" class="calc-tab-btn active" style="flex: 1; padding: 8px; border-radius: 6px; font-weight: 700; background: #38bdf8; color: #0f172a; border: none; cursor: pointer;">
          🏋️ DUMBBELL / MACHINE
        </button>
        <button id="calcModeBand" type="button" class="calc-tab-btn" style="flex: 1; padding: 8px; border-radius: 6px; font-weight: 700; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
          ⚡ BAND SIMULATOR
        </button>
      </div>

      <!-- 2. GYM / MACHINE PANEL -->
      <div id="calcPanelGym">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">WEIGHT (LBS)</label>
            <input type="number" id="calcWeightInput" value="60" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 14px; font-weight: 700;">
          </div>
          <div>
            <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">REPS LOGGED</label>
            <input type="number" id="calcRepsInput" value="8" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 14px; font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">RPE</label>
            <select id="calcRpeInput" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 700;">
              <option value="7.0">7.0 (3 RIR)</option>
              <option value="7.5" selected>7.5 (2-3 RIR)</option>
              <option value="8.0">8.0 (2 RIR)</option>
              <option value="8.5">8.5 (1-2 RIR)</option>
              <option value="9.0">9.0 (1 RIR)</option>
              <option value="10.0">10.0 (Max)</option>
            </select>
          </div>
          <div>
            <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">TARGET BRACKET</label>
            <select id="calcTargetBracket" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 700;">
              <option value="3x6-8">3x6-8 (Heavy Power)</option>
              <option value="3x8-10" selected>3x8-10 (Hypertrophy)</option>
              <option value="3x12-15">3x12-15 (Pump / Armor)</option>
              <option value="3x20-25 reps">3x20-25 (Metcon Tempo)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; cursor: pointer;">
            <input type="checkbox" id="calcIsDb" checked>
            <span>Apply 65 lb Dumbbell Ceiling</span>
          </label>
        </div>

        <div id="calcGymOutput" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px;">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- 3. BAND CONVERSION PANEL -->
      <div id="calcPanelBand" style="display: none;">
        <div style="margin-bottom: 12px;">
          <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">GYM BASELINE LOAD (OR 1RM)</label>
          <input type="number" id="calcBandBaseLoad" value="260" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 14px; font-weight: 700;">
        </div>

        <div style="margin-bottom: 12px;">
          <label style="font-size: 10px; color: #94a3b8; font-weight: 700;">MOVEMENT SCALING CATEGORY</label>
          <select id="calcBandScaler" style="width: 100%; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 700;">
            <option value="0.25">Spanish Squat / Knee Brace (0.25x)</option>
            <option value="0.20">Metcon Front Squat 20-25r (0.20x)</option>
            <option value="0.50">Standard Front Squat (0.50x)</option>
            <option value="0.60">Romanian Deadlift / Hinge (0.60x)</option>
            <option value="0.75">Adductor / Abductor Sweep (0.75x)</option>
            <option value="0.70">Curls / Biceps (0.70x)</option>
            <option value="1.00">Upper Body Press / Row (1.00x)</option>
          </select>
        </div>

        <div id="calcBandRecommendation" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <!-- Recommendation output -->
        </div>

        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; margin-bottom: 8px;">
          BAND COMBINATION TESTER (TAP TO COMBINE)
        </div>
        <div id="calcBandPillContainer" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
          <!-- Band pills -->
        </div>
        <div id="calcBandTotalDisplay" style="font-size: 12px; font-weight: 700; color: #facc15;">
          TOTAL TEST TENSION: 0 LBS
        </div>
      </div>
    </div>
  `;

  attachCalcEvents(containerEl);
  recomputeGym();
  recomputeBand();
  renderTesterPills(containerEl);
}

function attachCalcEvents(containerEl) {
  const gymBtn = containerEl.querySelector('#calcModeGym');
  const bandBtn = containerEl.querySelector('#calcModeBand');
  const panelGym = containerEl.querySelector('#calcPanelGym');
  const panelBand = containerEl.querySelector('#calcPanelBand');

  gymBtn.onclick = () => {
    gymBtn.style.background = '#38bdf8';
    gymBtn.style.color = '#0f172a';
    bandBtn.style.background = 'rgba(255,255,255,0.05)';
    bandBtn.style.color = '#94a3b8';
    panelGym.style.display = 'block';
    panelBand.style.display = 'none';
  };

  bandBtn.onclick = () => {
    bandBtn.style.background = '#38bdf8';
    bandBtn.style.color = '#0f172a';
    gymBtn.style.background = 'rgba(255,255,255,0.05)';
    gymBtn.style.color = '#94a3b8';
    panelGym.style.display = 'none';
    panelBand.style.display = 'block';
  };

  ['#calcWeightInput', '#calcRepsInput', '#calcRpeInput', '#calcTargetBracket', '#calcIsDb'].forEach(id => {
    const el = containerEl.querySelector(id);
    if (el) el.oninput = recomputeGym;
  });

  ['#calcBandBaseLoad', '#calcBandScaler'].forEach(id => {
    const el = containerEl.querySelector(id);
    if (el) el.oninput = recomputeBand;
  });
}

function recomputeGym() {
  const load = parseFloat(document.getElementById('calcWeightInput')?.value) || 0;
  const reps = parseInt(document.getElementById('calcRepsInput')?.value, 10) || 0;
  const rpe = parseFloat(document.getElementById('calcRpeInput')?.value) || 7.5;
  const target = document.getElementById('calcTargetBracket')?.value || "3x8-10";
  const isDb = document.getElementById('calcIsDb')?.checked;

  const e1rm = calculateE1RM(load, reps, rpe);
  let nextTargetLoad = calculateTargetLoad(e1rm, target, load);
  if (isDb) {
    nextTargetLoad = Math.min(65, nextTargetLoad);
  }

  const out = document.getElementById('calcGymOutput');
  if (out) {
    out.innerHTML = `
      <div style="font-size: 11px; color: #94a3b8;">ESTIMATED 1RM (E1RM): <strong style="color: #38bdf8; font-size: 13px;">${e1rm} LBS</strong></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">RECOMMENDED FOR ${target}: <strong style="color: #facc15; font-size: 13px;">${nextTargetLoad} LBS</strong> ${isDb && nextTargetLoad >= 65 ? '<span style="color: #ef4444;">(65 LB DB CAP REACHED)</span>' : ''}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Single Set Volume: ${load * reps} lbs</div>
    `;
  }
}

function recomputeBand() {
  const baseLoad = parseFloat(document.getElementById('calcBandBaseLoad')?.value) || 0;
  const mult = parseFloat(document.getElementById('calcBandScaler')?.value) || 1.0;
  const scaled = Math.round(baseLoad * mult);

  const candidateBands = Object.values(BAND_CONFIG).filter(b => b.type === '41_loop');
  const combo = solveBestBandCombination(scaled, candidateBands);

  const out = document.getElementById('calcBandRecommendation');
  if (out) {
    out.innerHTML = `
      <div style="font-size: 11px; color: #94a3b8;">SCALED EFFECTIVE LOAD: <strong style="color: #38bdf8; font-size: 13px;">${scaled} LBS</strong></div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">SOLVER RECOMMENDATION: <strong style="color: #facc15; font-size: 13px;">${combo.nominalTotal} LBS</strong></div>
      <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">Pills: ${combo.selectedKeys.map(k => BAND_CONFIG[k]?.name).join(' + ') || 'None'}</div>
    `;
  }
}

function renderTesterPills(containerEl) {
  const mount = containerEl.querySelector('#calcBandPillContainer');
  if (!mount) return;

  mount.innerHTML = Object.values(BAND_CONFIG).map(b => {
    const isSel = calcSelectedBands.has(b.id);
    return `
      <button type="button" class="calc-pill-btn" data-key="${b.id}" style="
        background: ${isSel ? 'rgba(56, 189, 248, 0.28)' : 'rgba(15, 23, 42, 0.85)'};
        border: 1px solid ${isSel ? '#38bdf8' : 'rgba(255,255,255,0.15)'};
        color: ${isSel ? '#ffffff' : '#94a3b8'};
        padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${b.color};"></span>
        ${b.name} (${b.nominal} lbs)
      </button>
    `;
  }).join('');

  mount.querySelectorAll('.calc-pill-btn').forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.key;
      if (calcSelectedBands.has(k)) calcSelectedBands.delete(k);
      else calcSelectedBands.add(k);
      renderTesterPills(containerEl);
      updateTesterTotal(containerEl);
    };
  });
}

function updateTesterTotal(containerEl) {
  let sum = 0;
  let names = [];
  calcSelectedBands.forEach(k => {
    const b = BAND_CONFIG[k];
    if (b) {
      sum += b.nominal;
      names.push(b.name);
    }
  });

  const disp = containerEl.querySelector('#calcBandTotalDisplay');
  if (disp) {
    disp.innerHTML = `TOTAL TEST TENSION: <strong>${sum} LBS</strong> (${names.join(' + ') || 'None'})`;
  }
}
