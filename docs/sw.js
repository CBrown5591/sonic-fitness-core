<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Sonic Fitness HUD // Modular Rig</title>
  <link rel="manifest" href="./manifest.json">
  <meta name="theme-color" content="#060911">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="./assets/icons/icon-192.png">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #141c2e;
      --accent-blue: #00e5ff;
      --accent-gold: #ffc400;
      --accent-red: #ff3d00;
      --accent-green: #00e676;
      --accent-purple: #b388ff;
      --text: #ffffff;
      --text-dim: #90a4ae;
      --border: #263238;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding-bottom: 90px; }

    .hud-header {
      background: #060911;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--accent-blue);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .hud-left { display: flex; align-items: center; gap: 8px; }
    .hud-title { font-size: 15px; font-weight: 800; letter-spacing: 1px; color: var(--accent-blue); }
    .shield-badge {
      background: rgba(0, 230, 118, 0.15);
      border: 1px solid var(--accent-green);
      color: var(--accent-green);
      padding: 3px 8px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }

    .container { padding: 14px; }

    /* Stage Selector Bar */
    .stage-nav {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-bottom: 12px;
    }
    .stage-tab {
      background: #141c2e;
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 8px 4px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .stage-tab.active {
      background: rgba(0, 229, 255, 0.15);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }

    /* Stage Mission Card */
    .stage-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .stage-label { color: var(--accent-gold); font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .stage-name { font-size: 17px; font-weight: 800; margin-top: 2px; }
    .tonnage-pill {
      background: rgba(179, 136, 255, 0.15);
      border: 1px solid var(--accent-purple);
      color: var(--accent-purple);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-align: right;
    }

            /* High-Visibility Prehab Mission Banner & Intel Drawer */
    .prehab-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(255, 196, 0, 0.12);
      border: 1.5px solid var(--accent-gold);
      padding: 12px 14px;
      border-radius: 10px;
      margin-bottom: 12px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(255, 196, 0, 0.15);
      transition: all 0.2s ease;
    }
    .prehab-box.has-drawer-open {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      margin-bottom: 0;
    }
    .prehab-box.cleared {
      background: rgba(0, 230, 118, 0.12);
      border-color: var(--accent-green);
      box-shadow: 0 0 10px rgba(0, 230, 118, 0.15);
    }
    .prehab-box.cleared.has-drawer-open {
      border-bottom-color: rgba(0, 230, 118, 0.3);
    }
    .prehab-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .prehab-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--accent-gold);
      text-transform: uppercase;
    }
    .prehab-box.cleared .prehab-tag {
      color: var(--accent-green);
    }
    .prehab-title {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }
    .btn-prehab-info {
      background: rgba(255, 196, 0, 0.15);
      border: 1px solid var(--accent-gold);
      color: var(--accent-gold);
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .prehab-box.cleared .btn-prehab-info {
      border-color: var(--accent-green);
      color: var(--accent-green);
      background: rgba(0, 230, 118, 0.15);
    }
    .prehab-status-pill {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--accent-gold);
      color: var(--accent-gold);
      padding: 4px 10px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }
    .prehab-box.cleared .prehab-status-pill {
      border-color: var(--accent-green);
      color: var(--accent-green);
      background: rgba(0, 230, 118, 0.15);
    }

    /* Expandable Prehab Intel Drawer */
    .prehab-drawer {
      display: none;
      background: #0b0f19;
      border: 1.5px solid var(--accent-gold);
      border-top: none;
      border-radius: 0 0 10px 10px;
      padding: 12px 14px;
      margin-bottom: 14px;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
      animation: drawerSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .prehab-drawer.drawer-cleared {
      border-color: var(--accent-green);
    }
    @keyframes drawerSlideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .prehab-drill-row {
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }
    .prehab-drill-row:first-child { padding-top: 2px; }
    .prehab-drill-row:last-child { border-bottom: none; padding-bottom: 2px; }
    .prehab-drill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      color: #fff;
    }
    .prehab-drill-dose {
      color: var(--accent-gold);
      font-size: 11px;
      font-weight: 800;
      background: rgba(255, 196, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .prehab-drawer.drawer-cleared .prehab-drill-dose {
      color: var(--accent-green);
      background: rgba(0, 230, 118, 0.1);
    }
    .prehab-drill-cue {
      color: var(--text-dim);
      font-size: 11px;
      margin-top: 3px;
      line-height: 1.35;
    }

    /* Slot Progress Stepper (A1, A2, A3, A4) */
    .slot-stepper {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
    }
    .slot-btn {
      flex: 1;
      background: #141c2e;
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 8px 4px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      text-align: center;
    }
    .slot-btn.active {
      background: rgba(0, 229, 255, 0.2);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
    }
    .slot-btn.completed {
      border-color: var(--accent-green);
      color: var(--accent-green);
    }
    .slot-btn.completed.active {
      border-color: var(--accent-blue);
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
      background: rgba(0, 230, 118, 0.15);
      color: var(--accent-green);
    }

    /* Active Movement Card */
    .movement-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .move-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .slot-tag { color: var(--accent-blue); font-size: 12px; font-weight: 800; }
    .target-tag { color: var(--accent-gold); font-size: 12px; font-weight: 700; }
    
    .exercise-select {
      width: 100%;
      background: #0b0f19;
      border: 1px solid var(--border);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 12px;
      outline: none;
    }

    .input-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }
    .input-box { background: #0b0f19; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); }
    .input-box label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; display: block; margin-bottom: 2px; }
    .input-box input, .input-box select {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 17px;
      font-weight: 700;
      width: 100%;
      outline: none;
    }

    .toggle-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .btn-toggle {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #0b0f19;
      color: var(--text-dim);
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
    }
    .btn-toggle.active-green { background: rgba(0, 230, 118, 0.2); border-color: var(--accent-green); color: var(--accent-green); }
    .btn-toggle.active-red { background: rgba(255, 61, 0, 0.2); border-color: var(--accent-red); color: var(--accent-red); }

    .btn-log {
      width: 100%;
      background: var(--accent-blue);
      color: #000;
      border: none;
      padding: 13px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
    }

    /* Vault Drawer Toggle Bar */
    .vault-toggle-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(179, 136, 255, 0.1);
      border: 1px solid var(--accent-purple);
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 14px;
      cursor: pointer;
    }
    .vault-title { font-size: 13px; font-weight: 800; color: var(--accent-purple); display: flex; align-items: center; gap: 6px; }

    /* Collapsible Vault Content */
    #vaultDrawer {
      display: none;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .vault-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
    }
    .vault-item:last-child { border-bottom: none; }
    .vault-move { font-weight: 700; color: #fff; }
    .vault-focus { color: var(--text-dim); font-size: 10px; }
    .vault-rings { color: var(--accent-gold); font-weight: 800; letter-spacing: 2px; }

    /* Logged Sets Feed */
    .logged-sets-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .set-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0b0f19;
      border: 1px solid var(--border);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
    }
    .set-tag { font-weight: 800; color: var(--accent-blue); }
    .set-detail { color: var(--text-dim); }
    .set-badge-ring { color: var(--accent-gold); font-weight: 700; font-size: 11px; }

    /* Bottom Recovery Dock */
    .rest-dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #060911;
      border-top: 1px solid var(--border);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 90;
    }
    .timer-val { font-size: 22px; font-weight: 900; color: var(--accent-gold); }
    .btn-advance {
      background: var(--accent-green);
      color: #000;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .timer-selector { display: flex; gap: 5px; align-items: center; }
    .btn-pill {
      background: #141c2e;
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-pill.active {
      background: rgba(0, 229, 255, 0.2);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }
  

    /* Integrated Results Dossier Overlay */
    .results-overlay {
      position: fixed;
      inset: 0;
      background: rgba(6, 9, 17, 0.92);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: 10000;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      animation: resultsFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes resultsFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .results-card {
      width: 100%;
      max-width: 400px;
      background: #141c2e;
      border: 2px solid var(--accent-gold);
      border-radius: 16px;
      padding: 24px 20px;
      box-shadow: 0 0 35px rgba(255, 196, 0, 0.22), 0 10px 40px rgba(0, 0, 0, 0.6);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .results-banner {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: var(--accent-gold);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .results-stage-title {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 16px;
    }
    .rank-badge-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
    }
    .rank-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44px;
      font-weight: 900;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, rgba(20, 28, 46, 0.8) 70%);
      border: 3px solid var(--accent-blue);
      color: var(--accent-blue);
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
      margin-bottom: 8px;
    }
    .rank-circle.rank-s {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background: radial-gradient(circle, rgba(255, 196, 0, 0.3) 0%, rgba(20, 28, 46, 0.8) 70%);
      box-shadow: 0 0 25px rgba(255, 196, 0, 0.5);
    }
    .rank-circle.rank-a {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    }
    .rank-circle.rank-b {
      border-color: var(--accent-purple);
      color: var(--accent-purple);
      box-shadow: 0 0 15px rgba(179, 136, 255, 0.4);
    }
    .rank-tier-text {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--text-dim);
    }

    .score-summary-grid {
      width: 100%;
      background: #0b0f19;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .score-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-dim);
      font-weight: 600;
    }
    .score-line span:last-child {
      color: #fff;
      font-weight: 700;
    }

    .total-score-box {
      width: 100%;
      background: rgba(255, 196, 0, 0.1);
      border: 1.5px solid var(--accent-gold);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 14px;
    }
    .total-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--accent-gold);
    }
    .total-val {
      font-size: 26px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .rings-earned-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--accent-gold);
      font-weight: 800;
      margin-bottom: 14px;
    }

    .sync-status-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--accent-green);
      font-weight: 700;
      margin-bottom: 18px;
    }
    .sync-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
      box-shadow: 0 0 8px var(--accent-green);
      display: inline-block;
      animation: pulseSync 1.5s infinite ease-in-out;
    }
    @keyframes pulseSync {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .btn-return-rig {
      width: 100%;
      background: var(--accent-green);
      color: #000;
      border: none;
      padding: 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: transform 0.1s ease;
    }
    .btn-return-rig:active {
      transform: scale(0.98);
    }

</style>
</head>
<body>

  <div class="hud-header">
    <div class="hud-left">
      <div class="hud-title">SONIC HUD // RIG</div>
      <div class="shield-badge" id="shieldStatus">SHIELD: 100%</div>
    </div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <button id="notifyBtn" onclick="requestNotificationPermission()" style="background: none; border: 1px solid var(--border); color: var(--text-dim); padding: 4px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">🔔</button>
      <button onclick="promptWebhookUrl()" style="background: none; border: 1px solid var(--border); color: var(--accent-blue); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">SYNC ⚙</button>
    </div>
  </div>

  <div class="container">
    <!-- Stage Switching Bar -->
    <div class="stage-nav">
      <div class="stage-tab active" id="tab-DAY_A" onclick="selectStage('DAY_A')">DAY A // HINGE</div>
      <div class="stage-tab" id="tab-DAY_B" onclick="selectStage('DAY_B')">DAY B // KNEE</div>
      <div class="stage-tab" id="tab-DAY_C" onclick="selectStage('DAY_C')">DAY C // TOTAL</div>
    </div>

    <!-- Active Stage Info Card -->
    <div class="stage-card">
      <div>
        <div class="stage-label" id="stageFocus">STAGE CLEAR ZONE // DAY A</div>
        <div class="stage-name" id="stageName">Hinge & Horizontal Power</div>
      </div>
      <div class="tonnage-pill" id="tonnageDisplay">VOL: 0 LBS</div>
    </div>

        <!-- Prehab Checklist Banner with Expandable Intel Drawer -->
    <div class="prehab-box" id="prehabBox" onclick="togglePrehab()">
      <div class="prehab-content">
        <span class="prehab-tag" id="prehabTag">PRE-FLIGHT MISSION</span>
        <span class="prehab-title" id="prehabLabel">McGill Big 3 + Band Pull-Aparts & Face Pulls</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn-prehab-info" id="prehabInfoBtn" onclick="togglePrehabDrawer(event)" title="View Movement Cues & Prescription">INTEL ▾</button>
        <div class="prehab-status-pill" id="prehabStatusPill">PENDING [ ]</div>
      </div>
    </div>

    <!-- Expandable Prehab Intel Drawer -->
    <div id="prehabDrawer" class="prehab-drawer">
      <div id="prehabDrawerContent">
        <!-- Rendered dynamically per stage -->
      </div>
    </div>

    <!-- Slot Progression Stepper -->
    <div class="slot-stepper" id="slotStepper">
      <!-- Generated via JS -->
    </div>

    <!-- Movement Execution Card -->
    <div class="movement-card">
      <div class="move-meta">
        <span class="slot-tag" id="currentSlotTag">SLOT A1</span>
        <span class="target-tag" id="currentTargetTag">TARGET: 3x6-8</span>
      </div>

      <select class="exercise-select" id="exerciseSelect" onchange="onExerciseChange()">
        <!-- Generated via JS -->
      </select>

      <div class="input-grid-3">
        <div class="input-box">
          <label>Load (Lbs)</label>
          <input type="number" id="loadInput" value="135" step="5">
        </div>
        <div class="input-box">
          <label>Reps</label>
          <input type="number" id="repsInput" value="8">
        </div>
        <div class="input-box">
          <label>RPE</label>
          <select id="rpeSelect">
            <option value="6.5">6.5</option>
            <option value="7.0">7.0</option>
            <option value="7.5" selected>7.5</option>
            <option value="8.0">8.0 ★</option>
            <option value="8.5">8.5</option>
            <option value="9.0">9.0</option>
          </select>
        </div>
      </div>

      <div class="toggle-row">
        <div class="btn-toggle active-green" id="tempoBtn" onclick="toggleTempo()">Tempo: Clean (3-0-1)</div>
        <div class="btn-toggle" id="painBtn" onclick="togglePain()">Joint Strain: No</div>
      </div>

      <button class="btn-log" id="logSetBtn" onclick="logActiveSet()">LOG SET 1 & START REST</button>
      <div id="loggedSetsList" class="logged-sets-list"></div>
    </div>

    <!-- Vault Drawer Toggle Bar -->
    <div class="vault-toggle-bar" onclick="toggleVaultDrawer()">
      <div class="vault-title">
        <span>★ 5-RING MASTERY VAULT</span>
      </div>
      <div style="font-size: 12px; color: var(--accent-purple); font-weight: 700;" id="vaultToggleIcon">EXPAND ▾</div>
    </div>

    <!-- Collapsible Vault Content -->
    <div id="vaultDrawer">
      <div id="vaultItemsContainer">
        <!-- Rendered dynamically from storage -->
      </div>
    </div>
  </div>

  <!-- Webhook Settings Modal -->
  <div id="syncModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center; padding:20px;">
    <div style="background:#141c2e; border:1px solid var(--accent-blue); border-radius:12px; padding:20px; width:100%; max-width:400px;">
      <h3 style="color:var(--accent-blue); margin-bottom:12px; font-size:16px;">LINK GOOGLE SHEETS</h3>
      <p style="color:var(--text-dim); font-size:12px; margin-bottom:12px;">Paste your Google Apps Script Webhook URL:</p>
      <input type="text" id="webhookInput" placeholder="https://script.google.com/macros/s/.../exec" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border); background:#0b0f19; color:#fff; font-size:13px; margin-bottom:16px; outline:none;">
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button onclick="closeSyncModal()" style="background:#263238; color:#fff; border:none; padding:8px 14px; border-radius:6px; font-weight:700; font-size:12px; cursor:pointer;">Cancel</button>
        <button onclick="saveSyncModal()" style="background:var(--accent-green); color:#000; border:none; padding:8px 16px; border-radius:6px; font-weight:800; font-size:12px; cursor:pointer;">Save</button>
      </div>
    </div>
  </div>

  <!-- Rest Dock -->
  <div class="rest-dock">
    <div>
      <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Recovery Timer</div>
      <div class="timer-val" id="timerClock">01:30</div>
    </div>

    <div class="timer-selector">
      <button class="btn-pill" id="pill-60" onclick="setTimerDuration(60)">60s</button>
      <button class="btn-pill active" id="pill-90" onclick="setTimerDuration(90)">90s</button>
      <button class="btn-pill" id="pill-120" onclick="setTimerDuration(120)">120s</button>
    </div>

    <button class="btn-advance" onclick="finishSession()">CLEAR STAGE</button>
  </div>

  <script>
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
            primary: "Trap Bar Deadlift (High Handles)",
            defaultLoad: 225,
            alts: ["Trap Bar Deadlift (High Handles)", "Glute Bridge / DB RDL (to Bench)", "Supported Romanian Deadlift (RDL)"]
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
          { name: "Tibialis Wall Raises", dose: "2 sets × 15–20 reps", cue: "Heels 12" from wall. Flex toes hard to shins to buffer patellar load." },
          { name: "90/90 Hip Switches", dose: "2 sets × 8 reps / side", cue: "Upright tall torso. Smoothly rotate internal & external hip capsules." },
          { name: "Prone Scapular Y-T-W Raises", dose: "1–2 sets × 6 reps / position", cue: "Thumbs up to ceiling. Fire lower traps & posterior rotator cuff." }
        ],
        slots: [
          {
            slot: "B1",
            target: "3x8-10",
            primary: "Goblet Box Squat (to 90° Bench)",
            defaultLoad: 70,
            alts: ["Goblet Box Squat (to 90° Bench)", "Bodyweight Box Squat / TRX Squat", "DB Bulgarian Split Squat"]
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
            alts: ["Supported Romanian Deadlift (RDL)", "B-Stance DB Hinge", "Trap Bar Deadlift (High Handles)"]
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
            alts: ["DB Bulgarian Split Squat", "Supported Reverse Lunge (Rack/Wall)", "Goblet Box Squat (to 90° Bench)"]
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
      { exercise: "Trap Bar Deadlift (High Handles)", focus: "Hinge", rings: 4 },
      { exercise: "Chest-Supported Dumbbell Row", focus: "Horizontal Pull", rings: 3 },
      { exercise: "Neutral-Grip DB Floor Press", focus: "Horizontal Push", rings: 3 },
      { exercise: "Cable Pallof Press", focus: "Core", rings: 2 },
      { exercise: "Goblet Box Squat (to 90° Bench)", focus: "Squat", rings: 5 },
      { exercise: "Half-Kneeling Landmine Press", focus: "Vertical Push", rings: 2 },
      { exercise: "Supported Romanian Deadlift (RDL)", focus: "Hinge", rings: 3 },
      { exercise: "Cable External Rotations", focus: "Shoulder Rehab", rings: 2 },
      { exercise: "DB Bulgarian Split Squat", focus: "Single Leg", rings: 2 },
      { exercise: "Lat Pulldown (Neutral/Mag-Grip)", focus: "Vertical Pull", rings: 3 },
      { exercise: "Incline DB Bench Press (30°)", focus: "Horizontal Push", rings: 3 },
      { exercise: "Farmer's Carries", focus: "Carry", rings: 2 }
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

    const DEFAULT_WEBHOOK_URL = "";

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
        "DAY_A": "Trap Bar Deadlift (High Handles)",
        "DAY_B": "Goblet Box Squat (to 90° Bench)",
        "DAY_C": "Neutral-Grip Flat DB Bench"
      };
      const targetName = stageMap[stageKey] || "Trap Bar Deadlift (High Handles)";
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

    function playStageClearFanfare() {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const notes = [
          { freq: 392.00, time: 0.00, dur: 0.10 },
          { freq: 523.25, time: 0.10, dur: 0.10 },
          { freq: 659.25, time: 0.20, dur: 0.10 },
          { freq: 783.99, time: 0.30, dur: 0.12 },
          { freq: 1046.50, time: 0.42, dur: 0.55 },
          { freq: 523.25, time: 0.42, dur: 0.55 },
          { freq: 659.25, time: 0.42, dur: 0.55 }
        ];

        notes.forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          gain.gain.setValueAtTime(0.22, now + note.time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur + 0.05);
        });
      } catch (e) {}
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

      if (drawer.style.display === 'block') {
        drawer.style.display = 'none';
        box.classList.remove('has-drawer-open');
        btn.innerText = 'INTEL ▾';
      } else {
        renderPrehabDrawer();
        drawer.style.display = 'block';
        box.classList.add('has-drawer-open');
        btn.innerText = 'CLOSE ▴';
      }
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

        let pendingStageClearData = null;

    async function finishSession() {
      if (activeSession.sets.length === 0) {
        showToast("Log at least 1 set before clearing stage!");
        return;
      }

      playStageClearFanfare();
      if (navigator.vibrate) navigator.vibrate([100, 50, 200]);

      const prehab = activeSession.prehabChecked;
      const anyPain = activeSession.jointPain || activeSession.sets.some(s => s.jointPain);
      const ringBonus = prehab ? (anyPain ? 7500 : 15000) : 0;
      const timeBonus = 20000;
      const totalReps = activeSession.sets.reduce((sum, s) => sum + s.reps, 0);
      const forceBonus = totalReps * 75;

      const ringsBanked = activeSession.sets.filter(s => s.rpe <= 8.0 && s.tempoClean && !s.jointPain).length;
      const redRingBonus = ringsBanked * 10000;
      const totalScore = ringBonus + timeBonus + forceBonus + redRingBonus;
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
        totalSets: activeSession.sets.length
      });

      // Transmit to Google Sheets in background
      syncSessionToSheets(syncPayload);
    }

    function renderResultsOverlay(data) {
      const stageDef = STAGES[data.stage];
      document.getElementById('resStageTitle').innerText = `${data.stage.replace('_', ' ')} // ${stageDef ? stageDef.name : ''}`;
      
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
  </script>


  <!-- Integrated Results Dossier Overlay -->
  <div id="resultsOverlay" class="results-overlay">
    <div class="results-card">
      <div class="results-banner">STAGE CLEAR // MISSION COMPLETE</div>
      <div class="results-stage-title" id="resStageTitle">DAY A: HINGE & HORIZONTAL</div>
      
      <div class="rank-badge-wrap">
        <div class="rank-circle" id="resRankCircle">S</div>
        <div class="rank-tier-text" id="resRankTier">SONIC RANK: S-TIER</div>
      </div>

      <div class="score-summary-grid">
        <div class="score-line">
          <span>Prehab Shielding</span>
          <span id="resPrehabScore">+15,000 pts</span>
        </div>
        <div class="score-line">
          <span>Aerobic Engine / Time</span>
          <span id="resTimeScore">+20,000 pts</span>
        </div>
        <div class="score-line">
          <span>Force Tonnage</span>
          <span id="resForceScore">+6,750 pts</span>
        </div>
        <div class="score-line">
          <span>Star Rings Banked</span>
          <span id="resRingScore">+40,000 pts</span>
        </div>
      </div>

      <div class="total-score-box">
        <div class="total-label">FINAL MISSION SCORE</div>
        <div class="total-val" id="resTotalScore">81,750 PTS</div>
      </div>

      <div class="rings-earned-row" id="resRingsEarned">
        <!-- Rendered dynamically -->
      </div>

      <div class="sync-status-row" id="resSyncStatus">
        <span class="sync-dot"></span>
        <span id="resSyncText">SYNCING TELEMETRY TO COMMAND HUB...</span>
      </div>

      <button class="btn-return-rig" onclick="closeResultsOverlay()">BANK DATA & RETURN TO RIG</button>
    </div>
  </div>

</body>
</html>
