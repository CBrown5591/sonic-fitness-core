// docs/js/ui/renderTabs.js
import { renderVault } from './renderVault.js';
import { refreshRecordsTab } from './renderRecordsTab.js';

export function switchMainTab(targetTabId) {
  // 1. Hide all views
  document.querySelectorAll('.main-tab-view').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active-tab-view');
  });

  // 2. Clear active tab buttons
  document.querySelectorAll('.main-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Activate selected view
  const activeView = document.getElementById(targetTabId);
  if (activeView) {
    activeView.style.display = 'block';
    activeView.classList.add('active-tab-view');
  }

  // 4. Highlight button
  const matchingBtn = document.querySelector(`.main-tab-btn[data-target="${targetTabId}"]`)
                   || document.querySelector(`.main-tab-btn[onclick*="${targetTabId}"]`);
  if (matchingBtn) {
    matchingBtn.classList.add('active');
  }

  // 5. Trigger live renders for target tab
  if (targetTabId === 'recordsTab') {
    refreshRecordsTab();
  } else if (targetTabId === 'vaultTab') {
    renderVault();
  }
}

window.switchMainTab = switchMainTab;
