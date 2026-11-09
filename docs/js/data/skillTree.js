// -------------------------------------------------------------
// FRONTIERS SKILL TREE CATALOG // js/data/skillTree.js
// -------------------------------------------------------------

// docs/js/data/skillTree.js
export const SKILL_TREE_CATALOG = [
  {
    id: "cyloop_recovery",
    name: "Cyloop Recovery",
    cost: 5,
    requires: null,
    desc: "Restores Shield Integrity to 100% after clearing any stage without joint strain."
  },
  {
    id: "phantom_rush",
    name: "Phantom Rush",
    cost: 10,
    requires: "cyloop_recovery",
    desc: "Grants +10% EXP multiplier across all completed sets on RPE ≤ 8.0."
  },
  {
    id: "sonic_boom",
    name: "Sonic Boom",
    cost: 15,
    requires: "phantom_rush",
    desc: "Reduces mandatory rest timer floor by 15s without tempo penalty."
  },
  {
    id: "wild_rush",
    name: "Wild Rush",
    cost: 20,
    requires: "sonic_boom",
    desc: "Converts extra volume reps into bonus Gold Rings at stage clear (100:1 ratio)."
  }
];

// Backwards-compatible aliases:
export const SKILL_TREE = SKILL_TREE_CATALOG;
export default SKILL_TREE_CATALOG;

export const SKILL_TREE_NODES = [
  // --- HULL & ARMOR (LONGEVITY & DEFENSE) ---
  {
    id: 'PERK_SHIELD_HARD',
    name: 'Shield Hardening',
    branch: 'hull',
    branchLabel: 'HULL & ARMOR',
    cost: 12,
    icon: '🛡️',
    description: 'First accidental joint strain flag drops Shield Integrity to 75% instead of 50%.',
    flavor: 'Reinforced joint capsules buffer abrupt biomechanical shear forces.'
  },
  {
    id: 'PERK_PREHAB_FORTITUDE',
    name: 'Prehab Fortitude',
    branch: 'hull',
    branchLabel: 'HULL & ARMOR',
    cost: 8,
    icon: '🧱',
    description: 'Pre-flight armor clear awards a flat +5,000 PTS conditioning surge.',
    flavor: 'Pre-activation routines convert directly into sortie telemetry velocity.'
  },
  {
    id: 'PERK_RECOVERY_OVERDRIVE',
    name: 'Cellular Restoration',
    branch: 'hull',
    branchLabel: 'HULL & ARMOR',
    cost: 16,
    icon: '🧬',
    description: 'Waives the rest timer penalty if you manually log a clean recovery walk.',
    flavor: 'Enhanced lactic flushing keeps core kinetic systems primed.'
  },

  // --- SPEED & KINETICS (TRANSFORMATIONS & PACING) ---
  {
    id: 'PERK_SOUL_4',
    name: 'Soul Gauge Expansion',
    branch: 'kinetics',
    branchLabel: 'SPEED & KINETICS',
    cost: 15,
    icon: '🔥',
    description: 'Expands Darkspine Sonic’s Time Brake from 3 charges to 4 charges per sortie.',
    flavor: 'Seven World Rings resonance expands the temporal distortion threshold.'
  },
  {
    id: 'PERK_SUPER_CONSERVE',
    name: 'Super Ring Conservation',
    branch: 'kinetics',
    branchLabel: 'SPEED & KINETICS',
    cost: 15,
    icon: '⚡',
    description: 'Reduces Super Sonic’s strain drain penalty from -15 rings down to -10 rings.',
    flavor: 'Hyper-efficient magnetic field containment mitigates ring fallout.'
  },
  {
    id: 'PERK_TEMPO_HARMONIZER',
    name: 'Tempo Harmonizer',
    branch: 'kinetics',
    branchLabel: 'SPEED & KINETICS',
    cost: 10,
    icon: '⏱️',
    description: 'Clean 3-0-1 cadence sets grant +500 PTS bonus force yield per completed set.',
    flavor: 'Eliminates kinetic energy leaks during slow eccentric deceleration.'
  },

  // --- PILOT PROTOCOL (ECONOMY & VAULT) ---
  {
    id: 'PERK_RING_MAGNET_PLUS',
    name: 'Ring Attractor Field',
    branch: 'protocol',
    branchLabel: 'PILOT PROTOCOL',
    cost: 10,
    icon: '🧲',
    description: 'Permanently increases all Standard Gold Ring payouts by +10% upon stage clear.',
    flavor: 'High-gain electromagnetic collector gathers stray telemetry currency.'
  },
  {
    id: 'PERK_CYBER_THEME',
    name: 'Cyber Neon HUD',
    branch: 'protocol',
    branchLabel: 'PILOT PROTOCOL',
    cost: 6,
    icon: '🎨',
    description: 'Unlocks alternative high-contrast Cyber Neon arcade visuals for the HUD.',
    flavor: 'Custom firmware overclock for the command cockpit telemetry screen.'
  }
];

export function getPerkById(id) {
  return SKILL_TREE_NODES.find(n => n.id === id) || null;
}
