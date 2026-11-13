// -------------------------------------------------------------
// GOOGLE SHEETS & COMMAND CORE TELEMETRY SYNC
// Modular Core Subsystem: sync.js
// -------------------------------------------------------------

const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxVl5oX6U2OwD6vI-KcJnR0srmjg64MLKY3CDuovFi20I_k_4Cc_t0a4XRy5KMo1AZo/exec";

export function getActiveWebhookUrl() {
  return localStorage.getItem('sonic_sheets_webhook') || DEFAULT_WEBHOOK_URL;
}

export function setWebhookUrl(url) {
  const clean = (url || '').trim();
  if (clean) {
    localStorage.setItem('sonic_sheets_webhook', clean);
  } else {
    localStorage.removeItem('sonic_sheets_webhook');
  }
  return clean;
}

/**
 * GET: Fetches live Lifetime EXP, PR Vault, Relics, and 2-Session History on boot
 */
export async function fetchSheetTelemetry() {
  const url = getActiveWebhookUrl();
  if (!url || url.includes('YOUR_APPS_SCRIPT_WEBHOOK_URL_HERE')) return null;

  try {
    console.log('[Telemetry] Querying Google Sheet command core...');
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.status === 'success') {
      // TSK-13: Sync recent session history from Sheet if available
      const remoteHistory = data.recentSessions || data.sessionHistory;
      if (Array.isArray(remoteHistory) && remoteHistory.length > 0) {
        try {
          const localRaw = localStorage.getItem('sonic_session_history');
          const localHistory = localRaw ? JSON.parse(localRaw) : [];
          // Merge remote + local by timestamp/stage and keep latest 15 sorties
          const merged = [...remoteHistory, ...localHistory];
          const seen = new Set();
          const deduped = [];
          for (const entry of merged) {
            const key = `${entry.timestamp || entry.date || ''}_${entry.stage || entry.Stage || ''}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(entry);
            }
          }
          deduped.sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));
          localStorage.setItem('sonic_session_history', JSON.stringify(deduped.slice(0, 15)));
        } catch (e) {
          console.warn('[Telemetry] Could not merge session history:', e);
        }
      }
      return data;
    }
  } catch (err) {
    console.warn('[Telemetry] Offline or sheet sync error:', err);
  }
  return null;
}
