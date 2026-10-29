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
 * GET: Fetches live Lifetime EXP, PR Vault, and Relics on boot
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
