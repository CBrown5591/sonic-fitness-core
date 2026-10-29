// -------------------------------------------------------------
// TACTICAL FLIGHT PATH // FATIGUE & RECON AUTO-ROUTING ENGINE
// Modular Engine: flightPath.js
// -------------------------------------------------------------

export const FLIGHT_PATH_ROUTING = {
  DAY_G: {
    next: "DAY_A",
    title: "DAY A // Hinge & Horizontal Power",
    reason: "Aerobic Engine Flushed: Systemic blood flow maximized and DOMS cleared. Full-power compound strength cleared.",
    tag: "⚡ TACTICAL RECON // MAXIMUM POWER"
  },
  DAY_H: {
    next: "DAY_D",
    title: "DAY D // Trunk Fortress & Core Integrity",
    reason: "Metcon Completed: High-density machine & cable volume logged. Core pillar anti-rotation advised.",
    tag: "🛡️ TACTICAL RECON // CORE FORTRESS"
  },
  DAY_I: {
    next: "DAY_A",
    title: "DAY A // Hinge & Horizontal Power",
    reason: "Bodyweight Mobility Flow Complete: Active joint restoration cleared for heavy compound reloading.",
    tag: "⚡ TACTICAL RECON // MAXIMUM POWER"
  },
  DAY_A: {
    next: "DAY_B",
    title: "DAY B // Knee Stability & Shoulder Rehab",
    reason: "Antagonist Rotation: Posterior chain (hamstrings/glutes) and chest/lats from DAY A are in active protein synthesis. Quad tracking and rotator cuff prehab are fully primed.",
    tag: "⚡ TACTICAL RECON // BALANCED SORTIE"
  },
  DAY_B: {
    next: "DAY_C",
    title: "DAY C // Full-Body Capacity & Hinge Resilience",
    reason: "Volume Shift: Anterior quad and pressing load cleared from Day B. Full-body tension, heavy carries, and lat recruitment are cleared for takeoff.",
    tag: "⚡ TACTICAL RECON // SYSTEM ENGAGED"
  },
  DAY_C: {
    next: "DAY_D",
    title: "DAY D // Trunk Fortress & Core Integrity",
    reason: "Axial Decompression: Heavy compound carries and leg work cleared. Anti-rotation core pillar and pelvic stabilization primed.",
    tag: "🛡️ TACTICAL RECON // CORE FORTRESS"
  },
  DAY_D: {
    next: "DAY_E",
    title: "DAY E // Hypertrophy & Machine Overload",
    reason: "Isolation Surge: Core stability secured. Machine-guided volume hypertrophy on Cybex track fully unlocked with zero spinal fatigue.",
    tag: "⚡ TACTICAL RECON // HYPERTROPHY TRACK"
  },
  DAY_E: {
    next: "DAY_F",
    title: "DAY F // Joint Sparing & Deload Recon",
    reason: "Connective Preservation: Heavy machine volume completed. Active joint sparing, rear delts, and adductor reset advised before heavy strike.",
    tag: "🛡️ TACTICAL RECON // JOINT PRESERVATION"
  },
  DAY_F: {
    next: "DAY_A",
    title: "DAY A // Hinge & Horizontal Power",
    reason: "System Recharged: Connective tissue and CNS fully restored from deload. Heavy hinge and horizontal pressing cleared for maximum output.",
    tag: "⚡ TACTICAL RECON // MAXIMUM POWER"
  },
  CH_1RM: {
    next: "DAY_F",
    title: "DAY F // Joint Sparing & Deload Recon",
    reason: "Neural Down-Regulation: Heavy CNS output expended on 1RM benchmark strikes. Low-intensity joint recon strictly advised to flush systemic fatigue.",
    tag: "🛡️ TACTICAL RECON // CNS RECOVERY"
  },
  CH_AMRAP: {
    next: "DAY_D",
    title: "DAY D // Trunk Fortress & Core Integrity",
    reason: "Metabolic Reset: Muscular failure reached on compound stations. Core anti-rotation and posture carries advised to reset biomechanical alignment.",
    tag: "🛡️ TACTICAL RECON // ALIGNMENT RESET"
  }
};

export function getRecommendedFlightPath() {
  let lastStage = localStorage.getItem('sonic_last_stage');
  const hadStrain = localStorage.getItem('sonic_last_strain') === 'true';

  // Check stage statuses synced from COMMAND_HUB
  let stageStatuses = {};
  try {
    const raw = localStorage.getItem('sonic_stage_statuses');
    if (raw) stageStatuses = JSON.parse(raw);
  } catch (e) {}

  // If lastStage was not set yet, check which stages are already Cleared in COMMAND_HUB
  if (!lastStage) {
    if (stageStatuses["DAY_B"] === "Cleared") {
      lastStage = "DAY_B";
    } else if (stageStatuses["DAY_A"] === "Cleared") {
      lastStage = "DAY_A";
    } else {
      lastStage = "DAY_B"; // Default to Day B completed today
    }
  }

  // Shield compromised / joint strain override: locks out heavy compounds
  if (hadStrain) {
    return {
      stageKey: "DAY_F",
      title: "DAY F // Joint Sparing & Deload Recon",
      reason: "SHIELD COMPROMISED: Joint strain was flagged during your previous session. High-load compounds are locked out; active deload and joint recon are required to restore 100% Shield.",
      tag: "⚠️ SHIELD BUFFER // RECOVERY DIRECTIVE",
      isRecovery: true
    };
  }

  let route = FLIGHT_PATH_ROUTING[lastStage] || FLIGHT_PATH_ROUTING.DAY_B;

  // If the suggested stage is already marked Cleared, advance forward to next pending stage
  let hops = 0;
  while (stageStatuses[route.next] === "Cleared" && hops < 8) {
    const nextHop = FLIGHT_PATH_ROUTING[route.next];
    if (!nextHop) break;
    route = nextHop;
    hops++;
  }

  return {
    stageKey: route.next,
    title: route.title,
    reason: route.reason,
    tag: route.tag,
    isRecovery: false
  };
}

export function checkAndRenderFlightPathPrompt(activeSession, onEngage) {
  // Don't show if active session already has sets logged
  if (activeSession.sets && activeSession.sets.length > 0) return;

  const container = document.querySelector('.container');
  const stageNav = document.querySelector('.stage-nav') || document.querySelector('.stage-tabs');
  if (!container || !stageNav) return;

  const existing = document.getElementById('flightPathPrompt');
  if (existing) existing.remove();

  const rec = getRecommendedFlightPath();

  const promptCard = document.createElement('div');
  promptCard.id = 'flightPathPrompt';
  promptCard.className = `flight-path-card ${rec.isRecovery ? 'shield-recovery' : ''}`;
  promptCard.innerHTML = `
    <div class="flight-path-header">
      <span class="flight-path-tag">${rec.tag}</span>
      <span style="font-size: 10px; color: var(--text-dim); font-weight: 700;">AUTO-RECON</span>
    </div>
    <div class="flight-path-stage-title">${rec.title}</div>
    <div class="flight-path-rationale">${rec.reason}</div>
    <div class="flight-path-actions">
      <button class="btn-engage-path" id="engagePathBtn">ENGAGE FLIGHT PATH [✓]</button>
      <button class="btn-bypass-path" id="bypassPathBtn">CHOOSE OWN PATH [✕]</button>
    </div>
  `;

  container.insertBefore(promptCard, stageNav);

  const engageBtn = promptCard.querySelector('#engagePathBtn');
  if (engageBtn) {
    engageBtn.onclick = () => {
      localStorage.setItem('sonic_flight_prompt_dismissed', Date.now());
      dismissFlightPathPrompt();
      if (onEngage) onEngage(rec.stageKey);
    };
  }

  const bypassBtn = promptCard.querySelector('#bypassPathBtn');
  if (bypassBtn) {
    bypassBtn.onclick = () => {
      localStorage.setItem('sonic_flight_prompt_dismissed', Date.now());
      dismissFlightPathPrompt();
    };
  }
}

export function dismissFlightPathPrompt() {
  const prompt = document.getElementById('flightPathPrompt');
  if (!prompt) return;
  prompt.style.transition = 'all 0.25s ease';
  prompt.style.opacity = '0';
  prompt.style.transform = 'translateY(-10px)';
  setTimeout(() => prompt.remove(), 250);
}
