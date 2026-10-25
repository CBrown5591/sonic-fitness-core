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
            alts: ["Barbell Deadlift (Standard Bar)", "Glute Bridge / DB RDL (to Bench)", "Supported Romanian Deadlift (RDL)"]
          },
          {
            slot: "A2",
            target: "3x8-10",
            primary: "Chest-Supported Dumbbell Row",
            defaultLoad: 50,
            alts: ["Chest-Supported Dumbbell Row", "Seated Cable Row / Incline Machine Row", "Lat Pulldown (Neutral/Mag-Grip)"]
          },
          {
            slot: "A3",
            target: "3x8-10",
            primary: "Neutral-Grip DB Floor Press",
            defaultLoad: 60,
            alts: ["Neutral-Grip DB Floor Press", "Incline Push-Up (Hands on Bench)", "Incline DB Bench Press (30°)"]
          },
          {
            slot: "A4",
            target: "3x10-12",
            primary: "Cable Pallof Press",
            defaultLoad: 30,
            alts: ["Cable Pallof Press", "Tall-Kneeling Pallof Hold", "Suitcase Carry (Single-Arm)"]
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
            primary: "Goblet Squat (Tempo 3-0-1)",
            defaultLoad: 70,
            alts: ["Goblet Squat (Tempo 3-0-1)", "Bodyweight Squat / TRX Squat", "DB Bulgarian Split Squat"]
          },
          {
            slot: "B2",
            target: "3x8-10",
            primary: "Half-Kneeling Landmine Press",
            defaultLoad: 45,
            alts: ["Half-Kneeling Landmine Press", "Half-Kneeling Cable Press", "Neutral-Grip DB Floor Press"]
          },
          {
            slot: "B3",
            target: "3x8-10",
            primary: "Supported Romanian Deadlift (RDL)",
            defaultLoad: 65,
            alts: ["Supported Romanian Deadlift (RDL)", "B-Stance DB Hinge", "Barbell Deadlift (Standard Bar)"]
          },
          {
            slot: "B4",
            target: "3x12-15",
            primary: "Cable External Rotations",
            defaultLoad: 15,
            alts: ["Cable External Rotations", "Side-Lying DB External Rotation", "Prone Scapular Y-T-W Raises"]
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
            alts: ["DB Bulgarian Split Squat", "Supported Reverse Lunge (Rack/Wall)", "Goblet Squat (Tempo 3-0-1)"]
          },
          {
            slot: "C2",
            target: "3x8-10",
            primary: "Lat Pulldown (Neutral/Mag-Grip)",
            defaultLoad: 130,
            alts: ["Lat Pulldown (Neutral/Mag-Grip)", "Half-Kneeling Single-Arm Pulldown", "Chest-Supported Dumbbell Row"]
          },
          {
            slot: "C3",
            target: "3x8-10",
            primary: "Incline DB Bench Press (30°)",
            defaultLoad: 65,
            alts: ["Incline DB Bench Press (30°)", "Neutral-Grip Flat DB Bench", "Neutral-Grip DB Floor Press"]
          },
          {
            slot: "C4",
            target: "3x40-50 paces",
            primary: "Farmer's Carries",
            defaultLoad: 70,
            alts: ["Farmer's Carries", "Suitcase Carry (Single-Arm)", "Cable Pallof Press"]
          }
        ]
      }
    };

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
  { exercise: "Farmer's Carries", focus: "Carry", rings: 0 },
  { exercise: "Aegis Striker (Push Progression)", focus: "Horizontal Push", rings: 0 },
  { exercise: "Kinetic Stride (Squat Progression)", focus: "Squat", rings: 0 },
  { exercise: "Pillar Stride (Lunge Progression)", focus: "Single Leg", rings: 0 },
  { exercise: "Gale Retractor (Pull Progression)", focus: "Horizontal Pull", rings: 0 }
];

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

      // Set default load
      document.getElementById('loadInput').value = slotDef.defaultLoad;

      updateLogButtonText();
    }

    function onExerciseChange() {
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

      activeSession.sets.push({
        slot: slotDef.slot,
        exercise,
        setNum: setsInSlot,
        load,
        reps,
        rpe,
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
        "DAY_C": "Neutral-Grip Flat DB Bench"
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
      const stored = localStorage.getItem('sonic_lifetime_exp');
      if (stored !== null) return parseInt(stored, 10) || 0;
      // Default initial baseline from logged sessions
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

    function updatePilotExpUI() {
      const exp = getLifetimeExp();
      const info = calculatePilotProgress(exp);

      const lvlEl = document.getElementById('hudPilotLevel');
      const titleEl = document.getElementById('hudPilotTitle');
      const counterEl = document.getElementById('hudExpCounter');
      const fillEl = document.getElementById('hudExpFill');
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

      // Check for Level Up milestone
      const oldProgress = calculatePilotProgress(getLifetimeExp());
      const newLifetimeExp = addLifetimeExp(totalScore);
      const newProgress = calculatePilotProgress(newLifetimeExp);
      const didLevelUp = newProgress.level > oldProgress.level;

      if (didLevelUp) {
        playLevelUpFanfare();
        if (navigator.vibrate) navigator.vibrate([120, 60, 120, 60, 450]);
        showToast(`PILOT PROMOTED TO LEVEL ${newProgress.level}!`);
      } else {
        playStageClearFanfare();
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
      }

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

      // Render Integrated Results Dossier
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
        didLevelUp,
        newLevel: newProgress.level
      });

      // Transmit to Google Sheets in background
      syncSessionToSheets(syncPayload);
    }

    function renderResultsOverlay(data) {
      const stageDef = STAGES[data.stage];
      document.getElementById('resStageTitle').innerText = `${data.stage.replace('_', ' ')} // ${stageDef ? stageDef.name : ''}`;

      const lvlBadge = document.getElementById('resLevelUpBadge');
      if (lvlBadge) {
        if (data.didLevelUp) {
          lvlBadge.style.display = 'inline-block';
          lvlBadge.innerText = `★ LEVEL UP! PILOT PROMOTED TO LVL ${data.newLevel} ★`;
        } else {
          lvlBadge.style.display = 'none';
        }
      }
      
      const rankCircle = document.getElementById('resRankCircle');
      rankCircle.innerText = data.rank;
      rankCircle.className = 'rank-circle ' + (data.rank === 'S' ? 'rank-s' : (data.rank === 'A' ? 'rank-a' : 'rank-b'));

      document.getElementById('resRankTier').innerText = `SONIC RANK: ${data.rank}-TIER`;
      document.getElementById('resPrehabScore').innerText = `+${data.ringBonus.toLocaleString()} pts`;
      document.getElementById('resTimeScore').innerText = `+${data.timeBonus.toLocaleString()} pts`;
      document.getElementById('resForceScore').innerText = `+${data.forceBonus.toLocaleString()} pts`;
      document.getElementById('resRingScore').innerText = `+${data.redRingBonus.toLocaleString()} pts`;
      document.getElementById('resTotalScore').innerText = `${data.totalScore.toLocaleString()} PTS`;

      let stars = '';
      for (let i = 0; i < data.ringsBanked; i++) stars += '★ ';
      for (let i = data.ringsBanked; i < data.totalSets; i++) stars += '☆ ';
      document.getElementById('resRingsEarned').innerText = `RINGS BANKED: ${stars}(${data.ringsBanked}/${data.totalSets})`;

      const webhookSet = !!getActiveWebhookUrl();
      const syncText = document.getElementById('resSyncText');
      if (webhookSet) {
        syncText.innerText = "TELEMETRY SYNCED TO COMMAND HUB [✓]";
        syncText.style.color = "var(--accent-green)";
      } else {
        syncText.innerText = "LOCAL LOG RECORDED (STANDALONE)";
        syncText.style.color = "var(--text-dim)";
      }

      const overlay = document.getElementById('resultsOverlay');
      overlay.style.display = 'flex';
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
    document.addEventListener('DOMContentLoaded', () => {
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
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('[SW] Registered within repo scope:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}
