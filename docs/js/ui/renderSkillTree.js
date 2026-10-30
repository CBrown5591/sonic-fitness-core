// -------------------------------------------------------------
// FRONTIERS SKILL TREE UI // js/ui/renderSkillTree.js
// Modular UI Component: renderSkillTree.js
// -------------------------------------------------------------
import { SKILL_TREE_NODES, getPerkById } from '../data/skillTree.js';
import { getSpendableRedRings, saveSpendableRedRings } from './renderArtifacts.js';

export function getUnlockedPerks() {
  try {
    const raw = localStorage.getItem('sonic_unlocked_perks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUnlockedPerks(perksArr) {
  localStorage.setItem('sonic_unlocked_perks', JSON.stringify(perksArr));
}

export function hasPerk(perkId) {
  const perks = getUnlockedPerks();
  return perks.includes(perkId);
}

export function unlockPerk(perkId, showToast = window.showToast) {
  const perk = getPerkById(perkId);
  if (!perk) return false;

  if (hasPerk(perkId)) {
    if (showToast) showToast(`ℹ️ ${perk.name.toUpperCase()} ALREADY UNLOCKED`);
    return false;
  }

  const currentBalance = getSpendableRedRings();
  if (currentBalance < perk.cost) {
    if (showToast) showToast(`⚠️ INSUFFICIENT RED RINGS: Need ${perk.cost}★ (Have ${currentBalance}★)`);
    return false;
  }

  // Deduct Red Rings & persist perk
  const newBalance = currentBalance - perk.cost;
  saveSpendableRedRings(newBalance);

  const perks = getUnlockedPerks();
  perks.push(perkId);
  saveUnlockedPerks(perks);

  // Re-render UI
  renderSkillTreeDrawer();
  
  if (showToast) {
    showToast(`⚡ PERK UNLOCKED: ${perk.name}! (-${perk.cost}★)`);
  }

  // Hook into other runtime systems (e.g. Darkspine Soul Gauge)
  if (perkId === 'PERK_SOUL_4') {
    sessionStorage.setItem('sonic_soul_gauge_max', '4');
  }

  return true;
}

export function toggleSkillTreeDrawer() {
  let drawer = document.getElementById('skillTreeDrawerBackdrop');
  if (drawer) {
    drawer.remove();
  } else {
    renderSkillTreeDrawer();
  }
}

export function renderSkillTreeDrawer() {
  let backdrop = document.getElementById('skillTreeDrawerBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'skillTreeDrawerBackdrop';
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  }

  const spendable = getSpendableRedRings();
  const unlocked = getUnlockedPerks();

  // Group by branch
  const branches = [
    { key: 'hull', label: '🛡️ HULL & ARMOR (LONGEVITY)' },
    { key: 'kinetics', label: '⚡ SPEED & KINETICS (PERFORMANCE)' },
    { key: 'protocol', label: '🧲 PILOT PROTOCOL (UTILITY)' }
  ];

  backdrop.innerHTML = `
    <div class="modal-card" style="max-height: 90vh; overflow-y: auto; padding: 18px; width: 100%; max-width: 480px; background: #0b111e; border: 1px solid #1f2d45; border-radius: 14px; box-shadow: 0 0 40px rgba(0,0,0,0.9);">
      
      <!-- HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2d45; padding-bottom: 12px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 10px; font-weight: 800; color: #f87171; letter-spacing: 1.5px;">FRONTIERS SKILL TREE</div>
          <div style="font-size: 16px; font-weight: 900; color: #f8fafc; letter-spacing: 0.5px;">PERMANENT PILOT PERKS</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 9px; font-weight: 800; color: #94a3b8;">SPENDABLE</div>
            <div style="font-size: 15px; font-weight: 900; color: #f87171; font-family: monospace;">${spendable}★</div>
          </div>
          <button id="closeSkillTreeBtn" style="background: none; border: none; color: #94a3b8; font-size: 22px; cursor: pointer; line-height: 1;">✕</button>
        </div>
      </div>

      <!-- BRANCHES & NODES -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${branches.map(b => {
          const nodes = SKILL_TREE_NODES.filter(n => n.branch === b.key);
          return `
            <div class="skill-branch-section">
              <div style="font-size: 11px; font-weight: 900; color: #38bdf8; letter-spacing: 1px; margin-bottom: 8px;">
                ${b.label}
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${nodes.map(node => {
                  const isOwned = unlocked.includes(node.id);
                  const canAfford = spendable >= node.cost;

                  let statusBtnHtml = '';
                  if (isOwned) {
                    statusBtnHtml = `
                      <span style="background: rgba(74, 222, 128, 0.15); border: 1px solid #4ade80; color: #4ade80; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; letter-spacing: 0.5px;">
                        ✓ ACTIVE
                      </span>
                    `;
                  } else {
                    const btnStyle = canAfford
                      ? 'background: #1e293b; border: 1px solid #f87171; color: #f87171; cursor: pointer;'
                      : 'background: #0d1524; border: 1px solid #334155; color: #64748b; cursor: not-allowed; opacity: 0.6;';

                    statusBtnHtml = `
                      <button class="unlock-perk-action-btn" data-perk-id="${node.id}" style="
                        font-size: 10.5px;
                        font-weight: 900;
                        padding: 6px 12px;
                        border-radius: 6px;
                        letter-spacing: 0.5px;
                        transition: 0.15s ease;
                        ${btnStyle}
                      " ${!canAfford ? 'disabled' : ''}>
                        UNLOCK (${node.cost}★)
                      </button>
                    `;
                  }

                  return `
                    <div class="skill-node-card" style="background: #0f1828; border: 1px solid ${isOwned ? '#4ade80' : '#1f2d45'}; border-radius: 10px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px; box-shadow: ${isOwned ? '0 0 10px rgba(74, 222, 128, 0.15)' : 'none'};">
                      <div style="display: flex; gap: 10px; align-items: flex-start;">
                        <span style="font-size: 22px; line-height: 1.1;">${node.icon}</span>
                        <div>
                          <div style="font-size: 12.5px; font-weight: 800; color: #f8fafc;">${node.name}</div>
                          <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">${node.description}</div>
                          <div style="font-size: 9px; font-style: italic; color: #64748b; margin-top: 4px;">"${node.flavor}"</div>
                        </div>
                      </div>
                      <div style="flex-shrink: 0;">
                        ${statusBtnHtml}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Attach event listeners
  document.getElementById('closeSkillTreeBtn').onclick = () => {
    backdrop.remove();
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) backdrop.remove();
  };

  backdrop.querySelectorAll('.unlock-perk-action-btn').forEach(btn => {
    btn.onclick = (e) => {
      const perkId = e.currentTarget.getAttribute('data-perk-id');
      unlockPerk(perkId);
    };
  });
}

// DevTools exposures
if (typeof window !== 'undefined') {
  window.renderSkillTreeDrawer = renderSkillTreeDrawer;
  window.toggleSkillTreeDrawer = toggleSkillTreeDrawer;
  window.hasPerk = hasPerk;
  window.unlockPerk = unlockPerk;
  window.getUnlockedPerks = getUnlockedPerks;
}
