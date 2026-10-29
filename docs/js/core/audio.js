// -------------------------------------------------------------
// WEB AUDIO API ARCADE SYNTHESIZER & AUDIO THEME ENGINE
// Modular Core Subsystem: audio.js
// -------------------------------------------------------------

let audioCtx = null;

const audioElements = {
  modern: null,
  classic: null,
  levelup: null
};

export function configureAudioSession() {
  if ('audioSession' in navigator) {
    try {
      navigator.audioSession.type = 'transient-solo-duck';
    } catch (e) {
      console.warn('AudioSession ducking failed:', e);
    }
  }
}

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass({ latencyHint: 'interactive' });
    configureAudioSession();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAudioTheme() {
  return localStorage.getItem('sonic_audio_theme') || 'modern';
}

export function toggleAudioTheme() {
  const current = getAudioTheme();
  const next = current === 'modern' ? 'classic' : 'modern';
  localStorage.setItem('sonic_audio_theme', next);
  return next;
}

export function playCountdownBeep(isFinal = false) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 1760.00 : 880.00, now);

    const duration = isFinal ? 0.35 : 0.12;
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch (e) {}
}

export function playRingChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(1046.50, now);
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08);

    osc2.frequency.setValueAtTime(2093.00, now);
    osc2.frequency.exponentialRampToValueAtTime(3135.96, now + 0.08);

    gain1.gain.setValueAtTime(0.40, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    gain2.gain.setValueAtTime(0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  } catch (e) {}
}

export function playScoreTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
}

export function playStampImpactSound(rank) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';

    if (rank === 'S') {
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(32, now + 0.45);
      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      whiteNoise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
    } else if (rank === 'A') {
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.3);
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(60, now + 0.2);
      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    }

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.6);
  } catch (e) {}
}

export function playStageClearFanfare() {
  const theme = getAudioTheme();
  const ctx = getAudioContext();
  const now = ctx ? ctx.currentTime : 0;

  const audioSrc = theme === 'modern' 
    ? './assets/audio/sa2_clear.mp3' 
    : './assets/audio/genesis_clear.mp3';

  try {
    if (!audioElements[theme]) {
      audioElements[theme] = new Audio(audioSrc);
      audioElements[theme].preload = 'auto';
    }
    
    audioElements[theme].currentTime = 0;
    const playPromise = audioElements[theme].play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`[Audio] ${theme.toUpperCase()} audio file playback failed, falling back to synth engine:`, err);
        if (theme === 'modern') playModernSynthFanfare(ctx, now);
        else playClassicSynthFanfare(ctx, now);
      });
    }
  } catch (e) {
    console.warn(`[Audio] Audio error on ${theme}, using synth fallback:`, e);
    if (theme === 'modern') playModernSynthFanfare(ctx, now);
    else playClassicSynthFanfare(ctx, now);
  }
}

export function playLevelUpFanfare() {
  const ctx = getAudioContext();
  const now = ctx ? ctx.currentTime : 0;
  try {
    if (!audioElements.levelup) {
      audioElements.levelup = new Audio('./assets/audio/level_up.mp3');
      audioElements.levelup.preload = 'auto';
    }
    audioElements.levelup.currentTime = 0;
    const playPromise = audioElements.levelup.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Audio] level_up.mp3 playback failed, falling back to synth:', err);
        playLevelUpSynth(ctx, now);
      });
    }
  } catch (e) {
    console.warn('[Audio] Level up audio failed:', e);
    playLevelUpSynth(ctx, now);
  }
}

export function stopAllFanfare() {
  Object.values(audioElements).forEach(a => {
    if (a && !a.paused) {
      a.pause();
      a.currentTime = 0;
    }
  });
}

// Modern Sonic Synth Fallback
function playModernSynthFanfare(ctx, now) {
  if (!ctx) return;
  const C5 = 523.25, D5 = 587.33, F5 = 698.46, G5 = 783.99, A5 = 880.00, Bb5 = 932.33;
  const C6 = 1046.50, F6 = 1396.91;

  const notes = [
    { f: C5, t: 0.00, d: 0.08 }, { f: D5, t: 0.08, d: 0.08 }, { f: F5, t: 0.16, d: 0.08 }, { f: G5, t: 0.24, d: 0.10 },
    { f: A5, t: 0.35, d: 0.30 }, { f: F5, t: 0.70, d: 0.14 }, { f: G5, t: 0.85, d: 0.14 }, { f: A5, t: 1.00, d: 0.14 },
    { f: Bb5, t: 1.15, d: 0.14 }, { f: C6, t: 1.30, d: 0.45 },
    { f: F6, t: 1.85, d: 1.20 }, { f: C6, t: 1.85, d: 1.20 }, { f: A5, t: 1.85, d: 1.20 }
  ];

  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(n.f, now + n.t);
    gain.gain.setValueAtTime(0.001, now + n.t);
    gain.gain.linearRampToValueAtTime(0.20, now + n.t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.t);
    osc.stop(now + n.t + n.d + 0.05);
  });
}

// Classic 16-Bit Sonic Synth Fallback
function playClassicSynthFanfare(ctx, now) {
  if (!ctx) return;
  const C5 = 523.25, F5 = 698.46, A5 = 880.00, Bb5 = 932.33, C6 = 1046.50, F6 = 1396.91;
  const notes = [
    { f: C5, t: 0.00, d: 0.09 }, { f: F5, t: 0.10, d: 0.09 }, { f: A5, t: 0.20, d: 0.09 }, { f: C6, t: 0.30, d: 0.36 },
    { f: Bb5, t: 0.70, d: 0.11 }, { f: A5, t: 0.82, d: 0.11 }, { f: F5, t: 0.94, d: 0.35 },
    { f: F6, t: 1.35, d: 1.20 }, { f: C6, t: 1.35, d: 1.20 }, { f: A5, t: 1.35, d: 1.20 }
  ];

  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, now + n.t);
    gain.gain.setValueAtTime(0.001, now + n.t);
    gain.gain.linearRampToValueAtTime(0.24, now + n.t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.t);
    osc.stop(now + n.t + n.d + 0.05);
  });
}

function playLevelUpSynth(ctx, now) {
  if (!ctx) return;
  const notes = [
    { f: 523.25, t: 0.00, d: 0.12 },
    { f: 659.25, t: 0.12, d: 0.12 },
    { f: 783.99, t: 0.24, d: 0.12 },
    { f: 1046.50, t: 0.36, d: 0.18 },
    { f: 1318.51, t: 0.54, d: 0.18 },
    { f: 1567.98, t: 0.72, d: 0.25 },
    { f: 2093.00, t: 0.97, d: 0.85 }
  ];
  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, now + n.t);
    gain.gain.setValueAtTime(0.001, now + n.t);
    gain.gain.linearRampToValueAtTime(0.35, now + n.t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.t);
    osc.stop(now + n.t + n.d + 0.05);
  });
}
