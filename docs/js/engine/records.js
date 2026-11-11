// -------------------------------------------------------------
// STAGE HIGH SCORE & COURSE RECORDS ENGINE (ZERO LOCALSTORAGE)
// Modular Engine: records.js
// -------------------------------------------------------------

// Runtime in-memory stores (hydrated from Google Sheet telemetry on boot)
let runtimeStageRecords = {};
let runtimePRVault = {};

export function setRuntimeStageRecords(records) {
  runtimeStageRecords = records || {};
}

export function getStageRecords() {
  return runtimeStageRecords;
}

export function setRuntimePRVault(vault) {
  runtimePRVault = vault || {};
}

export function getPRVault() {
  return runtimePRVault;
}

export function savePRVault(data) {
  runtimePRVault = data || {};
}

export function saveStageRecord(stageKey, score, rank) {
  const currentBest = runtimeStageRecords[stageKey] ? runtimeStageRecords[stageKey].bestScore : 0;
  let isNewRecord = false;

  if (score > currentBest) {
    runtimeStageRecords[stageKey] = {
      bestScore: score,
      rank: rank,
      date: new Date().toISOString().split('T')[0]
    };
    isNewRecord = true;
  }
  return { isNewRecord, record: runtimeStageRecords[stageKey] };
}
