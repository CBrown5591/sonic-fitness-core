// -------------------------------------------------------------
// ARBOLEAF PDF BODY COMPOSITION PARSER (CLIENT-SIDE)
// Supports both 2-page and 3-page Yolanda/Arboleaf PDF layouts
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
 * Extracts raw text across all pages of an Arboleaf PDF File/Blob
 */
export async function extractPdfRawText(file) {
  const pdfjsLib = await ensurePdfJsLoaded();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageStr = content.items.map(item => item.str).join(' ');
    fullText += `\n--- PAGE ${p} ---\n` + pageStr;
  }
  return fullText.replace(/\s+/g, ' ').trim();
}

function matchNum(text, regex) {
  const m = text.match(regex);
  if (!m || !m[1]) return null;
  const val = parseFloat(m[1]);
  return isNaN(val) ? null : val;
}

/**
 * Parses extracted Arboleaf PDF text into a normalized telemetry object
 */
export function parseArboleafReportText(rawText) {
  // 1. Scan Timestamp (e.g., "11/15/2026 15:09")
  const tsMatch = rawText.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/);
  let isoTimestamp = new Date().toISOString();
  let dateStr = isoTimestamp.split('T')[0];

  if (tsMatch) {
    const [month, day, year] = tsMatch[1].split('/').map(Number);
    const [hour, minute] = tsMatch[2].split(':').map(Number);
    const dt = new Date(year, month - 1, day, hour, minute, 0);
    if (!isNaN(dt.getTime())) {
      isoTimestamp = dt.toISOString();
      dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 2. Core & Extended Body Composition Fields
  const weightLbs =
    matchNum(rawText, /Body Fat Mass \(lb\)\s+[\d.]+\s+([\d.]+)\s+22~/) ??
    matchNum(rawText, /Weight\s*\(lb\)[\s\S]{0,60}?(\d{2,3}\.\d)/);

  const bodyFatPct =
    matchNum(rawText, /BodyFat Percentage\s+(\d{1,2}\.\d)/) ??
    matchNum(rawText, /PBF\(%\)[\s\S]{0,60}?(\d{1,2}\.\d)/);

  const bodyWaterL = matchNum(rawText, /Body Water \(L\)\s+(\d{1,3}\.\d)/);
  const bodyWaterPct = matchNum(rawText, /Body Water Percentage\s+(\d{1,2}\.\d)%/);

  const boneMassLbs = matchNum(rawText, /Bone Mass \(lb\)\s+(\d{1,2}\.\d)/);
  const boneMassPct = matchNum(rawText, /Bone Mass Percentage\s+(\d\.\d)%/);

  const skeletalMuscleLbs = matchNum(rawText, /Skeletal Muscle\s+(\d{2,3}\.\d)\s*lb/);
  const skeletalMusclePct = matchNum(rawText, /Skeletal Muscle \(%\)\s+(\d{1,2}\.\d)%/);

  const visceralFat = matchNum(rawText, /Visceral Fat\s+(\d{1,2})\b/);

  const subqFatLbs = matchNum(rawText, /Subcutaneous Fat\s+(\d{2,3}\.\d)\s*lb/);
  const subqFatPct = matchNum(rawText, /Subcutaneous Fat Percentage\s+(\d{1,2}\.\d)%/);

  const proteinLbs = matchNum(rawText, /Protein \(lb\)\s+(\d{1,2}\.\d)/);
  const smi = matchNum(rawText, /\bSMI\s+(\d{1,2}(?:\.\d)?)/);
  const fitnessScore = matchNum(rawText, /Fitness score:?\s*(\d{1,3}\.\d)\/100/i);

  // 3. Segmental Soft Lean Mass (Upper L/R, Trunk, Lower L/R)
  const segMatch = rawText.match(
    /(\d{1,2}(?:\.\d)?)lb\s*(?:\/?\s*95\.9%|\s+95\.9%)[\s\S]{0,40}?(\d{1,2}(?:\.\d)?)lb[\s\S]{0,40}?(\d{2,3}(?:\.\d)?)lb[\s\S]{0,40}?(\d{2}(?:\.\d)?)lb[\s\S]{0,40}?(\d{2}(?:\.\d)?)lb/
  );

  return {
    timestamp: isoTimestamp,
    date: dateStr,
    source: 'Arboleaf_PDF',
    weightLbs: weightLbs ?? 0,
    bodyFatPct: bodyFatPct ?? 0,
    visceralFat: visceralFat ?? 0,
    skeletalMuscleLbs: skeletalMuscleLbs ?? 0,
    skeletalMusclePct: skeletalMusclePct ?? 0,
    bodyWaterL: bodyWaterL ?? 0,
    bodyWaterPct: bodyWaterPct ?? 0,
    boneMassLbs: boneMassLbs ?? 0,
    boneMassPct: boneMassPct ?? 0,
    subqFatLbs: subqFatLbs ?? 0,
    subqFatPct: subqFatPct ?? 0,
    proteinLbs: proteinLbs ?? 0,
    smi: smi ?? 0,
    fitnessScore: fitnessScore ?? 0,
    segmentalLean: segMatch
      ? {
          leftArmLbs: parseFloat(segMatch[1]),
          rightArmLbs: parseFloat(segMatch[2]),
          trunkLbs: parseFloat(segMatch[3]),
          leftLegLbs: parseFloat(segMatch[4]),
          rightLegLbs: parseFloat(segMatch[5])
        }
      : null
  };
}

/**
 * End-to-end helper: takes an <input type="file"> File object and returns parsed telemetry
 */
export async function parseArboleafPdfFile(file) {
  const rawText = await extractPdfRawText(file);
  return parseArboleafReportText(rawText);
}
