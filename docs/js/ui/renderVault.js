// -------------------------------------------------------------
// MASTERY VAULT RENDERING COMPONENT
// Module: js/ui/renderVault.js
// -------------------------------------------------------------
import { STAGES } from '../data/stages.js';

export function getVaultData() {
  const stored = localStorage.getItem('sonic_mastery_vault');
  let savedVault = [];
  if (stored) {
    try { savedVault = JSON.parse(stored); } catch (e) {}
  }

  // Crawl every defined stage to build full movement catalog
  const catalog = new Map();
  Object.values(STAGES).forEach(st => {
    (st.slots || []).forEach(slot => {
      [slot.primary, ...(slot.alts || [])].forEach(name => {
        if (!catalog.has(name)) {
          let focus = "Conditioning";
          if (name.includes("Squat") || name.includes("Leg Press") || name.includes("Lunge") || name.includes("Extension")) focus = "Squat / Quads";
          else if (name.includes("RDL") || name.includes("Hinge") || name.includes("Curl") || name.includes("Bridge")) focus = "Hinge / Posterior";
          else if (name.includes("Press") || name.includes("Push-Up")) focus = "Push / Chest / Shoulders";
          else if (name.includes("Row") || name.includes("Pulldown")) focus = "Pull / Lats";
          else if (name.includes("Pallof") || name.includes("Crunch") || name.includes("Deadbug") || name.includes("Bird-Dog") || name.includes("Hold") || name.includes("Woodchopper") || name.includes("Windmill")) focus = "Core / Pillar";
          else if (name.includes("Carry") || name.includes("March") || name.includes("Crawl")) focus = "Loaded Carry / Locomotion";
          else if (name.includes("Rotation") || name.includes("Fly") || name.includes("Raises") || name.includes("Tibialis") || name.includes("Plank") || name.includes("Adduction") || name.includes("Abduction")) focus = "Joint Armor";
          catalog.set(name, focus);
        }
      });
    });
  });

  // Merge saved rings into full movement catalog
  const merged = [];
  catalog.forEach((focus, exercise) => {
    const found = savedVault.find(v => v.exercise === exercise);
    merged.push({
      exercise,
      focus,
      rings: found ? (found.rings || found.stars || 0) : 0
    });
  });

  return merged;
}

export function saveVaultData(incomingData) {
  if (!incomingData || !Array.isArray(incomingData)) return;
  const currentVault = getVaultData();

  incomingData.forEach(inItem => {
    const name = inItem.exercise || inItem.name;
    const incomingRings = Number(inItem.rings !== undefined ? inItem.rings : inItem.stars) || 0;
    const match = currentVault.find(v => v.exercise === name);

    if (match) {
      match.rings = Math.min(5, Math.max(match.rings || 0, incomingRings));
    } else {
      currentVault.push({
        exercise: name,
        focus: inItem.focus || "General",
        rings: Math.min(5, incomingRings)
      });
    }
  });

  localStorage.setItem('sonic_mastery_vault', JSON.stringify(currentVault));
}

export function getTotalRedRings() {
  const raw = localStorage.getItem('sonic_total_red_rings');
  if (raw !== null && !isNaN(parseInt(raw, 10))) return parseInt(raw, 10);
  const vault = getVaultData();
  return vault.reduce((sum, item) => sum + (item.rings || 0), 0);
}

export function renderVault(filterText = '') {
  const container = document.getElementById('vaultItemsContainer');
  if (!container) return;

  const query = (filterText || '').toLowerCase().trim();
  const vault = getVaultData();

  // Filter entries by exercise name or focus group
  const filtered = vault.filter(item => {
    if (!query) return true;
    return item.exercise.toLowerCase().includes(query) || item.focus.toLowerCase().includes(query);
  }).sort((a, b) => {
    // Sort prioritized by completed rings first, then alphabetically
    if (b.rings !== a.rings) return b.rings - a.rings;
    return a.exercise.localeCompare(b.exercise);
  });

  // Update total Red Star Rings header
  const totalCounter = document.getElementById('vaultTotalRedRings');
  if (totalCounter) {
    totalCounter.innerText = `${getTotalRedRings()} / 50 RED STAR RINGS`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="font-size: 12px; color: #64748b; text-align: center; padding: 20px 0;">
        No movements matching "${filterText}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isMastered = item.rings >= 5;
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= item.rings ? '★' : '☆';
    }

    return `
      <div class="vault-item" style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.65); padding: 9px 12px; border-radius: 6px; border-left: 3px solid ${isMastered ? '#facc15' : (item.rings > 0 ? '#f43f5e' : 'rgba(255,255,255,0.1)')};">
        <div style="flex: 1; padding-right: 10px;">
          <div style="font-weight: 800; font-size: 13px; color: #f8fafc;">${item.exercise}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${item.focus}</div>
        </div>
        <div style="text-align: right; min-width: 85px;">
          <div style="font-size: 14px; font-weight: 900; color: ${item.rings > 0 ? '#f43f5e' : '#64748b'}; letter-spacing: 2px;">
            ${starsHtml}
          </div>
          <div style="font-size: 9px; font-weight: 700; color: ${isMastered ? '#facc15' : '#94a3b8'}; margin-top: 2px;">
            ${isMastered ? '★ MASTERED' : `${item.rings}/5 RINGS`}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function creditVaultRings(sets) {
  if (!sets || !Array.isArray(sets) || sets.length === 0) return;
  const vault = getVaultData();

  sets.forEach(s => {
    if (s.rpe <= 8.0 && s.tempoClean && !s.jointPain) {
      const item = vault.find(v => v.exercise === s.exercise);
      if (item) {
        item.rings = Math.min(5, (item.rings || 0) + 1);
      }
    }
  });
  saveVaultData(vault);
}

// Global attachment for inline HTML event handlers
window.renderVault = renderVault;
