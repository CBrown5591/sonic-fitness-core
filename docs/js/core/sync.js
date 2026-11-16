// -------------------------------------------------------------
// GOOGLE SHEETS & COMMAND CORE TELEMETRY SYNC
// Modular Core Subsystem: docs/js/core/sync.js
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
 * GET: Fetches live Lifetime EXP, PR Vault, Relics, Biometrics, and Session History on boot
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
      // 1. Sync recent session history from Sheet if available
      const remoteHistory = data.recentSessions || data.sessionHistory;
      if (Array.isArray(remoteHistory) && remoteHistory.length > 0) {
        try {
          const localRaw = localStorage.getItem('sonic_session_history');
          const localHistory = localRaw ? JSON.parse(localRaw) : [];
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

      // 2. Sync Galaxy Watch8 / Health Connect BIOMETRICS rows from Sheet (up to 200 rows for 6M trends)
      if (Array.isArray(data.biometrics)) {
        try {
          const sortedBio = [...data.biometrics].sort(
            (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
          );
          localStorage.setItem('sonic_biometrics_history', JSON.stringify(sortedBio.slice(0, 200)));
        } catch (e) {
          console.warn('[Telemetry] Could not cache biometrics history:', e);
        }
      }

      return data;
    }
  } catch (err) {
    console.warn('[Telemetry] Offline or sheet sync error:', err);
  }
  return null;
}

/**
 * POST: Transmits completed stage telemetry payload to Google Sheets
 */
export async function syncSessionToSheets(sessionPayload) {
  const url = getActiveWebhookUrl();
  if (!url) return false;

  try {
    console.log('[Webhook] Transmitting session telemetry to Google Sheets...');
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionPayload)
    });
    console.log('[Webhook] Telemetry synced cleanly.');
    return true;
  } catch (err) {
    console.warn('[Webhook] Sync error:', err);
    return false;
  }
}

/**
 * POST: Transmits parsed Arboleaf PDF Deep Scan data to BIOMETRICS Column R
 */
export async function syncArboleafDeepScan(parsedReport) {
  const url = getActiveWebhookUrl();
  if (!url) return false;

  try {
    console.log('[Webhook] Transmitting Arboleaf Deep Scan PDF to BIOMETRICS Column R...');
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'import_arboleaf_pdf',
        timestamp: parsedReport.timestamp,
        date: parsedReport.date,
        weightLbs: parsedReport.weightLbs,
        bodyFatPct: parsedReport.bodyFatPct,
        deepScan: parsedReport.deepScan
      })
    });
    console.log('[Webhook] Arboleaf Deep Scan synced cleanly.');
    return true;
  } catch (err) {
    console.warn('[Webhook] Deep Scan sync error:', err);
    return false;
  }
}
