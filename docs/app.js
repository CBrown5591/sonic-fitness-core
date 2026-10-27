// -------------------------------------------------------------
    // STAGE DEFINITIONS & MOVEMENT CATALOG
    // -------------------------------------------------------------
        const STAGES = {
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
            primary: "Barbell Deadlift (Standard Bar)",
            defaultLoad: 225,
            alts: [
              "Barbell Deadlift (Standard Bar)",
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
            defaultLoad: 70,
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
              "Barbell Deadlift (Standard Bar)"
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
            defaultLoad: 70,
            alts: [
              "Farmer's Carries",
              "Suitcase Carry (Single-Arm)",
              "Cybex VR2 Seated Hip Abductor/Adductor",
              "Cable Pallof Press"
            ]
          }
        ]
      }
,
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
      }    };

    // -------------------------------------------------------------
    // MASTERY VAULT CATALOG (12 RELIC MOVEMENTS)
    // -------------------------------------------------------------
    const DEFAULT_VAULT = [
      { exercise: "Barbell Deadlift (Standard Bar)", focus: "Hinge", rings: 0 },
      { exercise: "Chest-Supported Dumbbell Row", focus: "Horizontal Pull", rings: 0 },
      { exercise: "Neutral-Grip DB Floor Press", focus: "Horizontal Push", rings: 0 },
      { exercise: "Cable Pallof Press", focus: "Core", rings: 0 },
      { exercise: "Goblet Squat (Tempo 3-0-1)", focus: "Squat", rings: 0 },
      { exercise: "Half-Kneeling Landmine Press", focus: "Vertical Push", rings: 0 },
      { exercise: "Supported Romanian Deadlift (RDL)", focus: "Hinge", rings: 0 },
      { exercise: "Cable External Rotations", focus: "Shoulder Rehab", rings: 0 },
      { exercise: "DB Bulgarian Split Squat", focus: "Single Leg", rings: 0 },
      { exercise: "Lat Pulldown (Neutral/Mag-Grip)", focus: "Vertical Pull", rings: 0 },
      { exercise: "Incline DB Bench Press (30°)", focus: "Horizontal Push", rings: 0 },
      { exercise: "Farmer's Carries", focus: "Carry", rings: 0 }
    ];

    // -------------------------------------------------------------
    // CLOSED-LOOP PR VAULT & 1RM DYNAMIC LOAD ENGINE
    // -------------------------------------------------------------
    function calculateE1RM(load, reps) {
      if (!load || load <= 0 || !reps || reps <= 0) return 0;
      if (reps === 1) return Math.round(load);
      if (reps <= 6) {
        // Brzycki formula for heavy strength sets
        return Math.round(load / (1.0278 - (0.0278 * reps)));
      } else {
        // Epley formula for higher rep / failure work
        return Math.round(load * (1 + (reps / 30.0)));
      }
    }

    function getTargetPercentage(targetStr) {
      if (!targetStr) return 0.70;
      const s = String(targetStr).toLowerCase();
      if (s.includes('6-8')) return 0.78;   // Heavy compound strength (~78%)
      if (s.includes('8-10')) return 0.72;  // Hypertrophy & tempo bracket (~72%)
      if (s.includes('10-12')) return 0.65; // Volume / machine bracket (~65%)
      if (s.includes('12-15')) return 0.58; // Endurance / joint prehab (~58%)
      if (s.includes('paces') || s.includes('carry')) return 0.60;
      return 0.70;
    }

    function calculateTargetLoad(e1rm, targetStr, defaultVal) {
      if (!e1rm || e1rm <= 0) return defaultVal;
      const pct = getTargetPercentage(targetStr);
      const raw = e1rm * pct;
      return Math.max(5, Math.round(raw / 5.0) * 5); // Round to nearest 5 lbs
    }

    function getPRVault() {
      const stored = localStorage.getItem('sonic_pr_vault');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      return {};
    }

    function savePRVault(data) {
      localStorage.setItem('sonic_pr_vault', JSON.stringify(data));
    }

    function applyDynamicWorkingLoad(exercise, targetStr, defaultLoad) {
      const prVault = getPRVault();
      const pr = prVault[exercise];
      const loadInput = document.getElementById('loadInput');
      const targetTag = document.getElementById('currentTargetTag');

      if (pr && pr.e1rm > 0) {
        const dynamicLoad = calculateTargetLoad(pr.e1rm, targetStr, defaultLoad);
        if (loadInput) loadInput.value = dynamicLoad;
        if (targetTag) {
          targetTag.innerText = `TARGET: ${targetStr} [PR: ${pr.e1rm}# → LOAD: ${dynamicLoad}#]`;
        }
      } else {
        if (loadInput) loadInput.value = defaultLoad;
        if (targetTag) {
          targetTag.innerText = `TARGET: ${targetStr}`;
        }
      }
    }

    // -------------------------------------------------------------
    // STATE ENGINE
    // -------------------------------------------------------------
    let activeStageKey = localStorage.getItem('sonic_active_stage') || "DAY_A";
    let activeSlotIndex = 0;
    let tempoClean = true;
    let currentSetPain = false;

    let activeSession = {
      stage: activeStageKey,
      prehabChecked: false,
      jointPain: false,
      sets: []
    };

    const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxVl5oX6U2OwD6vI-KcJnR0srmjg64MLKY3CDuovFi20I_k_4Cc_t0a4XRy5KMo1AZo/exec";

    function getActiveWebhookUrl() {
      return localStorage.getItem('sonic_sheets_webhook') || DEFAULT_WEBHOOK_URL;
    }

    function saveSessionState() {
      activeSession.stage = activeStageKey;
      activeSession.slotIndex = activeSlotIndex;
      localStorage.setItem('sonic_active_session', JSON.stringify(activeSession));
      localStorage.setItem('sonic_active_stage', activeStageKey);
      updateTonnageDisplay();
    }

    function loadSessionState() {
      const saved = localStorage.getItem('sonic_active_session');
      if (saved) {
        try {
          activeSession = JSON.parse(saved);
          if (activeSession.stage && STAGES[activeSession.stage]) {
            activeStageKey = activeSession.stage;
          }
        } catch (e) {
          console.warn('Error reading saved session state', e);
        }
      }
      selectStage(activeStageKey, false);
      renderSessionUI();
    }

    // -------------------------------------------------------------
    // STAGE & SLOT SWITCHING (SUITE A & B)
    // -------------------------------------------------------------
    function selectStage(stageKey, resetIfNew = true) {
      if (resetIfNew && stageKey !== activeStageKey) {
        if (activeSession.sets.length > 0 && !confirm("Switching stages will start a new session. Proceed?")) {
          return;
        }
        activeSession = { stage: stageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
        activeSlotIndex = 0;
      } else if (!resetIfNew && activeSession.slotIndex !== undefined) {
        activeSlotIndex = activeSession.slotIndex;
      } else if (resetIfNew) {
        activeSlotIndex = 0;
      }

      activeStageKey = stageKey;

      // Update Tab Pill UI
      document.querySelectorAll('.stage-tab').forEach(tab => tab.classList.remove('active'));
      const activeTab = document.getElementById(`tab-${stageKey}`);
      if (activeTab) activeTab.classList.add('active');

      const stageDef = STAGES[stageKey];
      document.getElementById('stageFocus').innerText = `STAGE CLEAR ZONE // ${stageKey.replace('_', ' ')}`;
      document.getElementById('stageName').innerText = stageDef.name;
      document.getElementById('prehabLabel').innerText = stageDef.prehab.replace('Prehab: ', '');

      renderSlotStepper();
      loadSlotData();
      saveSessionState();
      renderSessionUI();
    }

    function renderSlotStepper() {
      const stepper = document.getElementById('slotStepper');
      stepper.innerHTML = '';
      const stageDef = STAGES[activeStageKey];

      stageDef.slots.forEach((slotData, index) => {
        const btn = document.createElement('div');
        btn.className = `slot-btn ${index === activeSlotIndex ? 'active' : ''}`;
        
        // Check if slot has logged sets
        const setsInSlot = activeSession.sets.filter(s => s.slot === slotData.slot).length;
        if (setsInSlot >= 3) btn.classList.add('completed');

        btn.innerText = slotData.slot;
        btn.onclick = () => {
          activeSlotIndex = index;
          saveSessionState();
          renderSlotStepper();
          loadSlotData();
        };
        stepper.appendChild(btn);
      });
    }

    function loadSlotData() {
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef.slots[activeSlotIndex];

      document.getElementById('currentSlotTag').innerText = `SLOT ${slotDef.slot}`;
      document.getElementById('currentTargetTag').innerText = `TARGET: ${slotDef.target}`;

      // Populate exercises dropdown
      const select = document.getElementById('exerciseSelect');
      select.innerHTML = '';
      slotDef.alts.forEach(alt => {
        const opt = document.createElement('option');
        opt.value = alt;
        opt.innerText = alt;
        select.appendChild(opt);
      });
      select.value = slotDef.primary;

      // Apply dynamic working load from closed-loop 1RM
      applyDynamicWorkingLoad(slotDef.primary, slotDef.target, slotDef.defaultLoad);

      updateLogButtonText();
    }

    function onExerciseChange() {
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef.slots[activeSlotIndex];
      const selectedEx = document.getElementById('exerciseSelect').value;
      applyDynamicWorkingLoad(selectedEx, slotDef.target, slotDef.defaultLoad);
      updateLogButtonText();
    }

    function updateLogButtonText() {
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef.slots[activeSlotIndex];
      const setsInThisSlot = activeSession.sets.filter(s => s.slot === slotDef.slot).length;
      document.getElementById('logSetBtn').innerText = `LOG SET ${setsInThisSlot + 1} (${slotDef.slot}) & REST`;
    }

    // -------------------------------------------------------------
    // LOG SET & AUTO ADVANCE
    // -------------------------------------------------------------
    function logActiveSet() {
      const stageDef = STAGES[activeStageKey];
      const slotDef = stageDef.slots[activeSlotIndex];
      const exercise = document.getElementById('exerciseSelect').value;
      const load = parseFloat(document.getElementById('loadInput').value) || 0;
      const reps = parseInt(document.getElementById('repsInput').value, 10) || 0;
      const rpe = parseFloat(document.getElementById('rpeSelect').value) || 7.5;

      const setsInSlot = activeSession.sets.filter(s => s.slot === slotDef.slot).length + 1;

      // Calculate estimated 1RM for this completed set
      const setE1RM = calculateE1RM(load, reps);
      const prVault = getPRVault();
      const currentPR = prVault[exercise] ? (prVault[exercise].e1rm || 0) : 0;
      let isNewPR = false;

      // Only clean reps without joint pain qualify for 1RM PR promotions
      if (setE1RM > currentPR && tempoClean && !currentSetPain) {
        prVault[exercise] = {
          e1rm: setE1RM,
          load: load,
          reps: reps,
          bestSet: `${load}lbs × ${reps}`,
          date: new Date().toISOString().split('T')[0]
        };
        savePRVault(prVault);
        isNewPR = true;
        showToast(`★ NEW 1RM PR: ${exercise} → ${setE1RM} LBS!`);
      }

      activeSession.sets.push({
        slot: slotDef.slot,
        exercise,
        setNum: setsInSlot,
        load,
        reps,
        rpe,
        e1rm: setE1RM,
        isNewPR: isNewPR,
        tempoClean,
        jointPain: currentSetPain
      });

      saveSessionState();
      renderSessionUI();

      // Trigger Audio & Haptic feedback
      playRingChime();
      if (navigator.vibrate) navigator.vibrate(50);
      startRestTimer();

      // Check if slot reached 3 sets; if so, auto-advance to next slot
      if (setsInSlot >= 3 && activeSlotIndex < stageDef.slots.length - 1) {
        activeSlotIndex++;
        saveSessionState();
        renderSlotStepper();
        loadSlotData();
      } else {
        saveSessionState();
        renderSlotStepper();
        updateLogButtonText();
      }

      // Reset joint strain flag for next set
      currentSetPain = false;
      const painBtn = document.getElementById('painBtn');
      if (painBtn) {
        painBtn.classList.remove('active-red');
        painBtn.innerText = "Joint Strain: No";
      }
    }

    // -------------------------------------------------------------
    // TONNAGE & MASTERY VAULT (SUITE D)
    // -------------------------------------------------------------
    function updateTonnageDisplay() {
      const totalTonnage = activeSession.sets.reduce((sum, s) => sum + ((s.load || 0) * (s.reps || 0)), 0);
      const display = document.getElementById('tonnageDisplay');
      if (display) {
        display.innerText = `VOL: ${totalTonnage.toLocaleString()} LBS`;
      }
    }

    function toggleVaultDrawer() {
      const drawer = document.getElementById('vaultDrawer');
      const icon = document.getElementById('vaultToggleIcon');
      if (drawer.style.display === 'block') {
        drawer.style.display = 'none';
        icon.innerText = 'EXPAND ▾';
      } else {
        renderVault();
        drawer.style.display = 'block';
        icon.innerText = 'COLLAPSE ▴';
      }
    }

    function getVaultData() {
      const stored = localStorage.getItem('sonic_mastery_vault');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      return DEFAULT_VAULT;
    }

    function saveVaultData(data) {
      localStorage.setItem('sonic_mastery_vault', JSON.stringify(data));
    }

    function renderVault() {
      const container = document.getElementById('vaultItemsContainer');
      if (!container) return;
      const vault = getVaultData();
      container.innerHTML = '';

      vault.forEach(item => {
        const row = document.createElement('div');
        row.className = 'vault-item';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          stars += i <= item.rings ? '★' : '☆';
        }

        row.innerHTML = `
          <div>
            <div class="vault-move">${item.exercise}</div>
            <div class="vault-focus">${item.focus}</div>
          </div>
          <div style="text-align: right;">
            <div class="vault-rings">${stars}</div>
            <div style="font-size: 10px; color: ${item.rings >= 5 ? 'var(--accent-gold)' : 'var(--text-dim)'};">
              ${item.rings >= 5 ? 'MASTERED' : item.rings + '/5 Rings'}
            </div>
          </div>
        `;
        container.appendChild(row);
      });
    }

    function creditVaultRings(stageKey, ringsCount) {
      const vault = getVaultData();
      const stageMap = {
        "DAY_A": "Barbell Deadlift (Standard Bar)",
        "DAY_B": "Goblet Squat (Tempo 3-0-1)",
        "DAY_C": "Neutral-Grip Flat DB Bench",
        "DAY_D": "Cable Pallof Press",
        "DAY_E": "Goblet Squat (Tempo 3-0-1)",
        "DAY_F": "Cable External Rotations"
      };
      const targetName = stageMap[stageKey] || "Barbell Deadlift (Standard Bar)";
      const target = vault.find(v => v.exercise.includes(targetName) || targetName.includes(v.exercise));
      if (target) {
        target.rings = Math.min(5, (target.rings || 0) + ringsCount);
        saveVaultData(vault);
      }
    }

    // -------------------------------------------------------------
    // REST TIMER (DELTA BASED & BACKGROUND RESILIENT)
    // -------------------------------------------------------------
    const savedRest = parseInt(localStorage.getItem('sonic_rest_duration'), 10);
    let configuredRestSeconds = [60, 90, 120].includes(savedRest) ? savedRest : 90;
    let timerSeconds = configuredRestSeconds;
    let timerInterval = null;
    let timerEndTime = null;
    let wakeLock = null;

    function setTimerDuration(seconds, vibrate = true) {
      configuredRestSeconds = seconds;
      if (!timerEndTime) {
        timerSeconds = seconds;
        updateTimerDisplay();
      }
      localStorage.setItem('sonic_rest_duration', seconds);
      [60, 90, 120].forEach(s => {
        const pill = document.getElementById(`pill-${s}`);
        if (pill) {
          if (s === seconds) pill.classList.add('active');
          else pill.classList.remove('active');
        }
      });
      if (vibrate && navigator.vibrate) navigator.vibrate(25);
    }

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('WakeLock unavailable:', err);
      }
    }

    function startRestTimer() {
      clearInterval(timerInterval);
      timerEndTime = Date.now() + (configuredRestSeconds * 1000);
      localStorage.setItem('sonic_timer_end', timerEndTime);
      syncTimerDelta();
      requestWakeLock();
      timerInterval = setInterval(syncTimerDelta, 250);
    }

    function syncTimerDelta() {
      if (!timerEndTime) return;
      const remainingMs = timerEndTime - Date.now();
      const newSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      if (newSeconds !== timerSeconds) {
        timerSeconds = newSeconds;
        updateTimerDisplay();

        if (timerSeconds === 3 || timerSeconds === 2 || timerSeconds === 1) {
          playCountdownBeep(false);
          if (navigator.vibrate) navigator.vibrate(40);
        } else if (timerSeconds === 0) {
          clearInterval(timerInterval);
          timerEndTime = null;
          localStorage.removeItem('sonic_timer_end');
          playCountdownBeep(true);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          dispatchRestNotification();
        }
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const savedEnd = parseInt(localStorage.getItem('sonic_timer_end'), 10);
        if (savedEnd) {
          timerEndTime = savedEnd;
          syncTimerDelta();
          if (timerEndTime && !timerInterval) {
            timerInterval = setInterval(syncTimerDelta, 250);
          }
        }
      }
    });

    function updateTimerDisplay() {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      document.getElementById('timerClock').innerText = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // -------------------------------------------------------------
    // WEB AUDIO API ARCADE SYNTHESIZER WITH AUDIO DUCKING
    // -------------------------------------------------------------
    let audioCtx = null;

    function configureAudioSession() {
      if ('audioSession' in navigator) {
        try {
          navigator.audioSession.type = 'transient-solo-duck';
        } catch (e) {
          console.warn('AudioSession ducking failed:', e);
        }
      }
    }

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass({ latencyHint: 'interactive' });
        configureAudioSession();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playCountdownBeep(isFinal = false) {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = isFinal ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isFinal ? 1760.00 : 880.00, now);

        const duration = isFinal ? 0.35 : 0.12;
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.05);
      } catch (e) {}
    }

    function playRingChime() {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(1046.50, now);
        osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08);

        osc2.frequency.setValueAtTime(2093.00, now);
        osc2.frequency.exponentialRampToValueAtTime(3135.96, now + 0.08);

        gain1.gain.setValueAtTime(0.40, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        gain2.gain.setValueAtTime(0.25, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
      } catch (e) {}
    }

        // -------------------------------------------------------------
    // -------------------------------------------------------------
    // AUDIO THEME ENGINE: MODERN VS CLASSIC FANFARE (MP3 + SYNTH FALLBACK)
    // -------------------------------------------------------------
    const audioElements = {
      modern: null,
      classic: null,
      levelup: null
    };

    function playLevelUpFanfare() {
      const ctx = getAudioContext();
      const now = ctx ? ctx.currentTime : 0;
      try {
        if (!audioElements.levelup) {
          audioElements.levelup = new Audio('./assets/audio/level_up.mp3');
          audioElements.levelup.preload = 'auto';
        }
        audioElements.levelup.currentTime = 0;
        const playPromise = audioElements.levelup.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[Audio] level_up.mp3 playback failed, falling back to synth:', err);
            playLevelUpSynth(ctx, now);
          });
        }
      } catch (e) {
        console.warn('[Audio] Level up audio failed:', e);
        playLevelUpSynth(ctx, now);
      }
    }

    function playLevelUpSynth(ctx, now) {
      if (!ctx) return;
      const notes = [
        { f: 523.25, t: 0.00, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.12 },
        { f: 1046.50, t: 0.36, d: 0.18 },
        { f: 1318.51, t: 0.54, d: 0.18 },
        { f: 1567.98, t: 0.72, d: 0.25 },
        { f: 2093.00, t: 0.97, d: 0.85 }
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.35, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      });
    }

    function getAudioTheme() {
      return localStorage.getItem('sonic_audio_theme') || 'modern';
    }

    function toggleAudioTheme() {
      const current = getAudioTheme();
      const next = current === 'modern' ? 'classic' : 'modern';
      localStorage.setItem('sonic_audio_theme', next);
      updateAudioThemeBtnUI();
      updatePilotExpUI();
      showToast(`Audio Theme: ${next === 'modern' ? 'MODERN SONIC ⚡' : '16-BIT CLASSIC 🕹️'}`);
      if (navigator.vibrate) navigator.vibrate(25);
    }

    function updateAudioThemeBtnUI() {
      const btn = document.getElementById('audioThemeBtn');
      if (!btn) return;
      const theme = getAudioTheme();
      if (theme === 'modern') {
        btn.innerText = "SONIC: MODERN ⚡";
        btn.style.color = "var(--accent-blue)";
        btn.style.borderColor = "var(--accent-blue)";
      } else {
        btn.innerText = "SONIC: 16-BIT 🕹️";
        btn.style.color = "var(--accent-gold)";
        btn.style.borderColor = "var(--accent-gold)";
      }
    }

    function playStageClearFanfare() {
      const theme = getAudioTheme();
      const ctx = getAudioContext();
      const now = ctx ? ctx.currentTime : 0;

      const audioSrc = theme === 'modern' 
        ? './assets/audio/sa2_clear.mp3' 
        : './assets/audio/genesis_clear.mp3';

      try {
        if (!audioElements[theme]) {
          audioElements[theme] = new Audio(audioSrc);
          audioElements[theme].preload = 'auto';
        }
        
        audioElements[theme].currentTime = 0;
        const playPromise = audioElements[theme].play();

        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn(`[Audio] ${theme.toUpperCase()} audio file playback failed, falling back to synth engine:`, err);
            if (theme === 'modern') playModernSynthFanfare(ctx, now);
            else playClassicSynthFanfare(ctx, now);
          });
        }
      } catch (e) {
        console.warn(`[Audio] Audio error on ${theme}, using synth fallback:`, e);
        if (theme === 'modern') playModernSynthFanfare(ctx, now);
        else playClassicSynthFanfare(ctx, now);
      }
    }

    // --- Modern Sonic Synth Fallback ---
    function playModernSynthFanfare(ctx, now) {
      if (!ctx) return;
      const C5 = 523.25, D5 = 587.33, F5 = 698.46, G5 = 783.99, A5 = 880.00, Bb5 = 932.33;
      const C6 = 1046.50, D6 = 1174.66, E6 = 1318.51, F6 = 1396.91, C7 = 2093.00, F7 = 2793.83;
      const F2 = 87.31, C3 = 130.81;

      const notes = [
        { f: C5, t: 0.00, d: 0.08 }, { f: D5, t: 0.08, d: 0.08 }, { f: F5, t: 0.16, d: 0.08 }, { f: G5, t: 0.24, d: 0.10 },
        { f: A5, t: 0.35, d: 0.30 }, { f: F5, t: 0.70, d: 0.14 }, { f: G5, t: 0.85, d: 0.14 }, { f: A5, t: 1.00, d: 0.14 },
        { f: Bb5, t: 1.15, d: 0.14 }, { f: C6, t: 1.30, d: 0.45 },
        { f: F6, t: 1.85, d: 1.20 }, { f: C6, t: 1.85, d: 1.20 }, { f: A5, t: 1.85, d: 1.20 }
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.20, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      });
    }

    // --- Classic 16-Bit Sonic Synth Fallback ---
    function playClassicSynthFanfare(ctx, now) {
      if (!ctx) return;
      const C5 = 523.25, F5 = 698.46, A5 = 880.00, Bb5 = 932.33, C6 = 1046.50, F6 = 1396.91;
      const notes = [
        { f: C5, t: 0.00, d: 0.09 }, { f: F5, t: 0.10, d: 0.09 }, { f: A5, t: 0.20, d: 0.09 }, { f: C6, t: 0.30, d: 0.36 },
        { f: Bb5, t: 0.70, d: 0.11 }, { f: A5, t: 0.82, d: 0.11 }, { f: F5, t: 0.94, d: 0.35 },
        { f: F6, t: 1.35, d: 1.20 }, { f: C6, t: 1.35, d: 1.20 }, { f: A5, t: 1.35, d: 1.20 }
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.001, now + n.t);
        gain.gain.linearRampToValueAtTime(0.24, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.05);
      });
    }

    // -------------------------------------------------------------
    // LOCK SCREEN NOTIFICATIONS
    // -------------------------------------------------------------
    async function requestNotificationPermission() {
      if (!('Notification' in window)) {
        showToast("Web Notifications not supported.");
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        updateNotificationBtnUI(permission);
        if (permission === 'granted') {
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          showToast("Lock-screen alerts enabled!");
        }
      } catch (err) {}
    }

    function updateNotificationBtnUI(permission) {
      const btn = document.getElementById('notifyBtn');
      if (!btn) return;
      if (permission === 'granted') {
        btn.style.color = "var(--accent-green)";
        btn.style.borderColor = "var(--accent-green)";
        btn.innerText = "🔔";
      } else if (permission === 'denied') {
        btn.style.color = "var(--accent-red)";
        btn.style.borderColor = "var(--accent-red)";
        btn.innerText = "🔕";
      } else {
        btn.style.color = "var(--text-dim)";
        btn.style.borderColor = "var(--border)";
        btn.innerText = "🔔";
      }
    }

    async function dispatchRestNotification() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("REST COMPLETE // NEXT SET READY", {
            body: `Recovery elapsed for ${activeStageKey}. Time to strike!`,
            icon: "./assets/icons/icon-192.png",
            badge: "./assets/icons/icon-192.png",
            vibrate: [300, 100, 300, 100, 400],
            tag: "rest-timer-complete",
            renotify: true,
            requireInteraction: true
          });
        }
      } catch (e) {}
    }

    // -------------------------------------------------------------
    // UI RENDERING & TOGGLES
    // -------------------------------------------------------------
        // -------------------------------------------------------------
    // PREHAB INTEL DRAWER
    // -------------------------------------------------------------
    function togglePrehabDrawer(event) {
      if (event) event.stopPropagation(); // Avoid triggering prehab completion toggle
      const drawer = document.getElementById('prehabDrawer');
      const box = document.getElementById('prehabBox');
      const btn = document.getElementById('prehabInfoBtn');
      if (!drawer || !box || !btn) return;

      const isOpen = drawer.classList.toggle('open');
      box.classList.toggle('has-drawer-open', isOpen);
      btn.innerText = isOpen ? 'CLOSE ▴' : 'INTEL ▾';
      if (isOpen) renderPrehabDrawer();
      if (navigator.vibrate) navigator.vibrate(20);
    }

    function renderPrehabDrawer() {
      const container = document.getElementById('prehabDrawerContent');
      const drawer = document.getElementById('prehabDrawer');
      if (!container || !drawer) return;

      if (activeSession.prehabChecked) {
        drawer.classList.add('drawer-cleared');
      } else {
        drawer.classList.remove('drawer-cleared');
      }

      const stageDef = STAGES[activeStageKey];
      const details = (stageDef && stageDef.prehabDetails) ? stageDef.prehabDetails : [];
      container.innerHTML = '';

      details.forEach(drill => {
        const row = document.createElement('div');
        row.className = 'prehab-drill-row';
        row.innerHTML = `
          <div class="prehab-drill-header">
            <span>${drill.name}</span>
            <span class="prehab-drill-dose">${drill.dose}</span>
          </div>
          <div class="prehab-drill-cue">${drill.cue}</div>
        `;
        container.appendChild(row);
      });
    }

    function togglePrehab() {
      activeSession.prehabChecked = !activeSession.prehabChecked;
      if (activeSession.prehabChecked) {
        if (navigator.vibrate) navigator.vibrate(35);
      }
      saveSessionState();
      renderSessionUI();
    }

    function toggleTempo() {
      tempoClean = !tempoClean;
      const btn = document.getElementById('tempoBtn');
      if (tempoClean) {
        btn.classList.add('active-green');
        btn.innerText = "Tempo: Clean (3-0-1)";
      } else {
        btn.classList.remove('active-green');
        btn.innerText = "Tempo: Fast / Sloppy";
      }
    }

    function togglePain() {
      currentSetPain = !currentSetPain;
      const btn = document.getElementById('painBtn');
      if (currentSetPain) {
        btn.classList.add('active-red');
        btn.innerText = "Joint Strain: YES";
        activeSession.jointPain = true;
      } else {
        btn.classList.remove('active-red');
        btn.innerText = "Joint Strain: No";
      }
      saveSessionState();
      renderSessionUI();
    }

    function renderSessionUI() {
      const prehabBox = document.getElementById('prehabBox');
      const statusPill = document.getElementById('prehabStatusPill');
      const prehabTag = document.getElementById('prehabTag');
      const prehabDrawer = document.getElementById('prehabDrawer');
      if (prehabBox && statusPill && prehabTag) {
        if (activeSession.prehabChecked) {
          prehabBox.classList.add('cleared');
          if (prehabDrawer) prehabDrawer.classList.add('drawer-cleared');
          statusPill.innerText = "CLEARED [✓]";
          prehabTag.innerText = "MISSION COMPLETED";
        } else {
          prehabBox.classList.remove('cleared');
          if (prehabDrawer) prehabDrawer.classList.remove('drawer-cleared');
          statusPill.innerText = "PENDING [ ]";
          prehabTag.innerText = "PRE-FLIGHT MISSION";
        }
      }
      renderPrehabDrawer();

      const shield = document.getElementById('shieldStatus');
      if (shield) {
        if (activeSession.jointPain) {
          shield.innerText = "SHIELD: 50%";
          shield.style.borderColor = "var(--accent-red)";
          shield.style.color = "var(--accent-red)";
        } else {
          shield.innerText = "SHIELD: 100%";
          shield.style.borderColor = "var(--accent-green)";
          shield.style.color = "var(--accent-green)";
        }
      }

      updateTonnageDisplay();
      renderSlotStepper();
      updateLogButtonText();

      // Render logged sets list
      const listContainer = document.getElementById('loggedSetsList');
      if (listContainer) {
        listContainer.innerHTML = '';
        activeSession.sets.forEach((s) => {
          const row = document.createElement('div');
          row.className = 'set-row';
          const ringEarned = s.rpe <= 8.0 && s.tempoClean && !s.jointPain;
          row.innerHTML = `
            <span class="set-tag">${s.slot} • S${s.setNum}</span>
            <span class="set-detail">${s.exercise}: ${s.load}lbs × ${s.reps}r @ RPE ${s.rpe}</span>
            <span class="set-badge-ring">${ringEarned ? '★ RING' : 'CHECK'}</span>
          `;
          listContainer.appendChild(row);
        });
      }
    }

    // -------------------------------------------------------------
    // WEBHOOK SYNCHRONIZATION & STAGE CLEAR
    // -------------------------------------------------------------
    function promptWebhookUrl() {
      const modal = document.getElementById('syncModal');
      const input = document.getElementById('webhookInput');
      if (input) input.value = getActiveWebhookUrl();
      if (modal) modal.style.display = 'flex';
    }

    function closeSyncModal() {
      const modal = document.getElementById('syncModal');
      if (modal) modal.style.display = 'none';
    }

    function saveSyncModal() {
      const input = document.getElementById('webhookInput');
      const url = input ? input.value.trim() : '';
      if (url) localStorage.setItem('sonic_sheets_webhook', url);
      else localStorage.removeItem('sonic_sheets_webhook');
      closeSyncModal();
      if (navigator.vibrate) navigator.vibrate(50);
      showToast(url ? "Google Sheets webhook linked!" : "Webhook URL cleared.");
    }

    async function syncSessionToSheets(sessionData) {
      const webhookUrl = getActiveWebhookUrl();
      if (!webhookUrl) return;

      try {
        console.log('[Webhook] Transmitting session telemetry to Google Sheets...');
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
        console.log('[Webhook] Telemetry synced.');
      } catch (err) {
        console.warn('[Webhook] Sync error:', err);
      }
    }

        
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // PILOT EXP & LEVEL PROGRESSION ENGINE
    // -------------------------------------------------------------
    const EXP_TIERS = [
      { level: 1, title: "JUGGERNAUT // RECRUIT", min: 0, max: 150000 },
      { level: 2, title: "JUGGERNAUT // REINFORCED", min: 150000, max: 350000 },
      { level: 3, title: "JUGGERNAUT // VETERAN", min: 350000, max: 650000 },
      { level: 4, title: "JUGGERNAUT // OVERDRIVE", min: 650000, max: 1050000 },
      { level: 5, title: "JUGGERNAUT // APEX MASTER", min: 1050000, max: 2000000 }
    ];

    function getLifetimeExp() {
      const stored = localStorage.getItem("sonic_lifetime_exp");
      if (stored !== null) return parseInt(stored, 10) || 0;
      return 0;
    }

    function addLifetimeExp(pts) {
      const current = getLifetimeExp();
      const updated = current + pts;
      localStorage.setItem('sonic_lifetime_exp', updated);
      updatePilotExpUI();
      return updated;
    }

    function calculatePilotProgress(exp) {
      let tier = EXP_TIERS[0];
      for (let i = EXP_TIERS.length - 1; i >= 0; i--) {
        if (exp >= EXP_TIERS[i].min) {
          tier = EXP_TIERS[i];
          break;
        }
      }

      const isMax = tier.level >= 5;
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

    function setPilotExpDisplay(exp) {
      const info = calculatePilotProgress(exp);
      const lvlEl = document.getElementById('hudPilotLevel') || document.querySelector('.lvl-badge');
      const titleEl = document.getElementById('hudPilotTitle') || document.querySelector('.pilot-title');
      const counterEl = document.getElementById('hudExpCounter') || document.querySelector('.exp-counter');
      const fillEl = document.getElementById('hudExpFill') || document.querySelector('.exp-bar-fill');
      const toNextEl = document.getElementById('hudExpToNext');
      const bracketEl = document.getElementById('hudExpBracket');

      if (lvlEl) lvlEl.innerText = `LVL ${info.level}`;
      if (titleEl) titleEl.innerText = info.title;
      if (counterEl) counterEl.innerText = `${info.exp.toLocaleString()} EXP`;
      if (fillEl) fillEl.style.width = `${info.progressPct}%`;
      if (toNextEl) {
        toNextEl.innerText = info.isMax 
          ? "MAX LEVEL ATTAINED" 
          : `${info.expToNext.toLocaleString()} EXP TO LVL ${info.level + 1}`;
      }
      if (bracketEl) {
        bracketEl.innerText = `${Math.floor(info.tierMin/1000)}K / ${Math.floor(info.tierMax/1000)}K`;
      }
    }

    function updatePilotExpUI() {
      const exp = getLifetimeExp();
      setPilotExpDisplay(exp);
    }

    let pendingStageClearData = null;

    async function finishSession() {
      if (activeSession.sets.length === 0) {
        showToast("Log at least 1 set before clearing stage!");
        return;
      }

      const prehab = activeSession.prehabChecked;
      const anyPain = activeSession.jointPain || activeSession.sets.some(s => s.jointPain);
      const ringBonus = prehab ? (anyPain ? 7500 : 15000) : 0;
      const timeBonus = 20000;
      const totalReps = activeSession.sets.reduce((sum, s) => sum + s.reps, 0);
      const forceBonus = totalReps * 75;

      const ringsBanked = activeSession.sets.filter(s => s.rpe <= 8.0 && s.tempoClean && !s.jointPain).length;
      const redRingBonus = ringsBanked * 10000;
      const totalScore = ringBonus + timeBonus + forceBonus + redRingBonus;

      // Track old vs new EXP without triggering level-up alerts prematurely
      const oldExp = getLifetimeExp();
      const oldProgress = calculatePilotProgress(oldExp);
      const newLifetimeExp = oldExp + totalScore;
      const newProgress = calculatePilotProgress(newLifetimeExp);
      const didLevelUp = newProgress.level > oldProgress.level;

      const rank = totalScore >= 75000 ? "S" : (totalScore >= 55000 ? "A" : "B");

      // Credit local vault
      creditVaultRings(activeStageKey, ringsBanked);

      // Payload for Google Sheets
      const syncPayload = {
        stage: activeStageKey,
        totalScore,
        rank,
        ringsBanked,
        totalReps,
        prehab,
        jointPain: anyPain,
        sets: activeSession.sets
      };

      // Stash pending clear data to reset upon closing results
      pendingStageClearData = { stage: activeStageKey };

      // Render Integrated Results Dossier with sequenced EXP rollup
      renderResultsOverlay({
        stage: activeStageKey,
        totalScore,
        rank,
        ringBonus,
        timeBonus,
        forceBonus,
        redRingBonus,
        ringsBanked,
        totalSets: activeSession.sets.length,
        oldExp,
        newLifetimeExp,
        oldLevel: oldProgress.level,
        newLevel: newProgress.level,
        didLevelUp
      });

      // Transmit to Google Sheets in background
      syncSessionToSheets(syncPayload);
    }

    // -------------------------------------------------------------
    // ARCADE RESULTS DOSSIER: CINEMATIC TALLY & GRADE STAMP
    // -------------------------------------------------------------
    function playScoreTickSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    }

    function playStampImpactSound(rank) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Sub bass drop
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';

        if (rank === 'S') {
          // Massive hydraulic slam & sub bass boom
          sub.frequency.setValueAtTime(140, now);
          sub.frequency.exponentialRampToValueAtTime(32, now + 0.45);
          subGain.gain.setValueAtTime(0.7, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

          // Impact noise burst
          const bufferSize = ctx.sampleRate * 0.15;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = buffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.35, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          whiteNoise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          whiteNoise.start(now);
        } else if (rank === 'A') {
          // Solid martial punch
          sub.frequency.setValueAtTime(160, now);
          sub.frequency.exponentialRampToValueAtTime(45, now + 0.3);
          subGain.gain.setValueAtTime(0.45, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        } else {
          // Standard clean thud
          sub.frequency.setValueAtTime(180, now);
          sub.frequency.exponentialRampToValueAtTime(60, now + 0.2);
          subGain.gain.setValueAtTime(0.25, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        }

        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.6);
      } catch (e) {}
    }

    function animateNumber(element, start, end, duration, prefix = '', suffix = '', onTick) {
      const startTime = performance.now();
      const diff = end - start;
      if (diff === 0) {
        if (element) element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease-out cubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + diff * ease);
          if (element) element.innerText = `${prefix}${current.toLocaleString()}${suffix}`;

          if (onTick && Math.random() > 0.45) onTick();

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            if (element) element.innerText = `${prefix}${end.toLocaleString()}${suffix}`;
            resolve();
          }
        }
        requestAnimationFrame(update);
      });
    }

    async function renderResultsOverlay(data) {
      const stageDef = STAGES[data.stage];
      const modal = document.querySelector('.results-card') || document.getElementById('resultsModal') || document.getElementById('resultsOverlay');
      const overlay = document.getElementById('resultsOverlay');
      
      const stageTitle = document.getElementById('resStageTitle') || document.querySelector('.results-stage-title');
      if (stageTitle) stageTitle.innerText = `${data.stage.replace('_', ' ')} // ${stageDef ? stageDef.name : ''}`;

      const lvlBadge = document.getElementById('resLevelUpBadge') || document.querySelector('.levelup-alert-badge');
      if (lvlBadge) lvlBadge.style.display = 'none';

      const rankCircle = document.getElementById('resRankCircle') || document.querySelector('.rank-circle');
      const rankTier = document.getElementById('resRankTier') || document.querySelector('.rank-tier-text');
      const prehabEl = document.getElementById('resPrehabScore');
      const timeEl = document.getElementById('resTimeScore');
      const forceEl = document.getElementById('resForceScore');
      const ringEl = document.getElementById('resRingScore');
      const totalEl = document.getElementById('resTotalScore') || document.querySelector('.total-val');
      const ringsEarnedEl = document.getElementById('resRingsEarned') || document.querySelector('.rings-earned-row');

      // Ensure In-Modal Experience Bar exists directly inside results card
      let expBlock = document.getElementById('resInModalExpBlock');
      if (!expBlock && modal) {
        expBlock = document.createElement('div');
        expBlock.id = 'resInModalExpBlock';
        expBlock.className = 'results-exp-block';
        expBlock.innerHTML = `
          <div class="res-exp-header">
            <span id="resInModalPilotTitle" class="res-exp-title">PILOT PROGRESS</span>
            <span id="resInModalExpVal" class="res-exp-val">0 EXP</span>
          </div>
          <div class="res-exp-track">
            <div id="resInModalExpFill" class="res-exp-fill"></div>
          </div>
          <div class="res-exp-footer">
            <span id="resInModalLvl">LVL 1</span>
            <span id="resInModalToNext">... EXP TO NEXT LEVEL</span>
          </div>
        `;
        // Insert right after ringsEarnedEl or right before syncStatus
        const syncRow = modal.querySelector('.sync-status-row');
        if (syncRow) {
          modal.insertBefore(expBlock, syncRow);
        } else {
          modal.appendChild(expBlock);
        }
      }

      // Helper to update both in-modal and background EXP displays
      function syncExpViews(currentExp) {
        const info = calculatePilotProgress(currentExp);
        setPilotExpDisplay(currentExp); // Updates main HUD behind modal

        const inVal = document.getElementById('resInModalExpVal');
        const inFill = document.getElementById('resInModalExpFill');
        const inLvl = document.getElementById('resInModalLvl');
        const inNext = document.getElementById('resInModalToNext');
        const inTitle = document.getElementById('resInModalPilotTitle');

        if (inVal) inVal.innerText = `${currentExp.toLocaleString()} EXP`;
        if (inFill) inFill.style.width = `${info.progressPct}%`;
        if (inLvl) inLvl.innerText = `LVL ${info.level} • ${info.title}`;
        if (inNext) inNext.innerText = info.isMax ? "MAX LEVEL" : `${info.expToNext.toLocaleString()} EXP TO LVL ${info.level + 1}`;
        if (inTitle) inTitle.innerText = `PILOT TELEMETRY // LVL ${info.level}`;
      }

      // Initial visual states
      const startExp = data.oldExp !== undefined ? data.oldExp : getLifetimeExp();
      const endExp = data.newLifetimeExp !== undefined ? data.newLifetimeExp : (startExp + data.totalScore);
      syncExpViews(startExp);

      if (expBlock) expBlock.classList.remove('exp-active');

      if (rankCircle) {
        rankCircle.style.opacity = '0';
        rankCircle.style.transform = 'scale(0)';
        rankCircle.className = 'rank-circle ' + (data.rank === 'S' ? 'rank-s' : (data.rank === 'A' ? 'rank-a' : 'rank-b'));
        rankCircle.innerText = data.rank;
      }

      if (rankTier) {
        rankTier.style.opacity = '0';
        rankTier.innerText = `SONIC RANK: ${data.rank}-TIER`;
      }

      if (prehabEl) prehabEl.innerText = '+0 pts';
      if (timeEl) timeEl.innerText = '+0 pts';
      if (forceEl) forceEl.innerText = '+0 pts';
      if (ringEl) ringEl.innerText = '+0 pts';
      if (totalEl) totalEl.innerText = '0 PTS';
      if (ringsEarnedEl) ringsEarnedEl.style.opacity = '0';

      const rowPrehab = prehabEl ? (prehabEl.closest('.res-row') || prehabEl.parentElement) : null;
      const rowTime = timeEl ? (timeEl.closest('.res-row') || timeEl.parentElement) : null;
      const rowForce = forceEl ? (forceEl.closest('.res-row') || forceEl.parentElement) : null;
      const rowRing = ringEl ? (ringEl.closest('.res-row') || ringEl.parentElement) : null;

      [rowPrehab, rowTime, rowForce, rowRing].forEach(el => {
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateX(-20px)';
        }
      });

      overlay.style.display = 'flex';

      const sleep = ms => new Promise(res => setTimeout(res, ms));
      let runningTotal = 0;

      const subscores = [
        { row: rowPrehab, el: prehabEl, val: data.ringBonus },
        { row: rowTime, el: timeEl, val: data.timeBonus },
        { row: rowForce, el: forceEl, val: data.forceBonus },
        { row: rowRing, el: ringEl, val: data.redRingBonus }
      ];

      await sleep(400); // Measured opening gap

      // 1. Slow, deliberate subscore slide-ins (800ms per tally)
      for (const item of subscores) {
        if (item.row) {
          item.row.style.transition = 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
          item.row.style.opacity = '1';
          item.row.style.transform = 'translateX(0)';
        }

        const startTotal = runningTotal;
        runningTotal += item.val;

        await Promise.all([
          animateNumber(item.el, 0, item.val, 800, '+', ' pts', playScoreTickSound),
          animateNumber(totalEl, startTotal, runningTotal, 800, '', ' PTS')
        ]);

        if (navigator.vibrate) navigator.vibrate(15);
        await sleep(350); // Measured pause between subscores
      }

      // 2. Rings banked fade-in
      let stars = '';
      for (let i = 0; i < data.ringsBanked; i++) stars += '★ ';
      for (let i = data.ringsBanked; i < data.totalSets; i++) stars += '☆ ';
      if (ringsEarnedEl) {
        ringsEarnedEl.innerText = `RINGS BANKED: ${stars}(${data.ringsBanked}/${data.totalSets})`;
        ringsEarnedEl.style.transition = 'opacity 0.7s ease';
        ringsEarnedEl.style.opacity = '1';
      }

      // 3. Extended suspenseful anticipation pause before the stamp (1.0s)
      await sleep(1000);

      // 4. THE SLOW-MOTION HYDRAULIC GRADE STAMP (1.15s drop, crisp & upright)
      const rankClass = data.rank === 'S' 
        ? 'stamp-slam-s' 
        : (data.rank === 'A' ? 'stamp-slam-a' : 'stamp-slam-b');
      
      const shakeClass = data.rank === 'S' 
        ? 'screen-shake-heavy' 
        : (data.rank === 'A' ? 'screen-shake-medium' : 'screen-shake-light');

      if (rankCircle) {
        rankCircle.classList.remove('stamp-slam-s', 'stamp-slam-a', 'stamp-slam-b');
        void rankCircle.offsetWidth; // Force reflow
        rankCircle.classList.add(rankClass);
        rankCircle.style.opacity = '1';
      }

      // Delay impact sound & haptics slightly so it lands when stamp contacts the card (~700ms into the 1.15s animation)
      setTimeout(() => {
        playStampImpactSound(data.rank);
        if (modal) {
          modal.classList.remove('screen-shake-heavy', 'screen-shake-medium', 'screen-shake-light');
          void modal.offsetWidth;
          modal.classList.add(shakeClass);
        }
        if (navigator.vibrate) {
          if (data.rank === 'S') navigator.vibrate([100, 40, 300, 60, 180]);
          else if (data.rank === 'A') navigator.vibrate([60, 30, 150]);
          else navigator.vibrate(60);
        }
      }, 720);

      await sleep(1150); // Let full stamp animation settle

      if (rankTier) {
        rankTier.style.transition = 'opacity 0.5s ease';
        rankTier.style.opacity = '1';
      }

      // 5. EXPERIENCE BAR PROGRESSION (Visually rolling points directly on the results card)
      await sleep(700);
      if (expBlock) expBlock.classList.add('exp-active');

      const expDiff = endExp - startExp;
      const expStartTime = performance.now();
      const expDuration = 1400; // Smooth 1.4s deliberate fill animation

      await new Promise((resolve) => {
        function stepExp(now) {
          const elapsed = now - expStartTime;
          const p = Math.min(1, elapsed / expDuration);
          const ease = 1 - Math.pow(1 - p, 3);
          const currentVal = Math.floor(startExp + (expDiff * ease));
          syncExpViews(currentVal);

          if (Math.random() > 0.6) playScoreTickSound();

          if (p < 1) {
            requestAnimationFrame(stepExp);
          } else {
            localStorage.setItem('sonic_lifetime_exp', endExp);
            syncExpViews(endExp);
            resolve();
          }
        }
        requestAnimationFrame(stepExp);
      });

      if (expBlock) expBlock.classList.remove('exp-active');

      // 6. DEFERRED PROMOTION FANFARE (Triggers strictly AFTER the EXP bar finishes filling)
      await sleep(450);

      if (data.didLevelUp) {
        playLevelUpFanfare();
        if (navigator.vibrate) navigator.vibrate([120, 60, 120, 60, 450]);

        if (lvlBadge) {
          lvlBadge.style.display = 'inline-block';
          lvlBadge.className = 'levelup-alert-badge level-up-flare';
          lvlBadge.innerText = `★ LEVEL UP! PILOT PROMOTED TO LVL ${data.newLevel} ★`;
        }
        showToast(`PILOT PROMOTED TO LEVEL ${data.newLevel}!`);
      } else {
        playStageClearFanfare();
      }

      const webhookSet = !!getActiveWebhookUrl();
      const syncText = document.getElementById('resSyncText');
      if (syncText) {
        if (webhookSet) {
          syncText.innerText = "TELEMETRY SYNCED TO COMMAND HUB [✓]";
          syncText.style.color = "var(--accent-green)";
        } else {
          syncText.innerText = "LOCAL LOG RECORDED (STANDALONE)";
          syncText.style.color = "var(--text-dim)";
        }
      }
    }

    function closeResultsOverlay() {
      const overlay = document.getElementById('resultsOverlay');
      if (overlay) overlay.style.display = 'none';

      // Reset active session upon closing results screen
      localStorage.removeItem('sonic_active_session');
      activeSession = { stage: activeStageKey, slotIndex: 0, prehabChecked: false, jointPain: false, sets: [] };
      activeSlotIndex = 0;
      renderSessionUI();
      renderVault();
      if (navigator.vibrate) navigator.vibrate(30);
    }

    function showToast(msg) {
      let toast = document.getElementById('sonicToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sonicToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '80px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = '#141c2e';
        toast.style.border = '1px solid var(--accent-blue)';
        toast.style.color = '#fff';
        toast.style.padding = '10px 18px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '12px';
        toast.style.fontWeight = '700';
        toast.style.zIndex = '99999';
        toast.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)';
        toast.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(toast);
      }
      toast.innerText = msg;
      toast.style.opacity = '1';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.style.display = 'none', 300);
      }, 2500);
    }

    // -------------------------------------------------------------
    // BOOTSTRAP
    // -------------------------------------------------------------

    // -------------------------------------------------------------
    // LIVE GOOGLE SHEETS TELEMETRY SYNC (GET ENDPOINT)
    // -------------------------------------------------------------
    async function syncStateFromSheet() {
      const webhookUrl = getActiveWebhookUrl();
      if (!webhookUrl || webhookUrl.includes('YOUR_APPS_SCRIPT_WEBHOOK_URL_HERE')) return;

      try {
        console.log('[Telemetry] Querying Google Sheet for live pilot telemetry...');
        const res = await fetch(webhookUrl);
        if (!res.ok) return;
        const data = await res.json();

        if (data && data.status === 'success') {
          console.log('[Telemetry] Synchronized with Google Sheet:', data);

          if (data.lifetimeExp !== undefined) {
            localStorage.setItem('sonic_lifetime_exp', data.lifetimeExp);
            updatePilotExpUI();
          }

          if (data.vault && Array.isArray(data.vault) && data.vault.length > 0) {
            saveVaultData(data.vault);
            renderVault();
          }

          if (data.prVault && typeof data.prVault === 'object') {
            savePRVault(data.prVault);
            console.log('[Telemetry] Synchronized PR Vault from Command Core:', data.prVault);
            // Refresh dynamic load for active slot
            const curSlotDef = STAGES[activeStageKey].slots[activeSlotIndex];
            const curEx = document.getElementById('exerciseSelect') ? document.getElementById('exerciseSelect').value : curSlotDef.primary;
            applyDynamicWorkingLoad(curEx, curSlotDef.target, curSlotDef.defaultLoad);
          }
        }
      } catch (err) {
        console.warn('[Telemetry] Sync query error (offline mode active):', err);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      syncStateFromSheet();
      updateAudioThemeBtnUI();
      setTimerDuration(configuredRestSeconds, false);
      loadSessionState();
      renderVault();

      if ('Notification' in window) {
        updateNotificationBtnUI(Notification.permission);
      }

      const savedEnd = parseInt(localStorage.getItem('sonic_timer_end'), 10);
      if (savedEnd && savedEnd > Date.now()) {
        timerEndTime = savedEnd;
        syncTimerDelta();
        timerInterval = setInterval(syncTimerDelta, 250);
      } else {
        localStorage.removeItem('sonic_timer_end');
      }
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('[SW] Registered:', reg.scope))
          .catch(err => console.error('[SW] Registration failed:', err));
      });
    }
