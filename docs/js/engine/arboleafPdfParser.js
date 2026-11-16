// -------------------------------------------------------------
// ARBOLEAF PDF BODY COMPOSITION PARSER (RESILIENT MULTI-LAYOUT)
// Module: docs/js/engine/arboleafPdfParser.js
// -------------------------------------------------------------

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load PDF.js parser library.'));
    document.head.appendChild(script);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return window.pdfjsLib;
}

/**
 * Extracts normalized text across all pages of an Arboleaf PDF File/Blob
 */
export async function extractPdfRawText(file) {
  const pdfjsLib = await ensurePdfJsLoaded();
  const arrayBuffer = await file.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error('Selected PDF file is empty (0 bytes). Save to Downloads first and re-select.');
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageStr = content.items.map(item => item.str).join(' ');
    fullText += ` ${pageStr}`;
  }
  return fullText.replace(/\s+/g, ' ').trim();
}

function matchNum(text, patterns) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  for (const regex of list) {
    const m = text.match(regex);
    if (m && m[1]) {
      const val = parseFloat(m[1]);
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

/**
 * Extracts all 5 segmental lean mass entries (Upper L/R, Trunk, Lower L/R)
 */
function extractSegmentalLean(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:\.\d+)?)\s*lb\s*\/?\s*(\d{2,3}(?:\.\d+)?)%/gi;
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    const lbs = parseFloat(m[1]);
    const pct = parseFloat(m[2]);
    if (!isNaN(lbs) && !isNaN(pct) && pct >= 50 && pct <= 165) {
      pairs.push({ lbs, pct });
    }
  }
  if (pairs.length < 5) return null;

  const [leftArm, rightArm, trunk, leftLeg, rightLeg] = pairs.slice(0, 5);
  const upperSymmetryPct = Math.round(
    (Math.min(leftArm.lbs, rightArm.lbs) / Math.max(leftArm.lbs, rightArm.lbs || 1)) * 1000
  ) / 10;
  const lowerSymmetryPct = Math.round(
    (Math.min(leftLeg.lbs, rightLeg.lbs) / Math.max(leftLeg.lbs, rightLeg.lbs || 1)) * 1000
  ) / 10;

  return {
    leftArmLbs: leftArm.lbs,
    leftArmPct: leftArm.pct,
    rightArmLbs: rightArm.lbs,
    rightArmPct: rightArm.pct,
    trunkLbs: trunk.lbs,
    trunkPct: trunk.pct,
    leftLegLbs: leftLeg.lbs,
    leftLegPct: leftLeg.pct,
    rightLegLbs: rightLeg.lbs,
    rightLegPct: rightLeg.pct,
    upperSymmetryPct,
    lowerSymmetryPct
  };
}

/**
 * Extracts all 5 segmental fat mass entries (Upper L/R, Trunk, Lower L/R)
 */
function extractSegmentalFat(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:\.\d+)?)\s*lb\s*\/?\s*(\d{2,4}(?:\.\d+)?)%/gi;
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    const lbs = parseFloat(m[1]);
    const pct = parseFloat(m[2]);
    if (!isNaN(lbs) && !isNaN(pct) && pct > 165) {
      pairs.push({ lbs, pct });
    }
  }
  if (pairs.length < 5) return null;

  const [leftArm, rightArm, trunk, leftLeg, rightLeg] = pairs.slice(0, 5);
  return {
    leftArmLbs: leftArm.lbs,
    leftArmPct: leftArm.pct,
    rightArmLbs: rightArm.lbs,
    rightArmPct: rightArm.pct,
    trunkLbs: trunk.lbs,
    trunkPct: trunk.pct,
    leftLegLbs: leftLeg.lbs,
    leftLegPct: leftLeg.pct,
    rightLegLbs: rightLeg.lbs,
    rightLegPct: rightLeg.pct
  };
}

/**
 * Parses extracted Arboleaf PDF text into a normalized telemetry + Deep Scan object
 */
export function parseArboleafReportText(rawText) {
  // 1. Scan Timestamp (supports MM/DD/YYYY HH:mm or YYYY-MM-DD HH:mm)
  const tsMatch =
    rawText.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/) ||
    rawText.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})/);

  let isoTimestamp = new Date().toISOString();
  let dateStr = isoTimestamp.split('T')[0];

  if (tsMatch) {
    const [hour, minute] = tsMatch[2].split(':').map(Number);
    let year, month, day;
    if (tsMatch[1].includes('/')) {
      [month, day, year] = tsMatch[1].split('/').map(Number);
    } else {
      [year, month, day] = tsMatch[1].split('-').map(Number);
    }
    const dt = new Date(year, month - 1, day, hour, minute, 0);
    if (!isNaN(dt.getTime())) {
      isoTimestamp = dt.toISOString();
      dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 2. Resilient Multi-Pattern Metric Extraction
  const weightLbs = matchNum(rawText, [
    /Body Fat Mass \(lb\)\s+[\d.]+\s+([\d.]+)\s+22~/i,
    /Weight\s*\(lb\)[\s\S]{0,120}?(\d{2,3}\.\d)/i,
    /(\d{2,3}\.\d)\s*(?:lb)?\s*205%/i
  ]);

  const bodyFatPct = matchNum(rawText, [
    /Body\s*Fat Percentage\s+(\d{1,2}\.\d)/i,
    /PBF\s*\(%\)[\s\S]{0,120}?(\d{1,2}\.\d)/i
  ]);

  const bodyWaterL = matchNum(rawText, [
    /Body Water\s*\(L\)\s+(\d{1,3}\.\d)/i,
    /Body Water[\s\S]{0,40}?(\d{2,3}\.\d)\s*47~/i
  ]);

  const bodyWaterPct = matchNum(rawText, [
    /Body Water Percentage\s+(\d{1,2}\.\d)\s*%/i
  ]);

  const boneMassLbs = matchNum(rawText, [
    /Bone Mass\s*\(lb\)\s+(\d{1,2}\.\d)/i,
    /Bone Mass[\s\S]{0,40}?(\d{1,2}\.\d)\s+[\d.]+\s+9\.6~/i
  ]);

  const boneMassPct = matchNum(rawText, [
    /Bone Mass Percentage\s+(\d{1,2}\.\d)\s*%/i
  ]);

  const skeletalMuscleLbs = matchNum(rawText, [
    /Skeletal Muscle\s+(\d{2,3}\.\d)\s*lb/i,
    /Skeletal Muscle[\s\S]{0,60}?(\d{2,3}\.\d)\s*(?:lb)?\s*79~/i
  ]);

  const skeletalMusclePct = matchNum(rawText, [
    /Skeletal Muscle\s*\(%\)\s+(\d{1,2}\.\d)\s*%/i
  ]);

  const visceralFat = matchNum(rawText, [
    /Visceral Fat[\s\S]{0,50}?\b(\d{1,2})\b/i
  ]);

  const subqFatLbs = matchNum(rawText, [
    /Subcutaneous Fat\s+(\d{2,3}\.\d)\s*lb/i
  ]);

  const subqFatPct = matchNum(rawText, [
    /Subcutaneous Fat Percentage\s+(\d{1,2}\.\d)\s*%/i
  ]);

  const waistHipRatio = matchNum(rawText, [
    /Waist-Hip Ratio\s+(\d\.\d{1,2})/i
  ]);

  const smi = matchNum(rawText, [
    /\bSMI\s+(\d{1,2}(?:\.\d)?)/i
  ]);

  const fitnessScore = matchNum(rawText, [
    /Fitness score:?\s*(\d{1,3}\.\d)\s*\/100/i,
    /(\d{1,3}\.\d)\s*\/100\s*Fitness score/i
  ]);

  const segmentalLean = extractSegmentalLean(rawText);
  const segmentalFat = extractSegmentalFat(rawText);

  return {
    timestamp: isoTimestamp,
    date: dateStr,
    source: 'Arboleaf_PDF',
    weightLbs: weightLbs ?? 0,
    bodyFatPct: bodyFatPct ?? 0,
    deepScan: {
      scanDate: dateStr,
      visceralFat: visceralFat ?? 0,
      skeletalMuscleLbs: skeletalMuscleLbs ?? 0,
      skeletalMusclePct: skeletalMusclePct ?? 0,
      bodyWaterL: bodyWaterL ?? 0,
      bodyWaterPct: bodyWaterPct ?? 0,
      boneMassLbs: boneMassLbs ?? 0,
      boneMassPct: boneMassPct ?? 0,
      subqFatLbs: subqFatLbs ?? 0,
      subqFatPct: subqFatPct ?? 0,
      waistHipRatio: waistHipRatio ?? 0,
      smi: smi ?? 0,
      fitnessScore: fitnessScore ?? 0,
      segmentalLean,
      segmentalFat
    }
  };
}

/**
 * End-to-end helper: takes an <input type="file"> File object and returns parsed telemetry
 */
export async function parseArboleafPdfFile(file) {
  const rawText = await extractPdfRawText(file);
  console.log('[Arboleaf PDF] Extracted text length:', rawText.length, rawText.slice(0, 300));

  if (!rawText || rawText.length < 40) {
    throw new Error('PDF contains no selectable text (image-only scan). Export as PDF Report from Arboleaf.');
  }

  const parsed = parseArboleafReportText(rawText);
  const ds = parsed.deepScan || {};
  const hasAnyMetric =
    parsed.weightLbs > 0 ||
    parsed.bodyFatPct > 0 ||
    ds.visceralFat > 0 ||
    ds.skeletalMuscleLbs > 0 ||
    ds.bodyWaterL > 0 ||
    ds.boneMassLbs > 0;

  if (!hasAnyMetric) {
    throw new Error(`Unrecognized layout (${rawText.length} chars). Preview: "${rawText.slice(0, 90)}..."`);
  }
  return parsed;
}
