// -------------------------------------------------------------
// BAND CONFIGURATION & RESISTANCE CALIBRATION
// Modular Data Catalog: docs/js/data/bandConfigs.js
// -------------------------------------------------------------

export const BAND_CONFIG = {
  // -----------------------------------------------------------
  // 1. 41" CONTINUOUS HEAVY LOOP BANDS (Compound & Primary)
  // -----------------------------------------------------------
  "loop_blue": {
    id: "loop_blue",
    name: "Blue Loop",
    type: "41_loop",
    range: "15–25 lbs (10mm)",
    nominal: 20,
    color: "#2563eb"
  },
  "loop_green": {
    id: "loop_green",
    name: "Green Loop",
    type: "41_loop",
    range: "20–35 lbs (14mm)",
    nominal: 27.5,
    color: "#16a34a"
  },
  "loop_purple": {
    id: "loop_purple",
    name: "Purple Loop",
    type: "41_loop",
    range: "30–50 lbs (19mm)",
    nominal: 40,
    color: "#9333ea"
  },
  "loop_yellow": {
    id: "loop_yellow",
    name: "Yellow Loop",
    type: "41_loop",
    range: "40–80 lbs (28mm)",
    nominal: 60,
    color: "#eab308"
  },
  "loop_red": {
    id: "loop_red",
    name: "Red Loop",
    type: "41_loop",
    range: "50–125 lbs (35mm)",
    nominal: 85,
    color: "#dc2626"
  },
  "loop_black": {
    id: "loop_black",
    name: "Black Loop",
    type: "41_loop",
    range: "60–170 lbs (52mm)",
    nominal: 115,
    color: "#0f172a"
  },

  // -----------------------------------------------------------
  // 2. MINI LOOP BANDS (Hips, Ankles, Shoes & Locomotion)
  // -----------------------------------------------------------
  "mini_green": {
    id: "mini_green",
    name: "Green Mini (X-Light)",
    type: "mini",
    range: "10–15 lbs",
    nominal: 12.5,
    color: "#22c55e"
  },
  "mini_blue": {
    id: "mini_blue",
    name: "Blue Mini (Light)",
    type: "mini",
    range: "15–20 lbs",
    nominal: 17.5,
    color: "#3b82f6"
  },
  "mini_yellow": {
    id: "mini_yellow",
    name: "Yellow Mini (Medium)",
    type: "mini",
    range: "20–25 lbs",
    nominal: 22.5,
    color: "#eab308"
  },
  "mini_red": {
    id: "mini_red",
    name: "Red Mini (Heavy)",
    type: "mini",
    range: "25–35 lbs",
    nominal: 30,
    color: "#ef4444"
  },
  "mini_black": {
    id: "mini_black",
    name: "Black Mini (X-Heavy)",
    type: "mini",
    range: "35–45 lbs",
    nominal: 40,
    color: "#0f172a"
  },

  // -----------------------------------------------------------
  // 3. HANDLED DOOR-ANCHOR TUBES (Cable & Pulley Duplication)
  // -----------------------------------------------------------
  "tube_40": {
    id: "tube_40",
    name: "Tube 40 lb",
    type: "tube",
    range: "40 lbs",
    nominal: 40,
    color: "#0284c7"
  },
  "tube_50": {
    id: "tube_50",
    name: "Tube 50 lb",
    type: "tube",
    range: "50 lbs",
    nominal: 50,
    color: "#0d9488"
  },
  "tube_60": {
    id: "tube_60",
    name: "Tube 60 lb",
    type: "tube",
    range: "60 lbs",
    nominal: 60,
    color: "#16a34a"
  },
  "tube_70": {
    id: "tube_70",
    name: "Tube 70 lb",
    type: "tube",
    range: "70 lbs",
    nominal: 70,
    color: "#ca8a04"
  },
  "tube_80": {
    id: "tube_80",
    name: "Tube 80 lb",
    type: "tube",
    range: "80 lbs",
    nominal: 80,
    color: "#ea580c"
  },
  "tube_90": {
    id: "tube_90",
    name: "Tube 90 lb",
    type: "tube",
    range: "90 lbs",
    nominal: 90,
    color: "#475569"
  }
};

/**
 * Filters appropriate bands based on movement biomechanics.
 * Mini movements get mini loops; all other band exercises expose 41" loops and tubes.
 */
// docs/js/data/bandConfigs.js (At the very bottom)

/**
 * Strict Equipment Separation Gate:
 * 1. Mini Loops: Locomotion, Ankles, Hips
 * 2. Handled Tubes: Door-Anchored pushes, pulls, curls, rotations
 * 3. 41" Continuous Loops: Body-Anchored compound squats, hinges, push-ups
 */
// docs/js/data/bandConfigs.js (At the very bottom)

export function getBandsForMovement(exerciseName = '') {
  const name = (exerciseName || '').toLowerCase();

  // 1. Locomotion, Hips, Marches, & Core: Allow BOTH Mini Loops and 41" Continuous Loops
  if (
    name.includes('mini') || 
    name.includes('walk') || 
    name.includes('march') || 
    name.includes('deadbug') || 
    name.includes('y-t-w') || 
    name.includes('climber') ||
    name.includes('step-jack')
  ) {
    return Object.values(BAND_CONFIG).filter(b => b.type === 'mini' || b.type === '41_loop');
  }

// 2. Handled Door-Anchor Tubes Only (Pushes, Pulls, Rotations, Curls, Ankle Straps)
  if (
    name.includes('anchor') || 
    name.includes('pulldown') || 
    name.includes('woodchopper') || 
    name.includes('pallof') || 
    name.includes('crunch') || 
    name.includes('face pull') || 
    name.includes('curl') || 
    name.includes('adduction') || 
    name.includes('abduction') || 
    name.includes('fly')
  ) {
    return Object.values(BAND_CONFIG).filter(b => b.type === 'tube');
  }
  // 3. 41" Continuous Power Loops Only (Squats, Hinges, Push-Ups)
  return Object.values(BAND_CONFIG).filter(b => b.type === '41_loop');
}
