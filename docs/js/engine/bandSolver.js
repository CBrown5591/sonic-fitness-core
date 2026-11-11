// docs/js/engine/bandSolver.js
import { BAND_EQUIVALENTS } from '../data/bandEquivalents.js';
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

// docs/js/engine/bandSolver.js

// Reverse lookup: finds the actual gym parent lift for any chosen band alt
function getGymCounterpart(bandExerciseName) {
  for (const [gymName, bandName] of Object.entries(BAND_EQUIVALENTS)) {
    if (bandName.toLowerCase() === (bandExerciseName || '').toLowerCase()) {
      return gymName;
    }
  }
  return bandExerciseName;
}

export function resolveInitialBandPreset(bandExerciseName, gymExerciseName, gymTargetLoad = 50) {
  const prVault = getPRVault();
  
  // 1. Check if this banded movement has its own dedicated 1RM/PR
  const dedicatedPR = prVault[bandExerciseName];
  if (dedicatedPR && dedicatedPR.load > 0) {
    const candidateBands = getBandsForMovement(bandExerciseName);
    return solveBestBandCombination(dedicatedPR.load, candidateBands);
  }

  // 2. Identify the true gym counterpart (e.g., Spanish Squat -> Cybex Leg Press)
  const trueGymName = getGymCounterpart(bandExerciseName) || gymExerciseName;
  const gymPR = prVault[trueGymName];

  // 3. Resolve baseline load for that true counterpart
  let baseGymLoad = gymTargetLoad;
  if (gymPR && gymPR.load > 0) {
    baseGymLoad = gymPR.load;
  } else if (trueGymName.includes('Leg Press')) {
    baseGymLoad = 250; 
  } else if (trueGymName.includes('Chest Press') || trueGymName.includes('High Row')) {
    baseGymLoad = 110;
  }

  // 4. Scale with the movement multiplier
  const multiplier = getMovementScaler(bandExerciseName || trueGymName);
  const effectiveTargetLoad = Math.max(20, Math.round(baseGymLoad * multiplier));

  const candidateBands = getBandsForMovement(bandExerciseName);
  return solveBestBandCombination(effectiveTargetLoad, candidateBands);
}
