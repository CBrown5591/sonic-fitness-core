// -------------------------------------------------------------
// BIOMETRICS & BODY COMPOSITION TELEMETRY HUD
// Modular UI Renderer: docs/js/ui/renderBiometrics.js
// -------------------------------------------------------------

let activeChartMetric = 'weight'; // 'weight' | 'leanMass' | 'fatMass' | 'bfPct'

function parseBiometricScans() {
  let raw = [];
  try {
    raw = JSON.parse(localStorage.getItem('sonic_biometrics_history')) || [];
  } catch (e) {}

  const allEntries = [...raw].sort(
    (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
  );

  // Filter strictly for valid scale weigh-ins (both Weight & Body Fat % > 0)
  const scaleScans = allEntries
    .filter(b => Number(b.weightLbs) > 0 && Number(b.bodyFatPct) > 0)
    .map(b => {
      const dateObj = new Date(b.timestamp || b.date);
      const weight = Number(b.weightLbs);
      const bfPct = Number(b.bodyFatPct);
      const fatMass = Number((weight * (bfPct / 100)).toFixed(1));
      const leanMass = Number((weight - fatMass).toFixed(1));
      return {
        ...b,
        dateObj,
        dateLabel: String(b.date || '').split('T')[0] || dateObj.toISOString().split('T')[0],
        weight,
        bfPct,
        fatMass,
        leanMass
      };
    })
    .filter(s => !isNaN(s.dateObj));

  return { allEntries, scaleScans };
}

/**
 * Finds the most recent non-zero / non-empty reading for a given field across all cached entries
 */
function getLatestMetricReading(allEntries, field, isNumeric = true) {
  for (const entry of allEntries) {
    const rawVal = entry[field];
    if (isNumeric) {
      const num = Number(rawVal);
      if (num > 0) {
        return {
          value: num,
          date: String(entry.date || entry.timestamp || '').split('T')[0]
        };
      }
    } else if (rawVal && String(rawVal).trim() !== '') {
      return {
        value: String(rawVal).trim(),
        date: String(entry.date || entry.timestamp || '').split('T')[0]
      };
    }
  }
  return null;
}

/**
 * Finds the historical scale scan closest to `targetDaysAgo`
 */
function findHistoricalAnchor(scaleScans, targetDaysAgo) {
  if (scaleScans.length < 2) return null;
  const nowMs = scaleScans[0].dateObj.getTime();
  const targetMs = nowMs - (targetDaysAgo * 24 * 60 * 60 * 1000);
  const maxToleranceMs = Math.max(4, Math.round(targetDaysAgo * 0.35)) * 24 * 60 * 60 * 1000;

  let bestScan = null;
  let smallestDiff = Infinity;

  for (let i = 1; i < scaleScans.length; i++) {
    const scanMs = scaleScans[i].dateObj.getTime();
    if (scanMs >= nowMs) continue;
    const diff = Math.abs(scanMs - targetMs);
    if (diff <= maxToleranceMs && diff < smallestDiff) {
      smallestDiff = diff;
      bestScan = scaleScans[i];
    }
  }
  return bestScan;
}

function formatDeltaBadge(val, unit, invertColor = false) {
  if (val === null || val === undefined || isNaN(val)) {
    return `<span style="color: #475569; font-size: 11px;">—</span>`;
  }
  const rounded = unit === '%' ? Number(val.toFixed(2)) : Number(val.toFixed(1));
  if (rounded === 0) {
    return `<span style="color: #94a3b8; font-weight: 700; font-size: 11px;">0.0${unit}</span>`;
  }
  const sign = rounded > 0 ? '+' : '';
  const isPositiveOutcome = invertColor ? rounded > 0 : rounded < 0;
  const color = isPositiveOutcome ? '#4ade80' : '#facc15';
  return `<span style="color: ${color}; font-weight: 800; font-size: 11px; font-family: monospace;">${sign}${rounded}${unit}</span>`;
}

function buildTrendChartSVG(scaleScans, metricKey) {
  const points = [...scaleScans].slice(0, 24).reverse();
  if (points.length < 2) {
    return `
      <div style="padding: 24px 12px; text-align: center; font-size: 11px; color: #64748b; background: rgba(15,23,42,0.5); border-radius: 8px;">
        Log at least 2 scale weigh-ins to unlock trend line visualization.
      </div>
    `;
  }

  const meta = {
    weight:   { label: 'TOTAL WEIGHT (LBS)', color: '#38bdf8', unit: ' lbs' },
    leanMass: { label: 'LEAN MASS (LBS)',    color: '#4ade80', unit: ' lbs' },
    fatMass:  { label: 'FAT MASS (LBS)',     color: '#f43f5e', unit: ' lbs' },
    bfPct:    { label: 'BODY FAT (%)',       color: '#facc15', unit: '%' }
  }[metricKey] || { label: 'TOTAL WEIGHT (LBS)', color: '#38bdf8', unit: ' lbs' };

  const values = points.map(p => p[metricKey]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = Math.max((maxVal - minVal) * 0.18, 0.5);
  const yMin = minVal - pad;
  const yMax = maxVal + pad;

  const width = 320;
  const height = 135;
  const leftPad = 36;
  const rightPad = 14;
  const topPad = 14;
  const bottomPad = 22;
  const plotW = width - leftPad - rightPad;
  const plotH = height - topPad - bottomPad;

  const coords = points.map((p, idx) => {
    const x = leftPad + (idx / (points.length - 1)) * plotW;
    const normY = (p[metricKey] - yMin) / (yMax - yMin || 1);
    const y = topPad + plotH - (normY * plotH);
    return { x, y, val: p[metricKey], date: p.dateLabel.slice(5) };
  });

  const polylinePoints = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPoints = `${coords[0].x.toFixed(1)},${topPad + plotH} ${polylinePoints} ${coords[coords.length - 1].x.toFixed(1)},${topPad + plotH}`;

  return `
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10px; font-weight: 800; color: ${meta.color}; letter-spacing: 0.5px;">${meta.label}</span>
        <span style="font-size: 10px; color: #94a3b8;">${points[0].dateLabel.slice(5)} → ${points[points.length - 1].dateLabel.slice(5)} (${points.length} scans)</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible;">
        <defs>
          <linearGradient id="bioChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${meta.color}" stop-opacity="0.32" />
            <stop offset="100%" stop-color="${meta.color}" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Gridlines & Y-Axis Labels -->
        <line x1="${leftPad}" y1="${topPad}" x2="${width - rightPad}" y2="${topPad}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
        <text x="${leftPad - 5}" y="${topPad + 3}" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">${maxVal.toFixed(1)}</text>

        <line x1="${leftPad}" y1="${topPad + plotH}" x2="${width - rightPad}" y2="${topPad + plotH}" stroke="rgba(255,255,255,0.12)" />
        <text x="${leftPad - 5}" y="${topPad + plotH}" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">${minVal.toFixed(1)}</text>

        <!-- Shaded Area & Trend Line -->
        <polygon points="${areaPoints}" fill="url(#bioChartGrad)" />
        <polyline fill="none" stroke="${meta.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />

        <!-- Data Nodes -->
        ${coords.map((c, i) => `
          <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === coords.length - 1 ? 4 : 2.5}" fill="${i === coords.length - 1 ? '#ffffff' : meta.color}" stroke="${meta.color}" stroke-width="1.5" />
          ${(i === 0 || i === coords.length - 1) ? `
            <text x="${c.x.toFixed(1)}" y="${height - 4}" text-anchor="${i === 0 ? 'start' : 'end'}" fill="#94a3b8" font-size="8" font-family="monospace">${c.date}</text>
          ` : ''}
        `).join('')}
      </svg>
    </div>
  `;
}

export function renderBiometricsUI() {
  const mount = document.getElementById('biometricsTabMount');
  if (!mount) return;

  const { allEntries, scaleScans } = parseBiometricScans();
  const latestScale = scaleScans[0] || null;
  const latestSync = allEntries[0] || null;

  if (!latestScale && !latestSync) {
    mount.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px 16px;">
        <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">🧬 BIOMETRIC TELEMETRY STANDBY</div>
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          No scale or Galaxy Watch8 readings cached yet. Complete a scan in Arboleaf and run <b>Sync Now</b> in HC Webhook, then reload the HUD.
        </div>
      </div>
    `;
    return;
  }

  // Pull most recent valid reading per Watch8 / Health Connect vital
  const latestSleep  = getLatestMetricReading(allEntries, 'sleepHrs', true);
  const latestSteps  = getLatestMetricReading(allEntries, 'steps', true);
  const latestHr     = getLatestMetricReading(allEntries, 'avgHr', true);
  const latestSpo2   = getLatestMetricReading(allEntries, 'spo2Pct', true);
  const latestBp     = getLatestMetricReading(allEntries, 'bp', false);
  const latestCardio = getLatestMetricReading(allEntries, 'cardioMins', true);

  // Timeframe anchors: 1W (7d), 1M (30d), 3M (90d), 6M (180d)
  const horizons = [
    { key: '1W', days: 7 },
    { key: '1M', days: 30 },
    { key: '3M', days: 90 },
    { key: '6M', days: 180 }
  ];

  const anchors = horizons.map(h => {
    const past = findHistoricalAnchor(scaleScans, h.days);
    return {
      label: h.key,
      dWeight: (latestScale && past) ? (latestScale.weight - past.weight) : null,
      dBfPct:  (latestScale && past) ? (latestScale.bfPct - past.bfPct) : null,
      dLean:   (latestScale && past) ? (latestScale.leanMass - past.leanMass) : null,
      dFat:    (latestScale && past) ? (latestScale.fatMass - past.fatMass) : null
    };
  });

  mount.innerHTML = `
    <!-- 1. MOST RECENT OVERALL READING -->
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span class="card-title">🧬 LATEST BODY COMPOSITION</span>
        <span style="font-size: 10px; font-weight: 700; color: #38bdf8;">
          ${latestScale ? `SCALE: ${latestScale.dateLabel}` : 'AWAITING SCALE'}
        </span>
      </div>

      ${latestScale ? `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
          <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 8px; border-left: 3px solid #38bdf8;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700;">TOTAL WEIGHT</div>
            <div style="font-size: 18px; font-weight: 900; color: #f8fafc; font-family: monospace;">${latestScale.weight.toFixed(1)} <span style="font-size: 11px; color: #94a3b8;">LBS</span></div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 8px; border-left: 3px solid #facc15;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700;">BODY FAT %</div>
            <div style="font-size: 18px; font-weight: 900; color: #facc15; font-family: monospace;">${latestScale.bfPct.toFixed(1)}<span style="font-size: 12px;">%</span></div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 8px; border-left: 3px solid #4ade80;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700;">LEAN MASS</div>
            <div style="font-size: 18px; font-weight: 900; color: #4ade80; font-family: monospace;">${latestScale.leanMass.toFixed(1)} <span style="font-size: 11px; color: #94a3b8;">LBS</span></div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 8px; border-left: 3px solid #f43f5e;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700;">ACTUAL FAT MASS</div>
            <div style="font-size: 18px; font-weight: 900; color: #f43f5e; font-family: monospace;">${latestScale.fatMass.toFixed(1)} <span style="font-size: 11px; color: #94a3b8;">LBS</span></div>
          </div>
        </div>
      ` : ''}

      <!-- Galaxy Watch8 Full Vitals Grid -->
      ${latestSync ? `
        <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.4px;">⌚ WATCH8 / HEALTH CONNECT VITALS</span>
            <span style="font-size: 10px; color: #64748b;">SYNC: ${String(latestSync.date || '').split('T')[0]}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 11px;">
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">SLEEP</div>
              <div style="font-weight: 800; color: #f8fafc; font-family: monospace;">${latestSleep ? `${latestSleep.value}h` : '—'}</div>
              ${latestSleep ? `<div style="font-size: 8px; color: #64748b;">${latestSleep.date.slice(5)}</div>` : ''}
            </div>
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">STEPS</div>
              <div style="font-weight: 800; color: #f8fafc; font-family: monospace;">${latestSteps ? latestSteps.value.toLocaleString() : '—'}</div>
              ${latestSteps ? `<div style="font-size: 8px; color: #64748b;">${latestSteps.date.slice(5)}</div>` : ''}
            </div>
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">AVG HR</div>
              <div style="font-weight: 800; color: #f8fafc; font-family: monospace;">${latestHr ? `${latestHr.value} bpm` : '—'}</div>
              ${latestHr ? `<div style="font-size: 8px; color: #64748b;">${latestHr.date.slice(5)}</div>` : ''}
            </div>
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">SPO2</div>
              <div style="font-weight: 800; color: #f8fafc; font-family: monospace;">${latestSpo2 ? `${latestSpo2.value}%` : '—'}</div>
              ${latestSpo2 ? `<div style="font-size: 8px; color: #64748b;">${latestSpo2.date.slice(5)}</div>` : ''}
            </div>
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">BLOOD PRESS.</div>
              <div style="font-weight: 800; color: #f8fafc; font-family: monospace;">${latestBp ? latestBp.value : '—'}</div>
              ${latestBp ? `<div style="font-size: 8px; color: #64748b;">${latestBp.date.slice(5)}</div>` : ''}
            </div>
            <div style="background: rgba(15,23,42,0.55); padding: 6px 8px; border-radius: 6px;">
              <div style="font-size: 9px; color: #94a3b8;">CARDIO</div>
              <div style="font-weight: 800; color: #4ade80; font-family: monospace;">${latestCardio ? `${latestCardio.value}m` : '0m'}</div>
              ${latestCardio ? `<div style="font-size: 8px; color: #64748b;">${latestCardio.date.slice(5)}</div>` : ''}
            </div>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- 2. MULTI-HORIZON DELTA MATRIX (1W / 1M / 3M / 6M) -->
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="card-title">📈 COMPOSITION TRAJECTORY (Δ)</span>
        <span style="font-size: 10px; color: #94a3b8;">VS. PRIOR WINDOW</span>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-size: 10px;">
              <th style="text-align: left; padding: 6px 4px;">METRIC</th>
              ${anchors.map(a => `<th style="padding: 6px 4px;">${a.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="text-align: left; padding: 8px 4px; font-weight: 700; color: #e2e8f0;">Weight</td>
              ${anchors.map(a => `<td style="padding: 8px 4px;">${formatDeltaBadge(a.dWeight, ' lb', false)}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="text-align: left; padding: 8px 4px; font-weight: 700; color: #4ade80;">Lean Mass</td>
              ${anchors.map(a => `<td style="padding: 8px 4px;">${formatDeltaBadge(a.dLean, ' lb', true)}</td>`).join('')}
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="text-align: left; padding: 8px 4px; font-weight: 700; color: #f43f5e;">Fat Mass</td>
              ${anchors.map(a => `<td style="padding: 8px 4px;">${formatDeltaBadge(a.dFat, ' lb', false)}</td>`).join('')}
            </tr>
            <tr>
              <td style="text-align: left; padding: 8px 4px; font-weight: 700; color: #facc15;">Body Fat %</td>
              ${anchors.map(a => `<td style="padding: 8px 4px;">${formatDeltaBadge(a.dBfPct, '%', false)}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. INTERACTIVE TREND VISUALIZER -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="card-title">📉 VISUAL TRENDLINE</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;">
        ${[
          { id: 'weight',   label: 'WEIGHT' },
          { id: 'leanMass', label: 'LEAN' },
          { id: 'fatMass',  label: 'FAT LBS' },
          { id: 'bfPct',    label: 'BF %' }
        ].map(btn => `
          <button type="button" class="bio-chart-toggle" data-metric="${btn.id}" style="
            padding: 6px 4px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer;
            background: ${activeChartMetric === btn.id ? '#38bdf8' : 'rgba(15,23,42,0.75)'};
            color: ${activeChartMetric === btn.id ? '#0f172a' : '#94a3b8'};
            border: 1px solid ${activeChartMetric === btn.id ? '#38bdf8' : 'rgba(255,255,255,0.12)'};
          ">${btn.label}</button>
        `).join('')}
      </div>

      ${buildTrendChartSVG(scaleScans, activeChartMetric)}
    </div>
  `;

  mount.querySelectorAll('.bio-chart-toggle').forEach(btn => {
    btn.onclick = () => {
      activeChartMetric = btn.dataset.metric;
      renderBiometricsUI();
    };
  });
}

window.renderBiometricsUI = renderBiometricsUI;
