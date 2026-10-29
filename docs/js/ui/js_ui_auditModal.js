// -------------------------------------------------------------
// PRE-FLIGHT TELEMETRY AUDIT & LIVE SET EDITOR
// Modular UI Component: auditModal.js
// -------------------------------------------------------------
import { CARDIO_CONFIGS } from '../data/cardioConfigs.js';
import { calculateE1RM } from '../engine/calc.js';
import { showToast } from './renderHud.js';

export function openAuditModal(activeSession, onConfirm) {
  if (!activeSession.sets || activeSession.sets.length === 0) {
    showToast("Log at least 1 set before clearing stage!");
    return;
  }

  let auditOverlay = document.getElementById('auditOverlay');
  if (!auditOverlay) {
    auditOverlay = document.createElement('div');
    auditOverlay.id = 'auditOverlay';
    auditOverlay.className = 'results-overlay';
    auditOverlay.style.zIndex = '99998';
    document.body.appendChild(auditOverlay);
  }

  renderAuditContent(auditOverlay, activeSession, onConfirm);
  auditOverlay.style.display = 'flex';
}

function renderAuditContent(overlay, activeSession, onConfirm) {
  const currentVolume = activeSession.sets.reduce((sum, s) => 
    sum + (s.equivVolume !== undefined ? s.equivVolume : ((s.load || 0) * (s.reps || 0))), 0);

  overlay.innerHTML = `
    <div class="results-card" style="max-height: 85vh; overflow-y: auto; padding: 18px;">
      <div class="results-stage-title">TELEMETRY AUDIT // PRE-FLIGHT CHECK</div>
      <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 12px;">
        Review and edit any load, rep, or RPE numbers before final scoring and sync.
      </div>

      <div id="auditSetsList" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
        ${activeSession.sets.map((s, idx) => {
          const isCardio = CARDIO_CONFIGS && CARDIO_CONFIGS[s.exercise];
          const label1 = isCardio ? CARDIO_CONFIGS[s.exercise].label1 : "LBS";
          const label2 = isCardio ? CARDIO_CONFIGS[s.exercise].label2 : "REPS";
          return `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--accent-blue); margin-bottom: 6px;">
                <span>${s.slot} • ${s.exercise} (Set ${s.setNum})</span>
                <button id="del-audit-btn-${idx}" style="background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 11px;">✕ REMOVE</button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                <div>
                  <label style="font-size: 9px; color: var(--text-dim);">${label1}</label>
                  <input type="number" id="audit-load-${idx}" value="${s.load}" style="width: 100%; padding: 4px; background: #060911; border: 1px solid var(--border); color: #fff; border-radius: 4px; font-size: 12px; text-align: center;">
                </div>
                <div>
                  <label style="font-size: 9px; color: var(--text-dim);">${label2}</label>
                  <input type="number" id="audit-reps-${idx}" value="${s.reps}" style="width: 100%; padding: 4px; background: #060911; border: 1px solid var(--border); color: #fff; border-radius: 4px; font-size: 12px; text-align: center;">
                </div>
                <div>
                  <label style="font-size: 9px; color: var(--text-dim);">RPE</label>
                  <select id="audit-rpe-${idx}" style="width: 100%; padding: 4px; background: #060911; border: 1px solid var(--border); color: #fff; border-radius: 4px; font-size: 12px; text-align: center;">
                    ${[6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0].map(val => `
                      <option value="${val}" ${s.rpe === val ? 'selected' : ''}>${val}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; font-weight: 700; color: var(--accent-gold); margin-bottom: 15px; text-align: right;">
        TOTAL VOLUME: ${currentVolume.toLocaleString()} LBS
      </div>

      <div style="display: flex; gap: 8px;">
        <button id="closeAuditBtn" style="flex: 1; padding: 10px; background: #141c2e; border: 1px solid var(--border); color: #fff; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
          ← RESUME
        </button>
        <button id="confirmAuditBtn" style="flex: 2; padding: 10px; background: var(--accent-blue); border: none; color: #fff; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">
          CONFIRM & TRANSMIT [✓]
        </button>
      </div>
    </div>
  `;

  // Attach delete buttons
  activeSession.sets.forEach((_, idx) => {
    const delBtn = document.getElementById(`del-audit-btn-${idx}`);
    if (delBtn) {
      delBtn.onclick = () => {
        if (confirm("Remove this set?")) {
          activeSession.sets.splice(idx, 1);
          renderAuditContent(overlay, activeSession, onConfirm);
          showToast("Set removed.");
        }
      };
    }
  });

  const closeBtn = document.getElementById('closeAuditBtn');
  if (closeBtn) {
    closeBtn.onclick = () => { overlay.style.display = 'none'; };
  }

  const confirmBtn = document.getElementById('confirmAuditBtn');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      // Re-read form values
      activeSession.sets.forEach((s, idx) => {
        const loadEl = document.getElementById(`audit-load-${idx}`);
        const repsEl = document.getElementById(`audit-reps-${idx}`);
        const rpeEl = document.getElementById(`audit-rpe-${idx}`);
        if (loadEl && repsEl && rpeEl) {
          s.load = parseFloat(loadEl.value) || 0;
          s.reps = parseInt(repsEl.value, 10) || 0;
          s.rpe = parseFloat(rpeEl.value) || 8.0;

          const isCardio = CARDIO_CONFIGS && CARDIO_CONFIGS[s.exercise];
          if (isCardio) {
            const cMetrics = CARDIO_CONFIGS[s.exercise].calcEquiv(s.load, s.reps);
            s.equivReps = cMetrics.equivReps;
            s.equivVolume = cMetrics.equivVolume;
            s.displayMetric = cMetrics.display;
            s.e1rm = 0;
          } else {
            s.equivReps = s.reps;
            s.equivVolume = Math.round(s.load * s.reps);
            s.displayMetric = `${s.load}lbs × ${s.reps}r`;
            s.e1rm = calculateE1RM(s.load, s.reps, s.rpe);
          }
        }
      });
      overlay.style.display = 'none';
      if (onConfirm) onConfirm();
    };
  }
}
