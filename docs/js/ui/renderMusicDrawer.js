// -------------------------------------------------------------
// PERSISTENT COCKPIT DOCK & 3-WAY MEDIA ENGINE (WITH IDB CACHING)
// Modular Component: renderMusicDrawer.js
// -------------------------------------------------------------

const DB_NAME = 'SonicCockpitAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

let localPlaylist = [];
let currentTrackIndex = 0;
let localAudio = null;
let dbInstance = null;

// IndexedDB: Open / Initialize Store
function getDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

// IndexedDB: Save playlist blobs
async function saveTracksToIDB(trackObjects) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear(); // Replace old playlist
      trackObjects.forEach(t => store.add({ name: t.name, blob: t.blob }));
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('[Audio DB] Failed to cache tracks:', err);
  }
}

// IndexedDB: Retrieve cached playlist blobs on boot
async function loadTracksFromIDB() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('[Audio DB] Failed to load tracks:', err);
    return [];
  }
}

// IndexedDB: Clear stored tracks
async function clearTracksFromIDB() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {}
}

export async function initMusicDrawer() {
  const mount = document.getElementById('musicDrawerMount');
  if (!mount) return;

  if (!localAudio) {
    localAudio = new Audio();
    localAudio.preload = 'metadata';
    localAudio.addEventListener('ended', playNextTrack);
    localAudio.addEventListener('timeupdate', updateAudioProgress);
    localAudio.addEventListener('play', () => updatePlayPauseState(true));
    localAudio.addEventListener('pause', () => updatePlayPauseState(false));
  }

  const savedYtId = localStorage.getItem('sonic_music_yt_id') || 'PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D';

  mount.innerHTML = `
    <!-- Slide-Up Drawer Tray -->
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
            <span id="currentTrackTitle" class="track-title-text">LOADING AUDIO CORE...</span>
            <span id="trackTimeDisplay" class="track-time-text">0:00 / 0:00</span>
          </div>

          <div id="trackProgressBar" class="track-progress-bar">
            <div id="trackProgressFill" class="track-progress-fill"></div>
          </div>

          <div class="transport-controls">
            <button id="prevTrackBtn" class="ctrl-btn" type="button" title="Previous Track">⏮</button>
            <button id="playPauseBtn" class="ctrl-btn play-btn" type="button" title="Play / Pause">▶</button>
            <button id="nextTrackBtn" class="ctrl-btn" type="button" title="Next Track">⏭</button>
            
            <!-- Folder Select Mode -->
            <label class="file-load-btn" title="Load entire folder of songs">
              📁 FOLDER
              <input type="file" id="localAudioFolderInput" webkitdirectory directory multiple style="display: none;">
            </label>

            <!-- Multi-file Select Mode -->
            <label class="file-load-btn" title="Pick multiple loose songs">
              📂 FILES
              <input type="file" id="localAudioFileInput" multiple accept="audio/*" style="display: none;">
            </label>
          </div>

          <!-- Queue Management Row -->
          <div class="queue-manage-row">
            <span id="localQueueCount" class="queue-status-text">Restoring cached tracks...</span>
            <button id="clearQueueBtn" class="clear-queue-btn" type="button">CLEAR QUEUE</button>
          </div>
        </div>
      </div>

      <!-- SOURCE 2: YOUTUBE MUSIC -->
      <div id="musicPaneYoutube" class="music-pane" style="display: none;">
        <div class="yt-box">
          <div class="yt-input-row">
            <input type="text" id="ytPlaylistInput" class="yt-input" placeholder="Playlist ID or Video ID" value="${savedYtId}">
            <button id="ytLoadBtn" class="yt-btn" type="button">LOAD</button>
          </div>

          <div class="yt-embed-wrap">
            <iframe id="ytPlayerFrame" 
              src="https://www.youtube.com/embed/videoseries?list=${savedYtId}&enablejsapi=1" 
              allow="autoplay; encrypted-media" 
              allowfullscreen>
            </iframe>
          </div>

          <a href="https://music.youtube.com" target="_blank" rel="noopener" class="app-launch-link yt-link">
            🚀 OPEN YOUTUBE MUSIC APP
          </a>
        </div>
      </div>

      <!-- SOURCE 3: PANDORA -->
      <div id="musicPanePandora" class="music-pane" style="display: none;">
        <div class="pandora-box">
          <div class="pandora-desc">Instant handoff to Pandora workout stations:</div>
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

  // Restore cached playlist from IndexedDB on startup
  await restorePlaylistFromCache();
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

  // Folder Ingest (webkitdirectory)
  const folderInput = document.getElementById('localAudioFolderInput');
  if (folderInput) {
    folderInput.onchange = (e) => ingestAudioFiles(Array.from(e.target.files));
  }

  // Multi-file Ingest
  const fileInput = document.getElementById('localAudioFileInput');
  if (fileInput) {
    fileInput.onchange = (e) => ingestAudioFiles(Array.from(e.target.files));
  }

  // Clear Queue
  const clearBtn = document.getElementById('clearQueueBtn');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      if (localAudio) {
        localAudio.pause();
        localAudio.src = '';
      }
      localPlaylist.forEach(t => URL.revokeObjectURL(t.url));
      localPlaylist = [];
      currentTrackIndex = 0;
      await clearTracksFromIDB();

      const titleEl = document.getElementById('currentTrackTitle');
      if (titleEl) titleEl.innerText = "NO TRACK LOADED";
      const countEl = document.getElementById('localQueueCount');
      if (countEl) countEl.innerText = "Queue: 0 tracks (Cleaned)";
      const dockText = document.getElementById('dockNowPlayingText');
      if (dockText) dockText.innerText = "MUSIC DECK";
      updatePlayPauseState(false);
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
      if (!localAudio.src && localPlaylist.length > 0) {
        loadTrack(currentTrackIndex, true);
        return;
      }
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

  // YouTube Playlist Load
  const ytLoadBtn = document.getElementById('ytLoadBtn');
  const ytInput = document.getElementById('ytPlaylistInput');
  const ytFrame = document.getElementById('ytPlayerFrame');
  if (ytLoadBtn && ytInput && ytFrame) {
    ytLoadBtn.onclick = () => {
      const id = ytInput.value.trim();
      if (!id) return;
      localStorage.setItem('sonic_music_yt_id', id);
      ytFrame.src = id.length > 20 || id.startsWith('PL') || id.startsWith('OL')
        ? `https://www.youtube.com/embed/videoseries?list=${id}&enablejsapi=1`
        : `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    };
  }

  // Pandora Deep-Link Fallbacks
  document.querySelectorAll('.station-link').forEach(link => {
    link.onclick = (e) => {
      const deepUri = link.getAttribute('href');
      const fallbackUrl = link.getAttribute('data-fallback');
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

// Ingest, store in IndexedDB, and set active playlist
async function ingestAudioFiles(rawFiles) {
  const audioFiles = rawFiles.filter(f => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name));
  if (audioFiles.length === 0) return;

  const countEl = document.getElementById('localQueueCount');
  if (countEl) countEl.innerText = `Saving ${audioFiles.length} tracks to offline vault...`;

  localPlaylist.forEach(t => URL.revokeObjectURL(t.url));

  const trackObjectsToStore = audioFiles.map(file => ({
    name: file.name.replace(/\.[^/.]+$/, ""),
    blob: file
  }));

  await saveTracksToIDB(trackObjectsToStore);

  localPlaylist = trackObjectsToStore.map(t => ({
    name: t.name,
    url: URL.createObjectURL(t.blob)
  }));

  currentTrackIndex = 0;
  if (countEl) countEl.innerText = `Queue: ${localPlaylist.length} tracks cached (Ready)`;
  loadTrack(currentTrackIndex, true);
}

// Restore playlist from IndexedDB on boot
async function restorePlaylistFromCache() {
  const cached = await loadTracksFromIDB();
  const countEl = document.getElementById('localQueueCount');
  const titleEl = document.getElementById('currentTrackTitle');

  if (cached && cached.length > 0) {
    localPlaylist = cached.map(c => ({
      name: c.name,
      url: URL.createObjectURL(c.blob)
    }));

    if (countEl) countEl.innerText = `Queue: ${localPlaylist.length} tracks cached (Ready)`;
    currentTrackIndex = 0;
    loadTrack(currentTrackIndex, false); // Cue track without autoplay
  } else {
    if (countEl) countEl.innerText = 'Queue: 0 tracks loaded';
    if (titleEl) titleEl.innerText = 'NO TRACK LOADED (Pick Folder/Files)';
  }
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
    timeEl.innerText = `${formatTime(localAudio.currentTime)} / ${formatTime(localAudio.duration)}`;
  }
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// MediaSession: Headphone and Lockscreen controls
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
