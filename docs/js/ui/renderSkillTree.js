// -------------------------------------------------------------
// FRONTIERS SKILL TREE TAB RENDERER
// Module: js/ui/renderSkillTree.js
// -------------------------------------------------------------
import { SKILL_TREE_CATALOG } from '../data/skillTree.js';
import { getSpendableRedRings, saveSpendableRedRings, getStandardRings } from './renderArtifacts.js';
import { showToast } from './renderHud.js';

export function getUnlockedPerks() {
  try {
    const raw = localStorage.getItem('sonic_unlocked_perks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUnlockedPerks(perkList) {
  localStorage.setItem('sonic_unlocked_perks', JSON.stringify(perkList));
}

export function hasPerk(perkId) {
  const unlocked = getUnlockedPerks();
  return unlocked.includes(perkId);
}

export function unlockPerk(perkId) {
  const perk = (SKILL_TREE_CATALOG || []).find(p => p.id === perkId);
  if (!perk) return;

  const unlocked = getUnlockedPerks();
  if (unlocked.includes(perkId)) {
    showToast(`Perk [${perk.name}] is already unlocked!`);
    return;
  }

  // Check parent prerequisites if any
  if (perk.requires && !unlocked.includes(perk.requires)) {
    showToast(`Prerequisite required: Unlock [${perk.requires}] first!`);
    return;
  }

  const balance = getSpendableRedRings();
  const cost = perk.cost || 5;

  if (balance < cost) {
    showToast(`Not enough Red Star Rings! Need ${cost}, have ${balance}.`);
    return;
  }

  // Deduct balance and persist unlock
  saveSpendableRedRings(balance - cost);
  unlocked.push(perkId);
  saveUnlockedPerks(unlocked);

  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  showToast(`★ UNLOCKED PERK: ${perk.name}!`);

  renderSkillTree();
}

export function renderSkillTree() {
  const mount = document.getElementById('skillTreeMount');
  if (!mount) return;

  const balance = getSpendableRedRings();
  const gold = getStandardRings();
  const unlocked = getUnlockedPerks();

  // Update Balances
  const redBalEl = document.getElementById('skillTreeRedRingBalance');
  if (redBalEl) redBalEl.innerText = `${balance} SPENDABLE RINGS`;

  const goldBalEl = document.getElementById('skillTreeGoldRingBalance');
  if (goldBalEl) goldBalEl.innerText = `${gold.toLocaleString()} GOLD RINGS`;

  const countEl = document.getElementById('unlockedPerkCount');
  if (countEl) countEl.innerText = `${unlocked.length} / ${(SKILL_TREE_CATALOG || []).length} UNLOCKED`;

  if (!SKILL_TREE_CATALOG || SKILL_TREE_CATALOG.length === 0) {
    mount.innerHTML = `<div style="font-size: 12px; color: #64748b; text-align: center; padding: 20px;">No skills registered in catalog.</div>`;
    return;
  }

  // Render Perk Cards
  mount.innerHTML = SKILL_TREE_CATALOG.map(perk => {
    const isUnlocked = unlocked.includes(perk.id);
    const hasReq = !perk.requires || unlocked.includes(perk.requires);
    const canAfford = balance >= (perk.cost || 5);

    let borderCol = 'rgba(255,255,255,0.08)';
    let badgeText = 'LOCKED';
    let badgeBg = '#334155';

    if (isUnlocked) {
      borderCol = '#38bdf8';
      badgeText = 'ACTIVE ★';
      badgeBg = '#0284c7';
    } else if (!hasReq) {
      borderCol = 'rgba(239, 68, 68, 0.3)';
      badgeText = `REQ: ${perk.requires}`;
      badgeBg = '#7f1d1d';
    } else if (canAfford) {
      borderCol = '#f43f5e';
      badgeText = `UNLOCK (${perk.cost || 5} ★)`;
      badgeBg = '#e11d48';
    } else {
      badgeText = `NEED ${perk.cost || 5} ★`;
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
            ${perk.description || perk.desc || ''}
          </div>
        </div>
        <div>
          ${!isUnlocked && hasReq ? `
            <button type="button" 
                    onclick="unlockPerk('${perk.id}')" 
                    style="background: ${canAfford ? '#f43f5e' : 'rgba(244,63,94,0.2)'}; color: #fff; border: none; padding: 7px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; cursor: ${canAfford ? 'pointer' : 'not-allowed'};"
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
window.unlockPerk = unlockPerk;
window.hasPerk = hasPerk;
