// -------------------------------------------------------------
// DYNAMIC BAND SELECTION & LOAD SOLVER ENGINE
// File: docs/js/engine/bandSolver.js
// -------------------------------------------------------------
import { BAND_CONFIG, getBandsForMovement } from '../data/bandConfigs.js';
import { BAND_EQUIVALENTS } from '../data/bandEquivalents.js';
import { getPRVault } from './records.js';
import { calculateTargetLoad } from './calc.js';

// Movement-specific scale factors
export const EQUIPMENT_LOAD_SCALERS = {
  "spanish squat": 0.25,
  "front squat": 0.50,
  "thruster": 0.50,
  "rdl": 0.60,
  "deadlift": 0.60,
  "adduct": 0.75,
  "abduct": 0.75,
  "kickback": 0.65,
  "curl": 0.70,
  "extension": 0.65,
  "default": 1.00
};

export function getMovementScaler(exerciseName = '') {
  const name = exerciseName.toLowerCase();
  for (const [key, scale] of Object.entries(EQUIPMENT_LOAD_SCALERS)) {
    if (key !== 'default' && name.includes(key)) {
      return scale;
    }
  }
  return EQUIPMENT_LOAD_SCALERS.default;
}

// Reverse lookup helper: maps banded variation to primary gym counterpart
export function getGymCounterpart(bandExerciseName = '') {
  if (!bandExerciseName) return '';
  for (const [gymName, bandName] of Object.entries(BAND_EQUIVALENTS || {})) {
    if (bandName.toLowerCase() === bandExerciseName.toLowerCase()) {
      return gymName;
    }
  }
  return bandExerciseName;
}

/**
 * 3-Step Dynamic Band Load Solver
 */
export function resolveInitialBandPreset(bandExerciseName, gymExerciseName, slotTarget = "3x8-10", defaultFallbackLoad = 50) {
  const prVault = getPRVault();
  const candidateBands = getBandsForMovement(bandExerciseName);

  // STEP 1: Dedicated Band PR History Check
  const dedicatedPR = prVault[bandExerciseName];
  if (dedicatedPR && dedicatedPR.load > 0) {
    const bandTargetLoad = (dedicatedPR.e1rm && dedicatedPR.e1rm > 0)
      ? calculateTargetLoad(dedicatedPR.e1rm, slotTarget, dedicatedPR.load, bandExerciseName)
      : dedicatedPR.load;
    return solveBestBandCombination(bandTargetLoad, candidateBands);
  }

  // STEP 2: Identify primary counterpart (strip qualifiers for PR lookup)
  const trueGymName = getGymCounterpart(bandExerciseName) || gymExerciseName;
  const cleanGymName = trueGymName.replace(/\s*\([^)]*\)/g, '').trim();
  const gymPR = prVault[cleanGymName] || prVault[trueGymName];

  let stageGymLoad = defaultFallbackLoad;
  let multiplier = getMovementScaler(bandExerciseName || trueGymName);

  // Metcon Cadence Dampener (20+ reps)
  const isHighRepMetcon = slotTarget.includes('20') || slotTarget.includes('25') || (bandExerciseName || '').toLowerCase().includes('tempo');
  if (isHighRepMetcon && (bandExerciseName || '').toLowerCase().includes('front squat')) {
    multiplier = 0.20; // Drops metcon front squat from 0.50x down to light cadence
  }

  // STEP 3: Counterpart Stage Load Resolution
  if (gymPR && gymPR.e1rm > 0) {
    stageGymLoad = calculateTargetLoad(gymPR.e1rm, slotTarget, defaultFallbackLoad, trueGymName);
  } else if (gymPR && gymPR.load > 0) {
    stageGymLoad = gymPR.load;
  } else if (trueGymName.includes('Leg Press')) {
    stageGymLoad = calculateTargetLoad(350, slotTarget, 140, trueGymName);
  } else if (trueGymName.includes('Chest Press') || trueGymName.includes('High Row')) {
    stageGymLoad = calculateTargetLoad(140, slotTarget, 110, trueGymName);
  } else {
    stageGymLoad = defaultFallbackLoad;
  }

  // Calculate final effective load and solve
  const effectiveBandLoad = Math.max(15, Math.round(stageGymLoad * multiplier));
  return solveBestBandCombination(effectiveBandLoad, candidateBands);
}

/**
 * Combination Solver: Finds the closest 1-band or 2-band combination
 */
export function solveBestBandCombination(targetLoad, candidateBands = []) {
  if (!targetLoad || targetLoad <= 0 || candidateBands.length === 0) {
    return { selectedKeys: [], nominalTotal: 0 };
  }

  let bestCombo = [];
  let minDiff = Infinity;

  // 1-band check
  for (const b of candidateBands) {
    const diff = Math.abs(b.nominal - targetLoad);
    if (diff < minDiff) {
      minDiff = diff;
      bestCombo = [b];
    }
  }

  // 2-band stacking check
  for (let i = 0; i < candidateBands.length; i++) {
    for (let j = i + 1; j < candidateBands.length; j++) {
      const b1 = candidateBands[i];
      const b2 = candidateBands[j];
      const sum = b1.nominal + b2.nominal;
      const diff = Math.abs(sum - targetLoad);
      if (diff < minDiff) {
        minDiff = diff;
        bestCombo = [b1, b2];
      }
    }
  }

  return {
    selectedKeys: bestCombo.map(b => b.id),
    nominalTotal: bestCombo.reduce((acc, b) => acc + (b.nominal || 0), 0)
  };
}
// docs/js/engine/bandSolver.js (Add at bottom)

/**
 * Overdrive Micro-Loading Bridge Solver (Strict Band-Type Isolation)
 * Locks candidate bands to the exact band type (e.g. 'mini' OR '41_loop') 
 * the user currently has selected so Mini Bands and 41" Loops never mix.
 */
export function solveOverdriveBandBridge(currentNominalLoad, bandExerciseName, activeSelectedKeys = []) {
  let candidateBands = getBandsForMovement(bandExerciseName);

  // 1. Detect active band type from user's current selection (e.g. 'mini' vs '41_loop')
  if (Array.isArray(activeSelectedKeys) && activeSelectedKeys.length > 0) {
    const firstKey = activeSelectedKeys[0];
    const activeType = BAND_CONFIG[firstKey]?.type;
    if (activeType) {
      const typeLockedBands = candidateBands.filter(b => b.type === activeType);
      if (typeLockedBands.length > 0) {
        candidateBands = typeLockedBands;
      }
    }
  }

  if (!currentNominalLoad || currentNominalLoad <= 0 || candidateBands.length === 0) {
    return solveBestBandCombination(currentNominalLoad + 5, candidateBands);
  }

  // 2. Scale step-up target based on band family (Mini bands use +5 to +10 lb steps; 41" Loops use +10 to +20 lb steps)
  const isMiniMode = candidateBands[0]?.type === 'mini';
  const idealStep = isMiniMode ? 7.5 : 10;
  const maxStep = isMiniMode ? 15 : 22.5;
  const bridgeTarget = currentNominalLoad + idealStep;

  let bestBridge = [];
  let minDiff = Infinity;

  // Check single-band upgrades first within the SAME band family
  for (const b of candidateBands) {
    if (b.nominal > currentNominalLoad && b.nominal <= currentNominalLoad + maxStep) {
      const diff = Math.abs(b.nominal - bridgeTarget);
      if (diff < minDiff) {
        minDiff = diff;
        bestBridge = [b];
      }
    }
  }

  // Check 2-band bridge stacks within the SAME band family
  for (let i = 0; i < candidateBands.length; i++) {
    for (let j = i + 1; j < candidateBands.length; j++) {
      const b1 = candidateBands[i];
      const b2 = candidateBands[j];
      const sum = b1.nominal + b2.nominal;

      if (sum > currentNominalLoad && sum <= currentNominalLoad + maxStep) {
        const diff = Math.abs(sum - bridgeTarget);
        if (diff < minDiff || (diff === minDiff && bestBridge.length > 2)) {
          minDiff = diff;
          bestBridge = [b1, b2];
        }
      }
    }
  }

  if (bestBridge.length > 0) {
    return {
      selectedKeys: bestBridge.map(b => b.id),
      nominalTotal: bestBridge.reduce((acc, b) => acc + (b.nominal || 0), 0),
      isBridge: true
    };
  }

  return solveBestBandCombination(bridgeTarget, candidateBands);
}
