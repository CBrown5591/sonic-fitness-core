// docs/js/engine/bandSolver.js
import { BAND_CONFIG, getBandsForMovement } from '../data/bandConfigs.js';
import { getPRVault } from './records.js';

/**
 * Biomechanical scaling multipliers for converting gym baseline targets
 * to appropriate elastic tension equivalents.
 */
export const EQUIPMENT_LOAD_SCALERS = {
  // Heavy axial/machine lower body -> Spanish/front squat leverage
  "squat": 0.55,
  "leg press": 0.55,

  // Unilateral / Hip isolation -> Ascending elastic resistance
  "adduct": 0.75,
  "abduct": 0.75,
  "curl": 0.70,
  "extension": 0.65,

  // Direct upper-body pushes/pulls (lat pulldowns, rows, chest press)
  "default": 1.00
};

export function getMovementScaler(exerciseName = '') {
  const name = exerciseName.toLowerCase();
  for (const [key, multiplier] of Object.entries(EQUIPMENT_LOAD_SCALERS)) {
    if (name.includes(key)) return multiplier;
  }
  return EQUIPMENT_LOAD_SCALERS.default;
}

/**
 * Finds the optimal single band or multi-band combination (up to 3 bands)
 * closest to the target nominal load.
 */
export function solveBestBandCombination(targetLoad, candidateBands = []) {
  if (!targetLoad || targetLoad <= 0 || candidateBands.length === 0) {
    return { selectedKeys: [], nominalTotal: 0 };
  }

  let bestCombo = [];
  let minDiff = Infinity;

  // Helper to generate k-combinations
  function getCombos(arr, k) {
    if (k === 1) return arr.map(el => [el]);
    const combos = [];
    arr.forEach((el, idx) => {
      const rest = arr.slice(idx + 1);
      const subCombos = getCombos(rest, k - 1);
      subCombos.forEach(sub => combos.push([el, ...sub]));
    });
    return combos;
  }

  const maxStack = Math.min(3, candidateBands.length);
  for (let k = 1; k <= maxStack; k++) {
    const combos = getCombos(candidateBands, k);
    for (const combo of combos) {
      const sum = combo.reduce((acc, b) => acc + (b.nominal || 0), 0);
      const diff = Math.abs(sum - targetLoad);

      if (diff < minDiff) {
        minDiff = diff;
        bestCombo = combo;
      } else if (diff === minDiff && combo.length < bestCombo.length) {
        // Tie-breaker: prefer fewer bands to manage
        bestCombo = combo;
      }
    }
  }

  const selectedKeys = bestCombo.map(b => b.id);
  const nominalTotal = bestCombo.reduce((acc, b) => acc + (b.nominal || 0), 0);

  return { selectedKeys, nominalTotal };
}

/**
 * Resolves the initial load and pre-selected bands when flipping to [BANDS]:
 * 1. Checks if the banded exercise already has its own dedicated 1RM in PR_VAULT.
 * 2. If new, derives load from the gym exercise using biomechanical scaling.
 * 3. Returns the band IDs to highlight and the nominal load to set.
 */
export function resolveInitialBandPreset(bandExerciseName, gymExerciseName, gymTargetLoad = 50) {
  const prVault = getPRVault();
  const dedicatedPR = prVault[bandExerciseName];

  let effectiveTargetLoad = 0;

  if (dedicatedPR && dedicatedPR.e1rm > 0) {
    // 1. Dedicated banded record exists: load from its own history
    effectiveTargetLoad = dedicatedPR.load || Math.round(dedicatedPR.e1rm * 0.70);
  } else {
    // 2. First-time transition: scale from gym baseline
    const multiplier = getMovementScaler(gymExerciseName);
    effectiveTargetLoad = Math.round(gymTargetLoad * multiplier);
  }

  const candidateBands = getBandsForMovement(bandExerciseName);
  return solveBestBandCombination(effectiveTargetLoad, candidateBands);
}
