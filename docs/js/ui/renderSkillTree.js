// -------------------------------------------------------------
// DUAL SKILL TREE CONTROLLER & RENDERER
// Module: js/ui/renderSkillTree.js
// -------------------------------------------------------------
import { RED_RING_TREE, GOLD_RING_TREE } from '../data/skillTree.js';
import { getSpendableRedRings, saveSpendableRedRings, getStandardRings, saveStandardRings } from './renderArtifacts.js';
import { showToast } from './renderHud.js';

let activeBranch = 'red'; // 'red' or 'gold'

export function getUnlockedPerks() {
  try {
    const raw = localStorage.getItem('sonic_unlocked_perks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUnlockedPerks(list) {
  localStorage.setItem('sonic_unlocked_perks', JSON.stringify(list));
}

export function hasPerk(perkId) {
  return getUnlockedPerks().includes(perkId);
}

export function switchSkillTreeBranch(branch) {
  activeBranch = branch;
  
  const redBtn = document.getElementById('treeTabRedBtn');
  const goldBtn = document.getElementById('treeTabGoldBtn');
  const titleEl = document.getElementById('activeTreeTitle');

  if (redBtn && goldBtn) {
    if (branch === 'red') {
      redBtn.classList.add('active');
      goldBtn.classList.remove('active');
      if (titleEl) titleEl.innerText = "🔴 FRONTIERS SKILL TREE";
    } else {
      goldBtn.classList.add('active');
      redBtn.classList.remove('active');
      if (titleEl) titleEl.innerText = "🟡 CHAOS VAULT UPGRADES";
    }
  }

  renderSkillTree();
}

export function unlockPerk(perkId) {
  const catalog = activeBranch === 'red' ? RED_RING_TREE : GOLD_RING_TREE;
  const perk = catalog.find(p => p.id === perkId);
  if (!perk) return;

  const unlocked = getUnlockedPerks();
  if (unlocked.includes(perkId)) {
    showToast(`Upgrade [${perk.name}] already active!`);
    return;
  }

  // Prerequisite check
  if (perk.requires && !unlocked.includes(perk.requires)) {
    showToast(`Prerequisite required: Unlock [${perk.requires}] first!`);
    return;
  }

  const isRed = perk.currency === 'red';
  const balance = isRed ? getSpendableRedRings() : getStandardRings();
  const cost = perk.cost;

  if (balance < cost) {
    showToast(`Need ${cost} ${isRed ? 'Red Star Rings' : 'Gold Rings'}! You have ${balance}.`);
    return;
  }

  // Deduct from correct wallet
  if (isRed) {
    saveSpendableRedRings(balance - cost);
  } else {
    saveStandardRings(balance - cost);
  }

  unlocked.push(perkId);
  saveUnlockedPerks(unlocked);

  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  showToast(`★ ACQUIRED: ${perk.name}!`);

  renderSkillTree();
}

export function renderSkillTree() {
  const mount = document.getElementById('skillTreeMount');
  if (!mount) return;

  const redBal = getSpendableRedRings();
  const goldBal = getStandardRings();
  const unlocked = getUnlockedPerks();

  // Balance indicators
  const redBalEl = document.getElementById('skillTreeRedRingBalance');
  if (redBalEl) redBalEl.innerText = `${redBal} RED STARS`;

  const goldBalEl = document.getElementById('skillTreeGoldRingBalance');
  if (goldBalEl) goldBalEl.innerText = `${goldBal.toLocaleString()} GOLD RINGS`;

  const catalog = activeBranch === 'red' ? RED_RING_TREE : GOLD_RING_TREE;
  const unlockedInBranch = catalog.filter(p => unlocked.includes(p.id)).length;

  const countEl = document.getElementById('unlockedPerkCount');
  if (countEl) countEl.innerText = `${unlockedInBranch} / ${catalog.length} UNLOCKED`;

  mount.innerHTML = catalog.map(perk => {
    const isUnlocked = unlocked.includes(perk.id);
    const hasReq = !perk.requires || unlocked.includes(perk.requires);
    const balance = perk.currency === 'red' ? redBal : goldBal;
    const canAfford = balance >= perk.cost;
    const currencySym = perk.currency === 'red' ? '★' : '🟡';

    let borderCol = 'rgba(255,255,255,0.08)';
    let badgeBg = '#334155';
    let badgeText = 'LOCKED';

    if (isUnlocked) {
      borderCol = '#38bdf8';
      badgeText = 'ACTIVE ★';
      badgeBg = '#0284c7';
    } else if (!hasReq) {
      borderCol = 'rgba(239, 68, 68, 0.3)';
      badgeText = `REQ: ${perk.requires}`;
      badgeBg = '#7f1d1d';
    } else if (canAfford) {
      borderCol = perk.currency === 'red' ? '#f43f5e' : '#facc15';
      badgeText = `UNLOCK (${perk.cost} ${currencySym})`;
      badgeBg = perk.currency === 'red' ? '#e11d48' : '#ca8a04';
    } else {
      badgeText = `NEED ${perk.cost} ${currencySym}`;
      badgeBg = '#475569';
    }

    return `
      <div style="background: rgba(15, 23, 42, 0.7); padding: 12px; border-radius: 6px; border: 1px solid ${borderCol}; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: 800; color: ${isUnlocked ? '#38bdf8' : '#f8fafc'};">${perk.name}</span>
            <span style="font-size: 9px; font-weight: 800; background: ${badgeBg}; color: #fff; padding: 2px 6px; border-radius: 4px;">${badgeText}</span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
            ${perk.desc}
          </div>
        </div>
        <div>
          ${!isUnlocked && hasReq ? `
            <button type="button" 
                    onclick="unlockPerk('${perk.id}')" 
                    style="background: ${canAfford ? (perk.currency === 'red' ? '#f43f5e' : '#facc15') : 'rgba(255,255,255,0.1)'}; color: ${canAfford && perk.currency === 'gold' ? '#0f172a' : '#fff'}; border: none; padding: 7px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; cursor: ${canAfford ? 'pointer' : 'not-allowed'};"
                    ${canAfford ? '' : 'disabled'}>
              UNLOCK
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Global scope window attachments
window.renderSkillTree = renderSkillTree;
window.switchSkillTreeBranch = switchSkillTreeBranch;
window.unlockPerk = unlockPerk;
window.hasPerk = hasPerk;
