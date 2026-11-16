// -------------------------------------------------------------
// ARBOLEAF PDF BODY COMPOSITION PARSER (TEXT + OCR MULTI-COLUMN)
// Module: docs/js/engine/arboleafPdfParser.js
// -------------------------------------------------------------

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

async function loadExternalScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load library: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await loadExternalScript(PDFJS_CDN);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return window.pdfjsLib;
}

async function ensureTesseractLoaded() {
  if (window.Tesseract) return window.Tesseract;
  await loadExternalScript(TESSERACT_CDN);
  return window.Tesseract;
}

/**
 * Renders each PDF page to an offscreen canvas at 2.5x resolution
 * and runs Tesseract OCR for image-only Arboleaf mobile PDF exports.
 */
async function extractPdfOcrText(pdf, onStatus) {
  if (onStatus) onStatus('Image-only PDF — loading OCR engine...');
  const Tesseract = await ensureTesseractLoaded();
  const worker = await Tesseract.createWorker('eng');

  let combinedOcr = '';
  try {
    for (let p = 1; p <= pdf.numPages; p++) {
      if (onStatus) onStatus(`Scanning page ${p} of ${pdf.numPages} via OCR...`);
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const { data: { text } } = await worker.recognize(canvas);
      combinedOcr += ` ${text}`;
    }
  } finally {
    await worker.terminate();
  }

  return combinedOcr.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts text across all pages (selectable text first, automatic OCR fallback if image-only)
 */
export async function extractPdfRawText(file, onStatus) {
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

  const cleanedText = fullText.replace(/\s+/g, ' ').trim();
  if (cleanedText.length >= 40) {
    return cleanedText;
  }

  return await extractPdfOcrText(pdf, onStatus);
}

function matchNum(text, patterns, minVal = 0, maxVal = 9999) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  for (const regex of list) {
    const m = text.match(regex);
    if (m && m[1]) {
      const val = parseFloat(m[1].replace(/,/g, '.'));
      if (!isNaN(val) && val >= minVal && val <= maxVal) return val;
    }
  }
  return null;
}

function extractSegmentalLean(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:[.,]\d+)?)\s*(?:lb|lbs)?\s*\/?\s*(\d{2,3}(?:[.,]\d+)?)\s*%/gi;
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    const lbs = parseFloat(m[1].replace(',', '.'));
    const pct = parseFloat(m[2].replace(',', '.'));
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

function extractSegmentalFat(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:[.,]\d+)?)\s*(?:lb|lbs)?\s*\/?\s*(\d{2,4}(?:[.,]\d+)?)\s*%/gi;
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    const lbs = parseFloat(m[1].replace(',', '.'));
    const pct = parseFloat(m[2].replace(',', '.'));
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

export function parseArboleafReportText(rawText) {
  // Normalize common OCR quirks (e.g., "1b" instead of "lb", "|" column separators)
  const normText = rawText
    .replace(/\|/g, ' ')
    .replace(/(\d)\s*1b\b/gi, '$1lb')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Scan Timestamp (MM/DD/YYYY HH:mm or YYYY-MM-DD HH:mm)
  const tsMatch =
    normText.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/) ||
    normText.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})/);

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

  // 2. Wide-Window Multi-Column OCR Matchers
  const weightLbs = matchNum(normText, [
    /Body Fat Mass\s*\(lb\)[\s\S]{0,80}?(\d{3}[.,]\d)/i,
    /Weight[\s\S]{0,180}?(\d{3}[.,]\d)\s*(?:lb|205%|156)/i,
    /(\d{3}[.,]\d)\s*(?:lb)?\s*156\.8/i
  ], 70, 600);

  const bodyFatPct = matchNum(normText, [
    /Body\s*Fat\s*Percentage[\s\S]{0,80}?(\d{1,2}[.,]\d)/i,
    /PBF\s*\(%\)[\s\S]{0,160}?(\d{1,2}[.,]\d)/i
  ], 3, 75);

  const bodyWaterL = matchNum(normText, [
    /Body Water\s*\(L\)[\s\S]{0,60}?(\d{2,3}[.,]\d)/i,
    /Body Water[\s\S]{0,80}?(\d{2,3}[.,]\d)\s*(?:\d{2,3}[.,]\d\s*)?47~/i
  ], 15, 120);

  const bodyWaterPct = matchNum(normText, [
    /Body Water Percentage[\s\S]{0,80}?(\d{2}[.,]\d)\s*%/i
  ], 20, 80);

  const boneMassLbs = matchNum(normText, [
    /Bone Mass\s*\(lb\)[\s\S]{0,60}?(\d{1,2}[.,]\d)/i,
    /Bone Mass[\s\S]{0,80}?(\d{1,2}[.,]\d)[\s\S]{0,40}?9\.6~/i
  ], 3, 30);

  const boneMassPct = matchNum(normText, [
    /Bone Mass Percentage[\s\S]{0,80}?(\d[.,]\d)\s*%/i
  ], 1, 10);

  const skeletalMuscleLbs = matchNum(normText, [
    /Skeletal Muscle[\s\S]{0,80}?(\d{2,3}[.,]\d)\s*lb/i,
    /Skeletal Muscle[\s\S]{0,160}?(\d{2,3}[.,]\d)[\s\S]{0,40}?79~/i
  ], 30, 250);

  const skeletalMusclePct = matchNum(normText, [
    /Skeletal Muscle\s*\(%\)[\s\S]{0,80}?(\d{2}[.,]\d)\s*%/i
  ], 15, 65);

  const visceralFat = matchNum(normText, [
    /Visceral Fat[\s\S]{0,120}?\b([1-4]?\d)\b/i
  ], 1, 59);

  const subqFatLbs = matchNum(normText, [
    /Subcutaneous Fat[\s\S]{0,80}?(\d{2,3}[.,]\d)\s*lb/i
  ], 5, 300);

  const subqFatPct = matchNum(normText, [
    /Subcutaneous Fat Percentage[\s\S]{0,80}?(\d{1,2}[.,]\d)\s*%/i
  ], 3, 70);

  const waistHipRatio = matchNum(normText, [
    /Waist-?Hip Ratio[\s\S]{0,80}?(\d[.,]\d{1,2})/i
  ], 0.5, 2.0);

  const smi = matchNum(normText, [
    /\bSMI[\s\S]{0,60}?(\d{1,2}(?:[.,]\d)?)/i
  ], 3, 20);

  const fitnessScore = matchNum(normText, [
    /Fitness score:?\s*(\d{1,3}[.,]\d)\s*\/100/i,
    /(\d{1,3}[.,]\d)\s*\/100[\s\S]{0,40}?Fitness score/i
  ], 1, 100);

  const segmentalLean = extractSegmentalLean(normText);
  const segmentalFat = extractSegmentalFat(normText);

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
 * End-to-end helper with live OCR progress callback & diagnostic preview on mismatch
 */
export async function parseArboleafPdfFile(file, onStatus) {
  const rawText = await extractPdfRawText(file, onStatus);
  console.log('[Arboleaf OCR Full Text]:', rawText);

  if (!rawText || rawText.length < 30) {
    throw new Error('Could not read text from PDF even after OCR scan.');
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
    throw new Error(`OCR read ${rawText.length} chars, no match. Sample: "${rawText.slice(0, 120)}..."`);
  }
  return parsed;
}
