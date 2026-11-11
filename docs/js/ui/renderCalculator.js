// docs/js/ui/renderCalculator.js
import { BAND_CONFIG } from '../data/bandConfigs.js';
import { EQUIPMENT_LOAD_SCALERS, solveBestBandCombination } from '../engine/bandSolver.js';
import { calculateTargetLoad } from '../engine/calc.js';

let calcSelectedBands = new Set();

// Self-contained Epley + RIR/RPE e1RM calculation
function getE1RM(weight, reps, rpe) {
  if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
  const repsInReserve = Math.max(0, 10 - (rpe || 10));
  const effectiveReps = reps + repsInReserve;
  if (effectiveReps <= 1) return Math.round(weight);
  return Math.round(weight * (1 + effectiveReps / 30));
}

export function renderCalculator(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; border-radius: 12px; padding: 16px; margin-bottom: 16px; max-width: 650px; margin-left: auto; margin-right: auto;">
      <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">
        ⚡ TACTICAL LOAD & BAND CALCULATOR
      </h3>

      <!-- MODE TOGGLES -->
      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <button id="calcModeGym" type="button" style="flex: 1; padding: 9px; border-radius: 6px; font-weight: 800; font-size: 11px; background: #38bdf8; color: #0f172a; border: none; cursor: pointer;">
          🏋️ DUMBBELL / MACHINE
        </button>
        <button id="calcModeBand" type="button" style="flex: 1; padding: 9px; border-radius: 6px; font-weight: 800; font-size: 11px; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
          ⚡ BAND SIMULATOR
        </button>
      </div>

      <!-- PANEL 1: GYM & DUMBBELL CALC -->
      <div id="calcPanelGym">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">WEIGHT (LBS)</label>
            <input type="number" id="calcWeightInput" value="60" style="width: 100%; box-sizing: border-box; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 14px; font-weight: 700;">
          </div>
          <div>
            <label style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">REPS LOGGED</label>
            <input type="number" id="calcRepsInput" value="8" style="width: 100%; box-sizing: border-box; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 14px; font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">RPE (EFFORT)</label>
            <select id="calcRpeInput" style="width: 100%; box-sizing: border-box; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">
              <option value="7.0">7.0 (3 RIR)</option>
              <option value="7.5" selected>7.5 (2-3 RIR)</option>
              <option value="8.0">8.0 (2 RIR)</option>
              <option value="8.5">8.5 (1-2 RIR)</option>
              <option value="9.0">9.0 (1 RIR)</option>
              <option value="10.0">10.0 (Max Effort)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 10px; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">TARGET BRACKET</label>
            <select id="calcTargetBracket" style="width: 100%; box-sizing: border-box; background: #0b0f19; border: 1px solid #334155; color: #fff; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">
              <option value="3x6-8">3x6-8 (Heavy Power)</option>
              <option value="3x8-10" selected>3x8-10 (Hypertrophy)</option>
              <option value="3x10-12">3x10-12 (P
