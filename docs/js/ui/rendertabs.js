// -------------------------------------------------------------
// MAIN DASHBOARD TAB ROUTER & VIEW CONTROLLER
// Module: js/ui/renderTabs.js
// -------------------------------------------------------------
import { renderVault } from './renderVault.js';

export function switchMainTab(targetTabId) {
  // 1. Hide all tab view sections
  const views = document.querySelectorAll('.main-tab-view');
  views.forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active-tab-view');
  });

  // 2. Clear active styling from all tab buttons
  const buttons = document.querySelectorAll('.main-tab-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Show selected view container
  const activeView = document.getElementById(targetTabId);
  if (activeView) {
    activeView.style.display = 'block';
    activeView.classList.add('active-tab-view');
  }

  // 4. Highlight corresponding nav button
  const matchingBtn = document.querySelector(`.main-tab-btn[data-target="${targetTabId}"]`);
  if (matchingBtn) {
    matchingBtn.classList.add('active');
  }

  // 5. Lazy-render or refresh data for views that need it
  if (targetTabId === 'vaultTab') {
    renderVault();
  } else if (targetTabId === 'recordsTab') {
    if (typeof window.renderPRVaultUI === 'function') {
      window.renderPRVaultUI();
    }
  }
}

// Global scope attachment for inline onclick handlers if needed
window.switchMainTab = switchMainTab;
