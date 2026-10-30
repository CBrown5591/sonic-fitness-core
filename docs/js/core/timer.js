// -------------------------------------------------------------
// REST TIMER SUBSYSTEM (WITH 3-CHARGE SOUL GAUGE)
// Modular Core Subsystem: timer.js
// -------------------------------------------------------------

let configuredRestSeconds = parseInt(localStorage.getItem('sonic_rest_duration'), 10) || 90;
let timerSeconds = configuredRestSeconds;
let timerInterval = null;
let timerEndTime = null;
let wakeLock = null;

// Darkspine 3-Charge Soul Gauge
let soulCharges = 3;

export function getSoulCharges() {
  return soulCharges;
}

export function resetSoulGauge() {
  soulCharges = 3;
  updateTimeBrakeBtnUI();
}

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (err) {
    console.warn('WakeLock unavailable:', err);
  }
}

export function setTimerDuration(seconds, onUpdate) {
  configuredRestSeconds = seconds;
  localStorage.setItem('sonic_rest_duration', seconds);
  if (!timerEndTime) {
    timerSeconds = seconds;
    if (onUpdate) onUpdate(timerSeconds);
  }
  if (navigator.vibrate) navigator.vibrate(25);
  return configuredRestSeconds;
}

export function startRestTimer(onTick, onComplete) {
  clearInterval(timerInterval);
  timerEndTime = Date.now() + (configuredRestSeconds * 1000);
  localStorage.setItem('sonic_timer_end', timerEndTime);
  requestWakeLock();

  const sync = () => {
    if (!timerEndTime) return;
    const remainingMs = timerEndTime - Date.now();
    const newSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    if (newSeconds !== timerSeconds) {
      timerSeconds = newSeconds;
      if (onTick) onTick(timerSeconds);

      if (timerSeconds === 0) {
        clearInterval(timerInterval);
        timerEndTime = null;
        localStorage.removeItem('sonic_timer_end');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (onComplete) onComplete();
      }
    }
  };

  sync();
  timerInterval = setInterval(sync, 250);
}

export function applyTimeBrake(onTick) {
  if (soulCharges <= 0) {
    alert("🔥 SOUL GAUGE DEPLETED: 0 charges remaining for this workout!");
    return false;
  }
  if (timerSeconds <= 5) return false;

  soulCharges--;
  timerSeconds = Math.max(1, timerSeconds - 30);
  if (timerEndTime) {
    timerEndTime -= (30 * 1000);
    localStorage.setItem('sonic_timer_end', timerEndTime);
  }
  if (onTick) onTick(timerSeconds);
  if (navigator.vibrate) navigator.vibrate([30, 20, 60]);
  updateTimeBrakeBtnUI();
  return true;
}

export function updateTimeBrakeBtnUI() {
  const btn = document.getElementById('timeBrakeBtn');
  if (!btn) return;
  const pips = '■'.repeat(soulCharges) + '□'.repeat(3 - soulCharges);
  btn.innerText = `TIME BRAKE [${pips}]`;
  if (soulCharges <= 0) {
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
  } else {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }
}

export function initTimerBackgroundSync(onTick, onComplete) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const savedEnd = parseInt(localStorage.getItem('sonic_timer_end'), 10);
      if (savedEnd && savedEnd > Date.now()) {
        timerEndTime = savedEnd;
        startRestTimer(onTick, onComplete);
      } else if (savedEnd) {
        localStorage.removeItem('sonic_timer_end');
        timerEndTime = null;
        timerSeconds = 0;
        if (onTick) onTick(0);
        if (onComplete) onComplete();
      }
    }
  });
}

window.getSoulCharges = getSoulCharges;
window.resetSoulGauge = resetSoulGauge;
