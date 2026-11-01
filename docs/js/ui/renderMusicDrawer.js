// -------------------------------------------------------------
// PERSISTENT COCKPIT DOCK & 3-WAY MEDIA ENGINE
// Modular Component: renderMusicDrawer.js
// -------------------------------------------------------------

let localPlaylist = [];
let currentTrackIndex = 0;
let localAudio = null;

export function initMusicDrawer() {
  const mount = document.getElementById('musicDrawerMount');
  if (!mount) return;

  // Initialize native HTML5 audio object once
  if (!localAudio) {
    localAudio = new Audio();
    localAudio.preload = 'metadata';
    localAudio.addEventListener('ended', playNextTrack);
    localAudio.addEventListener('timeupdate', updateAudioProgress);
    localAudio.addEventListener('play', () => updatePlayPauseState(true));
    localAudio.addEventListener('pause', () => updatePlayPauseState(false));
  }

  // Retrieve saved YouTube Playlist/Video ID or default to high-energy workout mix
  const savedYtId = localStorage.getItem('sonic_music_yt_id') || 'PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D';

  mount.innerHTML = `
    <!-- Slide-Up Drawer Tray (Pops up above the fixed bottom dock) -->
    <div id="musicSlideUpTray" class="music-slideup-tray" style="display: none;">
      <div class="music-tray-header">
        <span class="music-tray-title">⚡ COCKPIT AUDIO DECK</span>
        <button id="musicCloseTrayBtn" class="music-tray-close" type="button" title="Close Tray">✕</button>
      </div>

      <!-- Source Switcher Tabs -->
      <div class="music-tabs">
        <button class="music-tab-btn active" data-source="local" type="button">LOCAL FILES</button>
        <button class="music-tab-btn" data-source="youtube" type="button">YT MUSIC</button>
        <button class="music-tab-btn" data-source="pandora" type="button">PANDORA</button>
      </div>

      <!-- SOURCE 1: LOCAL AUDIO PLAYER -->
      <div id="musicPaneLocal" class="music-pane active">
        <div class="local-player-box">
          <div class="track-info-row">
            <span id="currentTrackTitle" class="track-title-text">NO TRACK LOADED</span>
            <span id="trackTimeDisplay" class="track-time-text">0:00 / 0:00</span>
          </div>

          <div id="trackProgressBar" class="track-progress-bar">
            <div id="trackProgressFill" class="track-progress-fill"></div>
          </div>

          <div class="transport-controls">
            <button id="prevTrackBtn" class="ctrl-btn" type="button" title="Previous Track">⏮</button>
            <button id="playPauseBtn" class="ctrl-btn play-btn" type="button" title="Play / Pause">▶</button>
            <button id="nextTrackBtn" class="ctrl-btn" type="button" title="Next Track">⏭</button>
            
            <label class="file-load-btn" title="Choose audio files from device">
              📂 LOAD
              <input type="file" id="localAudioFileInput" multiple accept="audio/*" style="display: none;">
            </label>
          </div>

          <!-- Mini Tracklist Dropdown/Queue Preview -->
          <div id="localQueueCount" class="queue-status-text">Queue: 0 tracks loaded</div>
        </div>
      </div>

      <!-- SOURCE 2: YOUTUBE MUSIC -->
      <div id="musicPaneYoutube" class="music-pane" style="display: none;">
        <div class="yt-box">
          <div class="yt-input-row">
            <input type="text" id="ytPlaylistInput" class="yt-input" placeholder="Enter Playlist ID or Video ID" value="${savedYtId}">
            <button id="ytLoadBtn" class="yt-btn" type="button">LOAD</button>
          </div>

          <div class="yt-embed-wrap">
            <iframe id="ytPlayerFrame" 
              src="https://www.youtube.com/embed/videoseries?list=${savedYtId}&enablejsapi=1" 
              allow="autoplay; encrypted-media" 
              allowfullscreen>
            </iframe>
          </div>

          <div class="external-links-row">
            <a href="https://music.youtube.com" target="_blank" rel="noopener" class="app-launch-link yt-link">
              🚀 OPEN YOUTUBE MUSIC APP
            </a>
          </div>
        </div>
      </div>

      <!-- SOURCE 3: PANDORA -->
      <div id="musicPanePandora" class="music-pane" style="display: none;">
        <div class="pandora-box">
          <div class="pandora-desc">Instant handoff to native Pandora workout stations:</div>
          <div class="pandora-btn-grid">
            <a href="pandora://station/play/439775086551608226" 
               data-fallback="https://www.pandora.com/genre/workout" 
               class="pandora-btn station-link">
              ⚡ POP FITNESS & WORKOUT RADIO
            </a>
            <a href="pandora://genre/hip-hop-workout" 
               data-fallback="https://www.pandora.com/genre/hip-hop-workout" 
               class="pandora-btn station-link">
              🔥 HIP-HOP & RAP POWER HOUR
            </a>
            <a href="pandora://genre/electronic-workout" 
               data-fallback="https://www.pandora.com/genre/electronic-workout" 
               class="pandora-btn station-link">
              🌀 HIGH-BPM ELECTRONIC / DRUM & BASS
            </a>
            <a href="https://www.pandora.com" target="_blank" rel="noopener" class="pandora-btn generic-link">
              🌐 LAUNCH PANDORA WEB CLIENT
            </a>
          </div>
        </div>
      </div>

    </div>
  `;

  attachMusicDrawerEvents();
  setupMediaSessionApi();
}

export function toggleMusicDrawer() {
  const tray = document.getElementById('musicSlideUpTray');
  const chevron = document.getElementById('dockMusicChevron');
  if (!tray) return;

  const isOpen = tray.style.display !== 'none';
  tray.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.innerText = isOpen ? '▲' : '▼';
}

function attachMusicDrawerEvents() {
  const closeBtn = document.getElementById('musicCloseTrayBtn');
  if (closeBtn) {
    closeBtn.onclick = () => toggleMusicDrawer();
  }

  // Source Switcher Tabs
  const tabBtns = document.querySelectorAll('.music-tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const src = btn.getAttribute('data-source');
      document.getElementById('musicPaneLocal').style.display = src === 'local' ? 'block' : 'none';
      document.getElementById('musicPaneYoutube').style.display = src === 'youtube' ? 'block' : 'none';
      document.getElementById('musicPanePandora').style.display = src === 'pandora' ? 'block' : 'none';
    };
  });

  // Local File Ingest
  const fileInput = document.getElementById('localAudioFileInput');
  if (fileInput) {
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      localPlaylist = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file)
      }));

      const queueCount = document.getElementById('localQueueCount');
      if (queueCount) queueCount.innerText = `Queue: ${localPlaylist.length} tracks loaded`;

      currentTrackIndex = 0;
      loadTrack(currentTrackIndex, true);
    };
  }

  // Scrubbing on Progress Bar
  const progressBar = document.getElementById('trackProgressBar');
  if (progressBar) {
    progressBar.onclick = (e) => {
      if (!localAudio || !localAudio.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      localAudio.currentTime = clickPos * localAudio.duration;
    };
  }

  // Transport Controls
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.onclick = () => {
      if (!localAudio.src) return;
      if (localAudio.paused) {
        localAudio.play();
      } else {
        localAudio.pause();
      }
    };
  }

  const prevBtn = document.getElementById('prevTrackBtn');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (localPlaylist.length === 0) return;
      currentTrackIndex = (currentTrackIndex - 1 + localPlaylist.length) % localPlaylist.length;
      loadTrack(currentTrackIndex, true);
    };
  }

  const nextBtn = document.getElementById('nextTrackBtn');
  if (nextBtn) {
    nextBtn.onclick = playNextTrack;
  }

  // YouTube Playlist Switcher
  const ytLoadBtn = document.getElementById('ytLoadBtn');
  const ytInput = document.getElementById('ytPlaylistInput');
  const ytFrame = document.getElementById('ytPlayerFrame');
  if (ytLoadBtn && ytInput && ytFrame) {
    ytLoadBtn.onclick = () => {
      const id = ytInput.value.trim();
      if (!id) return;
      localStorage.setItem('sonic_music_yt_id', id);

      // Distinguish full playlist ID from single video ID
      ytFrame.src = id.length > 20 || id.startsWith('PL') || id.startsWith('OL')
        ? `https://www.youtube.com/embed/videoseries?list=${id}&enablejsapi=1`
        : `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    };
  }

  // Pandora Deep-Link Fallback Handling
  document.querySelectorAll('.station-link').forEach(link => {
    link.onclick = (e) => {
      const deepUri = link.getAttribute('href');
      const fallbackUrl = link.getAttribute('data-fallback');

      // Attempt native app URI; fall back to mobile browser tab if app is not installed
      const start = Date.now();
      window.location.href = deepUri;

      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.open(fallbackUrl, '_blank', 'noopener');
        }
      }, 800);

      e.preventDefault();
    };
  });
}

function loadTrack(index, autoPlay = false) {
  if (!localPlaylist[index]) return;
  const track = localPlaylist[index];
  localAudio.src = track.url;

  const titleEl = document.getElementById('currentTrackTitle');
  if (titleEl) titleEl.innerText = `${index + 1}. ${track.name}`;

  const dockStatus = document.getElementById('dockNowPlayingText');
  if (dockStatus) dockStatus.innerText = track.name;

  updateMediaSessionMetadata(track.name);

  if (autoPlay) {
    localAudio.play().catch(() => {});
  }
}

function playNextTrack() {
  if (localPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex + 1) % localPlaylist.length;
  loadTrack(currentTrackIndex, true);
}

function updatePlayPauseState(isPlaying) {
  const btn = document.getElementById('playPauseBtn');
  if (btn) btn.innerText = isPlaying ? '⏸' : '▶';

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }
}

function updateAudioProgress() {
  const fill = document.getElementById('trackProgressFill');
  const timeEl = document.getElementById('trackTimeDisplay');

  if (fill && localAudio.duration) {
    const pct = (localAudio.currentTime / localAudio.duration) * 100;
    fill.style.width = `${pct}%`;
  }

  if (timeEl && localAudio.duration) {
    const cur = formatTime(localAudio.currentTime);
    const dur = formatTime(localAudio.duration);
    timeEl.innerText = `${cur} / ${dur}`;
  }
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// -------------------------------------------------------------
// NATIVE LOCK SCREEN / HEADPHONE BLUETOOTH MEDIA SESSION API
// -------------------------------------------------------------
function setupMediaSessionApi() {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.setActionHandler('play', () => {
    if (localAudio) localAudio.play();
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    if (localAudio) localAudio.pause();
  });
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    if (localPlaylist.length > 0) {
      currentTrackIndex = (currentTrackIndex - 1 + localPlaylist.length) % localPlaylist.length;
      loadTrack(currentTrackIndex, true);
    }
  });
  navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);
}

function updateMediaSessionMetadata(trackName) {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: trackName || "Workout Track",
    artist: "Sonic Fitness Core",
    album: "Cockpit Audio Deck",
    artwork: [
      { src: './assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: './assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  });
}
