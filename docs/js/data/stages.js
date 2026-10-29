// -------------------------------------------------------------
// STAGE DEFINITIONS & MOVEMENT CATALOG
// Modular Data Catalog: stages.js
// -------------------------------------------------------------
export const STAGES = {
  DAY_A: {
    id: "DAY_A",
    name: "Hinge & Horizontal Power",
    prehab: "Prehab: McGill Big 3 + Band Pull-Aparts & Face Pulls",
    prehabDetails: [
      { name: "Bird-Dogs (McGill Big 3)", dose: "2 sets × 6 reps / side", cue: "5s hold at full extension. Neutral spine; do not hyperextend lumbar." },
      { name: "Side Planks (McGill Big 3)", dose: "2 sets × 15–20s hold / side", cue: "Straight line from ankle to shoulder. Brace glutes & lateral obliques." },
      { name: "Band Pull-Aparts & Face Pulls", dose: "2 sets × 15 reps", cue: "Pull band to clavicle/bridge of nose. Squeeze scaps together for 1s." }
    ],
    slots: [
      {
        slot: "A1",
        target: "3x6-8",
        primary: "Supported Romanian Deadlift (Heavy DBs)",
        defaultLoad: 60,
        alts: [
          "Supported Romanian Deadlift (Heavy DBs)",
          "Supported Romanian Deadlift (RDL)",
          "B-Stance DB Hinge",
          "Glute Bridge / DB RDL (to Bench)"
        ]
      },
      {
        slot: "A2",
        target: "3x8-10",
        primary: "Chest-Supported Dumbbell Row",
        defaultLoad: 50,
        alts: [
          "Chest-Supported Dumbbell Row",
          "Cybex VR2 High Row (Chest Supported)",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Lat Pulldown (Neutral/Mag-Grip)"
        ]
      },
      {
        slot: "A3",
        target: "3x8-10",
        primary: "Neutral-Grip DB Floor Press",
        defaultLoad: 60,
        alts: [
          "Neutral-Grip DB Floor Press",
          "Cybex VR2 Converging Chest Press",
          "Incline DB Bench Press (30°)",
          "Cybex VR2 Overhead Shoulder Press",
          "Incline Push-Up (Hands on Bench)"
        ]
      },
      {
        slot: "A4",
        target: "3x10-12",
        primary: "Cable Pallof Press",
        defaultLoad: 30,
        alts: [
          "Cable Pallof Press",
          "Tall-Kneeling Pallof Hold",
          "Cybex VR2 Seated Abdominal Crunch",
          "Suitcase Carry (Single-Arm)"
        ]
      }
    ]
  },
  DAY_B: {
    id: "DAY_B",
    name: "Knee Stability & Shoulder Rehab",
    prehab: "Prehab: Tibialis Wall Raises & 90/90 Hip Switches",
    prehabDetails: [
      { name: "Tibialis Wall Raises", dose: "2 sets × 15–20 reps", cue: "Heels 12 inches from wall. Flex toes hard to shins to buffer patellar load." },
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Upright tall torso. Smoothly rotate internal & external hip capsules." },
      { name: "Prone Scapular Y-T-W Raises", dose: "1–2 sets × 6 reps / position", cue: "Thumbs up to ceiling. Fire lower traps & posterior rotator cuff." }
    ],
    slots: [
      {
        slot: "B1",
        target: "3x8-10",
        primary: "Suitcase DB Squat",
        defaultLoad: 55,
        alts: [
          "Suitcase DB Squat",
          "Goblet Squat (Tempo 3-0-1)",
          "Cybex VR2 Articulating Leg Press",
          "DB Bulgarian Split Squat",
          "Bodyweight Squat / TRX Squat"
        ]
      },
      {
        slot: "B2",
        target: "3x8-10",
        primary: "Half-Kneeling Landmine Press",
        defaultLoad: 45,
        alts: [
          "Half-Kneeling Landmine Press",
          "Cybex VR2 Overhead Shoulder Press",
          "Cybex VR2 Converging Chest Press",
          "Bravo Half-Kneeling Cable Press",
          "Neutral-Grip DB Floor Press"
        ]
      },
      {
        slot: "B3",
        target: "3x8-10",
        primary: "Supported Romanian Deadlift (RDL)",
        defaultLoad: 65,
        alts: [
          "Supported Romanian Deadlift (RDL)",
          "Cybex VR2 Leg Curl",
          "B-Stance DB Hinge",
          "Supported Romanian Deadlift (Heavy DBs)"
        ]
      },
      {
        slot: "B4",
        target: "3x12-15",
        primary: "Cable External Rotations",
        defaultLoad: 15,
        alts: [
          "Cable External Rotations",
          "Cybex VR2 Rear Delt Fly",
          "Side-Lying DB External Rotation",
          "Prone Scapular Y-T-W Raises"
        ]
      }
    ]
  },
  DAY_C: {
    id: "DAY_C",
    name: "Full-Body Capacity & Hinge Resilience",
    prehab: "Prehab: Deadbug with Wall Press + Band Dislocates",
    prehabDetails: [
      { name: "Deadbug with Wall Press", dose: "2 sets × 6 reps / side", cue: "Press hands hard into wall to lock lats. Lower back glued flush to floor." },
      { name: "Band Shoulder Dislocates", dose: "2 sets × 10 passes", cue: "Wide grip on light band. Keep elbows locked; smooth over-and-back arc." }
    ],
    slots: [
      {
        slot: "C1",
        target: "3x6-8",
        primary: "DB Bulgarian Split Squat",
        defaultLoad: 40,
        alts: [
          "DB Bulgarian Split Squat",
          "Cybex VR2 Articulating Leg Press",
          "Cybex VR2 Leg Extension",
          "Supported Reverse Lunge (Rack/Wall)",
          "Goblet Squat (Tempo 3-0-1)"
        ]
      },
      {
        slot: "C2",
        target: "3x8-10",
        primary: "Lat Pulldown (Neutral/Mag-Grip)",
        defaultLoad: 130,
        alts: [
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Cybex VR2 High Row (Chest Supported)",
          "Bravo Dual-Cable Pulldown",
          "Half-Kneeling Single-Arm Pulldown",
          "Chest-Supported Dumbbell Row"
        ]
      },
      {
        slot: "C3",
        target: "3x8-10",
        primary: "Incline DB Bench Press (30°)",
        defaultLoad: 65,
        alts: [
          "Incline DB Bench Press (30°)",
          "Cybex VR2 Converging Chest Press",
          "Cybex VR2 Pec Fly (Machine)",
          "Neutral-Grip DB Floor Press"
        ]
      },
      {
        slot: "C4",
        target: "3x40-50 paces",
        primary: "Farmer's Carries",
        defaultLoad: 60,
        alts: [
          "Farmer's Carries",
          "Suitcase Carry (Single-Arm)",
          "Cybex VR2 Seated Hip Abductor/Adductor",
          "Cable Pallof Press"
        ]
      }
    ]
  },
  DAY_D: {
    id: "DAY_D",
    name: "Trunk Fortress & Core Integrity",
    prehab: "Prehab: McGill Big 3 + Deadbugs & Band Pallof Warmup",
    prehabDetails: [
      { name: "Deadbugs (Wall or Med Ball Press)", dose: "2 sets × 8 reps / side", cue: "Lower back flush against floor. Exhale fully as opposite limbs extend." },
      { name: "McGill Side Planks", dose: "2 sets × 15–20s hold / side", cue: "Straight line ankle to ear. Brace glutes and lateral obliques." },
      { name: "Kettlebell Halos (10–15 lbs)", dose: "2 sets × 6 circles / direction", cue: "Tight ribcage. Circle head closely without shifting hips or neck." }
    ],
    slots: [
      {
        slot: "D1",
        target: "3x10-12",
        primary: "Cable Pallof Press (Bravo)",
        defaultLoad: 35,
        alts: [
          "Cable Pallof Press (Bravo)",
          "Bravo Cable Woodchoppers (High-to-Low)",
          "Single-Arm DB Suitcase Carry",
          "Tall-Kneeling Pallof Hold (20s)"
        ]
      },
      {
        slot: "D2",
        target: "3x10-12",
        primary: "Cybex VR2 Seated Abdominal Crunch",
        defaultLoad: 70,
        alts: [
          "Cybex VR2 Seated Abdominal Crunch",
          "Bravo Kneeling Cable Crunch",
          "Med Ball Deadbug Compression (8-12 lbs)",
          "Hollow Body Isometric Hold (30s)"
        ]
      },
      {
        slot: "D3",
        target: "3x40-50 paces",
        primary: "Kettlebell Suitcase March / Carry",
        defaultLoad: 30,
        alts: [
          "Kettlebell Suitcase March / Carry",
          "Farmer's Carries (Dual DB/KB)",
          "Overhead Waiter's Walk (Single DB)",
          "Bravo Anti-Extension Overhead Hold"
        ]
      },
      {
        slot: "D4",
        target: "3x12-15",
        primary: "Cybex VR2 Seated Hip Adduction / Abduction",
        defaultLoad: 80,
        alts: [
          "Cybex VR2 Seated Hip Adduction / Abduction",
          "Med Ball Rotational Wall Chest Pass",
          "Cable Pull-Through (Bravo Low Pulley)",
          "McGill Curl-Up (Strict Pause)"
        ]
      }
    ]
  },
  DAY_E: {
    id: "DAY_E",
    name: "Hypertrophy & Machine Overload",
    prehab: "Prehab: 90/90 Hip Switches + Band Shoulder Dislocates",
    prehabDetails: [
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Smoothly transition internal to external rotation. Keep chest tall." },
      { name: "Band Shoulder Dislocates", dose: "2 sets × 10 passes", cue: "Straight arms, smooth overhead arc without flaring the ribcage." },
      { name: "Tibialis Wall Raises", dose: "2 sets × 15 reps", cue: "Flex toes to shins hard; preload anterior tibialis before heavy leg press." }
    ],
    slots: [
      {
        slot: "E1",
        target: "3x10-12",
        primary: "Cybex VR2 Articulating Leg Press",
        defaultLoad: 180,
        alts: [
          "Cybex VR2 Articulating Leg Press",
          "Suitcase DB Squat",
          "DB Bulgarian Split Squat",
          "Goblet Squat (Tempo 3-0-1)"
        ]
      },
      {
        slot: "E2",
        target: "3x10-12",
        primary: "Cybex VR2 Converging Chest Press",
        defaultLoad: 110,
        alts: [
          "Cybex VR2 Converging Chest Press",
          "Cybex VR2 Pec Fly (Machine)",
          "Incline DB Bench Press (30°)",
          "Neutral-Grip DB Floor Press"
        ]
      },
      {
        slot: "E3",
        target: "3x10-12",
        primary: "Cybex VR2 Leg Curl",
        defaultLoad: 90,
        alts: [
          "Cybex VR2 Leg Curl",
          "Supported Romanian Deadlift (RDL)",
          "B-Stance DB Hinge",
          "Cable Pull-Through (Bravo Low Pulley)"
        ]
      },
      {
        slot: "E4",
        target: "3x10-12",
        primary: "Cybex VR2 High Row (Chest Supported)",
        defaultLoad: 120,
        alts: [
          "Cybex VR2 High Row (Chest Supported)",
          "Chest-Supported Dumbbell Row",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Lat Pulldown (Neutral/Mag-Grip)"
        ]
      }
    ]
  },
  DAY_F: {
    id: "DAY_F",
    name: "Joint Sparing & Deload Recon",
    prehab: "Prehab: Deadbugs + Prone Y-T-W Raises & Hip Openers",
    prehabDetails: [
      { name: "Deadbugs (Wall Press)", dose: "2 sets × 6 reps / side", cue: "Glued lumbar spine; deep diaphragmatic exhale on each reach." },
      { name: "Prone Scapular Y-T-W Raises", dose: "1–2 sets × 6 reps / pos", cue: "Thumbs to ceiling; isolate lower traps and posterior rotator cuff." },
      { name: "Bird-Dogs (McGill)", dose: "2 sets × 6 reps / side", cue: "5s hold at peak extension; zero lumbar hyperextension." }
    ],
    slots: [
      {
        slot: "F1",
        target: "3x12-15",
        primary: "Cybex VR2 Leg Extension",
        defaultLoad: 70,
        alts: [
          "Cybex VR2 Leg Extension",
          "Cybex VR2 Articulating Leg Press (Light Tempo)",
          "Bodyweight Squat / TRX Squat",
          "Tibialis Wall Raises"
        ]
      },
      {
        slot: "F2",
        target: "3x12-15",
        primary: "Cybex VR2 Seated Hip Adduction / Abduction",
        defaultLoad: 75,
        alts: [
          "Cybex VR2 Seated Hip Adduction / Abduction",
          "Tall-Kneeling Pallof Hold (20s)",
          "Single-Arm DB Suitcase Carry",
          "Med Ball Deadbug Compression"
        ]
      },
      {
        slot: "F3",
        target: "3x12-15",
        primary: "Cybex VR2 Rear Delt Fly",
        defaultLoad: 50,
        alts: [
          "Cybex VR2 Rear Delt Fly",
          "Cable External Rotations (Bravo)",
          "Bravo Dual-Cable Face Pulls",
          "Side-Lying DB External Rotation"
        ]
      },
      {
        slot: "F4",
        target: "3x10-12",
        primary: "Cable Pallof Press (Bravo)",
        defaultLoad: 30,
        alts: [
          "Cable Pallof Press (Bravo)",
          "Cybex VR2 Seated Abdominal Crunch",
          "Cable Pull-Through (Bravo Low Pulley)",
          "Bravo Anti-Extension Overhead Hold"
        ]
      }
    ]
  },
  DAY_G: {
    id: "DAY_G",
    name: "Sonic Velocity // Ergo & Machine Cardio",
    prehab: "Prehab: Tibialis Wall Raises + 90/90 Hip Switches & Cat-Camels",
    prehabDetails: [
      { name: "Tibialis Wall Raises", dose: "2 sets × 20 reps", cue: "Pump anterior shins to lubricate ankle dorsiflexion before gait work." },
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Smoothly unlock hip internal/external rotation without lumbar torque." },
      { name: "McGill Cat-Camel", dose: "1 set × 8 slow cycles", cue: "Gentle spinal flexion and extension to mobilize thoracolumbar fascia." }
    ],
    slots: [
      {
        slot: "G1",
        target: "10-12 Mins @ Zone 2",
        primary: "Incline Treadmill Walk (Zone 2)",
        defaultLoad: 0,
        alts: [
          "Incline Treadmill Walk (Zone 2)",
          "Stationary Bike (Zone 2 Cadence)",
          "Rower (Zone 2 Steady State)"
        ]
      },
      {
        slot: "G2",
        target: "6-8 Rounds (30s on / 60s off)",
        primary: "Rower Sprints (30s on / 60s off)",
        defaultLoad: 0,
        alts: [
          "Rower Sprints (30s on / 60s off)",
          "Stationary Bike Surge Intervals",
          "Incline Power Walk Surges"
        ]
      },
      {
        slot: "G3",
        target: "3x12-15 / side",
        primary: "Bravo Cable Woodchoppers (High-to-Low)",
        defaultLoad: 35,
        alts: [
          "Bravo Cable Woodchoppers (High-to-Low)",
          "Med Ball Rotational Wall Chest Pass",
          "Cable Pallof Press (Bravo)"
        ]
      },
      {
        slot: "G4",
        target: "3x40-50 paces",
        primary: "Farmer's Carries (Dual DB/KB)",
        defaultLoad: 60,
        alts: [
          "Farmer's Carries (Dual DB/KB)",
          "Kettlebell Suitcase March / Carry",
          "Overhead Waiter's Walk (Single DB)"
        ]
      }
    ]
  },
  DAY_H: {
    id: "DAY_H",
    name: "Speed Highway // Non-Impact DB & Cable Metcon",
    prehab: "Prehab: Tibialis Wall Raises + 90/90 Hip Switches & Cat-Camels",
    prehabDetails: [
      { name: "Tibialis Wall Raises", dose: "2 sets × 20 reps", cue: "Pump anterior shins to lubricate ankle dorsiflexion before gait work." },
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Smoothly unlock hip internal/external rotation without lumbar torque." },
      { name: "McGill Cat-Camel", dose: "1 set × 8 slow cycles", cue: "Gentle spinal flexion and extension to mobilize thoracolumbar fascia." }
    ],
    slots: [
      {
        slot: "H1",
        target: "3x20-25 reps (Light Cadence)",
        primary: "Cybex VR2 Articulating Leg Press (Light Tempo 25r)",
        defaultLoad: 140,
        alts: [
          "Cybex VR2 Articulating Leg Press (Light Tempo 25r)",
          "Cybex VR2 Leg Extension (Paced 20r)",
          "Suitcase DB Squat",
          "Bodyweight Squat / TRX Squat"
        ]
      },
      {
        slot: "H2",
        target: "3x15-20 reps (Rhythmic Hinge)",
        primary: "Cable Pull-Through (Bravo Low Pulley)",
        defaultLoad: 45,
        alts: [
          "Cable Pull-Through (Bravo Low Pulley)",
          "Supported Romanian Deadlift (RDL)",
          "B-Stance DB Hinge",
          "Glute Bridge / DB RDL (to Bench)"
        ]
      },
      {
        slot: "H3",
        target: "3x45s Time-Under-Tension",
        primary: "Lat Pulldown (Neutral/Mag-Grip)",
        defaultLoad: 100,
        alts: [
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Chest-Supported Dumbbell Row",
          "Cybex VR2 High Row (Chest Supported)"
        ]
      },
      {
        slot: "H4",
        target: "3x40-50 paces / side",
        primary: "Single-Arm DB Suitcase Carry",
        defaultLoad: 50,
        alts: [
          "Single-Arm DB Suitcase Carry",
          "Farmer's Carries (Dual DB/KB)",
          "Cable Pallof Press (Bravo)",
          "Kettlebell Suitcase March / Carry"
        ]
      }
    ]
  },
  DAY_I: {
    id: "DAY_I",
    name: "Emerald Coast // 100% Zero-Equipment Bodyweight Flow",
    prehab: "Prehab: McGill Big 3 + Deadbugs & Band Pallof Warmup",
    prehabDetails: [
      { name: "Deadbugs (Wall Press)", dose: "2 sets × 8 reps / side", cue: "Lower back flush against floor. Exhale fully as opposite limbs extend." },
      { name: "McGill Side Planks", dose: "2 sets × 15–20s hold / side", cue: "Straight line ankle to ear. Brace glutes and lateral obliques." },
      { name: "Bird-Dogs (McGill)", dose: "2 sets × 6 reps / side", cue: "5s hold at peak extension; zero lumbar hyperextension." }
    ],
    slots: [
      {
        slot: "I1",
        target: "3x20-25 reps (Paced)",
        primary: "Bodyweight Squat / TRX Squat",
        defaultLoad: 0,
        alts: [
          "Bodyweight Squat / TRX Squat",
          "Supported Reverse Lunge (Rack/Wall)",
          "Single-Leg Glute Bridge (12r/side)",
          "Tibialis Wall Raises"
        ]
      },
      {
        slot: "I2",
        target: "3x12-15 reps (Strict Pause)",
        primary: "Incline Push-Up (Hands on Bench)",
        defaultLoad: 0,
        alts: [
          "Incline Push-Up (Hands on Bench)",
          "Hollow Body Isometric Hold (30s)",
          "Prone Scapular Y-T-W Raises"
        ]
      },
      {
        slot: "I3",
        target: "3x8-10 reps / side (5s Hold)",
        primary: "Bird-Dogs (Strict 5s Hold)",
        defaultLoad: 0,
        alts: [
          "Bird-Dogs (Strict 5s Hold)",
          "Deadbugs (Wall Press)",
          "Prone Scapular Y-T-W Raises"
        ]
      },
      {
        slot: "I4",
        target: "3x20-30s hold / side",
        primary: "Tall-Kneeling Pallof Hold (20s)",
        defaultLoad: 0,
        alts: [
          "Tall-Kneeling Pallof Hold (20s)",
          "McGill Curl-Up (Strict Pause)",
          "Hollow Body Isometric Hold (30s)"
        ]
      }
    ]
  },
  CH_1RM: {
    id: "CH_1RM",
    name: "The Apex Benchmark (1RM Strike)",
    prehab: "Prehab: CNS Ramp & Dynamic Joint Mobilization",
    prehabDetails: [
      { name: "Bird-Dogs (Strict 5s Hold)", dose: "2 sets × 6 reps / side", cue: "Max core tension; lock spine in neutral before heavy loads." },
      { name: "McGill Side Planks", dose: "2 sets × 20s hold / side", cue: "Fire lateral chain and lock ribcage to pelvic bowl." },
      { name: "Band Pull-Aparts & Dislocates", dose: "2 sets × 15 reps", cue: "Prime rotator cuffs and retract shoulder girdle." }
    ],
    slots: [
      {
        slot: "X1",
        target: "1x3-5 @ 88%",
        primary: "Supported Romanian Deadlift (Heavy DBs)",
        defaultLoad: 65,
        alts: [
          "Supported Romanian Deadlift (Heavy DBs)",
          "Supported Romanian Deadlift (RDL)",
          "B-Stance DB Hinge"
        ]
      },
      {
        slot: "X2",
        target: "1x3-5 @ 88%",
        primary: "Cybex VR2 Articulating Leg Press",
        defaultLoad: 235,
        alts: [
          "Cybex VR2 Articulating Leg Press",
          "Suitcase DB Squat",
          "Goblet Squat (Tempo 3-0-1)"
        ]
      },
      {
        slot: "X3",
        target: "1x3-5 @ 88%",
        primary: "Neutral-Grip DB Floor Press",
        defaultLoad: 60,
        alts: [
          "Neutral-Grip DB Floor Press",
          "Cybex VR2 Converging Chest Press",
          "Incline DB Bench Press (30°)"
        ]
      },
      {
        slot: "X4",
        target: "1x3-5 @ 88% (or Apex Metric)",
        primary: "Chest-Supported Dumbbell Row",
        defaultLoad: 60,
        alts: [
          "Chest-Supported Dumbbell Row",
          "Rower 500m Apex Sprint (Sub-1:45 Pace)",
          "Farmer's Carries (Dual DB/KB - Max Distance)",
          "Cybex VR2 High Row (Chest Supported)",
          "Lat Pulldown (Neutral/Mag-Grip)"
        ]
      }
    ]
  },
  CH_AMRAP: {
    id: "CH_AMRAP",
    name: "Overdrive Protocol (Train-to-Failure AMRAP)",
    prehab: "Prehab: Muscular Stamina & McGill Core Activation",
    prehabDetails: [
      { name: "Deadbugs (Wall Press)", dose: "2 sets × 8 reps / side", cue: "Exhale all air at extension; lock anterior abdominal wall." },
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Open hip capsules smoothly without lumbar rotation." },
      { name: "Tibialis Wall Raises", dose: "2 sets × 15 reps", cue: "Preload shins and ankles before high-rep leg press." }
    ],
    slots: [
      {
        slot: "Y1",
        target: "AMRAP @ 70%",
        primary: "Cybex VR2 Articulating Leg Press",
        defaultLoad: 180,
        alts: [
          "Cybex VR2 Articulating Leg Press",
          "Cybex VR2 Leg Extension",
          "Suitcase DB Squat"
        ]
      },
      {
        slot: "Y2",
        target: "AMRAP @ 70%",
        primary: "Cybex VR2 Converging Chest Press",
        defaultLoad: 100,
        alts: [
          "Cybex VR2 Converging Chest Press",
          "Neutral-Grip DB Floor Press",
          "Incline DB Bench Press (30°)"
        ]
      },
      {
        slot: "Y3",
        target: "AMRAP @ 70%",
        primary: "Lat Pulldown (Neutral/Mag-Grip)",
        defaultLoad: 120,
        alts: [
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Chest-Supported Dumbbell Row",
          "Cybex VR2 High Row (Chest Supported)"
        ]
      },
      {
        slot: "Y4",
        target: "AMRAP @ 70% (or Engine Burnout)",
        primary: "Cybex VR2 Seated Abdominal Crunch",
        defaultLoad: 70,
        alts: [
          "Cybex VR2 Seated Abdominal Crunch",
          "Single-Arm DB Suitcase Carry (AMRAP Laps to Failure)",
          "Rower / Incline Treadmill (90s Max Effort AMRAP)",
          "Cable Pallof Press (Bravo)",
          "Med Ball Deadbug Compression"
        ]
      }
    ]
  }
};
