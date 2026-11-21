// -------------------------------------------------------------
// STAGE DEFINITIONS & MOVEMENT CATALOG (TRAVEL-PROOF CALISTHENICS EXPANSION)
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
          "Glute Bridge / DB RDL (to Bench)",
          "Bodyweight Single-Leg RDL (Wall Supported)",
          "Single-Leg Glute Bridge (12r/side)",
          "Cybex Eagle Leg Extension Hip Thrust",
          "Cybex Eagle Leg Extension Glute Kickback",
          "Cybex Eagle Single-Leg Curl",
          "Cybex Eagle Leg Press (High-and-Wide Glute/Ham)"
        ]
      },
      {
        slot: "A2",
        target: "3x8-10",
        primary: "Chest-Supported Dumbbell Row",
        defaultLoad: 50,
        alts: [
          "Chest-Supported Dumbbell Row",
          "Elevated DB/KB Gorilla Row",
          "Cybex Eagle High Row (Chest Supported)",
          "Cybex Eagle Single-Arm Iso-Lateral High Row",
          "Bravo Half-Kneeling Single-Arm Cable Row",
          "Bravo Standing Cable Straight-Arm Pullover",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Single-Arm Iso-Lateral Pulldown",
          "Doorframe Row (Single-Arm Strict Pause)"
        ]
      },
      {
        slot: "A3",
        target: "3x8-10",
        primary: "Neutral-Grip DB Floor Press",
        defaultLoad: 60,
        alts: [
          "Neutral-Grip DB Floor Press",
          "Cybex Eagle Converging Chest Press",
          "Incline DB Bench Press (30°)",
          "Cybex Eagle Overhead Shoulder Press",
          "Cybex Eagle Single-Arm Iso-Lateral Chest Press",
          "Seated Floor DB Z-Press",
          "Incline Push-Up (Hands on Bench)",
          "Tempo Push-Up (3-0-1 Pause)"
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
          "Cybex Eagle Seated Abdominal Crunch",
          "Suitcase Carry (Single-Arm)",
          "Tall-Kneeling Pallof Hold (20s)"
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
          "Cybex Eagle Articulating Leg Press",
          "Cybex Eagle Single-Leg Extension",
          "Cybex Eagle Single-Leg Press",
          "Cybex Eagle Leg Press (High-and-Wide Glute/Ham)",
          "Cybex Eagle Leg Extension Isometric Hold (30-45s)",
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
          "Cybex Eagle Overhead Shoulder Press",
          "Cybex Eagle Converging Chest Press",
          "Bravo Half-Kneeling Cable Press",
          "Bravo Cable Lateral Raise (Cross-Body)",
          "Bravo Incline Cable Y-Raise",
          "Neutral-Grip DB Floor Press",
          "Seated Floor DB Z-Press",
          "DB Lateral Raise (Scapular Plane)",
          "DB Front-to-Lateral Raise Combo",
          "Pike Push-Up (Hands or Feet Elevated)",
          "Incline Push-Up (Hands on Bench)"
        ]
      },
      {
        slot: "B3",
        target: "3x8-10",
        primary: "Supported Romanian Deadlift (RDL)",
        defaultLoad: 65,
        alts: [
          "Supported Romanian Deadlift (RDL)",
          "Cybex Eagle Leg Curl",
          "Cybex Eagle Single-Leg Curl",
          "Cybex Eagle Leg Extension Glute Kickback",
          "Cybex Eagle Leg Curl (2-Up / 1-Down Eccentric)",
          "B-Stance DB Hinge",
          "Supported Romanian Deadlift (Heavy DBs)",
          "Bodyweight Single-Leg RDL (Wall Supported)",
          "Single-Leg Glute Bridge (12r/side)",
          "Cybex Eagle Leg Curl Isometric Hold (30-45s)",
          "Single-Leg Glute Bridge Isometric Hold (30s/side)"
        ]
      },
      {
        slot: "B4",
        target: "3x12-15",
        primary: "Cable External Rotations",
        defaultLoad: 15,
        alts: [
          "Cable External Rotations",
          "Cybex Eagle Rear Delt Fly",
          "Bravo Incline Cable Y-Raise",
          "Bravo Cable Lateral Raise (Cross-Body)",
          "DB Lateral Raise (Scapular Plane)",
          "DB Front-to-Lateral Raise Combo",
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
          "Cybex Eagle Articulating Leg Press",
          "Cybex Eagle Leg Extension",
          "Cybex Eagle Single-Leg Extension",
          "Cybex Eagle Leg Press Calf Isometric Hold (30-45s)",
          "Cybex Eagle Single-Leg Curl",
          "Cybex Eagle Single-Leg Press",
          "Cybex Eagle Leg Press Calf Raise",
          "Supported Reverse Lunge (Rack/Wall)",
          "Goblet Squat (Tempo 3-0-1)",
          "Goblet Cossack Squat (Lateral Squat)",
          "Bodyweight / Goblet Tactical Get-Up",
  "Snap-Downs (Athletic Braking)",
          "Split-Squat with Thoracic Rotation (No Bench)",
          "Half-Kneeling Sprint Start (First 3 Steps)",
          "DDP Twisting Lunge to Warrior Flow",
          "Bodyweight Squat / TRX Squat"
        ]
      },
      {
        slot: "C2",
        target: "3x8-10",
        primary: "Lat Pulldown (Neutral/Mag-Grip)",
        defaultLoad: 130,
        alts: [
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Single-Arm Iso-Lateral Pulldown",
          "Cybex Eagle High Row (Chest Supported)",
          "Bravo Standing Cable Straight-Arm Pullover",
          "Cybex Eagle Single-Arm Iso-Lateral High Row",
          "Bravo Dual-Cable Pulldown",
          "Half-Kneeling Single-Arm Pulldown",
          "Chest-Supported Dumbbell Row",
          "Elevated DB/KB Gorilla Row",
          "Prone Floor Lat Pull (Towel Slide)",
          "Doorframe Row (Single-Arm Strict Pause)"
        ]
      },
      {
        slot: "C3",
        target: "3x8-10",
        primary: "Incline DB Bench Press (30°)",
        defaultLoad: 65,
        alts: [
          "Incline DB Bench Press (30°)",
          "Cybex Eagle Converging Chest Press",
          "Cybex Eagle Pec Fly (Machine)",
          "Neutral-Grip DB Floor Press",
          "Incline Push-Up (Hands on Bench)",
          "Tempo Push-Up (3-0-1 Pause)"
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
          "Cybex Eagle Hip Adduction (Inner Thigh)",
          "Cybex Eagle Hip Abduction (Outer Glute)",
          "Cybex Eagle Hip Abduction (Lean-Forward Upper Glute)",
          "Cable Pallof Press",
          "Bear Crawl (Forward & Reverse Paced)",
          "Front-Rack DB/KB Carry (Single or Double)",
  "Mixed Carry (Overhead + Suitcase)",
  "Lateral Bear Crawl (Side-to-Side)",
  "Crab Walk / Reverse Table-Top Reach",
          "March in Place (Strict High Knees 45s)"
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
          "DB Spellcaster (Rotational Swing)",
          "Weighted / Bodyweight Russian Twist",
          "Split-Squat with Thoracic Rotation (No Bench)",
          "Half Turkish Get-Up (DB/KB)",
  "Front-Rack DB/KB Carry (Single or Double)",
  "Mixed Carry (Overhead + Suitcase)",
  "Single-Leg Cable Pallof Press (Perturbation)",
  "Cable Pallof Press with Figure-8 Trace",
          "Tall-Kneeling Pallof Hold (20s)"
        ]
      },
      {
        slot: "D2",
        target: "3x10-12",
        primary: "Cybex Eagle Seated Abdominal Crunch",
        defaultLoad: 70,
        alts: [
          "Cybex Eagle Seated Abdominal Crunch",
          "Bravo Kneeling Cable Crunch",
          "Med Ball Deadbug Compression (8-12 lbs)",
          "DB Spellcaster (Rotational Swing)",
  "Weighted / Bodyweight Russian Twist",
          "DDP Broken Table (Crunch & Isometric Extension)",
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
          "Bravo Anti-Extension Overhead Hold",
          "Seated Floor DB Z-Press",
          "March in Place (Strict High Knees 45s)",
          "Half Turkish Get-Up (DB/KB)",
  "Front-Rack DB/KB Carry (Single or Double)",
  "Mixed Carry (Overhead + Suitcase)",
  "Single-Leg Cable Pallof Press (Perturbation)",
  "Cable Pallof Press with Figure-8 Trace",
          "Bear Crawl (Forward & Reverse Paced)"
        ]
      },
      {
        slot: "D4",
        target: "3x12-15",
        primary: "Cybex Eagle Hip Adduction (Inner Thigh)",
        defaultLoad: 80,
        alts: [
          "Cybex Eagle Hip Adduction (Inner Thigh)",
          "Cybex Eagle Hip Abduction (Outer Glute)",
          "Cybex Eagle Hip Abduction (Lean-Forward Upper Glute)",
          "Cybex Eagle Leg Extension Hip Thrust",
          "Cybex Eagle Leg Extension Glute Kickback",
          "Med Ball Rotational Wall Chest Pass",
          "Med Ball Overhead Slam",
          "Cable Pull-Through (Bravo Low Pulley)",
          "DDP Broken Table (Crunch & Isometric Extension)",
          "McGill Curl-Up (Strict Pause)"
        ]
      }
    ]
  },
  // docs/js/data/stages.js

  DAY_E: {
    id: "DAY_E",
    name: "Hypertrophy & Heavy Tension",
    prehab: "Prehab: 90/90 Hip Switches + Band Shoulder Dislocates",
    prehabDetails: [
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Smoothly transition internal to external rotation. Keep chest tall." },
      { name: "Band Shoulder Dislocates", dose: "2 sets × 10 passes", cue: "Straight arms, smooth overhead arc without flaring the ribcage." },
      { name: "Tibialis Wall Raises", dose: "2 sets × 15 reps", cue: "Flex toes to shins hard; preload anterior tibialis before heavy leg press." }
    ],
    slots: [
      {
        slot: "E1",
        target: "3x6-8",
        primary: "Cybex Eagle Articulating Leg Press",
        defaultLoad: 235,
        alts: [
          "Cybex Eagle Articulating Leg Press",
          "Cybex Eagle Single-Leg Extension",
          "Cybex Eagle Single-Leg Press",
          "Cybex Eagle Leg Press (High-and-Wide Glute/Ham)",
          "Cybex Eagle Leg Press Calf Raise",
          "Suitcase DB Squat",
          "DB Bulgarian Split Squat",
          "Goblet Squat (Tempo 3-0-1)",
          "Goblet Cossack Squat (Lateral Squat)",
          "Bodyweight Squat / TRX Squat",
          "Broad Jump to Soft Stick",
  "Med Ball Overhead Slam",
          "Supported Reverse Lunge (Rack/Wall)"
        ]
      },
      {
        slot: "E2",
        target: "3x6-8",
        primary: "Cybex Eagle Converging Chest Press",
        defaultLoad: 125,
        alts: [
          "Cybex Eagle Converging Chest Press",
          "Cybex Eagle Pec Fly (Machine)",
          "Cybex Eagle Single-Arm Iso-Lateral Chest Press",
          "Bravo Cable Overhead Tricep Extension",
          "Seated Floor DB Z-Press",
          "Incline DB Bench Press (30°)",
          "Neutral-Grip DB Floor Press",
          "DB Lateral Raise (Scapular Plane)",
          "DB Front-to-Lateral Raise Combo",
          "Incline Push-Up (Hands on Bench)",
          "DDP Slow-Burn Push-Up (3–5s Eccentric Count)",
          "Tempo Push-Up (3-0-1 Pause)"
        ]
      },
      {
        slot: "E3",
        target: "3x8-10",
        primary: "Cybex Eagle Leg Curl",
        defaultLoad: 100,
        alts: [
          "Cybex Eagle Leg Curl",
          "Cybex Eagle Leg Curl (2-Up / 1-Down Eccentric)",
          "Cybex Eagle Single-Leg Curl",
          "Cybex Eagle Leg Extension Hip Thrust",
          "Cybex Eagle Leg Extension Glute Kickback",
          "Supported Romanian Deadlift (RDL)",
          "B-Stance DB Hinge",
          "Cable Pull-Through (Bravo Low Pulley)",
          "Single-Leg Glute Bridge (12r/side)",
          "Bodyweight Single-Leg RDL (Wall Supported)"
        ]
      },
      {
        slot: "E4",
        target: "3x8-10",
        primary: "Cybex Eagle High Row (Chest Supported)",
        defaultLoad: 120,
        alts: [
          "Cybex Eagle High Row (Chest Supported)",
          "Cybex Eagle Single-Arm Iso-Lateral High Row",
          "Bravo Half-Kneeling Single-Arm Cable Row",
          "Bravo Standing Cable Straight-Arm Pullover",
          "Bravo Behind-the-Back Cable Shrug",
          "Bravo Cable Hammer Curl (Rope)",
          "Chest-Supported Dumbbell Row",
          "Elevated DB/KB Gorilla Row",
          "Seated DB Rear Delt Raise (Bent-Over)",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Single-Arm Iso-Lateral Pulldown",
          "Doorframe Row (Single-Arm Strict Pause)",
          "Prone Scapular Y-T-W Raises"
        ]
      },
    ]
  },

  DAY_F: {
    id: "DAY_F",
    name: "Joint Sparing & Deload Recon",
    // --- Inside DAY_F (Joint Sparing & Deload Recon) ---
    prehab: "Prehab: Posterior Chain & Spine Unlock (Elephant Walks → Jefferson Curls → Hip Flexor Stretch)",
    prehabDetails: [
      {
        name: "Elephant Walks (Alternating Knee-Bend Forward Fold)",
        dose: "1–2 sets × 10 reps / side",
        cue: "Hands planted on a low bench or shins; straighten one knee at a time to glide the sciatic nerve without forcing past the 80% pull."
      },
      {
        name: "Jefferson Curl (Bodyweight / Light DB)",
        dose: "1–2 sets × 6 slow reps (5s descent)",
        cue: "Tuck chin to chest and peel your spine down ONE vertebra at a time with bodyweight or 5–15 lbs. Stop at smooth muscular tension."
      },
      {
        name: "Half-Kneeling Hip Flexor & Quad Stretch",
        dose: "1–2 sets × 30s hold / side",
        cue: "Tuck tailbone under (posterior pelvic tilt) and squeeze rear glute firmly to release anterior pelvic pull on your hamstrings."
      }
    ],
    slots: [
      {
        slot: "F1",
        target: "3x15-20",
        primary: "Cybex Eagle Leg Extension",
        defaultLoad: 60,
        alts: [
          "Cybex Eagle Leg Extension",
          "Cybex Eagle Single-Leg Extension",
          "Cybex Eagle Articulating Leg Press (Light Tempo)",
          "Cybex Eagle Leg Extension Isometric Hold (30-45s)",
          "Cybex Eagle Leg Press Calf Raise",
          "Cybex Eagle Leg Press Calf Isometric Hold (30-45s)",
          "DB Bulgarian Split-Squat Bottom Isometric Hold (30s/side)",
          "Bodyweight Squat / TRX Squat",
          "90/90 Hip Switches (Active End-Range)",
  "Cossack / Side Lunge Flow (Assisted)",
          "DDP Twisting Lunge to Warrior Flow",
          "Elephant Walks (Alternating Knee-Bend Forward Fold)",
          "Tibialis Wall Raises"
        ]
      },
      {
        slot: "F2",
        target: "3x15-20",
        primary: "Cybex Eagle Hip Adduction (Inner Thigh)",
        defaultLoad: 65,
        alts: [
          "Cybex Eagle Hip Adduction (Inner Thigh)",
          "Cybex Eagle Hip Abduction (Outer Glute)",
          "Cybex Eagle Hip Abduction (Lean-Forward Upper Glute)",
          "Cybex Eagle Single-Leg Curl",
          "Cybex Eagle Leg Curl Isometric Hold (30-45s)",
          "Cybex Eagle Leg Extension Hip Thrust",
          "Cybex Eagle Leg Extension Glute Kickback",
          "Tall-Kneeling Pallof Hold (20s)",
          "Single-Arm DB Suitcase Carry",
          "Single-Leg Glute Bridge Isometric Hold (30s/side)",
          "Med Ball Deadbug Compression"
        ]
      },
      {
        slot: "F3",
        target: "3x15-20",
        primary: "Cybex Eagle Rear Delt Fly",
        defaultLoad: 45,
        alts: [
          "Cybex Eagle Rear Delt Fly",
          "Cable External Rotations (Bravo)",
          "Bravo Dual-Cable Face Pulls",
          "Bravo Incline Cable Y-Raise",
          "Bravo Cable Lateral Raise (Cross-Body)",
          "Side-Lying DB External Rotation",
          "Seated DB Rear Delt Raise (Bent-Over)",
          "DB Lateral Raise (Scapular Plane)",
          "DB Front-to-Lateral Raise Combo",
          "Band Shoulder Dislocates",
  "Wall Slides / Thoracic Open-Book Rotations",
          "DDP Diamond Cutter to Touchdown",
          "Prone Scapular Y-T-W Raises"
        ]
      },
      {
        slot: "F4",
        target: "3x12-15",
        primary: "Cable Pallof Press (Bravo)",
        defaultLoad: 25,
        alts: [
          "Cable Pallof Press (Bravo)",
          "Cybex Eagle Seated Abdominal Crunch",
          "Cable Pull-Through (Bravo Low Pulley)",
          "Bravo Anti-Extension Overhead Hold",
          "Lat & Thoracic Bench Prayer Stretch",
  "Half-Kneeling Hip Flexor & Quad Stretch",
          "Jefferson Curl (Bodyweight / Light DB)",
  "DB / Low-Anchor Oblique Side Bend (Controlled)",
          "DDP Cobra / Upward Dog to Safety Zone",
  "DDP Can Opener / Pinfall Stretch",
          "Jefferson Curl (Bodyweight / Light DB)",
  "Supine Hamstring Band/Strap Stretch",
  "90/90 Pigeon Glute Hold",
  "Bent-Knee Standing Ragdoll Decompression",
          "Tall-Kneeling Pallof Hold (20s)",
          "Hollow Body Isometric Hold (30s)"
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
          "Rower (Zone 2 Steady State)",
          "March in Place (Strict High Knees 45s)",
          "Low-Impact Shadow Boxing Flow (Zone 2)"
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
          "Incline Power Walk Surges",
          "Mountain Climbers (Hands on Bed - Low Shear)",
          "Fast Step-Jacks (30s on / 60s off)"
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
          "Cable Pallof Press (Bravo)",
          "Lateral Bear Crawl (Side-to-Side)",
          "Crab Walk / Reverse Table-Top Reach",
          "Tall-Kneeling Pallof Hold (20s)"
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
          "Overhead Waiter's Walk (Single DB)",
          "Bear Crawl (Forward & Reverse Paced)",
          "Front-Rack DB/KB Carry (Single or Double)",
          "Mixed Carry (Overhead + Suitcase)",
          "March in Place (Strict High Knees 45s)"
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
        primary: "Cybex Eagle Articulating Leg Press (Light Tempo 25r)",
        defaultLoad: 140,
        alts: [
          "Cybex Eagle Articulating Leg Press (Light Tempo 25r)",
          "Cybex Eagle Leg Extension (Paced 20r)",
          "Suitcase DB Squat",
          "DB Spellcaster (Rotational Swing)",
          "Bodyweight / Goblet Tactical Get-Up",
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
          "Glute Bridge / DB RDL (to Bench)",
          "Single-Leg Glute Bridge (12r/side)",
          "Snap-Downs (Athletic Braking)",
          "Bodyweight Single-Leg RDL (Wall Supported)"
        ]
      },
    {
        slot: "H3",
        target: "3x45s Time-Under-Tension",
        primary: "Lat Pulldown (Neutral/Mag-Grip)",
        defaultLoad: 100,
        alts: [
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Single-Arm Iso-Lateral Pulldown",
          "Bravo Dual-Cable Row (Mid-Height)",
          "Chest-Supported Dumbbell Row",
          "Elevated DB/KB Gorilla Row",
          "Cybex Eagle High Row (Chest Supported)",
          "Doorframe Row (Single-Arm Strict Pause)",
          "Lateral Bear Crawl (Side-to-Side)",
          "Crab Walk / Reverse Table-Top Reach",
          "Prone Floor Lat Pull (Towel Slide)"
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
          "Kettlebell Suitcase March / Carry",
          "March in Place (Strict High Knees 45s)",
          "Front-Rack DB/KB Carry (Single or Double)",
          "Mixed Carry (Overhead + Suitcase)",
          "DB Spellcaster (Rotational Swing)",
          "Bear Crawl (Forward & Reverse Paced)"
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
          "DB Bulgarian Split-Squat Bottom Isometric Hold (30s/side)",
          "Split-Squat with Thoracic Rotation (No Bench)",
          "Goblet Cossack Squat (Lateral Squat)",
          "Bodyweight / Goblet Tactical Get-Up",
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
          "DDP Slow-Burn Push-Up (3–5s Eccentric Count)",
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
          "Twisting Leg Raise (Floor / Bench)",
  "Weighted / Bodyweight Russian Twist",
          "Lateral Bear Crawl (Side-to-Side)",
          "Crab Walk / Reverse Table-Top Reach",
          "DDP Broken Table (Crunch & Isometric Extension)",
          "Elephant Walks (Alternating Knee-Bend Forward Fold)",
  "Bent-Knee Standing Ragdoll Decompression",
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
          "Twisting Leg Raise (Floor / Bench)",
  "Weighted / Bodyweight Russian Twist",
          "Single-Leg Cable Pallof Press (Perturbation)",
          "Cable Pallof Press with Figure-8 Trace",
          "Hollow Body Isometric Hold (30s)"
        ]
      }
    ]
  },
  DAY_J: {
    id: "DAY_J",
    name: "Sonic Chaos // Athletic Agility, Mobility & Flexibility",
    // --- Inside DAY_J (Sonic Chaos // Athletic Agility, Mobility & Flexibility) ---
    prehab: "Prehab: Posterior Chain & Spine Unlock (Elephant Walks → Jefferson Curls → Hip Flexor Stretch)",
    prehabDetails: [
      {
        name: "Elephant Walks (Alternating Knee-Bend Forward Fold)",
        dose: "1–2 sets × 10 reps / side",
        cue: "Hands planted on a low bench or shins; straighten one knee at a time to glide the sciatic nerve without forcing past the 80% pull."
      },
      {
        name: "Jefferson Curl (Bodyweight / Light DB)",
        dose: "1–2 sets × 6 slow reps (5s descent)",
        cue: "Tuck chin to chest and peel your spine down ONE vertebra at a time with bodyweight or 5–15 lbs. Stop at smooth muscular tension."
      },
      {
        name: "Half-Kneeling Hip Flexor & Quad Stretch",
        dose: "1–2 sets × 30s hold / side",
        cue: "Tuck tailbone under (posterior pelvic tilt) and squeeze rear glute firmly to release anterior pelvic pull on your hamstrings."
      }
    ],
    slots: [
      {
        slot: "J1",
        target: "3x3-5 / side (Full Rest)",
        primary: "Half-Kneeling Sprint Start (First 3 Steps)",
        defaultLoad: 0,
        alts: [
          "Half-Kneeling Sprint Start (First 3 Steps)",
          "Med Ball Overhead Slam",
          "Broad Jump to Soft Stick",
          "Goblet Cossack Squat (Lateral Squat)",
  "Split-Squat with Thoracic Rotation (No Bench)",
          "Snap-Downs (Athletic Braking)",
          "Lateral Bound to Single-Leg Stick (Low-Amplitude)",
          "Seated-to-Standing Box Jump (Dead-Stop)"
        ]
      },
      {
        slot: "J2",
        target: "3x30s Flow / 45s Rest",
        primary: "Low-Impact Lateral Shuffle & Carioca (Zone 2)",
        defaultLoad: 0,
        alts: [
          "Low-Impact Lateral Shuffle & Carioca (Zone 2)",
          "Med Ball Rotational Wall Chest Pass",
          "Dynamic Banded Rotational Punch",
          "Lateral Bear Crawl (Side-to-Side)",
"Crab Walk / Reverse Table-Top Reach",
          "Low-Impact Shadow Boxing Flow (Zone 2)"
        ]
      },
      {
        slot: "J3",
        target: "2-3x6-8 / side (Slow Control)",
        primary: "90/90 Hip Switches (Active End-Range)",
        defaultLoad: 0,
        alts: [
          "90/90 Hip Switches (Active End-Range)",
          "Bodyweight Rotational Windmills (Paced)",
          "Cossack / Side Lunge Flow (Assisted)",
          "Goblet Cossack Squat (Lateral Squat)",
  "Split-Squat with Thoracic Rotation (No Bench)",
          "Half Turkish Get-Up (DB/KB)",
"Bodyweight / Goblet Tactical Get-Up",
"Single-Leg Cable Pallof Press (Perturbation)",
          "Jefferson Curl (Bodyweight / Light DB)",
  "DB / Low-Anchor Oblique Side Bend (Controlled)",
          "DDP Diamond Cutter to Touchdown",
  "DDP Twisting Lunge to Warrior Flow",
          "Elephant Walks (Alternating Knee-Bend Forward Fold)",
  "Jefferson Curl (Bodyweight / Light DB)",
          "Band Shoulder Dislocates"
        ]
      },
      {
        slot: "J4",
        target: "2x30-45s Holds (Nasal Breathing)",
        primary: "Half-Kneeling Hip Flexor & Quad Stretch",
        defaultLoad: 0,
        alts: [
          "Half-Kneeling Hip Flexor & Quad Stretch",
          "90/90 Pigeon Glute Hold",
          "Lat & Thoracic Bench Prayer Stretch",
          "DDP Cobra / Upward Dog to Safety Zone",
  "DDP Can Opener / Pinfall Stretch",
          "Bent-Knee Standing Ragdoll Decompression",
          "Supine Hamstring Band/Strap Stretch"
        ]
      }
    ]
  },
  DAY_K: {
    id: "DAY_K",
    name: "Tendon Mechanics & Connective Armor",
    prehab: "Prehab: Tibialis Wall Raises + 90/90 Hip Switches & Prone Y-T-W",
    prehabDetails: [
      { name: "Tibialis Wall Raises", dose: "2 sets × 20 reps", cue: "Drive toes to shins hard; preload anterior shin tendon and ankle capsule." },
      { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Tall spine; smoothly lubricate hip joint capsules without lumbar torque." },
      { name: "Prone Scapular Y-T-W Raises", dose: "1–2 sets × 6 reps / pos", cue: "Thumbs up to ceiling; prime lower traps and rotator cuff tendons." }
    ],
    slots: [
      {
        slot: "K1",
        target: "3x30-45s Hold",
        primary: "Cybex Eagle Leg Extension Isometric Hold (30-45s)",
        defaultLoad: 80,
        alts: [
          "Cybex Eagle Leg Extension Isometric Hold (30-45s)",
          "Heavy Banded Spanish Squat",
          "DB Bulgarian Split-Squat Bottom Isometric Hold (30s/side)",
          "Bodyweight Single-Leg RDL (Wall Supported)",
      "Single-Leg Box Squat (Strict 3s Pause)",
          "Banded Terminal Knee Extension (TKE)"
        ]
      },
      {
        slot: "K2",
        target: "3x30-45s Hold",
        primary: "Cybex Eagle Leg Curl Isometric Hold (30-45s)",
        defaultLoad: 75,
        alts: [
          "Cybex Eagle Leg Curl Isometric Hold (30-45s)",
          "Single-Leg Glute Bridge Isometric Hold (30s/side)",
          "Cybex Eagle Leg Curl (2-Up / 1-Down Eccentric)",
          "Cybex Eagle Hip Abduction (Lean-Forward Upper Glute)",
      "Mini-Band Lateral Monster Walk",
      "Copenhagen Side Plank Hold (Bent-Knee 20-30s)",
          "DDP Broken Table (Crunch & Isometric Extension)",
          "Bodyweight Single-Leg RDL (Strict 5s Eccentric)"
        ]
      },
      {
        slot: "K3",
        target: "3x30-45s Hold",
        primary: "Cybex Eagle Leg Press Calf Isometric Hold (30-45s)",
        defaultLoad: 140,
        alts: [
          "Cybex Eagle Leg Press Calf Isometric Hold (30-45s)",
          "Tibialis Wall Raises",
          "Cybex Eagle Leg Press Calf Raise",
          "Single-Leg Balance & Foot-Tripod Hold (30s/side)",
      "Single-Arm Banded Suitcase Isometric March",
          "41\" Loop Band Seated Calf Extension"
        ]
      },
      {
        slot: "K4",
        target: "3x12-15 (3s Eccentric)",
        primary: "Cable External Rotations (Bravo)",
        defaultLoad: 15,
        alts: [
          "Cable External Rotations (Bravo)",
          "Prone Scapular Y-T-W Raises",
          "Seated DB Wrist Curl & Reverse Wrist Curl Superset",
          "Serratus Wall Slide with Mini-Band",
      "4-Way Isometric Neck Stabilization",
          "Bravo Low-Cable Reverse Curl (Pronated Forearms)"
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
          "B-Stance DB Hinge",
          "Bodyweight Single-Leg RDL (Strict 5s Eccentric)"
        ]
      },
      {
        slot: "X2",
        target: "1x3-5 @ 88%",
        primary: "Cybex Eagle Articulating Leg Press",
        defaultLoad: 235,
        alts: [
          "Cybex Eagle Articulating Leg Press",
          "Suitcase DB Squat",
          "Goblet Squat (Tempo 3-0-1)",
          "Single-Leg Box Squat (Strict 3s Pause)"
        ]
      },
      {
        slot: "X3",
        target: "1x3-5 @ 88%",
        primary: "Neutral-Grip DB Floor Press",
        defaultLoad: 60,
        alts: [
          "Neutral-Grip DB Floor Press",
          "Cybex Eagle Converging Chest Press",
          "Incline DB Bench Press (30°)",
          "Feet-Elevated Decline Push-Up (Strict 1s Pause)"
        ]
      },
      {
        slot: "X4",
        target: "1x3-5 @ 88% (or Apex Metric)",
        primary: "Chest-Supported Dumbbell Row",
        defaultLoad: 60,
        alts: [
          "Chest-Supported Dumbbell Row",
          "Elevated DB/KB Gorilla Row",
          "Rower 500m Apex Sprint (Sub-1:45 Pace)",
          "Farmer's Carries (Dual DB/KB - Max Distance)",
          "Cybex Eagle High Row (Chest Supported)",
          "Lat Pulldown (Neutral/Mag-Grip)",
          "Single-Arm Iso-Lateral Pulldown",
          "Doorframe Row (Single-Arm 3s Pause)"
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
        primary: "Cybex Eagle Articulating Leg Press",
        defaultLoad: 180,
        alts: [
          "Cybex Eagle Articulating Leg Press",
          "Cybex Eagle Leg Extension",
          "Suitcase DB Squat",
          "Bodyweight Squat / TRX Squat (AMRAP to Failure)"
        ]
      },
      {
        slot: "Y2",
        target: "AMRAP @ 70%",
        primary: "Cybex Eagle Converging Chest Press",
        defaultLoad: 100,
        alts: [
          "Cybex Eagle Converging Chest Press",
          "Neutral-Grip DB Floor Press",
          "Incline DB Bench Press (30°)",
          "Incline Push-Up (Hands on Bench - AMRAP)"
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
          "Cybex Eagle High Row (Chest Supported)",
          "Doorframe Row (Single-Arm AMRAP)"
        ]
      },
      {
        slot: "Y4",
        target: "AMRAP @ 70% (or Engine Burnout)",
        primary: "Cybex Eagle Seated Abdominal Crunch",
        defaultLoad: 70,
        alts: [
          "Cybex Eagle Seated Abdominal Crunch",
          "Single-Arm DB Suitcase Carry (AMRAP Laps to Failure)",
          "Rower / Incline Treadmill (90s Max Effort AMRAP)",
          "Cable Pallof Press (Bravo)",
          "Med Ball Deadbug Compression",
          "Hollow Body Isometric Hold (Max Seconds to Failure)"
        ]
      }
    ]
  }
};
