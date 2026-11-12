// -------------------------------------------------------------
// HYBRID CARDIO CONTEXTUAL INPUTS & METRIC TRANSLATOR
// Modular Data Catalog: docs/js/data/cardioConfigs.js
// -------------------------------------------------------------
export const CARDIO_CONFIGS = {
  // --- SLOT G1: ZONE 2 AEROBIC BASE (MINUTES) ---
  "Incline Treadmill Walk (Zone 2)": {
    label1: "INCLINE (%)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 10,
    default2: 12,
    calcEquiv: (incline, mins) => ({
      equivReps: Math.round(mins * 10),
      equivVolume: Math.round(mins * 110 * Math.max(1, (incline || 5) * 0.25)),
      display: `${mins} mins @ ${incline}% Incline`
    })
  },
  "Stationary Bike (Zone 2 Cadence)": {
    label1: "LEVEL / GEAR",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 8,
    default2: 12,
    calcEquiv: (level, mins) => ({
      equivReps: Math.round(mins * 10),
      equivVolume: Math.round(mins * 120 * Math.max(1, (level || 6) * 0.2)),
      display: `${mins} mins @ Level ${level}`
    })
  },
  "Rower (Zone 2 Steady State)": {
    label1: "DAMPER (1-10)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 5,
    default2: 12,
    calcEquiv: (damper, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 140 * Math.max(1, (damper || 5) * 0.25)),
      display: `${mins} mins @ Damper ${damper}`
    })
  },
  "Low-Impact Shadow Boxing Flow (Zone 2)": {
    label1: "LOAD (LBS)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 0,
    default2: 12,
    calcEquiv: (load, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 130 * (1 + (load || 0) * 0.05)),
      display: `${mins} mins Shadow Flow`
    })
  },
  "March in Place (Paced Zone 2 Cadence)": {
    label1: "LOAD (LBS)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 0,
    default2: 12,
    calcEquiv: (load, mins) => ({
      equivReps: Math.round(mins * 10),
      equivVolume: Math.round(mins * 120 * (1 + (load || 0) * 0.04)),
      display: `${mins} mins Zone 2 March`
    })
  },
  // Banded G1 Equivalents
  "Banded High-Knee March (Zone 2 Cadence)": {
    label1: "BAND LOAD (LBS)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 22.5,
    default2: 12,
    calcEquiv: (bandLoad, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 125 * (1 + (bandLoad || 20) * 0.03)),
      display: `${mins} mins @ ${bandLoad} lbs Band`
    })
  },
  "Continuous Band Pull-Throughs & Rows (Zone 2)": {
    label1: "BAND LOAD (LBS)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 40,
    default2: 12,
    calcEquiv: (bandLoad, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 135 * (1 + (bandLoad || 40) * 0.025)),
      display: `${mins} mins @ ${bandLoad} lbs Band`
    })
  },
  "Banded Shadow Boxing Flow (Zone 2)": {
    label1: "BAND LOAD (LBS)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 20,
    default2: 12,
    calcEquiv: (bandLoad, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 130 * (1 + (bandLoad || 20) * 0.03)),
      display: `${mins} mins @ ${bandLoad} lbs Band`
    })
  },

  // --- SLOT G2: SURGE INTERVALS (30s ON / 60s OFF — ROUNDS) ---
  "Rower Sprints (30s on / 60s off)": {
    label1: "DAMPER (1-10)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 6,
    default2: 8,
    calcEquiv: (damper, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 240 * Math.max(1, (damper || 5) * 0.2)),
      display: `${rounds} Rounds (30s/60s) @ Damper ${damper}`
    })
  },
  "Stationary Bike Surge Intervals": {
    label1: "LEVEL / GEAR",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 10,
    default2: 8,
    calcEquiv: (level, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 225 * Math.max(1, (level || 8) * 0.15)),
      display: `${rounds} Rounds (30s/60s) @ Level ${level}`
    })
  },
  "Incline Power Walk Surges": {
    label1: "INCLINE (%)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 12,
    default2: 8,
    calcEquiv: (incline, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 210 * Math.max(1, (incline || 10) * 0.15)),
      display: `${rounds} Rounds (30s/60s) @ ${incline}%`
    })
  },
  "Mountain Climbers (Hands on Bed - Low Shear)": {
    label1: "LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 0,
    default2: 8,
    calcEquiv: (load, rounds) => ({
      equivReps: Math.round(rounds * 20),
      equivVolume: Math.round(rounds * 220),
      display: `${rounds} Rounds (30s/60s)`
    })
  },
  "Fast Step-Jacks (30s on / 60s off)": {
    label1: "LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 0,
    default2: 8,
    calcEquiv: (load, rounds) => ({
      equivReps: Math.round(rounds * 20),
      equivVolume: Math.round(rounds * 200),
      display: `${rounds} Rounds (30s/60s)`
    })
  },
  // Banded G2 Equivalents
  "Mini-Band Mountain Climber Sprints (30s/60s)": {
    label1: "BAND LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 17.5,
    default2: 8,
    calcEquiv: (bandLoad, rounds) => ({
      equivReps: Math.round(rounds * 18),
      equivVolume: Math.round(rounds * 230 * (1 + (bandLoad || 17.5) * 0.02)),
      display: `${rounds} Rounds @ ${bandLoad} lbs Band`
    })
  },
  "Mini-Band Mountain Climbers": {
    label1: "BAND LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 17.5,
    default2: 8,
    calcEquiv: (bandLoad, rounds) => ({
      equivReps: Math.round(rounds * 18),
      equivVolume: Math.round(rounds * 230 * (1 + (bandLoad || 17.5) * 0.02)),
      display: `${rounds} Rounds @ ${bandLoad} lbs Band`
    })
  },
  "Banded Resisted Sprint Marches (30s/60s)": {
    label1: "BAND LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 22.5,
    default2: 8,
    calcEquiv: (bandLoad, rounds) => ({
      equivReps: Math.round(rounds * 18),
      equivVolume: Math.round(rounds * 225 * (1 + (bandLoad || 22.5) * 0.02)),
      display: `${rounds} Rounds @ ${bandLoad} lbs Band`
    })
  },
  "Banded Power Marches (30s/60s)": {
    label1: "BAND LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 22.5,
    default2: 8,
    calcEquiv: (bandLoad, rounds) => ({
      equivReps: Math.round(rounds * 18),
      equivVolume: Math.round(rounds * 225 * (1 + (bandLoad || 22.5) * 0.02)),
      display: `${rounds} Rounds @ ${bandLoad} lbs Band`
    })
  },
  "Mini-Band Step-Jacks (30s/60s)": {
    label1: "BAND LOAD (LBS)",
    label2: "ROUNDS",
    label3: "PEAK RPE",
    default1: 17.5,
    default2: 8,
    calcEquiv: (bandLoad, rounds) => ({
      equivReps: Math.round(rounds * 20),
      equivVolume: Math.round(rounds * 215 * (1 + (bandLoad || 17.5) * 0.02)),
      display: `${rounds} Rounds @ ${bandLoad} lbs Band`
    })
  },

  // --- TIMED SETS & ISOMETRIC HOLDS (SECONDS) ---
  "March in Place (Strict High Knees 45s)": {
    label1: "LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 0,
    default2: 45,
    calcEquiv: (load, secs) => ({
      equivReps: Math.round(secs / 2),
      equivVolume: Math.round(secs * 12 * (1 + (load || 0) * 0.03)),
      display: `${secs}s High Knees`
    })
  },
  "Mini-Band Resisted High Knees (45s)": {
    label1: "BAND LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 22.5,
    default2: 45,
    calcEquiv: (bandLoad, secs) => ({
      equivReps: Math.round(secs / 2),
      equivVolume: Math.round(secs * Math.max(20, bandLoad)),
      display: `${secs}s @ ${bandLoad} lbs Band`
    })
  },
  "Tall-Kneeling Pallof Hold": {
    label1: "LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 30,
    default2: 30,
    calcEquiv: (load, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round((secs / 2.5) * Math.max(25, load)),
      display: `${secs}s Hold @ ${load} lbs`
    })
  },
  "Tall-Kneeling Pallof Hold (20s)": {
    label1: "LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 30,
    default2: 20,
    calcEquiv: (load, secs) => ({
      equivReps: Math.round(secs / 2),
      equivVolume: Math.round((secs / 2) * Math.max(25, load)),
      display: `${secs}s Hold @ ${load} lbs`
    })
  },
  "Tall-Kneeling Banded Pallof Hold": {
    label1: "BAND LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 40,
    default2: 30,
    calcEquiv: (bandLoad, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round((secs / 2.5) * Math.max(25, bandLoad)),
      display: `${secs}s Hold @ ${bandLoad} lbs Band`
    })
  },
  "Tall-Kneeling Banded Pallof Hold (20s)": {
    label1: "BAND LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 40,
    default2: 20,
    calcEquiv: (bandLoad, secs) => ({
      equivReps: Math.round(secs / 2),
      equivVolume: Math.round((secs / 2) * Math.max(25, bandLoad)),
      display: `${secs}s Hold @ ${bandLoad} lbs Band`
    })
  },
  "Hollow Body Isometric Hold (30s)": {
    label1: "LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 0,
    default2: 30,
    calcEquiv: (load, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round(secs * 15 * (1 + (load || 0) * 0.05)),
      display: `${secs}s Hollow Hold`
    })
  },
  "Banded Hollow Body Hold": {
    label1: "BAND LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 20,
    default2: 30,
    calcEquiv: (bandLoad, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round(secs * Math.max(20, bandLoad)),
      display: `${secs}s Hold @ ${bandLoad} lbs Band`
    })
  },
  "Bravo Anti-Extension Overhead Hold": {
    label1: "LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 35,
    default2: 30,
    calcEquiv: (load, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round((secs / 2.5) * Math.max(30, load)),
      display: `${secs}s Hold @ ${load} lbs`
    })
  },
  "High Door-Anchor Band Overhead Anti-Extension Hold": {
    label1: "BAND LOAD (LBS)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 40,
    default2: 30,
    calcEquiv: (bandLoad, secs) => ({
      equivReps: Math.round(secs / 2.5),
      equivVolume: Math.round((secs / 2.5) * Math.max(30, bandLoad)),
      display: `${secs}s Hold @ ${bandLoad} lbs Band`
    })
  },
  "Rower 500m Apex Sprint (Sub-1:45 Pace)": {
    label1: "DAMPER (1-10)",
    label2: "SECONDS",
    label3: "RPE",
    default1: 6,
    default2: 105,
    calcEquiv: (damper, secs) => ({
      equivReps: 50,
      equivVolume: Math.round(2500 * (105 / Math.max(75, secs || 105))),
      display: `500m in ${secs}s @ Damper ${damper}`
    })
  },
  "Rower / Incline Treadmill (90s Max Effort AMRAP)": {
    label1: "DAMPER / %",
    label2: "SECONDS",
    label3: "RPE",
    default1: 6,
    default2: 90,
    calcEquiv: (level, secs) => ({
      equivReps: Math.round(secs / 2),
      equivVolume: Math.round(secs * 22 * Math.max(1, (level || 5) * 0.2)),
      display: `${secs}s Max Effort @ Level ${level}`
    })
  }
};
