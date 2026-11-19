// -------------------------------------------------------------
// AUTO-ROTATING STAGE PRESETS & SEGMENTAL BIAS ENGINE (TSK-14)
// Modes: 'FRESH' (Cross-Session + Segmental Balance) | 'FOCUS' (Cumulative Synergy)
// Modular Engine: docs/js/engine/slotRotator.js
// -------------------------------------------------------------

const ROTATOR_MODE_KEY = 'sonic_rotator_mode';
const ROTATOR_HISTORY_KEY = 'sonic_rotator_history';

export function getRotatorMode() {
  return localStorage.getItem(ROTATOR_MODE_KEY) || 'FRESH';
}

export function setRotatorMode(mode) {
  const valid = mode === 'FOCUS' ? 'FOCUS' : 'FRESH';
  localStorage.setItem(ROTATOR_MODE_KEY, valid);
  return valid;
}

/**
 * Infers normalized primary & synergistic muscle tags from exercise name
 */
export function getExerciseMuscleTags(exerciseName = '') {
  const n = exerciseName.toLowerCase();
  const tags = new Set();

  // Posterior Chain & Lower Body
  if (n.includes('rdl') || n.includes('deadlift') || n.includes('hinge') || n.includes('hamstring') || n.includes('good morning')) {
    tags.add('hamstrings'); tags.add('glutes'); tags.add('erectors');
  }
  if (n.includes('glute') || n.includes('bridge') || n.includes('hip thrust') || n.includes('abduction') || n.includes('clam')) {
    tags.add('glutes'); tags.add('abductors');
  }
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg press') || n.includes('leg extension') || n.includes('step-up')) {
    tags.add('quads'); tags.add('glutes');
  }

  // Horizontal & Vertical Pull
  if (n.includes('row') || n.includes('pulldown') || n.includes('pull-up') || n.includes('chin-up') || n.includes('lat')) {
    tags.add('lats'); tags.add('upper_back'); tags.add('biceps'); tags.add('rear_delts');
  }
  if (n.includes('rear delt') || n.includes('face pull') || n.includes('pull-apart') || n.includes('reverse fly') || n.includes('shrug')) {
    tags.add('rear_delts'); tags.add('upper_back'); tags.add('traps');
  }
  if (n.includes('curl') || n.includes('bicep')) {
    tags.add('biceps'); tags.add('forearms');
  }

  // Horizontal & Vertical Push
  if (n.includes('chest') || n.includes('bench') || n.includes('push-up') || n.includes('pushup') || n.includes('fly') || n.includes('pec')) {
    tags.add('chest'); tags.add('front_delts'); tags.add('triceps');
  }
  if (n.includes('overhead') || n.includes('shoulder press') || n.includes('lateral raise') || n.includes('landmine press') || n.includes('arnold')) {
    tags.add('front_delts'); tags.add('side_delts'); tags.add('triceps');
  }
  if (n.includes('tricep') || n.includes('pushdown') || n.includes('extension') || n.includes('dip')) {
    tags.add('triceps');
  }

  // Core, Rotation & Carries
  if (n.includes('woodchop') || n.includes('pallof') || n.includes('rotation') || n.includes('windmill') || n.includes('russian')) {
    tags.add('obliques'); tags.add('core'); tags.add('glutes');
  }
  if (n.includes('crunch') || n.includes('plank') || n.includes('dead bug') || n.includes('hollow') || n.includes('anti-extension') || n.includes('ab')) {
    tags.add('abs'); tags.add('core');
  }
  if (n.includes('carry') || n.includes('farmer') || n.includes('suitcase')) {
    tags.add('core'); tags.add('obliques'); tags.add('forearms'); tags.add('traps'); tags.add('glutes');
  }

  if (tags.size === 0) tags.add('general');
  return Array.from(tags);
}

/**
 * Reads the latest Arboleaf Deep Scan (Column R) from localStorage to derive
 * unilateral limb bias and trunk metabolic conditioning bias.
 */
function getDeepScanRotatorBiases() {
  try {
    const raw = localStorage.getItem('sonic_biometrics_history');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return null;

    const sorted = [...list].sort(
      (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
    );
    const ds = sorted.find(r => r.deepScan && typeof r.deepScan === 'object')?.deepScan;
    if (!ds) return null;

    const segLean = ds.segmentalLean || null;
    const segFat = ds.segmentalFat || null;

    const needUnilateralUpper = Boolean(
      segLean && Number(segLean.upperSymmetryPct) > 0 && Number(segLean.upperSymmetryPct) < 96.0
    );
    const needUnilateralLower = Boolean(
      segLean && (
        (Number(segLean.lowerSymmetryPct) > 0 && Number(segLean.lowerSymmetryPct) < 96.0) ||
        (Number(segLean.leftLegPct) > 0 && Number(segLean.leftLegPct) < 90.0) ||
        (Number(segLean.rightLegPct) > 0 && Number(segLean.rightLegPct) < 90.0)
      )
    );
    const highTrunkOrVisceral = Boolean(
      (Number(ds.visceralFat) >= 15) ||
      (segFat && Number(segFat.trunkLbs) >= 50)
    );

    return { needUnilateralUpper, needUnilateralLower, highTrunkOrVisceral };
  } catch (e) {
    return null;
  }
}

function isUnilateralMovement(exerciseName = '') {
  const n = exerciseName.toLowerCase();
  return (
    n.includes('single-arm') ||
    n.includes('single arm') ||
    n.includes('single-leg') ||
    n.includes('single leg') ||
    n.includes('bulgarian') ||
    n.includes('split squat') ||
    n.includes('b-stance') ||
    n.includes('suitcase') ||
    n.includes('half-kneeling') ||
    n.includes('iso-lateral') ||
    n.includes('one-arm') ||
    n.includes('lunge')
  );
}

/**
 * Records completed slot exercise to cross-session history so FRESH mode rotates cleanly
 */
export function recordSlotRotationHistory(stageKey, slotId, exerciseName) {
  if (!stageKey || !slotId || !exerciseName) return;
  try {
    const raw = localStorage.getItem(ROTATOR_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : {};
    const key = `${stageKey}_${slotId}`;
    const list = Array.isArray(history[key]) ? history[key] : [];
    const filtered = list.filter(item => item !== exerciseName);
    filtered.push(exerciseName);
    history[key] = filtered.slice(-4);
    localStorage.setItem(ROTATOR_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Rotator history save skipped:', e);
  }
}

/**
 * Resolves the recommended exercise for the active slot based on mode:
 * - FRESH: Cross-session variety + Segmental Muscle Balance / Visceral Fat tie-breaker
 * - FOCUS: Cumulative muscle-tag overlap across ALL preceding slots in activeSession
 */

/**
 * Evaluates ALL slots in the active stage (current, adjacent, and non-adjacent)
 * to determine whether FOCUS mode should:
 *  - Stay in the current slot and load a second synergistic variation, OR
 *  - Jump directly to another slot (including non-adjacent slots) with higher goal synergy.
 *
 * Returns { slotIndex, exercise } or null if no synergistic move remains.
 */
export function resolveFocusNextStep(stageKey, stageDef, currentSlotIndex, activeSessionSets = []) {
  if (!stageDef || !Array.isArray(stageDef.slots) || stageDef.slots.length === 0) {
    return null;
  }

  // 1. Build cumulative muscle profile & per-exercise set counts from the active session
  const priorExercises = [];
  const seenExercises = new Set();
  const exerciseSetCounts = {};

  for (const s of activeSessionSets) {
    if (!s.exercise) continue;
    exerciseSetCounts[s.exercise] = (exerciseSetCounts[s.exercise] || 0) + 1;
    if (!seenExercises.has(s.exercise)) {
      seenExercises.add(s.exercise);
      priorExercises.push(s.exercise);
    }
  }

  // Require at least one logged movement to establish the session's focus profile
  if (priorExercises.length === 0) return null;

  const workedMuscleWeights = {};
  priorExercises.forEach((exName, idx) => {
    const tags = getExerciseMuscleTags(exName);
    const weight = idx === 0 ? 1.5 : 1.0; // Anchor movement sets the primary theme
    tags.forEach(tag => {
      workedMuscleWeights[tag] = (workedMuscleWeights[tag] || 0) + weight;
    });
  });

  // 2. Score the best uncompleted variation across EVERY slot (current, adjacent, or non-adjacent)
  let bestChoice = null;
  let bestOverallScore = 0; // Must have > 0 synergy overlap to justify a Focus pick

  stageDef.slots.forEach((slotObj, idx) => {
    const candidates = Array.isArray(slotObj.alts) ? slotObj.alts : [];
    const setsLoggedInSlot = activeSessionSets.filter(s => s.slot === slotObj.slot).length;

    // Filter out exercises already completed (3+ sets) in this session
    const unplayedAlts = candidates.filter(alt => (exerciseSetCounts[alt] || 0) < 3);
    if (unplayedAlts.length === 0) return;

    unplayedAlts.forEach((alt) => {
      const altTags = getExerciseMuscleTags(alt);
      let overlapScore = 0;

      altTags.forEach(tag => {
        if (workedMuscleWeights[tag]) {
          overlapScore += workedMuscleWeights[tag];
        }
      });

      if (overlapScore <= 0) return;

      // Slight preference (+0.4) to stack a 2nd synergistic move in the current slot before switching stations,
      // provided fewer than 6 sets (2 exercises) have been logged in this slot already.
      const sameSlotBonus = (idx === currentSlotIndex && setsLoggedInSlot < 6) ? 0.4 : 0;

      // Slight penalty (-0.3) if another slot already has a completed 3-set block, encouraging fresh stations
      // once a 2-exercise stack is done or when jumping across non-adjacent slots.
      const visitedPenalty = (idx !== currentSlotIndex && setsLoggedInSlot >= 3) ? -0.3 : 0;

      const totalScore = overlapScore + sameSlotBonus + visitedPenalty;

      if (totalScore > bestOverallScore) {
        bestOverallScore = totalScore;
        bestChoice = { slotIndex: idx, exercise: alt, slotId: slotObj.slot };
      }
    });
  });

  return bestChoice;
}

export function resolveSlotPreset(stageKey, slotDef, slotIndex, activeSessionSets = []) {
  if (!slotDef || !Array.isArray(slotDef.alts) || slotDef.alts.length === 0) {
    return slotDef?.primary || '';
  }

  const mode = getRotatorMode();
  const candidates = slotDef.alts;

  // 1. FOCUS MODE: Cumulative synergy across all preceding slots (A1 -> A2 -> A3 -> A4)
  if (mode === 'FOCUS' && slotIndex > 0 && Array.isArray(activeSessionSets) && activeSessionSets.length > 0) {
    const priorExercises = [];
    /**
 * Evaluates ALL slots in the active stage (current, adjacent, and non-adjacent)
 * to determine whether FOCUS mode should:
 *  - Stay in the current slot and load a second synergistic variation, OR
 *  - Jump directly to another slot (including non-adjacent slots) with higher goal synergy.
 *
 * Returns { slotIndex, exercise } or null if no synergistic move remains.
 */
export function resolveFocusNextStep(stageKey, stageDef, currentSlotIndex, activeSessionSets = []) {
  if (!stageDef || !Array.isArray(stageDef.slots) || stageDef.slots.length === 0) {
    return null;
  }

  // 1. Build cumulative muscle profile & per-exercise set counts from the active session
  const priorExercises = [];
  const seenExercises = new Set();
  const exerciseSetCounts = {};

  for (const s of activeSessionSets) {
    if (!s.exercise) continue;
    exerciseSetCounts[s.exercise] = (exerciseSetCounts[s.exercise] || 0) + 1;
    if (!seenExercises.has(s.exercise)) {
      seenExercises.add(s.exercise);
      priorExercises.push(s.exercise);
    }
  }

  // Require at least one logged movement to establish the session's focus profile
  if (priorExercises.length === 0) return null;

  const workedMuscleWeights = {};
  priorExercises.forEach((exName, idx) => {
    const tags = getExerciseMuscleTags(exName);
    const weight = idx === 0 ? 1.5 : 1.0; // Anchor movement sets the primary theme
    tags.forEach(tag => {
      workedMuscleWeights[tag] = (workedMuscleWeights[tag] || 0) + weight;
    });
  });

  // 2. Score the best uncompleted variation across EVERY slot (current, adjacent, or non-adjacent)
  let bestChoice = null;
  let bestOverallScore = 0; // Must have > 0 synergy overlap to justify a Focus pick

  stageDef.slots.forEach((slotObj, idx) => {
    const candidates = Array.isArray(slotObj.alts) ? slotObj.alts : [];
    const setsLoggedInSlot = activeSessionSets.filter(s => s.slot === slotObj.slot).length;

    // Filter out exercises already completed (3+ sets) in this session
    const unplayedAlts = candidates.filter(alt => (exerciseSetCounts[alt] || 0) < 3);
    if (unplayedAlts.length === 0) return;

    unplayedAlts.forEach((alt) => {
      const altTags = getExerciseMuscleTags(alt);
      let overlapScore = 0;

      altTags.forEach(tag => {
        if (workedMuscleWeights[tag]) {
          overlapScore += workedMuscleWeights[tag];
        }
      });

      if (overlapScore <= 0) return;

      // Slight preference (+0.4) to stack a 2nd synergistic move in the current slot before switching stations,
      // provided fewer than 6 sets (2 exercises) have been logged in this slot already.
      const sameSlotBonus = (idx === currentSlotIndex && setsLoggedInSlot < 6) ? 0.4 : 0;

      // Slight penalty (-0.3) if another slot already has a completed 3-set block, encouraging fresh stations
      // once a 2-exercise stack is done or when jumping across non-adjacent slots.
      const visitedPenalty = (idx !== currentSlotIndex && setsLoggedInSlot >= 3) ? -0.3 : 0;

      const totalScore = overlapScore + sameSlotBonus + visitedPenalty;

      if (totalScore > bestOverallScore) {
        bestOverallScore = totalScore;
        bestChoice = { slotIndex: idx, exercise: alt, slotId: slotObj.slot };
      }
    });
  });

  return bestChoice;
}

    if (priorExercises.length > 0) {
      const targetMuscleWeights = {};
      priorExercises.forEach((exName, idx) => {
        const tags = getExerciseMuscleTags(exName);
        const weight = idx === 0 ? 1.5 : 1.0;
        tags.forEach(tag => {
          targetMuscleWeights[tag] = (targetMuscleWeights[tag] || 0) + weight;
        });
      });

      let bestAlt = slotDef.primary;
      let bestScore = -1;

      candidates.forEach((alt) => {
        const altTags = getExerciseMuscleTags(alt);
        let score = 0;
        altTags.forEach(tag => {
          if (targetMuscleWeights[tag]) {
            score += targetMuscleWeights[tag];
          }
        });
        if (score > bestScore) {
          bestScore = score;
          bestAlt = alt;
        }
      });

      return bestAlt;
    }
  }

  // 2. FRESH MODE: Cross-session variety + Arboleaf Deep Scan segmental bias
  let recentList = [];
  try {
    const raw = localStorage.getItem(ROTATOR_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : {};
    recentList = history[`${stageKey}_${slotDef.slot}`] || [];
  } catch (e) {
    recentList = [];
  }

  const biases = getDeepScanRotatorBiases();

  let bestCandidate = slotDef.primary;
  let bestScore = -Infinity;

  candidates.forEach((alt, idx) => {
    let score = 0;

    // A. Cross-session freshness score (unplayed = +3.0, older = +1.0..+2.0, most recent = -2.0)
    const histIdx = recentList.indexOf(alt);
    if (histIdx === -1) {
      score += 3.0;
    } else if (histIdx === recentList.length - 1) {
      score -= 2.0; // Avoid repeating the exact last-used movement
    } else {
      score += (recentList.length - 1 - histIdx) * 0.75;
    }

    // B. Segmental Muscle Balance & Visceral Fat Tie-Breaker
    if (biases) {
      const tags = getExerciseMuscleTags(alt);
      const isLower = tags.includes('quads') || tags.includes('hamstrings') || tags.includes('glutes');
      const isUpper = tags.includes('chest') || tags.includes('lats') || tags.includes('upper_back') || tags.includes('front_delts');
      const isCoreOrCarry = tags.includes('core') || tags.includes('obliques') || tags.includes('abs');

      if (isUnilateralMovement(alt)) {
        if (biases.needUnilateralLower && isLower) score += 0.85;
        if (biases.needUnilateralUpper && isUpper) score += 0.85;
      }

      if (biases.highTrunkOrVisceral && isCoreOrCarry) {
        score += 0.45;
      }
    }

    // Slight deterministic preference for earlier primary/top-tier variations on ties
    score -= idx * 0.02;

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = alt;
    }
  });

  return bestCandidate;
}
