// docs/js/engine/bandSolver.js
// docs/js/engine/bandSolver.js
import { BAND_CONFIG, getBandsForMovement } from '../data/bandConfigs.js';
import { BAND_EQUIVALENTS } from '../data/bandEquivalents.js';
import { getPRVault } from './records.js';
import { calculateTargetLoad } from './calc.js';

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

// Reverse lookup: maps any chosen band exercise back to its primary gym counterpart
export function getGymCounterpart(bandExerciseName) {
  if (!bandExerciseName) return '';
  for (const [gymName, bandName] of Object.entries(BAND_EQUIVALENTS || {})) {
    if (bandName.toLowerCase() === bandExerciseName.toLowerCase()) {
      return gymName;
    }
  }
  return bandExerciseName;
}
// Reverse lookup: finds the actual gym parent lift for any chosen band alt
export function resolveInitialBandPreset(bandExerciseName, gymExerciseName, slotTarget = "3x8-10", defaultFallbackLoad = 50) {
  const prVault = getPRVault();
  const candidateBands = getBandsForMovement(bandExerciseName);

  // 1. Dedicated band history check
  const dedicatedPR = prVault[bandExerciseName];
  if (dedicatedPR && dedicatedPR.e1rm > 0) {
    const bandTargetLoad = calculateTargetLoad(dedicatedPR.e1rm, slotTarget, dedicatedPR.load || defaultFallbackLoad, bandExerciseName);
    return solveBestBandCombination(bandTargetLoad, candidateBands);
  }

  // 2. Identify gym partner via reverse lookup
  const trueGymName = getGymCounterpart(bandExerciseName) || gymExerciseName;
  const gymPR = prVault[trueGymName];

  // 3. Compute stage-specific load from partner 1RM
  let partnerStageLoad = defaultFallbackLoad;
  if (gymPR && gymPR.e1rm > 0) {
    partnerStageLoad = calculateTargetLoad(gymPR.e1rm, slotTarget, defaultFallbackLoad, trueGymName);
  } else if (trueGymName.includes('Leg Press')) {
    partnerStageLoad = calculateTargetLoad(350, slotTarget, 250, trueGymName);
  } else if (trueGymName.includes('Chest Press') || trueGymName.includes('High Row')) {
    partnerStageLoad = calculateTargetLoad(140, slotTarget, 110, trueGymName);
  }

  // 4. Apply biomechanical modifier
  const multiplier = getMovementScaler(bandExerciseName || trueGymName);
  const effectiveBandLoad = Math.max(20, Math.round(partnerStageLoad * multiplier));

  return solveBestBandCombination(effectiveBandLoad, candidateBands);
}
