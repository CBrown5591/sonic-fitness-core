// -------------------------------------------------------------
// HYBRID CARDIO CONTEXTUAL INPUTS & METRIC TRANSLATOR
// Modular Data Catalog: cardioConfigs.js
// -------------------------------------------------------------
export const CARDIO_CONFIGS = {
  "Incline Treadmill Walk (Zone 2)": {
    label1: "INCLINE (%)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 10,
    default2: 12,
    calcEquiv: (incline, mins) => ({
      equivReps: Math.round(mins * 10),
      equivVolume: Math.round(mins * 100 * Math.max(1, incline * 0.5)),
      display: `${mins} mins @ ${incline}% inc`
    })
  },
  "Stationary Bike (Zone 2 Cadence)": {
    label1: "RESISTANCE (LVL)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 8,
    default2: 12,
    calcEquiv: (lvl, mins) => ({
      equivReps: Math.round(mins * 10),
      equivVolume: Math.round(mins * 100 * Math.max(1, lvl * 0.4)),
      display: `${mins} mins @ Lvl ${lvl}`
    })
  },
  "Rower (Zone 2 Steady State)": {
    label1: "DAMPER (LVL)",
    label2: "MINUTES",
    label3: "ZONE / RPE",
    default1: 5,
    default2: 12,
    calcEquiv: (damper, mins) => ({
      equivReps: Math.round(mins * 12),
      equivVolume: Math.round(mins * 120 * Math.max(1, damper * 0.3)),
      display: `${mins} mins @ Damper ${damper}`
    })
  },
  "Rower Sprints (30s on / 60s off)": {
    label1: "SPLIT PACE (s)",
    label2: "ROUNDS",
    label3: "RPE (1-10)",
    default1: 105,
    default2: 8,
    calcEquiv: (split, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 850),
      display: `${rounds} rounds (${split}s split)`
    })
  },
  "Stationary Bike Surge Intervals": {
    label1: "GEAR / LEVEL",
    label2: "ROUNDS",
    label3: "RPE (1-10)",
    default1: 10,
    default2: 8,
    calcEquiv: (gear, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 800),
      display: `${rounds} rounds @ Gear ${gear}`
    })
  },
  "Incline Power Walk Surges": {
    label1: "INCLINE (%)",
    label2: "ROUNDS",
    label3: "RPE (1-10)",
    default1: 12,
    default2: 8,
    calcEquiv: (incline, rounds) => ({
      equivReps: Math.round(rounds * 15),
      equivVolume: Math.round(rounds * 800),
      display: `${rounds} rounds @ ${incline}%`
    })
  },
  "Rower / Incline Treadmill (90s Max Effort AMRAP)": {
    label1: "PACE / INCLINE",
    label2: "SECONDS / MINS",
    label3: "RPE (1-10)",
    default1: 10,
    default2: 90,
    calcEquiv: (p, s) => ({
      equivReps: 35,
      equivVolume: 4500,
      display: `${s}s Max Effort`
    })
  },
  "Rower 500m Apex Sprint (Sub-1:45 Pace)": {
    label1: "SPLIT / WATTS",
    label2: "TOTAL TIME (s)",
    label3: "RPE (1-10)",
    default1: 102,
    default2: 102,
    calcEquiv: (watts, s) => ({
      equivReps: 40,
      equivVolume: 5000,
      display: `500m in ${s}s`
    })
  }
};
