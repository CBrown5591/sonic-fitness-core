// -------------------------------------------------------------
// FRONTIERS SKILL TREE TAB RENDERER
// Module: js/ui/renderSkillTree.js
// -------------------------------------------------------------
import { getSpendableRedRings, saveSpendableRedRings, getStandardRings } from './renderArtifacts.js';
import { showToast } from './renderHud.js';
// After (Universal fallback import):
import * as SkillModule from '../data/skillTree.js';

const SKILL_TREE_CATALOG = SkillModule.SKILL_TREE_CATALOG 
  || SkillModule.SKILL_TREE 
  || SkillModule.SKILLS 
  || SkillModule.default 
  || [];

// -------------------------------------------------------------
// DUAL SKILL PROGRESSION CATALOG
// Module: js/data/skillTree.js
// -------------------------------------------------------------

// 1. RED STAR RING TREE (Permanent Passives & Modifiers)
export const RED_RING_TREE = [
  {
    id: "cyloop_recovery",
    name: "Cyloop Recovery",
    cost: 5,
    currency: "red",
    requires: null,
    desc: "Restores Shield Integrity to 100% after clearing any stage without joint strain."
  },
  {
    id: "phantom_rush",
    name: "Phantom Rush",
    cost: 10,
    currency: "red",
    requires: "cyloop_recovery",
    desc: "Grants +10% EXP multiplier across all completed sets on RPE ≤ 8.0."
  },
  {
    id: "sonic_boom",
    name: "Sonic Boom",
    cost: 15,
    currency: "red",
    requires: "phantom_rush",
    desc: "Reduces mandatory rest timer floor by 15s without tempo penalty."
  },
  {
    id: "wild_rush",
    name: "Wild Rush",
    cost: 20,
    currency: "red",
    requires: "sonic_boom",
    desc: "Converts extra volume reps into bonus Gold Rings at stage clear (100:1 ratio)."
  }
];

// 2. GOLD RING TREE (Chaos Upgrades & Buffs)
export const GOLD_RING_TREE = [
  {
    id: "shield_repair_pack",
    name: "Aegis Shield Repair",
    cost: 50,
    currency: "gold",
    requires: null,
    desc: "Immediately restores Hull Integrity / Shield back to 100% if strained during a sortie."
  },
  {
    id: "speed_shoes_cadence",
    name: "Speed Shoes Rest Cadence",
    cost: 150,
    currency: "gold",
    requires: null,
    desc: "Shaves 30s off active rest clocks to keep training intensity elevated."
  },
  {
    id: "super_fuel_optimizer",
    name: "Chaos Core Efficiency",
    cost: 300,
    currency: "gold",
    requires: null,
    desc: "Reduces Super Sonic transformation cost from 50 rings down to 35 rings."
  },
  {
    id: "emerald_resonance",
    name: "Master Emerald Resonance",
    cost: 600,
    currency: "gold",
    requires: null,
    desc: "Increases Chaos Emerald drop probability on Perfect Day clearances by +15%."
  },
  {
    id: "chaos_blast_protocol",
    name: "Chaos Blast Overdrive",
    cost: 1000,
    currency: "gold",
    requires: "emerald_resonance",
    desc: "Grants a +25,000 Stage Score burst bonus once per week on any cleared sortie."
  }
];

// Backwards-compatibility aliases
export const SKILL_TREE_CATALOG = RED_RING_TREE;
export default { RED_RING_TREE, GOLD_RING_TREE };
