// -------------------------------------------------------------
// APEX 1RM BENCHMARK VAULT UI RENDERER
// Module: js/ui/renderPRVault.js
// -------------------------------------------------------------
import { getPRVault } from '../engine/records.js';

export function renderPRVaultUI(filterText = '') {
  const mount = document.getElementById('prVaultMount');
  if (!mount) return;

  const prVault = getPRVault() || {};
  const query = (filterText || '').toLowerCase().trim();

  // Filter and sort exercises alphabetically
  const entries = Object.entries(prVault)
    .filter(([exercise]) => !query || exercise.toLowerCase().includes(query))
    .sort(([a], [b]) => a.localeCompare(b));

  // Update total count indicator badge if present
  const totalCountEl = document.getElementById('prTotalCount');
  if (totalCountEl) {
    const totalEntries = Object.keys(prVault).length;
    totalCountEl.innerText = `${totalEntries} MOVEMENT PRs`;
  }

  // Handle empty state
  if (entries.length === 0) {
    mount.innerHTML = `
      <div style="font-size: 12px; color: #64748b; text-align: center; padding: 20px 0;">
        ${query ? 'No matching exercises found.' : 'No 1RM records established yet. Complete a clean set to log a PR!'}
      </div>
    `;
    return;
  }

  // Render cards
  mount.innerHTML = entries.map(([exercise, data]) => {
    const e1rm = data.e1rm || 0;
    const bestSet = data.bestSet || `${data.load || 0}lbs × ${data.reps || 0}r`;
    const dateStr = data.date ? ` • ${data.date}` : '';

    return `
      <div class="pr-vault-row" style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.65); padding: 9px 12px; border-radius: 6px; border-left: 3px solid var(--accent-gold, #facc15);">
        <div style="flex: 1; padding-right: 12px;">
          <div style="font-weight: 800; font-size: 13px; color: #f8fafc;">${exercise}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
            Best Set: <span style="color: #e2e8f0; font-weight: 600;">${bestSet}</span>${dateStr}
          </div>
        </div>
        <div style="text-align: right; min-width: 80px;">
          <div style="font-size: 15px; font-weight: 900; color: var(--accent-gold, #facc15); font-family: monospace;">
            ${e1rm} <span style="font-size: 10px; color: #94a3b8;">LBS</span>
          </div>
          <div style="font-size: 9px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px;">EST. 1RM</div>
        </div>
      </div>
    `;
  }).join('');
}

// Global attachment for inline HTML event handlers (e.g. oninput="renderPRVaultUI(this.value)")
window.renderPRVaultUI = renderPRVaultUI;
