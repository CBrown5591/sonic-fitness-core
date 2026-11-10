// -------------------------------------------------------------
// EQUIPMENT-AWARE DOUBLE PROGRESSION & AUTO-REGULATION ENGINE
// Modular Engine: autoReg.js
// -------------------------------------------------------------

/**
 * Parses min and max rep boundaries from target string or DOM element
 * e.g., "3x8-10" -> { minReps: 8, maxReps: 10 }
 * e.g., "3x6-8"  -> { minReps: 6, maxReps: 8 }
 * e.g., "3x12-15" -> { minReps: 12, maxReps: 15 }
 */
// docs/js/engine/autoReg.js

export function parseRepBracket(targetStr, fallbackMin = 8, fallbackMax = 10) {
  if (!targetStr) return { minReps: fallbackMin, maxReps: fallbackMax };

  // 1. Matches range brackets across hyphens, en-dashes, em-dashes, and spaces
  // Examples: "3x10-12", "3 × 12–15", "10 - 12", "40–50"
  const rangeMatch = targetStr.match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (rangeMatch) {
    return {
      minReps: parseInt(rangeMatch[1], 10),
      maxReps: parseInt(rangeMatch[2], 10)
    };
  }

  // 2. Single target notations (e.g. "15 reps", "12r/side")
  const singleMatch = targetStr.match(/(\d+)\s*(?:reps?|r\b|\/side)/i);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return { minReps: Math.max(1, val - 2), maxReps: val };
  }

  // 3. Fall back to the passed-in stage/slot defaults rather than a static 8-10
  return { minReps: fallbackMin, maxReps: fallbackMax };
}

/**
 * Determines if movement is a dumbbell variation subject to physical equipment ceiling
 */
export function isDumbbellMovement(exerciseName) {
  if (!exerciseName) return false;
  const name = exerciseName.toLowerCase();
  return (
    name.includes('db') ||
    name.includes('dumbbell') ||
    name.includes("farmer's") ||
    name.includes("suitcase")
  );
}

/**
 * Calculates auto-regulated recommendations for the subsequent set
 * Evaluates completed set using Double Progression protocol:
 * 1. Accumulate reps within the bracket first (RPE <= 7.5).
 * 2. Overload weight (+5 lbs) ONLY after capping the rep ceiling cleanly.
 * 3. Enforce 65 lb hard ceiling exclusively on Dumbbell exercises.
 */
export function autoRegulateNextSet(completedSet) {
  if (!completedSet) return null;

  const { exercise, load, reps, rpe, tempoClean, jointPain } = completedSet;
  const numLoad = parseFloat(load) || 0;
  const numReps = parseInt(reps, 10) || 0;
  const numRpe = parseFloat(rpe) || 8.0;

// Read current target directly from DOM or completed set
  let targetStr = "";
  const targetTag = typeof document !== 'undefined' ? document.getElementById('currentTargetTag') : null;
  if (targetTag && targetTag.innerText) {
    targetStr = targetTag.innerText.replace(/^TARGET:\s*/i, '').trim();
  } else if (completedSet.target) {
    targetStr = completedSet.target;
  }

  // Use completedSet.reps as the floor fallback if targetStr fails to resolve
  const fallbackFloor = completedSet.reps || 8;
  const { minReps, maxReps } = parseRepBracket(targetStr, fallbackFloor, fallbackFloor + 2);

  const isDumbbell = isDumbbellMovement(exercise);

  // 1. Safety Hold / Joint Strain / Severe Overshoot (RPE >= 9.5)
  if (jointPain || numRpe >= 9.5) {
    const deLoad = Math.max(5, numLoad - 5);
    return {
      load: deLoad,
      reps: minReps,
      message: `⚠️ JOINT SHIELD ENGAGED: Dial back load to ${deLoad} lbs × ${minReps} reps.`
    };
  }

  // 2. High Fatigue / Technical Breakdown (RPE >= 9.0 or Sloppy Tempo)
  if (!tempoClean || numRpe >= 9.0) {
    return {
      load: numLoad,
      reps: Math.max(minReps, numReps - 1),
      message: `🛑 FATIGUE DETECTED: Maintain ${numLoad} lbs; lock in strict 3-0-1 tempo.`
    };
  }

  // 3. Double Progression Engine: Sub-Threshold Clean Sets (RPE <= 7.5)
  if (numRpe <= 7.5 && tempoClean && !jointPain) {
    // Phase 1: Rep Accumulation within bracket
    if (numReps < maxReps) {
      const targetNextReps = Math.min(maxReps, numReps + (numRpe <= 6.5 ? 2 : 1));
      return {
        load: numLoad,
        reps: targetNextReps,
        message: `⚡ OVERDRIVE READY: Load locked at ${numLoad} lbs. Target ${targetNextReps} reps (+${targetNextReps - numReps}r)!`
      };
    }

    // Phase 2: Max Rep Ceiling Achieved -> Overload Weight & Reset Rep Floor
    if (numReps >= maxReps) {
      if (isDumbbell && numLoad >= 65) {
        // Dumbbell ceiling reached: progress via tempo density or top-bracket holds
        return {
          load: 65,
          reps: maxReps,
          message: `★ 65 LB DB CEILING CLEAR: Hold 65 lbs × ${maxReps} reps with 4-0-1 slow eccentric!`
        };
      }

      // Normal weight advancement: +5 lbs, reset reps to bracket floor
      let nextLoad = numLoad + 5;
      if (isDumbbell) {
        nextLoad = Math.min(65, nextLoad);
      }

      return {
        load: nextLoad,
        reps: minReps,
        message: `★ BRACKET CLEARED (${numReps}r @ RPE ${numRpe})! Overload to ${nextLoad} lbs (+5 lbs) × ${minReps} reps.`
      };
    }
  }

  // 4. In the Pocket (RPE 8.0): Steady State
  return {
    load: numLoad,
    reps: numReps,
    message: `🎯 SWEET SPOT (RPE 8.0): Repeat ${numLoad} lbs × ${numReps} reps.`
  };
}
