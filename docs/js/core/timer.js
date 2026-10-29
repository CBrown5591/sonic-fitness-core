// -------------------------------------------------------------
// REST TIMER SUBSYSTEM (DELTA-BASED & BACKGROUND RESILIENT)
// Modular Core Subsystem: timer.js
// -------------------------------------------------------------
import { playCountdownBeep } from './audio.js';

let configuredRestSeconds = parseInt(localStorage.getItem('sonic_rest_duration'), 10) || 90;
let timerSeconds = configuredRestSeconds;
let timerInterval = null;
let timerEndTime = null;
let wakeLock = null;

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

      if (timerSeconds === 3 || timerSeconds === 2 || timerSeconds === 1) {
        playCountdownBeep(false);
        if (navigator.vibrate) navigator.vibrate(40);
      } else if (timerSeconds === 0) {
        clearInterval(timerInterval);
        timerEndTime = null;
        localStorage.removeItem('sonic_timer_end');
        playCountdownBeep(true);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        dispatchRestNotification();
        if (onComplete) onComplete();
      }
    }
  };

  sync();
  timerInterval = setInterval(sync, 250);
}

export function applyTimeBrake(onTick) {
  if (timerSeconds <= 5) return false;
  timerSeconds = Math.max(1, timerSeconds - 30);
  if (timerEndTime) {
    timerEndTime -= (30 * 1000);
    localStorage.setItem('sonic_timer_end', timerEndTime);
  }
  if (onTick) onTick(timerSeconds);
  if (navigator.vibrate) navigator.vibrate([30, 20, 60]);
  return true;
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

export async function dispatchRestNotification() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("REST COMPLETE // NEXT SET READY", {
        body: "Recovery elapsed. Time to strike!",
        icon: "./assets/icons/icon-192.png",
        badge: "./assets/icons/icon-192.png",
        vibrate: [300, 100, 300, 100, 400],
        tag: "rest-timer-complete",
        renotify: true,
        requireInteraction: true
      });
    }
  } catch (e) {}
}
