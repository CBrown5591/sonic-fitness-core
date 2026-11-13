// -------------------------------------------------------------
// STAGE CLEAR RESULTS OVERLAY // ARCADE SCORECARD & REWARD TALLY
// Self-Contained Modular UI Component: resultsOverlay.js
// -------------------------------------------------------------
import { playStageClearFanfare, stopAllFanfare } from '../core/audio.js';

export function renderResultsOverlay(data, onClose) {
  // Remove existing overlay if present
  const existing = document.getElementById('resultsOverlay');
  if (existing) existing.remove();

  if (!document.getElementById('sonicSlamAnimStyle')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'sonicSlamAnimStyle';
    styleEl.textContent = `
      @keyframes sRankSlam {
        0% {
          opacity: 0;
          transform: scale(3.2) rotate(-18deg);
          filter: brightness(2.5) drop-shadow(0 0 24px rgba(250, 204, 21, 0.95));
        }
        65% {
          opacity: 1;
          transform: scale(0.92) rotate(2deg);
          filter: brightness(1.4) drop-shadow(0 0 18px rgba(250, 204, 21, 0.85));
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          filter: brightness(1) drop-shadow(0 0 12px rgba(250, 204, 21, 0.6));
        }
      }
      .s-rank-slam-active {
        animation: sRankSlam 0.63s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
    `;
    document.head.appendChild(styleEl);
  }

  const overlay = document.createElement('div');
  overlay.id = 'resultsOverlay';
  overlay.className = 'results-overlay-backdrop';

  // 1. 3D Chiseled Metallic Letter Profiles (Deep saturated tones + directional bevel shadows)
  const letterStyles = {
    'S': {
      color: '#facc15',
      shadow: '0 1px 0 #fffbeb, 0 2px 0 #eab308, 0 3px 0 #ca8a04, 0 4px 0 #a16207, 0 5px 0 #854d0e, 0 6px 0 #713f12, 0 7px 2px rgba(0,0,0,0.7), 0 0 26px rgba(250, 204, 21, 0.85)'
    },
    'A': {
      color: '#38bdf8',
      shadow: '0 1px 0 #f0f9ff, 0 2px 0 #0284c7, 0 3px 0 #0369a1, 0 4px 0 #075985, 0 5px 0 #0c4a6e, 0 6px 2px rgba(0,0,0,0.7), 0 0 26px rgba(56, 189, 248, 0.8)'
    },
    'B': {
      color: '#4ade80',
      shadow: '0 1px 0 #f0fdf4, 0 2px 0 #22c55e, 0 3px 0 #16a34a, 0 4px 0 #15803d, 0 5px 0 #14532d, 0 6px 2px rgba(0,0,0,0.7), 0 0 22px rgba(74, 222, 128, 0.75)'
    },
    'C': {
      color: '#94a3b8',
      shadow: '0 1px 0 #f8fafc, 0 2px 0 #64748b, 0 3px 0 #475569, 0 4px 0 #334155, 0 5px 2px rgba(0,0,0,0.7)'
    }
  };

  const isTrueSRank = data.rank === 'S';
  const initialRankKey = isTrueSRank ? 'A' : ((data.rank === 'A' || data.rank === 'B' || data.rank === 'C') ? data.rank : 'B');
  const activeLetterStyle = letterStyles[initialRankKey];
  const goldRings = data.goldRingsEarned || Math.floor((data.totalScore || 0) / 1000);

  let emeraldHtml = '';
  if (data.awardedEmerald) {
    emeraldHtml = `
      <div id="resultsEmeraldBanner" class="results-emerald-banner" style="display: none;">
        <div class="emerald-banner-title">✨ SPECIAL STAGE CLEAR ✨</div>
        <div class="emerald-banner-detail">💎 ${data.awardedEmerald}</div>
      </div>
    `;
  }

  let transformMultiplierHtml = '';
  if (data.isSS2) {
    transformMultiplierHtml = `
      <div class="results-transform-pill ss2">
        ⚡ SUPER SONIC 2: 1.50x EXP SURGE APPLIED ⚡
      </div>
    `;
  } else if (data.isSuperActive) {
    transformMultiplierHtml = `
      <div class="results-transform-pill super">
        ⚡ SUPER SONIC: 1.25x EXP MULTIPLIER APPLIED ⚡
      </div>
    `;
  }

  let recordHtml = data.isNewRecord ? `<div class="results-record-badge">★ NEW STAGE RECORD ★</div>` : '';
  let levelUpHtml = data.didLevelUp ? `<div class="results-levelup-badge">▲ PILOT LEVEL UP → LVL ${data.newLevel} ▲</div>` : '';

  const expGained = data.totalScore || 0;
  const currentLevel = data.newLevel || 1;
  const expProgressPct = data.expProgressPct !== undefined ? data.expProgressPct : 65;

  overlay.innerHTML = `
    <!-- Self-Contained Overlay Styles -->
    <style>
      .results-overlay-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(7, 11, 18, 0.94);
        backdrop-filter: blur(10px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        animation: overlayFadeIn 0.3s ease-out;
        overflow-y: auto;
      }
      .results-card {
        background: #0b111e;
        border: 1px solid #1f2d45;
        border-radius: 14px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 0 45px rgba(0, 0, 0, 0.9), 0 0 20px rgba(56, 189, 248, 0.2);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
        margin: auto;
      }
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 18px;
        background: #111a2d;
        border-bottom: 1px solid #1f2d45;
      }
      .results-stage-tag {
        font-size: 12px;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: 1.5px;
      }
      .results-x-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
      }
      .results-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .results-hero-rank-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px 0;
      }
      .results-rank-stamp-hidden {
        opacity: 0;
        transform: scale(2.6) rotate(-18deg);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .results-rank-stamp {
        background: #070b12;
        border: 2px solid #243048;
        border-radius: 12px;
        padding: 6px 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-3deg);
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8), 0 4px 15px rgba(0, 0, 0, 0.5);
      }
      .results-rank-label {
        font-size: 10px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 2.5px;
        margin-top: 6px;
      }
      .results-breakdown-card {
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .breakdown-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 0;
      }
      .breakdown-lbl {
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
      .breakdown-val {
        font-size: 14px;
        font-weight: 800;
        color: #f8fafc;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .breakdown-val.highlight-red {
        color: #f87171;
      }
      .results-total-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 10px;
      }
      .results-total-lbl {
        font-size: 11px;
        font-weight: 800;
        color: #94a3b8;
        letter-spacing: 2px;
      }
      .results-total-num {
        font-size: 34px;
        font-weight: 900;
        color: #38bdf8;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-shadow: 0 0 18px rgba(56, 189, 248, 0.45);
        line-height: 1.1;
        margin-top: 3px;
      }
      .results-exp-block {
        background: #0f1828;
        border: 1px solid #1f2d45;
        border-radius: 10px;
        padding: 10px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .results-exp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11.5px;
        font-weight: 800;
      }
      .results-exp-lvl {
        color: #38bdf8;
        letter-spacing: 1px;
      }
      .results-exp-gained {
        color: #facc15;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .results-exp-bar-track {
        width: 100%;
        height: 10px;
        background: #070b12;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid #243048;
      }
      .results-exp-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #38bdf8, #facc15);
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        transition: width 0.1s linear;
      }
      .results-gold-ring-payout {
        background: #0f1828;
        border: 1px dashed #facc15;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
      }
      .gold-ring-payout-label {
        font-size: 9px;
        font-weight: 800;
        color: #facc15;
        letter-spacing: 1.2px;
      }
      .gold-ring-payout-val {
        font-size: 18px;
        font-weight: 900;
        color: #facc15;
        margin-top: 2px;
      }
      .results-continue-btn {
        background: #38bdf8;
        color: #070b12;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 1px;
        cursor: pointer;
        margin-top: 4px;
      }
      .animate-stamp-slam {
        animation: stampSlam 0.53s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      @keyframes stampSlam {
        0% { opacity: 0; transform: scale(2.6) rotate(-18deg); }
        70% { opacity: 1; transform: scale(0.94) rotate(-3deg); }
        100% { opacity: 1; transform: scale(1) rotate(-3deg); }
      }
      @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-pop-in {
        animation: popIn 0.53s ease-out forwards;
      }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fade-out {
        opacity: 0;
        transition: opacity 0.25s ease-out;
      }
      .results-transform-pill {
        padding: 7px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        text-align: center;
      }
      .results-transform-pill.super {
        background: rgba(250, 204, 21, 0.15);
        border: 1px solid #facc15;
        color: #facc15;
      }
      .results-transform-pill.ss2 {
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid #38bdf8;
        color: #38bdf8;
        box-shadow: 0 0 15px rgba(56, 189, 248,
