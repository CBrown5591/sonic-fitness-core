// -------------------------------------------------------------
// ARBOLEAF PDF BODY COMPOSITION PARSER (MULTI-FILE + OCR v3)
// Eliminates bar-chart tick shifts & normal-range collisions
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

async function extractPdfOcrText(pdf, fileLabel, onStatus) {
  if (onStatus) onStatus(`${fileLabel}: loading OCR engine...`);
  const Tesseract = await ensureTesseractLoaded();
  const worker = await Tesseract.createWorker('eng');

  let combinedOcr = '';
  try {
    for (let p = 1; p <= pdf.numPages; p++) {
      if (onStatus) onStatus(`${fileLabel}: scanning page ${p}/${pdf.numPages}...`);
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

export async function extractPdfRawText(file, fileLabel, onStatus) {
  const pdfjsLib = await ensurePdfJsLoaded();
  const arrayBuffer = await file.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error(`${fileLabel} is empty (0 bytes). Save to Downloads first.`);
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

  return await extractPdfOcrText(pdf, fileLabel, onStatus);
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

function normalizeOcrText(rawText) {
  return rawText
    .replace(/\|/g, ' ')
    .replace(/(\d)\s*(?:1b|1bs|ib|ibs|lbs)\b/gi, '$1lb')
    .replace(/(\d+\.\d)\s*96\b/g, '$1%')
    .replace(/(\d)[oO](\.\d)/g, '$10$2')
    .replace(/(\d+\.)[oO]\b/g, '$10')
    .replace(/\b2[oO]\b/g, '20')
    .replace(/\b1[oO]\b/g, '10')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts Visceral Fat (e.g. 20) while ignoring gauge tick marks (10)
 */
function extractVisceralFat(normText) {
  const vfMatch = normText.match(/Visceral(?:\s*Fat)?([\s\S]{0,220})/i);
  if (!vfMatch) return null;

  const snippet = vfMatch[1];
  const nums = [];
  const numRegex = /\b(\d{1,2})\b/g;
  let m;
  while ((m = numRegex.exec(snippet)) !== null) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val >= 1 && val <= 59) {
      nums.push(val);
    }
  }
  if (nums.length === 0) return null;

  const nonTick = nums.filter(n => n !== 10);
  return nonTick.length > 0 ? nonTick[0] : nums[0];
}

/**
 * Extracts all 5 segmental lean mass entries (Left Arm, Right Arm, Trunk, Left Leg, Right Leg)
 * anchored strictly AFTER the Fat Analysis / Muscle Balance section so BMI/Weight bar ticks
 * (like "45 55%") are never included.
 */
function extractSegmentalLean(normText) {
  // Slice starting at "Visceral Fat" or "Muscle Balance" or "Soft Lean Mass"
  const startIdx = Math.max(
    normText.search(/Visceral\s*Fat/i),
    normText.search(/Muscle\s*Balance/i),
    normText.search(/Soft\s*Lean\s*Mass/i)
  );
  const searchZone = startIdx !== -1 ? normText.slice(startIdx, startIdx + 750) : normText;

  const pairs = [];
  const pairRegex = /(\d{1,3}(?:[.,]\d+)?)\s*(?:lb)?\s*\/?\s*(\d{2,3}(?:[.,]\d+)?)\s*%/gi;
  let m;
  while ((m = pairRegex.exec(searchZone)) !== null) {
    const lbs = parseFloat(m[1].replace(',', '.'));
    const pct = parseFloat(m[2].replace(',', '.'));
    // Exclude chart scale ticks (45/55%, 150/170%, 175/205%) and keep real limb/trunk lean range (60%–150%)
    if (!isNaN(lbs) && !isNaN(pct) && pct >= 60 && pct <= 150 && lbs >= 5 && lbs <= 130) {
      // Guard against exact scale-tick pair 45 / 55
      if (lbs === 45 && pct === 55) continue;
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
 * Extracts all 5 segmental fat mass entries (Left Arm, Right Arm, Trunk, Left Leg, Right Leg)
 * anchored strictly AFTER the Fat Analysis section and excluding bar-chart ticks (175/205%, 150/170%).
 */
function extractSegmentalFat(normText) {
  const startIdx = Math.max(
    normText.search(/Visceral\s*Fat/i),
    normText.search(/Segmental\s*Fat/i),
    normText.search(/Soft\s*Lean\s*Mass/i)
  );
  const searchZone = startIdx !== -1 ? normText.slice(startIdx, startIdx + 850) : normText;

  const pairs = [];
  const regex = /(\d{1,3}(?:[.,]\d+)?)\s*(?:lb)?\s*\/?\s*(\d{3,4}(?:[.,]\d+)?)\s*%/gi;
  let m;
  while ((m = regex.exec(searchZone)) !== null) {
    const lbs = parseFloat(m[1].replace(',', '.'));
    const pct = parseFloat(m[2].replace(',', '.'));
    // Segmental fat evaluation percentages are >= 210% (e.g., 362%, 619.5%, 804.4%, 824.5%)
    if (!isNaN(lbs) && !isNaN(pct) && pct >= 210 && lbs >= 2 && lbs <= 180) {
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
  const normText = normalizeOcrText(rawText);

  // 1. Scan Timestamp
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

  // 2. Core & Extended Body Composition Fields (excluding normal-range ~ values)
  const weightLbs = matchNum(normText, [
    /Body Fat Mass\s*\(lb\)[\s\S]{0,90}?(\d{3}[.,]\d)/i,
    /Weight[\s\S]{0,200}?(\d{3}[.,]\d)\s*(?:lb|205%|156)/i
  ], 70, 600);

  const bodyFatPct = matchNum(normText, [
    /Body\s*Fat\s*Percentage[\s\S]{0,100}?(\d{1,2}[.,]\d)(?!\s*[~-])/i,
    /PBF\s*\(%\)[\s\S]{0,180}?(\d{1,2}[.,]\d)(?!\s*[~-])/i
  ], 3, 75);

  const bodyWaterL = matchNum(normText, [
    /Body Water\s*\(L\)[\s\S]{0,80}?(\d{2,3}[.,]\d)(?!\s*[~-])/i
  ], 15, 120);

  const bodyWaterPct = matchNum(normText, [
    /Body Water Percentage[\s\S]{0,90}?(\d{2}[.,]\d)\s*%/i,
    /Body Water Percentage[\s\S]{0,60}?(\d{2}[.,]\d)(?!\s*[~-])/i
  ], 20, 80);

  const boneMassLbs = matchNum(normText, [
    /Bone Mass\s*\(lb\)[\s\S]{0,80}?(\d{1,2}[.,]\d)(?!\s*[~-])/i
  ], 3, 30);

  const boneMassPct = matchNum(normText, [
    /Bone Mass Percentage[\s\S]{0,90}?(\d[.,]\d)\s*%/i,
    /Bone Mass Percentage[\s\S]{0,60}?(\d[.,]\d)(?!\s*[~-])/i
  ], 1, 10);

  const skeletalMuscleLbs = matchNum(normText, [
    /Skeletal Muscle[\s\S]{0,90}?(\d{2,3}[.,]\d)\s*lb/i,
    /Skeletal Muscle[\s\S]{0,180}?(\d{2,3}[.,]\d)(?!\s*[~-])/i
  ], 30, 250);

  const skeletalMusclePct = matchNum(normText, [
    /Skeletal Muscle\s*\(%\)[\s\S]{0,90}?(\d{2}[.,]\d)\s*%/i,
    /Skeletal Muscle\s*\(%\)[\s\S]{0,60}?(\d{2}[.,]\d)(?!\s*[~-])/i
  ], 15, 65);

  const visceralFat = extractVisceralFat(normText);

  const subqFatLbs = matchNum(normText, [
    /Subcutaneous Fat[\s\S]{0,90}?(\d{2,3}[.,]\d)\s*lb/i,
    /Subcutaneous Fat[\s\S]{0,90}?(\d{2,3}[.,]\d)(?!\s*[~-])/i
  ], 5, 300);

  const subqFatPct = matchNum(normText, [
    /Subcutaneous Fat Percentage[\s\S]{0,90}?(\d{1,2}[.,]\d)\s*%/i,
    /Subcutaneous Fat Percentage[\s\S]{0,60}?(\d{1,2}[.,]\d)(?!\s*[~-])/i
  ], 3, 70);

  const waistHipRatio = matchNum(normText, [
    /Waist[\s-]*Hip[\s\S]{0,140}?([012][.,]\d{1,2})/i,
    /([012][.,]\d{2})\s*(?:<=|≤|<)\s*0[.,]9/i
  ], 0.5, 2.2);

  const smi = matchNum(normText, [
    /\bSMI[\s\S]{0,70}?(\d{1,2}(?:[.,]\d)?)(?!\s*[~-])/i
  ], 3, 20);

  const fitnessScore = matchNum(normText, [
    /Fitness score:?\s*(\d{1,3}[.,]\d)\s*\/100/i,
    /(\d{1,3}[.,]\d)\s*\/100[\s\S]{0,50}?Fitness score/i
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

function mergeParsedReports(base, incoming) {
  const merged = {
    ...base,
    weightLbs: base.weightLbs > 0 ? base.weightLbs : incoming.weightLbs,
    bodyFatPct: base.bodyFatPct > 0 ? base.bodyFatPct : incoming.bodyFatPct,
    deepScan: { ...(base.deepScan || {}) }
  };

  const incDs = incoming.deepScan || {};
  const numericKeys = [
    'visceralFat', 'skeletalMuscleLbs', 'skeletalMusclePct',
    'bodyWaterL', 'bodyWaterPct', 'boneMassLbs', 'boneMassPct',
    'subqFatLbs', 'subqFatPct', 'waistHipRatio', 'smi', 'fitnessScore'
  ];

  numericKeys.forEach(k => {
    if (!merged.deepScan[k] || merged.deepScan[k] === 0) {
      if (incDs[k] && incDs[k] > 0) merged.deepScan[k] = incDs[k];
    }
  });

  if (!merged.deepScan.segmentalLean && incDs.segmentalLean) {
    merged.deepScan.segmentalLean = incDs.segmentalLean;
  }
  if (!merged.deepScan.segmentalFat && incDs.segmentalFat) {
    merged.deepScan.segmentalFat = incDs.segmentalFat;
  }

  return merged;
}

export async function parseArboleafPdfFile(file, onStatus, fileIdx = 1, totalFiles = 1) {
  const label = totalFiles > 1 ? `Doc ${fileIdx}/${totalFiles}` : 'PDF';
  const rawText = await extractPdfRawText(file, label, onStatus);
  console.log(`[Arboleaf OCR ${label}]:`, rawText);

  if (!rawText || rawText.length < 30) {
    throw new Error(`${label}: could not read text from PDF.`);
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
    throw new Error(`${label}: OCR read ${rawText.length} chars, no match. Sample: "${rawText.slice(0, 100)}..."`);
  }
  return parsed;
}

export async function parseMultipleArboleafPdfs(fileList, onStatus) {
  const files = Array.from(fileList || []);
  if (files.length === 0) return [];

  const byDate = {};
  for (let i = 0; i < files.length; i++) {
    const parsed = await parseArboleafPdfFile(files[i], onStatus, i + 1, files.length);
    if (byDate[parsed.date]) {
      byDate[parsed.date] = mergeParsedReports(byDate[parsed.date], parsed);
    } else {
      byDate[parsed.date] = parsed;
    }
  }

  return Object.values(byDate).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
