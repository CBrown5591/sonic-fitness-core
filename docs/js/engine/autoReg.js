// -------------------------------------------------------------
// INTRA-SESSION AUTO-REGULATION ENGINE (BI-DIRECTIONAL)
// Modular Engine: autoReg.js
// -------------------------------------------------------------
import { calculateE1RM } from './calc.js';
import { CARDIO_CONFIGS } from '../data/cardioConfigs.js';

/**
 * Evaluates completed set effort against target RPE 8.0
 * Bumps load/reps on undershoots, applies fatigue buffer on overshoots
 */
export function autoRegulateNextSet(completedSet, options = {}) {
  if (!completedSet || completedSet.jointPain || !completedSet.tempoClean) return null;
  if (CARDIO_CONFIGS && CARDIO_CONFIGS[completedSet.exercise]) return null;

  const loggedRpe = parseFloat(completedSet.rpe) || 8.0;
  const targetRpe = options.targetRpe || 8.0;
  const deltaRpe = loggedRpe - targetRpe;

  // In the target pocket (RPE 7.5 - 8.5): No adjustment needed
  if (Math.abs(deltaRpe) < 0.75) return null;

  const currentLoad = parseFloat(completedSet.load) || 0;
  const currentReps = parseInt(completedSet.reps, 10) || 0;
  if (currentLoad <= 0 || currentReps <= 0) return null;

  // 1. Calculate real-time e1RM from completed set
  const sessionE1RM = calculateE1RM(currentLoad, currentReps, loggedRpe);

  // 2. Back-calculate target load for RPE 8.0 (2.0 RIR) at the same rep count
  const targetRir = Math.max(0.0, 10.0 - targetRpe);
  const targetEffReps = currentReps + targetRir;

  let targetLoadRaw = 0;
  if (targetEffReps <= 1) {
    targetLoadRaw = sessionE1RM;
  } else if (targetEffReps <= 6) {
    targetLoadRaw = sessionE1RM * (1.0278 - (0.0278 * targetEffReps));
  } else {
    targetLoadRaw = sessionE1RM / (1.0 + (targetEffReps / 30.0));
  }

  // 3. Equipment-aware clamping & rounding
  const isDumbbell = completedSet.exercise.includes('DB') || completedSet.exercise.includes('Dumbbell') || completedSet.exercise.includes('Farmer');
  let adjustedLoad = Math.round(targetLoadRaw / 5.0) * 5;
  if (isDumbbell) adjustedLoad = Math.min(65, adjustedLoad);

  // 4. Return concrete recommendation payload
  if (deltaRpe <= -0.75) {
    // Undershoot (e.g. RPE 6.0 - 7.0)
    if (adjustedLoad > currentLoad) {
      return {
        type: 'BOOST_LOAD',
        load: adjustedLoad,
        reps: currentReps,
        message: `⚡ AUTO-BOOST: Load adjusted ${currentLoad}# → ${adjustedLoad}# for RPE 8.0 target!`
      };
    } else {
      const suggestedReps = currentReps + Math.round(Math.abs(deltaRpe));
      return {
        type: 'BOOST_REPS',
        load: currentLoad,
        reps: suggestedReps,
        message: `⚡ AUTO-CADENCE: Reps bumped ${currentReps} → ${suggestedReps} to hit RPE 8.0 threshold!`
      };
    }
  } else if (deltaRpe >= 0.75) {
    // Overshoot (e.g. RPE 9.0 - 10.0)
    if (adjustedLoad < currentLoad) {
      return {
        type: 'FATIGUE_BUFFER_LOAD',
        load: Math.max(5, adjustedLoad),
        reps: currentReps,
        message: `🛡️ FATIGUE BUFFER: Load reduced ${currentLoad}# → ${adjustedLoad}# to protect set quality!`
      };
    } else {
      const safeReps = Math.max(1, currentReps - 1);
      return {
        type: 'FATIGUE_BUFFER_REPS',
        load: currentLoad,
        reps: safeReps,
        message: `🛡️ FATIGUE BUFFER: Rep target adjusted to ${safeReps} to prevent technical failure.`
      };
    }
  }

  return null;
}
