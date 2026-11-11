// docs/js/engine/bandSolver.js
import { getBandsForMovement } from '../data/bandConfigs.js';
import { getPRVault } from './records.js';

export const EQUIPMENT_LOAD_SCALERS = {
  // Horizontal shin/knee brace squats (bodyweight delivers vertical work)
  "spanish squat": 0.25,

  // Direct vertical resisted squats & deadlifts
  "front squat": 0.50,
  "rdl": 0.60,

  // Unilateral / Hip isolation
  "adduct": 0.75,
  "abduct": 0.75,
  "curl": 0.70,
  "extension": 0.65,

  // Direct upper-body cable/machine pulls and presses
  "default": 1.00
};

export function getMovementScaler(exerciseName = '') {
  const name = exerciseName.toLowerCase();
  for (const [key, multiplier] of Object.entries(EQUIPMENT_LOAD_SCALERS)) {
    if (name.includes(key)) return multiplier;
  }
  return EQUIPMENT_LOAD_SCALERS.default;
}

export function solveBestBandCombination(targetLoad, candidateBands = []) {
  if (!targetLoad || targetLoad <= 0 || candidateBands.length === 0) {
    return { selectedKeys: [], nominalTotal: 0 };
  }

  let bestCombo = [];
  let minDiff = Infinity;

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
        bestCombo = combo;
      }
    }
  }

  return {
    selectedKeys: bestCombo.map(b => b.id),
    nominalTotal: bestCombo.reduce((acc, b) => acc + (b.nominal || 0), 0)
  };
}

export function resolveInitialBandPreset(bandExerciseName, gymExerciseName, gymTargetLoad = 50) {
  const prVault = getPRVault();
  const dedicatedPR = prVault[bandExerciseName];

  let effectiveTargetLoad = 0;

  if (dedicatedPR && dedicatedPR.e1rm > 0) {
    effectiveTargetLoad = dedicatedPR.load || Math.round(dedicatedPR.e1rm * 0.70);
  } else {
    const multiplier = getMovementScaler(bandExerciseName || gymExerciseName);
    effectiveTargetLoad = Math.round(gymTargetLoad * multiplier);
  }

  const candidateBands = getBandsForMovement(bandExerciseName);
  return solveBestBandCombination(effectiveTargetLoad, candidateBands);
}
