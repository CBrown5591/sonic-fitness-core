// -------------------------------------------------------------
// STAGE HIGH SCORE & COURSE RECORDS ENGINE
// Modular Engine: records.js
// -------------------------------------------------------------

export function getStageRecords() {
  const stored = localStorage.getItem('sonic_stage_records');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {};
}

export function saveStageRecord(stageKey, score, rank) {
  const records = getStageRecords();
  const currentBest = records[stageKey] ? records[stageKey].bestScore : 0;
  let isNewRecord = false;

  if (score > currentBest) {
    records[stageKey] = {
      bestScore: score,
      rank: rank,
      date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('sonic_stage_records', JSON.stringify(records));
    isNewRecord = true;
  }
  return { isNewRecord, record: records[stageKey] };
}

export function getPRVault() {
  const stored = localStorage.getItem('sonic_pr_vault');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {};
}

export function savePRVault(data) {
  localStorage.setItem('sonic_pr_vault', JSON.stringify(data));
}
