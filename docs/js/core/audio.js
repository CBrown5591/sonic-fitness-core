// -------------------------------------------------------------
// AUDIO ENGINE // RETRO & MODERN SOUND SUBSYSTEM
// Modular Core Subsystem: audio.js
// -------------------------------------------------------------

let currentAudioTheme = localStorage.getItem('sonic_audio_theme') || 'modern';
let activeAudio = null;

export function getAudioTheme() {
  return currentAudioTheme;
}

export function toggleAudioTheme() {
  currentAudioTheme = currentAudioTheme === 'modern' ? 'classic' : 'modern';
  localStorage.setItem('sonic_audio_theme', currentAudioTheme);
  return currentAudioTheme;
}

export function playRingChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Classic two-tone ring pickup chime
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.setValueAtTime(3000, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn("AudioContext chime bypassed:", e);
  }
}

export function playCountdownBeep(isFinal = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isFinal ? 1760 : 880, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.35 : 0.15));
  } catch (e) {}
}

export function playStageClearFanfare(rank = 'S') {
  stopAllFanfare();
  const theme = getAudioTheme();
  const soundFile = theme === 'classic' ? './assets/audio/genesis_clear.mp3' : './assets/audio/sa2_clear.mp3';

  try {
    activeAudio = new Audio(soundFile);
    activeAudio.volume = 0.75;
    activeAudio.play().catch(e => console.warn("Audio autoplay blocked by browser policy:", e));
  } catch (e) {}
}

export function stopAllFanfare() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {}
    activeAudio = null;
  }
}
