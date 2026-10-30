// -------------------------------------------------------------
// MASTERY VAULT DRAWER & RENDERING COMPONENT
// Modular UI Component: renderVault.js
// -------------------------------------------------------------
import { STAGES } from '../data/stages.js';

export function getVaultData() {
  const stored = localStorage.getItem('sonic_mastery_vault');
  let savedVault = [];
  if (stored) {
    try { savedVault = JSON.parse(stored); } catch (e) {}
  }

  // Crawl every defined stage to catalog every exercise
  const catalog = new Map();
  Object.values(STAGES).forEach(st => {
    st.slots.forEach(slot => {
      [slot.primary, ...(slot.alts || [])].forEach(name => {
        if (!catalog.has(name)) {
          let focus = "Conditioning";
          if (name.includes("Squat") || name.includes("Leg Press") || name.includes("Lunge") || name.includes("Extension")) focus = "Squat / Quads";
          else if (name.includes("RDL") || name.includes("Hinge") || name.includes("Curl") || name.includes("Bridge")) focus = "Hinge / Posterior";
          else if (name.includes("Press") || name.includes("Push-Up")) focus = "Push / Chest / Shoulders";
          else if (name.includes("Row") || name.includes("Pulldown")) focus = "Pull / Lats";
          else if (name.includes("Pallof") || name.includes("Crunch") || name.includes("Deadbug") || name.includes("Bird-Dog") || name.includes("Hold") || name.includes("Woodchopper") || name.includes("Windmill")) focus = "Core / Pillar";
          else if (name.includes("Carry") || name.includes("March") || name.includes("Crawl")) focus = "Loaded Carry / Locomotion";
          else if (name.includes("Rotation") || name.includes("Fly") || name.includes("Raises") || name.includes("Tibialis") || name.includes("Plank")) focus = "Joint Armor";
          catalog.set(name, focus);
        }
      });
    });
  });

  // Merge saved Star Rings into catalog
  const merged = [];
  catalog.forEach((focus, exercise) => {
    const found = savedVault.find(v => v.exercise === exercise);
    merged.push({
      exercise,
      focus,
      rings: found ? found.rings : 0
    });
  });

  return merged;
}

export function saveVaultData(data) {
  localStorage.setItem('sonic_mastery_vault', JSON.stringify(data));
}

export function getTotalRedRings() {
  const vault = getVaultData();
  return vault.reduce((sum, item) => sum + (item.rings || 0), 0);
}

export function renderVault() {
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

  const totalCounter = document.getElementById('vaultTotalRedRings');
  if (totalCounter) {
    totalCounter.innerText = `${getTotalRedRings()} RED STAR RINGS`;
  }
}

export function toggleVaultDrawer() {
  const drawer = document.getElementById('vaultDrawer');
  const icon = document.getElementById('vaultToggleIcon');
  if (!drawer) return;
  if (drawer.style.display === 'block') {
    drawer.style.display = 'none';
    if (icon) icon.innerText = 'EXPAND ▾';
  } else {
    renderVault();
    drawer.style.display = 'block';
    if (icon) icon.innerText = 'COLLAPSE ▴';
  }
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

// Bind to window for HTML onclick compatibility
window.toggleVaultDrawer = toggleVaultDrawer;
