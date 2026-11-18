// -------------------------------------------------------------
// BIOMETRICS, ARBOLEAF DEEP SCAN & SEGMENTAL TELEMETRY HUD
// Modular UI Renderer: docs/js/ui/renderBiometrics.js
// -------------------------------------------------------------
import { parseMultipleArboleafPdfs } from '../engine/arboleafPdfParser.js';
import { syncArboleafDeepScan } from '../core/sync.js';
import { getPRVault } from '../engine/records.js';

let activeChartMetric = 'weight'; // 'weight' | 'leanMass' | 'fatMass' | 'bfPct'
let isDeepScanEditorOpen = false;

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

  // Find latest entry containing an imported or manually edited Deep Scan (Column R)
  const latestDeepScanEntry = allEntries.find(b => b.deepScan && typeof b.deepScan === 'object') || null;

  return { allEntries, scaleScans, latestDeepScanEntry };
}

function latestNonZero(allEntries, field, isString = false) {
  for (const row of allEntries) {
    const val = row[field];
    if (isString) {
      if (val && String(val).trim() !== '') {
        return { value: String(val).trim(), date: String(row.date || '').split('T')[0] };
      }
    } else if (Number(val) > 0) {
      return { value: Number(val), date: String(row.date || '').split('T')[0] };
    }
  }
  return null;
}

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
      <div style="padding: 20px 12px; text-align: center; font-size: 11px; color: #64748b; background: rgba(15,23,42,0.5); border-radius: 8px;">
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
        <line x1="${leftPad}" y1="${topPad}" x2="${width - rightPad}" y2="${topPad}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
        <text x="${leftPad - 5}" y="${topPad + 3}" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">${maxVal.toFixed(1)}</text>
        <line x1="${leftPad}" y1="${topPad + plotH}" x2="${width - rightPad}" y2="${topPad + plotH}" stroke="rgba(255,255,255,0.12)" />
        <text x="${leftPad - 5}" y="${topPad + plotH}" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">${minVal.toFixed(1)}</text>
        <polygon points="${areaPoints}" fill="url(#bioChartGrad)" />
        <polyline fill="none" stroke="${meta.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
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

function mergeDeepScanIntoLocalHistory(parsedReport, overwriteAll = false) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('sonic_biometrics_history')) || [];
  } catch (e) {}

  const targetDate = parsedReport.date;
  let matchedIdx = history.findIndex(
    row => String(row.date || '').split('T')[0] === targetDate && Number(row.weightLbs) > 0
  );
  if (matchedIdx === -1) {
    matchedIdx = history.findIndex(row => String(row.date || '').split('T')[0] === targetDate);
  }

  if (matchedIdx !== -1) {
    const existingDs = history[matchedIdx].deepScan || {};
    const incomingDs = parsedReport.deepScan || {};
    const mergedDs = overwriteAll ? { ...existingDs, ...incomingDs } : { ...existingDs };

    if (!overwriteAll) {
      Object.entries(incomingDs).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== 0) {
          mergedDs[k] = v;
        }
      });
    }

    history[matchedIdx] = {
      ...history[matchedIdx],
      weightLbs: history[matchedIdx].weightLbs > 0 ? history[matchedIdx].weightLbs : parsedReport.weightLbs,
      bodyFatPct: history[matchedIdx].bodyFatPct > 0 ? history[matchedIdx].bodyFatPct : parsedReport.bodyFatPct,
      deepScan: mergedDs
    };
    localStorage.setItem('sonic_biometrics_history', JSON.stringify(history.slice(0, 200)));
    return history[matchedIdx];
  } else {
    const newEntry = {
      timestamp: parsedReport.timestamp || new Date().toISOString(),
      date: parsedReport.date,
      sleepHrs: 0,
      steps: 0,
      avgHr: 0,
      cardioMins: 0,
      spo2Pct: 0,
      bodyFatPct: parsedReport.bodyFatPct || 0,
      weightLbs: parsedReport.weightLbs || 0,
      bp: '',
      source: 'Arboleaf_Manual_Edit',
      deepScan: parsedReport.deepScan
    };
    history.unshift(newEntry);
    localStorage.setItem('sonic_biometrics_history', JSON.stringify(history.slice(0, 200)));
    return newEntry;
  }
}

function buildDeepScanEditorDrawer(deepScanEntry, fallbackDate) {
  if (!isDeepScanEditorOpen) return '';

  const ds = deepScanEntry?.deepScan || {};
  const segLean = ds.segmentalLean || {};
  const scanDate = ds.scanDate || String(deepScanEntry?.date || fallbackDate || new Date().toISOString().split('T')[0]).split('T')[0];

  const inputStyle = `
    width: 100%; box-sizing: border-box; padding: 7px 8px;
    background: #0b0f19; border: 1px solid rgba(56,189,248,0.35);
    border-radius: 6px; color: #f8fafc; font-size: 12px; font-family: monospace;
  `;
  const labelStyle = `display: block; font-size: 9px; font-weight: 800; color: #94a3b8; margin-bottom: 3px;`;

  return `
    <div id="deepScanEditorPanel" style="
      background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8;
      border-radius: 8px; padding: 12px; margin-bottom: 12px;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 11px; font-weight: 900; color: #38bdf8;">✏️ EDIT DEEP SCAN METRICS</span>
        <button type="button" id="closeDeepScanEditorBtn" style="
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: #cbd5e1; border-radius: 4px; padding: 2px 8px; font-size: 10px; cursor: pointer;
        ">✕ CLOSE</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
        <div>
          <label style="${labelStyle}">SCAN DATE</label>
          <input type="date" id="editDsDate" value="${scanDate}" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">VISCERAL FAT</label>
          <input type="number" step="1" id="editDsVisceral" value="${ds.visceralFat || ''}" placeholder="20" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">WAIST-HIP RATIO</label>
          <input type="number" step="0.01" id="editDsWhr" value="${ds.waistHipRatio || ''}" placeholder="1.29" style="${inputStyle}" />
        </div>

        <div>
          <label style="${labelStyle}">SKEL. MUSCLE (LB)</label>
          <input type="number" step="0.1" id="editDsSmLbs" value="${ds.skeletalMuscleLbs || ''}" placeholder="104.6" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">SKEL. MUSCLE (%)</label>
          <input type="number" step="0.1" id="editDsSmPct" value="${ds.skeletalMusclePct || ''}" placeholder="32.5" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">BODY WATER (%)</label>
          <input type="number" step="0.1" id="editDsWaterPct" value="${ds.bodyWaterPct || ''}" placeholder="42.5" style="${inputStyle}" />
        </div>

        <div>
          <label style="${labelStyle}">BODY WATER (L)</label>
          <input type="number" step="0.1" id="editDsWaterL" value="${ds.bodyWaterL || ''}" placeholder="62.1" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">BONE MASS (LB)</label>
          <input type="number" step="0.1" id="editDsBoneLbs" value="${ds.boneMassLbs || ''}" placeholder="13.8" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">BONE MASS (%)</label>
          <input type="number" step="0.1" id="editDsBonePct" value="${ds.boneMassPct || ''}" placeholder="4.3" style="${inputStyle}" />
        </div>

        <div>
          <label style="${labelStyle}">SUBQ. FAT (LB)</label>
          <input type="number" step="0.1" id="editDsSubqLbs" value="${ds.subqFatLbs || ''}" placeholder="108.2" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">SUBQ. FAT (%)</label>
          <input type="number" step="0.1" id="editDsSubqPct" value="${ds.subqFatPct || ''}" placeholder="33.6" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">FITNESS SCORE</label>
          <input type="number" step="0.1" id="editDsScore" value="${ds.fitnessScore || ''}" placeholder="41.8" style="${inputStyle}" />
        </div>
      </div>

      <div style="font-size: 9px; font-weight: 800; color: #4ade80; margin-bottom: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
        SEGMENTAL LEAN MASS (LBS)
      </div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 10px;">
        <div>
          <label style="${labelStyle}">L ARM</label>
          <input type="number" step="0.1" id="editSegLArm" value="${segLean.leftArmLbs || ''}" placeholder="11.0" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">R ARM</label>
          <input type="number" step="0.1" id="editSegRArm" value="${segLean.rightArmLbs || ''}" placeholder="11.2" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">TRUNK</label>
          <input type="number" step="0.1" id="editSegTrunk" value="${segLean.trunkLbs || ''}" placeholder="82.6" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">L LEG</label>
          <input type="number" step="0.1" id="editSegLLeg" value="${segLean.leftLegLbs || ''}" placeholder="30.4" style="${inputStyle}" />
        </div>
        <div>
          <label style="${labelStyle}">R LEG</label>
          <input type="number" step="0.1" id="editSegRLeg" value="${segLean.rightLegLbs || ''}" placeholder="31.0" style="${inputStyle}" />
        </div>
      </div>

      <button type="button" id="saveDeepScanEditBtn" style="
        width: 100%; background: #4ade80; color: #0f172a; border: none;
        padding: 9px 12px; border-radius: 6px; font-size: 11px; font-weight: 900; cursor: pointer;
      ">💾 SAVE &amp; SYNC TO SHEET (COL R)</button>
    </div>
  `;
}

function renderDeepScanAndSegmentalHTML(deepScanEntry) {
  if (!deepScanEntry || !deepScanEntry.deepScan) return '';
  const ds = deepScanEntry.deepScan;
  const scanDate = ds.scanDate || String(deepScanEntry.date || '').split('T')[0] || 'IMPORTED';
  const segLean = ds.segmentalLean;
  const segFat = ds.segmentalFat;

  return `
    <!-- ARBOLEAF DEEP SCAN METRICS -->
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span class="card-title">🔬 ARBOLEAF DEEP SCAN</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; font-weight: 700; color: #a78bfa;">${scanDate}</span>
          <button type="button" class="open-deepscan-edit-btn" style="
            background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.45);
            color: #38bdf8; border-radius: 5px; padding: 3px 8px; font-size: 9px; font-weight: 800; cursor: pointer;
          ">✏️ EDIT</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid ${ds.visceralFat >= 15 ? '#f43f5e' : '#4ade80'};">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">VISCERAL FAT</div>
          <div style="font-size: 16px; font-weight: 900; color: ${ds.visceralFat >= 15 ? '#f43f5e' : '#f8fafc'}; font-family: monospace;">${ds.visceralFat || '—'}</div>
          <div style="font-size: 9px; color: #64748b;">Target &lt; 10</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid #4ade80;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">SKEL. MUSCLE</div>
          <div style="font-size: 16px; font-weight: 900; color: #4ade80; font-family: monospace;">${ds.skeletalMuscleLbs ? `${ds.skeletalMuscleLbs}` : '—'} <span style="font-size: 10px;">lb</span></div>
          <div style="font-size: 9px; color: #94a3b8;">${ds.skeletalMusclePct ? `${ds.skeletalMusclePct}%` : ''}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid #38bdf8;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">BODY WATER</div>
          <div style="font-size: 16px; font-weight: 900; color: #38bdf8; font-family: monospace;">${ds.bodyWaterPct ? `${ds.bodyWaterPct}%` : '—'}</div>
          <div style="font-size: 9px; color: #94a3b8;">${ds.bodyWaterL ? `${ds.bodyWaterL} L` : ''}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid #e2e8f0;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">BONE MASS</div>
          <div style="font-size: 15px; font-weight: 900; color: #f8fafc; font-family: monospace;">${ds.boneMassLbs ? `${ds.boneMassLbs}` : '—'} <span style="font-size: 10px;">lb</span></div>
          <div style="font-size: 9px; color: #94a3b8;">${ds.boneMassPct ? `${ds.boneMassPct}%` : ''}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid #facc15;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">SUBQ. FAT</div>
          <div style="font-size: 15px; font-weight: 900; color: #facc15; font-family: monospace;">${ds.subqFatLbs ? `${ds.subqFatLbs}` : '—'} <span style="font-size: 10px;">lb</span></div>
          <div style="font-size: 9px; color: #94a3b8;">${ds.subqFatPct ? `${ds.subqFatPct}%` : ''}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 8px; border-top: 2px solid #a78bfa;">
          <div style="font-size: 9px; color: #94a3b8; font-weight: 700;">WAIST-HIP</div>
          <div style="font-size: 15px; font-weight: 900; color: #f8fafc; font-family: monospace;">${ds.waistHipRatio || '—'}</div>
          <div style="font-size: 9px; color: #64748b;">Target ≤ 0.90</div>
        </div>
      </div>

      ${(segLean || segFat) ? `
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; color: #cbd5e1; letter-spacing: 0.4px;">⚖️ SEGMENTAL MUSCLE & FAT MAP</span>
            ${segLean ? `<span style="font-size: 9px; color: #4ade80; font-weight: 700;">SYM: U ${segLean.upperSymmetryPct}% • L ${segLean.lowerSymmetryPct}%</span>` : ''}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-size: 9px;">
                <th style="text-align: left; padding: 5px 4px;">REGION</th>
                <th style="padding: 5px 4px;">LEAN (L / R)</th>
                <th style="padding: 5px 4px;">FAT (L / R)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="text-align: left; padding: 6px 4px; font-weight: 700; color: #e2e8f0;">Upper Limbs</td>
                <td style="padding: 6px 4px; color: #4ade80; font-family: monospace;">${segLean ? `${segLean.leftArmLbs} / ${segLean.rightArmLbs} lb` : '—'}</td>
                <td style="padding: 6px 4px; color: #f43f5e; font-family: monospace;">${segFat ? `${segFat.leftArmLbs} / ${segFat.rightArmLbs} lb` : '—'}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="text-align: left; padding: 6px 4px; font-weight: 700; color: #e2e8f0;">Trunk / Core</td>
                <td style="padding: 6px 4px; color: #4ade80; font-family: monospace;">${segLean ? `${segLean.trunkLbs} lb${segLean.trunkPct ? ` (${segLean.trunkPct}%)` : ''}` : '—'}</td>
                <td style="padding: 6px 4px; color: #f43f5e; font-family: monospace;">${segFat ? `${segFat.trunkLbs} lb` : '—'}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 6px 4px; font-weight: 700; color: #e2e8f0;">Lower Limbs</td>
                <td style="padding: 6px 4px; color: #4ade80; font-family: monospace;">${segLean ? `${segLean.leftLegLbs} / ${segLean.rightLegLbs} lb` : '—'}</td>
                <td style="padding: 6px 4px; color: #f43f5e; font-family: monospace;">${segFat ? `${segFat.leftLegLbs} / ${segFat.rightLegLbs} lb` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Resolves the highest e1RM in PR_VAULT matching any keyword in `patterns`.
 * Multiplies DB e1RMs by 2 when `scaleDBToBilateral` is true so single-hand DB logs
 * compare apples-to-apples against bilateral machine stacks.
 */
function findBestVaultE1RM(prVault, patterns, scaleDBToBilateral = false) {
  let best = 0;
  for (const [name, data] of Object.entries(prVault || {})) {
    const e1rm = Number(data?.e1rm) || 0;
    if (e1rm <= 0) continue;
    const lower = name.toLowerCase();
    if (patterns.some(p => lower.includes(p))) {
      const isDB = /\bdb\b/.test(lower) || lower.includes('dumbbell');
      const normalized = (scaleDBToBilateral && isDB) ? e1rm * 2 : e1rm;
      if (normalized > best) best = normalized;
    }
  }
  return best;
}

function renderFunctionalBalanceCardHTML(deepScanEntry) {
  const prVault = getPRVault() || {};

  // 1. Horizontal Push vs. Pull (Target: 0.85 - 1.00)
  const pushE1RM = findBestVaultE1RM(prVault, ['chest press', 'bench press', 'floor press'], true);
  const pullE1RM = findBestVaultE1RM(prVault, ['high row', 'cable row', 'dumbbell row', 'pulldown'], true);
  const pushPullRatio = (pushE1RM > 0 && pullE1RM > 0) ? Number((pushE1RM / pullE1RM).toFixed(2)) : null;

  // 2. Hamstring vs. Quad Isolation (Target: 0.65 - 1.40)
  const quadE1RM = findBestVaultE1RM(prVault, ['leg extension'], false);
  const hamE1RM  = findBestVaultE1RM(prVault, ['leg curl'], false);
  const quadHamRatio = (quadE1RM > 0 && hamE1RM > 0) ? Number((hamE1RM / quadE1RM).toFixed(2)) : null;

  // 3. Hip Abduction vs. Adduction (Target: 0.85 - 1.00)
  const addE1RM = findBestVaultE1RM(prVault, ['hip adduction', 'adductor'], false);
  const abdE1RM = findBestVaultE1RM(prVault, ['hip abduction', 'abductor'], false);
  const hipRatio = (addE1RM > 0 && abdE1RM > 0) ? Number((abdE1RM / addE1RM).toFixed(2)) : null;

  // 4. Arm Balance (Triceps vs. Biceps) + Left vs. Right Unilateral Symmetry
  const bicepE1RM  = findBestVaultE1RM(prVault, ['curl'], false);
  const tricepE1RM = findBestVaultE1RM(prVault, ['tricep', 'pushdown', 'skullcrusher'], false);
  const armRatio   = (bicepE1RM > 0 && tricepE1RM > 0) ? Number((tricepE1RM / bicepE1RM).toFixed(2)) : null;

  let lrForceSymPct = null;
  for (const data of Object.values(prVault)) {
    if (Number(data?.leftE1RM) > 0 && Number(data?.rightE1RM) > 0) {
      const minArm = Math.min(data.leftE1RM, data.rightE1RM);
      const maxArm = Math.max(data.leftE1RM, data.rightE1RM);
      lrForceSymPct = Number(((minArm / maxArm) * 100).toFixed(1));
      break;
    }
  }

  const segLean = deepScanEntry?.deepScan?.segmentalLean;
  const leanSymText = (segLean?.leftArmLbs && segLean?.rightArmLbs)
    ? `Mass: ${segLean.leftArmLbs} vs ${segLean.rightArmLbs} lb (${segLean.upperSymmetryPct}%)`
    : '';

  const buildRow = (label, ratio, minOk, maxOk, detailText, lowTag, highTag) => {
    let badge = `<span style="color:#64748b; font-size:9px; font-weight:800;">PENDING DATA</span>`;
    let valStr = '—';

    if (ratio !== null) {
      valStr = ratio.toFixed(2);
      if (ratio >= minOk && ratio <= maxOk) {
        badge = `<span style="background:rgba(74,222,128,0.15); color:#4ade80; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:800;">BALANCED</span>`;
      } else if (ratio < minOk) {
        badge = `<span style="background:rgba(250,204,21,0.15); color:#facc15; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:800;">${lowTag}</span>`;
      } else {
        badge = `<span style="background:rgba(56,189,248,0.15); color:#38bdf8; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:800;">${highTag}</span>`;
      }
    }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
        <div>
          <div style="font-size:11px; font-weight:800; color:#e2e8f0;">${label}</div>
          <div style="font-size:9px; color:#94a3b8; margin-top:2px;">${detailText} • Target ${minOk.toFixed(2)}–${maxOk.toFixed(2)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:900; color:#f8fafc; font-family:monospace; margin-bottom:2px;">${valStr}</div>
          ${badge}
        </div>
      </div>
    `;
  };

  return `
    <!-- FUNCTIONAL STRUCTURAL BALANCE CARD -->
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="card-title">⚖️ FUNCTIONAL STRUCTURAL BALANCE</span>
        <span style="font-size: 9px; font-weight: 800; color: #38bdf8;">LIVE PR VAULT</span>
      </div>

      ${buildRow(
        'Horizontal Push : Pull',
        pushPullRatio,
        0.85,
        1.00,
        pushE1RM && pullE1RM ? `${pushE1RM} vs ${pullE1RM} lbs` : 'Log Chest Press & Row',
        'PULL-STRONG',
        'PUSH-DOMINANT'
      )}

      ${buildRow(
        'Hamstring : Quad Isolation',
        quadHamRatio,
        0.65,
        1.40,
        quadE1RM && hamE1RM ? `${hamE1RM} vs ${quadE1RM} lbs` : 'Log Leg Ext & Leg Curl',
        'QUAD-DOMINANT',
        'POSTERIOR-STRONG'
      )}

      ${buildRow(
        'Hip Abduction : Adduction',
        hipRatio,
        0.85,
        1.00,
        addE1RM && abdE1RM ? `${abdE1RM} vs ${addE1RM} lbs` : 'Log Hip Add & Abd',
        'ADDUCTOR-DOMINANT',
        'ABDUCTOR-STRONG'
      )}

      ${buildRow(
        'Triceps : Biceps Isolation',
        armRatio,
        1.15,
        1.30,
        bicepE1RM && tricepE1RM ? `${tricepE1RM} vs ${bicepE1RM} lbs` : 'Log Curl & Tricep Ext',
        'BICEP-DOMINANT',
        'TRICEP-DOMINANT'
      )}

      <!-- Unilateral Arm Force Symmetry Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; margin-top:2px;">
        <div>
          <div style="font-size:11px; font-weight:800; color:#c4b5fd;">Unilateral Arm Force Symmetry</div>
          <div style="font-size:9px; color:#94a3b8;">${leanSymText || 'Target ≥ 95.0% L/R output parity'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:13px; font-weight:900; color:${lrForceSymPct !== null && lrForceSymPct >= 95 ? '#4ade80' : '#f8fafc'}; font-family:monospace;">
            ${lrForceSymPct !== null ? `${lrForceSymPct}%` : 'PENDING'}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderBiometricsUI() {
  const mount = document.getElementById('biometricsTabMount');
  if (!mount) return;

  const { allEntries, scaleScans, latestDeepScanEntry } = parseBiometricScans();
  const latestScale = scaleScans[0] || null;

  const sleepLatest = latestNonZero(allEntries, 'sleepHrs');
  const spo2Latest = latestNonZero(allEntries, 'spo2Pct');
  const hrLatest = latestNonZero(allEntries, 'avgHr');
  const stepsLatest = latestNonZero(allEntries, 'steps');
  const bpLatest = latestNonZero(allEntries, 'bp', true);
  const cardioLatest = latestNonZero(allEntries, 'cardioMins');

  const pdfDropInBarHTML = `
    <div class="card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 12px;">
      <div style="min-width: 0; flex: 1;">
        <div style="font-size: 11px; font-weight: 800; color: #f8fafc;">📄 ARBOLEAF DEEP SCAN</div>
        <div id="arboleafPdfStatus" style="font-size: 10px; color: #94a3b8;">Import PDF or edit metrics manually</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" class="open-deepscan-edit-btn" style="
          background: rgba(167, 139, 250, 0.18); border: 1px solid rgba(167, 139, 250, 0.5);
          color: #c4b5fd; padding: 7px 10px; border-radius: 6px;
          font-size: 10px; font-weight: 900; cursor: pointer; white-space: nowrap;
        ">✏️ EDIT</button>
        <label for="arboleafPdfInput" style="
          background: #38bdf8; color: #0f172a; padding: 7px 11px; border-radius: 6px;
          font-size: 10px; font-weight: 900; cursor: pointer; white-space: nowrap;
        ">IMPORT PDF</label>
      </div>
      <input type="file" id="arboleafPdfInput" accept="application/pdf,.pdf" multiple style="display: none;" />
    </div>
    ${buildDeepScanEditorDrawer(latestDeepScanEntry, latestScale?.dateLabel)}
  `;

  if (!latestScale && allEntries.length === 0) {
    mount.innerHTML = `
      ${pdfDropInBarHTML}
      ${renderFunctionalBalanceCardHTML(latestDeepScanEntry)}
      <div class="card" style="text-align: center; padding: 24px 16px;">
        <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">🧬 BIOMETRIC TELEMETRY STANDBY</div>
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          No scale or Galaxy Watch8 readings cached yet. Sync Health Connect, tap <b>IMPORT PDF</b>, or tap <b>✏️ EDIT</b> above.
        </div>
      </div>
    `;
    bindPdfAndEditorHandlers(latestDeepScanEntry);
    return;
  }

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
    ${pdfDropInBarHTML}

    <!-- 1. MOST RECENT OVERALL READING -->
    <div class="card" style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span class="card-title">🧬 LATEST BODY COMPOSITION</span>
        <span style="font-size: 10px; font-weight: 700; color: #38bdf8;">${latestScale ? latestScale.dateLabel : 'WATCH ONLY'}</span>
      </div>

      ${latestScale ? `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px;">
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

      <!-- Galaxy Watch8 Vitals Strip -->
      <div style="display: flex; flex-wrap: wrap; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10px; color: #cbd5e1;">
        ${sleepLatest ? `<span style="background: rgba(56,189,248,0.12); padding: 3px 7px; border-radius: 4px;">😴 Sleep: <b>${sleepLatest.value}h</b></span>` : ''}
        ${spo2Latest ? `<span style="background: rgba(56,189,248,0.12); padding: 3px 7px; border-radius: 4px;">🫁 SpO2: <b>${spo2Latest.value}%</b></span>` : ''}
        ${hrLatest ? `<span style="background: rgba(56,189,248,0.12); padding: 3px 7px; border-radius: 4px;">❤️ Avg HR: <b>${hrLatest.value} bpm</b></span>` : ''}
        ${stepsLatest ? `<span style="background: rgba(56,189,248,0.12); padding: 3px 7px; border-radius: 4px;">👟 Steps: <b>${stepsLatest.value.toLocaleString()}</b></span>` : ''}
        ${bpLatest ? `<span style="background: rgba(244,63,94,0.16); padding: 3px 7px; border-radius: 4px;">🩺 BP: <b>${bpLatest.value}</b></span>` : ''}
        ${cardioLatest ? `<span style="background: rgba(74,222,128,0.12); padding: 3px 7px; border-radius: 4px;">🏃 Cardio: <b>${cardioLatest.value}m</b></span>` : ''}
      </div>
    </div>

    <!-- 2. ARBOLEAF DEEP SCAN & SEGMENTAL MUSCLE/FAT CARD -->
    ${renderDeepScanAndSegmentalHTML(latestDeepScanEntry)}

    <!-- 3. FUNCTIONAL STRUCTURAL BALANCE CARD -->
    ${renderFunctionalBalanceCardHTML(latestDeepScanEntry)}

    <!-- 4. MULTI-HORIZON DELTA MATRIX (1W / 1M / 3M / 6M) -->
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

    <!-- 5. INTERACTIVE TREND VISUALIZER -->
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

  bindPdfAndEditorHandlers(latestDeepScanEntry);
}

function bindPdfAndEditorHandlers(latestDeepScanEntry) {
  // 1. Toggle Deep Scan Editor Open/Close
  document.querySelectorAll('.open-deepscan-edit-btn').forEach(btn => {
    btn.onclick = () => {
      isDeepScanEditorOpen = !isDeepScanEditorOpen;
      renderBiometricsUI();
    };
  });

  const closeBtn = document.getElementById('closeDeepScanEditorBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      isDeepScanEditorOpen = false;
      renderBiometricsUI();
    };
  }

  // 2. Save & Sync Manual Deep Scan Edits
  const saveEditBtn = document.getElementById('saveDeepScanEditBtn');
  if (saveEditBtn) {
    saveEditBtn.onclick = async () => {
      const numVal = (id) => {
        const v = parseFloat(document.getElementById(id)?.value);
        return isNaN(v) ? 0 : v;
      };

      const scanDate = document.getElementById('editDsDate')?.value || new Date().toISOString().split('T')[0];
      const existingDs = latestDeepScanEntry?.deepScan || {};
      const existingSegLean = existingDs.segmentalLean || {};

      const lArm = numVal('editSegLArm');
      const rArm = numVal('editSegRArm');
      const trunk = numVal('editSegTrunk');
      const lLeg = numVal('editSegLLeg');
      const rLeg = numVal('editSegRLeg');

      const hasSegLean = lArm > 0 || rArm > 0 || trunk > 0 || lLeg > 0 || rLeg > 0;
      const upperSymmetryPct = (lArm > 0 && rArm > 0)
        ? Math.round((Math.min(lArm, rArm) / Math.max(lArm, rArm)) * 1000) / 10
        : (existingSegLean.upperSymmetryPct || 0);
      const lowerSymmetryPct = (lLeg > 0 && rLeg > 0)
        ? Math.round((Math.min(lLeg, rLeg) / Math.max(lLeg, rLeg)) * 1000) / 10
        : (existingSegLean.lowerSymmetryPct || 0);

      const updatedDeepScan = {
        ...existingDs,
        scanDate,
        visceralFat: numVal('editDsVisceral'),
        waistHipRatio: numVal('editDsWhr'),
        skeletalMuscleLbs: numVal('editDsSmLbs'),
        skeletalMusclePct: numVal('editDsSmPct'),
        bodyWaterPct: numVal('editDsWaterPct'),
        bodyWaterL: numVal('editDsWaterL'),
        boneMassLbs: numVal('editDsBoneLbs'),
        boneMassPct: numVal('editDsBonePct'),
        subqFatLbs: numVal('editDsSubqLbs'),
        subqFatPct: numVal('editDsSubqPct'),
        fitnessScore: numVal('editDsScore'),
        segmentalLean: hasSegLean
          ? {
              ...existingSegLean,
              leftArmLbs: lArm,
              rightArmLbs: rArm,
              trunkLbs: trunk,
              leftLegLbs: lLeg,
              rightLegLbs: rLeg,
              upperSymmetryPct,
              lowerSymmetryPct
            }
          : (existingDs.segmentalLean || null)
      };

      const reportPayload = {
        timestamp: new Date(`${scanDate}T12:00:00`).toISOString(),
        date: scanDate,
        weightLbs: latestDeepScanEntry?.weightLbs || 0,
        bodyFatPct: latestDeepScanEntry?.bodyFatPct || 0,
        deepScan: updatedDeepScan
      };

      const mergedRecord = mergeDeepScanIntoLocalHistory(reportPayload, true);
      isDeepScanEditorOpen = false;
      renderBiometricsUI();

      const statusEl = document.getElementById('arboleafPdfStatus');
      if (statusEl) {
        statusEl.style.color = '#38bdf8';
        statusEl.innerText = 'Syncing edited Deep Scan to Google Sheet...';
      }

      await syncArboleafDeepScan({
        ...reportPayload,
        deepScan: mergedRecord.deepScan
      });

      if (statusEl) {
        statusEl.style.color = '#4ade80';
        statusEl.innerText = `✓ Saved & Synced ${scanDate} (Visceral: ${updatedDeepScan.visceralFat}, WHR: ${updatedDeepScan.waistHipRatio})`;
      }
    };
  }

  // 3. PDF File Picker Handler
  const input = document.getElementById('arboleafPdfInput');
  const statusEl = document.getElementById('arboleafPdfStatus');
  if (!input) return;

  input.onchange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (statusEl) {
        statusEl.style.color = '#38bdf8';
        statusEl.innerText = `Scanning ${files.length} Arboleaf PDF${files.length > 1 ? 's' : ''}...`;
      }

      const mergedReports = await parseMultipleArboleafPdfs(files, (progressMsg) => {
        if (statusEl) {
          statusEl.style.color = '#38bdf8';
          statusEl.innerText = progressMsg;
        }
      });

      for (const report of mergedReports) {
        const mergedRecord = mergeDeepScanIntoLocalHistory(report, false);
        await syncArboleafDeepScan({
          ...report,
          deepScan: mergedRecord.deepScan
        });
      }

      renderBiometricsUI();
      const postStatus = document.getElementById('arboleafPdfStatus');
      if (postStatus && mergedReports[0]) {
        const latest = mergedReports[0];
        postStatus.style.color = '#4ade80';
        postStatus.innerText = `✓ Merged ${files.length} PDF(s) for ${latest.date}`;
      }
    } catch (err) {
      console.error('[Arboleaf PDF] Import failed:', err);
      if (statusEl) {
        statusEl.style.color = '#f43f5e';
        statusEl.innerText = err.message || 'Failed to parse PDF.';
      }
    }
  };
}

window.renderBiometricsUI = renderBiometricsUI;
