// -------------------------------------------------------------
// AUTO-ROTATING STAGE PRESETS ENGINE (TSK-14)
// Modes: 'FRESH' (Cross-Session Rotation) | 'FOCUS' (Cumulative Synergy)
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

  // Fallback if unmatched
  if (tags.size === 0) tags.add('general');
  return Array.from(tags);
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
    // Keep last 4 used movements for this slot
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
 * - FRESH: Picks least-recently-used variation in slotDef.alts across sessions
 * - FOCUS: Scores each variation by cumulative muscle-tag overlap across ALL preceding slots in activeSession
 */
/**
 * Resolves the recommended exercise for the active slot based on mode:
 * - FOCUS: Maximizes cumulative muscle-tag overlap across all preceding slots in activeSession
 * - FRESH: Minimizes cumulative muscle-tag overlap across all preceding slots (Full-Body Spread),
 *          using cross-session history as a tie-breaker so variations stay fresh week-to-week.
 */
export function resolveSlotPreset(stageKey, slotDef, slotIndex, activeSessionSets = []) {
  if (!slotDef || !Array.isArray(slotDef.alts) || slotDef.alts.length === 0) {
    return slotDef?.primary || '';
  }

  const mode = getRotatorMode();
  const candidates = slotDef.alts;

  // Load cross-session history for tie-breaking / Slot 1 rotation
  let recentList = [];
  try {
    const raw = localStorage.getItem(ROTATOR_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : {};
    recentList = history[`${stageKey}_${slotDef.slot}`] || [];
  } catch (e) {
    recentList = [];
  }

  // Build cumulative muscle frequency map from ALL preceding slots in the current session
  const priorExercises = [];
  const seenSlots = new Set();
  if (Array.isArray(activeSessionSets)) {
    for (const s of activeSessionSets) {
      if (s.slot && s.slot !== slotDef.slot && !seenSlots.has(s.slot) && s.exercise) {
        seenSlots.add(s.slot);
        priorExercises.push(s.exercise);
      }
    }
  }

  // Intra-session scoring when preceding slots have been logged (Slot 2, 3, 4...)
  if (slotIndex > 0 && priorExercises.length > 0) {
    const workedMuscleWeights = {};
    priorExercises.forEach((exName, idx) => {
      const tags = getExerciseMuscleTags(exName);
      // Anchor slot (Slot 1) carries slightly higher weight; all prior slots accumulate
      const weight = idx === 0 ? 1.5 : 1.0;
      tags.forEach(tag => {
        workedMuscleWeights[tag] = (workedMuscleWeights[tag] || 0) + weight;
      });
    });

    let bestAlt = candidates[0];
    let bestScore = -Infinity;

    candidates.forEach((alt) => {
      const altTags = getExerciseMuscleTags(alt);
      let overlapScore = 0;

      altTags.forEach(tag => {
        if (workedMuscleWeights[tag]) {
          overlapScore += workedMuscleWeights[tag];
        }
      });

      if (mode === 'FOCUS') {
        // FOCUS: Reward high muscle overlap (+), slight tie-breaker toward primary/familiar moves
        const totalScore = overlapScore;
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestAlt = alt;
        }
      } else {
        // FRESH: Penalize overlapping muscles (-), reward unplayed cross-session variations (+)
        const historyPenalty = recentList.includes(alt) ? (recentList.indexOf(alt) + 1) * 0.25 : 0;
        const totalScore = -overlapScore - historyPenalty;
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestAlt = alt;
        }
      }
    });

    return bestAlt;
  }

  // Slot 1 (or empty session): Rotate least-recently-used in FRESH mode, or default primary in FOCUS
  if (mode === 'FRESH' && recentList.length > 0) {
    const unplayed = candidates.find(alt => !recentList.includes(alt));
    if (unplayed) return unplayed;

    let oldestAlt = candidates[0];
    let oldestIdx = Infinity;
    candidates.forEach(alt => {
      const idx = recentList.indexOf(alt);
      if (idx !== -1 && idx < oldestIdx) {
        oldestIdx = idx;
        oldestAlt = alt;
      }
    });
    return oldestAlt;
  }

  return slotDef.primary;
}
