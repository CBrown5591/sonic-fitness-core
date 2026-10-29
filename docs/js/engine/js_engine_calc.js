// -------------------------------------------------------------
// PURE CALCULATION & PROGRESSION ENGINE
// Modular Engine: calc.js
// -------------------------------------------------------------

/**
 * 20-Level Exponential EXP Tier Curves
 */
export const EXP_TIERS = [
  { level: 1,  title: "JUGGERNAUT // RECRUIT",         min: 0,         max: 160000 },
  { level: 2,  title: "JUGGERNAUT // REINFORCED",      min: 160000,    max: 380000 },
  { level: 3,  title: "JUGGERNAUT // VETERAN",         min: 380000,    max: 680000 },
  { level: 4,  title: "JUGGERNAUT // OVERDRIVE",       min: 680000,    max: 1100000 },
  { level: 5,  title: "JUGGERNAUT // APEX STRIKER",    min: 1100000,   max: 1700000 },
  { level: 6,  title: "JUGGERNAUT // HYPER-DRIVE",     min: 1700000,   max: 2550000 },
  { level: 7,  title: "JUGGERNAUT // SONIC SPEED",     min: 2550000,   max: 3750000 },
  { level: 8,  title: "JUGGERNAUT // WARP RUNNER",     min: 3750000,   max: 5450000 },
  { level: 9,  title: "JUGGERNAUT // TITAN BREAKER",   min: 5450000,   max: 7850000 },
  { level: 10, title: "JUGGERNAUT // CHAOS PILOT",     min: 7850000,   max: 11250000 },
  { level: 11, title: "JUGGERNAUT // CYBER MASTER",    min: 11250000,  max: 16000000 },
  { level: 12, title: "JUGGERNAUT // ECLIPSE",         min: 16000000,  max: 22500000 },
  { level: 13, title: "JUGGERNAUT // LIGHTNING FORCE", min: 22500000,  max: 31500000 },
  { level: 14, title: "JUGGERNAUT // ZERO GRAVITY",    min: 31500000,  max: 43500000 },
  { level: 15, title: "JUGGERNAUT // GRAND CHAMPION",  min: 43500000,  max: 59500000 },
  { level: 16, title: "JUGGERNAUT // SOLAR FLARE",     min: 59500000,  max: 80500000 },
  { level: 17, title: "JUGGERNAUT // NOVA PRIME",      min: 80500000,  max: 108000000 },
  { level: 18, title: "JUGGERNAUT // TRANSCENDENT",    min: 108000000, max: 143500000 },
  { level: 19, title: "JUGGERNAUT // SUPER FORM",      min: 143500000, max: 189500000 },
  { level: 20, title: "JUGGERNAUT // APEX GOD OF WAR", min: 189500000, max: 250000000 }
];

/**
 * Closed-Loop RIR-Adjusted e1RM Formula (Brzycki <= 6, Epley > 6)
 */
export function calculateE1RM(load, reps, rpe = 10.0) {
  if (!load || load <= 0 || !reps || reps <= 0) return 0;
  const cleanRpe = Math.min(10.0, Math.max(6.5, parseFloat(rpe) || 10.0));
  const rir = Math.max(0, 10.0 - cleanRpe);
  const effectiveReps = reps + rir;

  if (effectiveReps <= 1) return Math.round(load);
  if (effectiveReps <= 6) {
    // Brzycki curve for high-load strength sets
    return Math.round(load / (1.0278 - (0.0278 * effectiveReps)));
  } else {
    // Epley curve for hypertrophy / high-volume sets
    return Math.round(load * (1 + (effectiveReps / 30.0)));
  }
}

/**
 * Target Percentage Extractor from target bracket string
 */
export function getTargetPercentage(targetStr) {
  if (!targetStr) return 0.70;
  const s = String(targetStr).toLowerCase();
  if (s.includes('88%') || s.includes('3-5') || s.includes('1rm') || s.includes('strike')) return 0.88;
  if (s.includes('amrap') || s.includes('70%') || s.includes('failure') || s.includes('overdrive')) return 0.70;
  if (s.includes('6-8')) return 0.78;
  if (s.includes('8-10')) return 0.72;
  if (s.includes('10-12')) return 0.65;
  if (s.includes('12-15')) return 0.58;
  if (s.includes('paces') || s.includes('carry')) return 0.60;
  return 0.70;
}

/**
 * Calculates Working Weight with strict 65 lb DB ceiling
 */
export function calculateTargetLoad(e1rm, targetStr, defaultVal, exerciseName = '') {
  if (!e1rm || e1rm <= 0) return defaultVal;
  const pct = getTargetPercentage(targetStr);
  let calculated = Math.max(5, Math.round((e1rm * pct) / 5.0) * 5);

  // Strict 65 lb dumbbell ceiling
  const isDumbbell = exerciseName && (exerciseName.includes('DB') || exerciseName.includes('Dumbbell') || exerciseName.includes('Farmer'));
  if (isDumbbell) {
    calculated = Math.min(65, calculated);
  }
  return calculated;
}

/**
 * Pilot Level Progress & Percentage to next tier
 */
export function calculatePilotProgress(exp) {
  let tier = EXP_TIERS[0];
  for (let i = EXP_TIERS.length - 1; i >= 0; i--) {
    if (exp >= EXP_TIERS[i].min) {
      tier = EXP_TIERS[i];
      break;
    }
  }

  const isMax = tier.level >= 20;
  const span = tier.max - tier.min;
  const progress = Math.min(100, Math.max(0, ((exp - tier.min) / span) * 100));
  const expToNext = isMax ? 0 : Math.max(0, tier.max - exp);

  return {
    level: tier.level,
    title: tier.title,
    exp,
    progressPct: progress.toFixed(1),
    expToNext,
    tierMin: tier.min,
    tierMax: tier.max,
    isMax
  };
}
