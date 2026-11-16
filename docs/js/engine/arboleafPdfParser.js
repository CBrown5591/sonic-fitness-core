// -------------------------------------------------------------
// ARBOLEAF PDF BODY COMPOSITION PARSER (TEXT + IMAGE OCR FALLBACK)
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
 * Renders each PDF page to an offscreen canvas and runs Tesseract OCR
 * for image-only Arboleaf mobile PDF exports.
 */
async function extractPdfOcrText(pdf, onStatus) {
  if (onStatus) onStatus('Image-only PDF detected — loading OCR engine...');
  const Tesseract = await ensureTesseractLoaded();
  const worker = await Tesseract.createWorker('eng');

  let combinedOcr = '';
  try {
    for (let p = 1; p <= pdf.numPages; p++) {
      if (onStatus) onStatus(`Scanning page ${p} of ${pdf.numPages} via OCR...`);
      const page = await pdf.getPage(p);
      // 2.0x scale gives crisp digits for table cells without exhausting mobile RAM
      const viewport = page.getViewport({ scale: 2.0 });
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

  // Fallback to client-side OCR when mobile Arboleaf exports rasterized pages
  return await extractPdfOcrText(pdf, onStatus);
}

function matchNum(text, patterns) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  for (const regex of list) {
    const m = text.match(regex);
    if (m && m[1]) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

function extractSegmentalLean(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:\.\d+)?)\s*(?:lb|lbs)?\s*\/?\s*(\d{2,3}(?:\.\d+)?)\s*%/gi;
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

function extractSegmentalFat(rawText) {
  const pairs = [];
  const regex = /(\d{1,3}(?:\.\d+)?)\s*(?:lb|lbs)?\s*\/?\s*(\d{2,4}(?:\.\d+)?)\s*%/gi;
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

export function parseArboleafReportText(rawText) {
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

  const weightLbs = matchNum(rawText, [
    /Body Fat Mass\s*\(lb\)[\s\S]{0,40}?[\d.]+\s+(\d{2,3}\.\d)/i,
    /Weight\s*\(lb\)[\s\S]{0,120}?(\d{2,3}\.\d)/i,
    /(\d{2,3}\.\d)\s*(?:lb)?\s*205%/i
  ]);

  const bodyFatPct = matchNum(rawText, [
    /Body\s*Fat Percentage[\s\S]{0,30}?(\d{1,2}\.\d)/i,
    /PBF\s*\(%\)[\s\S]{0,120}?(\d{1,2}\.\d)/i
  ]);

  const bodyWaterL = matchNum(rawText, [
    /Body Water\s*\(L\)[\s\S]{0,25}?(\d{1,3}\.\d)/i,
    /Body Water[\s\S]{0,40}?(\d{2,3}\.\d)\s*47~/i
  ]);

  const bodyWaterPct = matchNum(rawText, [
    /Body Water Percentage[\s\S]{0,25}?(\d{1,2}\.\d)\s*%/i
  ]);

  const boneMassLbs = matchNum(rawText, [
    /Bone Mass\s*\(lb\)[\s\S]{0,25}?(\d{1,2}\.\d)/i,
    /Bone Mass[\s\S]{0,40}?(\d{1,2}\.\d)\s+[\d.]+\s*9\.6~/i
  ]);

  const boneMassPct = matchNum(rawText, [
    /Bone Mass Percentage[\s\S]{0,25}?(\d{1,2}\.\d)\s*%/i
  ]);

  const skeletalMuscleLbs = matchNum(rawText, [
    /Skeletal Muscle[\s\S]{0,25}?(\d{2,3}\.\d)\s*lb/i,
    /Skeletal Muscle[\s\S]{0,60}?(\d{2,3}\.\d)\s*(?:lb)?\s*79~/i
  ]);

  const skeletalMusclePct = matchNum(rawText, [
    /Skeletal Muscle\s*\(%\)[\s\S]{0,25}?(\d{1,2}\.\d)\s*%/i
  ]);

  const visceralFat = matchNum(rawText, [
    /Visceral Fat[\s\S]{0,50}?\b(\d{1,2})\b/i
  ]);

  const subqFatLbs = matchNum(rawText, [
    /Subcutaneous Fat[\s\S]{0,25}?(\d{2,3}\.\d)\s*lb/i
  ]);

  const subqFatPct = matchNum(rawText, [
    /Subcutaneous Fat Percentage[\s\S]{0,25}?(\d{1,2}\.\d)\s*%/i
  ]);

  const waistHipRatio = matchNum(rawText, [
    /Waist-Hip Ratio[\s\S]{0,25}?(\d\.\d{1,2})/i
  ]);

  const smi = matchNum(rawText, [
    /\bSMI[\s\S]{0,20}?(\d{1,2}(?:\.\d)?)/i
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
 * End-to-end helper with live OCR progress callback for mobile UI feedback
 */
export async function parseArboleafPdfFile(file, onStatus) {
  const rawText = await extractPdfRawText(file, onStatus);
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
    throw new Error(`OCR completed (${rawText.length} chars) but no metrics matched. Preview: "${rawText.slice(0, 80)}..."`);
  }
  return parsed;
}
