// docs/js/core/timer.js

let timerDuration = parseInt(localStorage.getItem('sonic_timer_duration') || '90', 10);
let timerTargetEnd = null;
let timerInterval = null;
let onTickCallback = null;

export function setTimerDuration(seconds) {
  timerDuration = seconds;
  localStorage.setItem('sonic_timer_duration', seconds);

  // Update visual active state on duration pills
  document.querySelectorAll('.timer-duration-selector .btn-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  const activePill = document.getElementById(`pill-${seconds}`);
  if (activePill) activePill.classList.add('active');

  // If clock is idle, immediately update clock readout
  if (!timerTargetEnd) {
    updateClockDisplay(seconds);
  }
}
// Add to docs/js/core/timer.js

export function toggleRestDropUp() {
  const menu = document.getElementById('restDropUpMenu');
  if (!menu) return;
  const isOpen = menu.style.display !== 'none';
  menu.style.display = isOpen ? 'none' : 'flex';
}

export function selectRestPreset(seconds) {
  setTimerDuration(seconds);
  const menu = document.getElementById('restDropUpMenu');
  if (menu) menu.style.display = 'none';
}

// Global window bindings
window.toggleRestDropUp = toggleRestDropUp;
window.selectRestPreset = selectRestPreset;

// Dismiss drop-up if tapping anywhere outside
document.addEventListener('click', (e) => {
  const container = document.querySelector('.dock-timer-container');
  const menu = document.getElementById('restDropUpMenu');
  if (menu && container && !container.contains(e.target)) {
    menu.style.display = 'none';
  }
});

export function startRestTimer(callback) {
  if (callback) onTickCallback = callback;

  clearInterval(timerInterval);
  timerTargetEnd = Date.now() + (timerDuration * 1000);

  renderClock();
  timerInterval = setInterval(renderClock, 250);
}

export function applyTimeBrake(callback) {
  if (callback) onTickCallback = callback;
  if (!timerTargetEnd) return;

  // Deduct 15 seconds from remaining time target
  timerTargetEnd -= 15000;
  renderClock();
}

function renderClock() {
  if (!timerTargetEnd) return;

  const now = Date.now();
  const diffMs = timerTargetEnd - now;
  const remainingSecs = Math.max(0, Math.ceil(diffMs / 1000));

  updateClockDisplay(remainingSecs);

  if (onTickCallback) {
    onTickCallback(remainingSecs);
  }

  if (remainingSecs <= 0) {
    clearInterval(timerInterval);
    timerTargetEnd = null;
    timerInterval = null;

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }
}

function updateClockDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  
  const clk = document.getElementById('timerClock');
  if (clk) clk.innerText = formatted;
}

export function initTimerBackgroundSync() {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && timerTargetEnd) {
      // Recalculate immediately on return to app
      renderClock();
    }
  });

  // Re-hydrate active pill style on initial load
  setTimerDuration(timerDuration);
}

// Global window exposure for inline HTML calls
window.setTimerDuration = setTimerDuration;
window.startRestTimer = startRestTimer;
window.applyTimeBrake = () => applyTimeBrake();
