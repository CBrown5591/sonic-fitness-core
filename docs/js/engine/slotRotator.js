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
export function resolveSlotPreset(stageKey, slotDef, slotIndex, activeSessionSets = []) {
  if (!slotDef || !Array.isArray(slotDef.alts) || slotDef.alts.length === 0) {
    return slotDef?.primary || '';
  }

  const mode = getRotatorMode();
  const candidates = slotDef.alts;

  // 1. FOCUS MODE: Cumulative synergy across all preceding slots (A1 -> A2 -> A3 -> A4)
  if (mode === 'FOCUS' && slotIndex > 0 && Array.isArray(activeSessionSets) && activeSessionSets.length > 0) {
    // Collect unique exercises performed in preceding slots in order
    const priorExercises = [];
    const seenSlots = new Set();
    for (const s of activeSessionSets) {
      if (s.slot && s.slot !== slotDef.slot && !seenSlots.has(s.slot) && s.exercise) {
        seenSlots.add(s.slot);
        priorExercises.push(s.exercise);
      }
    }

    if (priorExercises.length > 0) {
      // Build weighted muscle frequency map from all preceding slots
      const targetMuscleWeights = {};
      priorExercises.forEach((exName, idx) => {
        const tags = getExerciseMuscleTags(exName);
        // Earlier anchor slots (e.g., Slot 1) + immediate prior slot both contribute
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

  // 2. FRESH MODE (or Slot 1 default): Rotate to least-recently used alt in this slot
  try {
    const raw = localStorage.getItem(ROTATOR_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : {};
    const recentList = history[`${stageKey}_${slotDef.slot}`] || [];

    if (recentList.length > 0) {
      // Prefer an option not in recent history at all
      const unplayed = candidates.find(alt => !recentList.includes(alt));
      if (unplayed) return unplayed;

      // Otherwise pick the oldest used option (furthest back in recentList)
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
  } catch (e) {
    // Fallback cleanly to primary
  }

  return slotDef.primary;
}
