// docs/js/ui/renderRecordsTab.js
import { STAGES } from '../data/stages.js';
import { getStageRecords, getPRVault } from '../engine/records.js';
import { renderPRVaultUI } from './renderPRVault.js';

export { renderPRVaultUI };

export function renderAllStageRecords() {
  const mount = document.getElementById('stageRecordsMount');
  if (!mount) return;

  const records = getStageRecords() || {};
  const stageKeys = Object.keys(STAGES);

  mount.innerHTML = stageKeys.map(key => {
    const stage = STAGES[key];
    const rec = records[key];
    const hasRecord = rec && rec.bestScore > 0;
    const rankColor = rec?.rank === 'S' ? '#facc15' : (rec?.rank === 'A' ? '#38bdf8' : '#94a3b8');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.65); padding: 9px 12px; border-radius: 6px; border-left: 3px solid ${hasRecord ? rankColor : 'rgba(255,255,255,0.1)'};">
        <div style="flex: 1; padding-right: 10px;">
          <div style="font-size: 12px; font-weight: 800; color: #f8fafc;">
            ${key.replace('_', ' ')} <span style="font-size: 11px; font-weight: 500; color: #94a3b8;">// ${stage.name}</span>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${hasRecord ? `Cleared: ${rec.date || 'Recorded'}` : 'Status: Pending First Sortie'}
          </div>
        </div>
        <div style="text-align: right; min-width: 80px;">
          ${hasRecord ? `
            <div style="font-size: 14px; font-weight: 900; color: #f8fafc; font-family: monospace;">
              ${rec.bestScore.toLocaleString()} <span style="font-size: 10px; color: ${rankColor}; font-weight: 800;">[${rec.rank}]</span>
            </div>
          ` : `
            <div style="font-size: 11px; font-weight: 700; color: #64748b;">-- PTS</div>
          `}
        </div>
      </div>
    `;
  }).join('');
}

export function refreshRecordsTab() {
  renderAllStageRecords();
  renderPRVaultUI();
  
  // Update total PR tally tag
  const totalCounter = document.getElementById('prTotalCount');
  if (totalCounter) {
    const prVault = getPRVault() || {};
    const count = Object.keys(prVault).length;
    totalCounter.innerText = `${count} MOVEMENT PRs`;
  }
}

// Global scope attachment
window.renderAllStageRecords = renderAllStageRecords;
window.refreshRecordsTab = refreshRecordsTab;
