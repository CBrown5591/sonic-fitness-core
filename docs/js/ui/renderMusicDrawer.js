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
let isShuffle = false;
let repeatMode = 'all'; // 'off' | 'all' | 'one'
let playbackHistory = [];

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
            <button id="shuffleBtn" class="ctrl-btn mode-btn" type="button" title="Toggle Shuffle">🔀</button>
            <button id="prevTrackBtn" class="ctrl-btn" type="button" title="Previous Track">⏮</button>
            <button id="playPauseBtn" class="ctrl-btn play-btn" type="button" title="Play / Pause">▶</button>
            <button id="nextTrackBtn" class="ctrl-btn" type="button" title="Next Track">⏭</button>
            <button id="repeatBtn" class="ctrl-btn mode-btn" type="button" title="Toggle Repeat (Off / All / One)">🔁</button>
            
<!-- Inside .transport-controls in renderMusicDrawer.js -->
<button id="pickFolderBtn" class="ctrl-btn folder-btn" type="button" title="Select entire folder">
  📁 FOLDER
</button>

<label class="file-load-btn" title="Pick individual files">
  📂 FILES
  <input type="file" id="localAudioFileInput" multiple accept="audio/*" style="display: none;">
</label>

<!-- MUST omit accept="" and include webkitdirectory to enable Android "Use this folder" -->
<input type="file" id="localAudioFolderFallback" webkitdirectory directory mozdirectory style="display: none;">

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
          <!-- Preset Quick Mixes -->
          <div class="yt-presets-row">
            <button class="yt-preset-btn" data-yt-id="PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D" type="button">⚡ SONIC OST</button>
            <button class="yt-preset-btn" data-yt-id="RDCLAK5uy_kfd5lT4u6Vq3q6p5Fq_h8E1l2m3n4o5p" type="button">🔥 GYM HYPE</button>
            <button class="yt-preset-btn" data-yt-id="RDCLAK5uy_l0Yd8XgOqvz6XkZ5U8x2_G8o3P1q" type="button">🌀 SYNTHWAVE</button>
          </div>

          <!-- URL / ID Ingest Bar -->
          <div class="yt-input-row">
            <input type="text" id="ytPlaylistInput" class="yt-input" placeholder="Paste YouTube / YT Music URL or ID" value="${savedYtId}">
            <button id="ytLoadBtn" class="yt-btn" type="button">LOAD</button>
          </div>

          <!-- Responsive Embedded Deck -->
          <div class="yt-embed-wrap">
            <iframe id="ytPlayerFrame" 
              src="https://www.youtube.com/embed/videoseries?list=${savedYtId}&enablejsapi=1" 
              allow="autoplay; encrypted-media; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>

          <!-- Deep-Link Action Row -->
          <div class="yt-actions-row">
            <button id="ytOpenAppBtn" class="app-launch-link yt-link" type="button">
              🚀 OPEN IN YOUTUBE MUSIC APP
            </button>
          </div>
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

// -------------------------------------------------------------
// RECURSIVE SUBFOLDER SCANNER ENGINE
// -------------------------------------------------------------

// Method A: Recursive traversal using modern File System Access API
async function scanDirectoryRecursively(dirHandle, path = '') {
  let foundTracks = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|wma)$/i.test(file.name)) {
        foundTracks.push({
          name: (path ? `${path} / ` : '') + file.name.replace(/\.[^/.]+$/, ""),
          blob: file
        });
      }
    } else if (entry.kind === 'directory') {
      const subTracks = await scanDirectoryRecursively(entry, path ? `${path}/${entry.name}` : entry.name);
      foundTracks = foundTracks.concat(subTracks);
    }
  }

  return foundTracks;
}

// Method B: Parse nested subfolders from webkitRelativePath
function parseRelativeFileList(fileArray) {
  return fileArray
    .filter(f => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|wma)$/i.test(f.name))
    .map(file => {
      const displayPath = file.webkitRelativePath 
        ? file.webkitRelativePath.replace(/\.[^/.]+$/, '').replace(/\//g, ' / ')
        : file.name.replace(/\.[^/.]+$/, '');
      return {
        name: displayPath,
        blob: file
      };
    });
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

 const pickFolderBtn = document.getElementById('pickFolderBtn');
  const fallbackFolderInput = document.getElementById('localAudioFolderFallback');
  const fileInput = document.getElementById('localAudioFileInput');

  if (pickFolderBtn) {
    pickFolderBtn.onclick = async () => {
      const countEl = document.getElementById('localQueueCount');
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // On desktop Chromium, use showDirectoryPicker if available
      if (!isMobile && 'showDirectoryPicker' in window) {
        try {
          if (countEl) countEl.innerText = 'Scanning folder tree...';
          const dirHandle = await window.showDirectoryPicker();
          const tracks = await scanDirectoryRecursively(dirHandle);
          if (tracks.length > 0) {
            await commitTracksToPlaylist(tracks);
          } else {
            if (countEl) countEl.innerText = 'No audio tracks found.';
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            fallbackFolderInput?.click();
          }
        }
      } else {
        // Mobile (Android): Reset input value and trigger directory picker
        if (fallbackFolderInput) {
          fallbackFolderInput.value = ''; // Clear prior selection cache
          if (countEl) countEl.innerText = 'Open folder and tap "Use this folder"...';
          fallbackFolderInput.click();
        } else if (fileInput) {
          fileInput.click();
        }
      }
    };
  }
 if (fallbackFolderInput) {
    fallbackFolderInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files || files.length === 0) return;

      const countEl = document.getElementById('localQueueCount');
      if (countEl) countEl.innerText = `Ingesting ${files.length} items from folder...`;

      // Filter only audio formats from the directory payload
      const audioFiles = files.filter(f => 
        f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|wma)$/i.test(f.name)
      );

      if (audioFiles.length === 0) {
        if (countEl) countEl.innerText = 'No audio files found in selected folder.';
        return;
      }

      const tracks = parseRelativeFileList(audioFiles);
      await commitTracksToPlaylist(tracks);
    };
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

// Shuffle Mode Toggle
  const shuffleBtn = document.getElementById('shuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.onclick = () => {
      isShuffle = !isShuffle;
      shuffleBtn.classList.toggle('active-mode', isShuffle);
      shuffleBtn.style.color = isShuffle ? '#38bdf8' : '#94a3b8';
    };
  }

  // Repeat Mode Toggle (Cycle: ALL 🔁 -> ONE 🔂 -> OFF ➡️)
  const repeatBtn = document.getElementById('repeatBtn');
  if (repeatBtn) {
    repeatBtn.onclick = () => {
      if (repeatMode === 'all') {
        repeatMode = 'one';
        repeatBtn.innerText = '🔂';
        repeatBtn.style.color = '#38bdf8';
      } else if (repeatMode === 'one') {
        repeatMode = 'off';
        repeatBtn.innerText = '➡️';
        repeatBtn.style.color = '#64748b';
      } else {
        repeatMode = 'all';
        repeatBtn.innerText = '🔁';
        repeatBtn.style.color = '#38bdf8';
      }
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

      // If more than 3 seconds in, restart track
      if (localAudio.currentTime > 3) {
        localAudio.currentTime = 0;
        return;
      }

      // If we have history from shuffle, pop last played track
      if (playbackHistory.length > 0) {
        currentTrackIndex = playbackHistory.pop();
      } else {
        currentTrackIndex = (currentTrackIndex - 1 + localPlaylist.length) % localPlaylist.length;
      }
      loadTrack(currentTrackIndex, true);
    };
  }
  const nextBtn = document.getElementById('nextTrackBtn');
  if (nextBtn) {
    nextBtn.onclick = playNextTrack;
  }

  // -----------------------------------------------------------
  // YOUTUBE MUSIC ENGINE: URL PARSING & APP HANDOFF
  // -----------------------------------------------------------
  const ytLoadBtn = document.getElementById('ytLoadBtn');
  const ytInput = document.getElementById('ytPlaylistInput');
  const ytFrame = document.getElementById('ytPlayerFrame');
  const ytOpenAppBtn = document.getElementById('ytOpenAppBtn');

  // URL / ID Parser Helper
  function extractYouTubeTarget(inputStr) {
    if (!inputStr) return null;
    const trimmed = inputStr.trim();

    // 1. Direct Playlist ID
    if (/^[A-Za-z0-9_-]{18,}$/.test(trimmed) && (trimmed.startsWith('PL') || trimmed.startsWith('OL') || trimmed.startsWith('RD') || trimmed.startsWith('UU'))) {
      return { type: 'playlist', id: trimmed };
    }

    // 2. Direct Video ID (11 chars)
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
      return { type: 'video', id: trimmed };
    }

    // 3. Full URL matching (music.youtube.com, youtube.com, youtu.be)
    try {
      const url = new URL(trimmed);
      const listParam = url.searchParams.get('list');
      if (listParam) {
        return { type: 'playlist', id: listParam };
      }

      const vParam = url.searchParams.get('v');
      if (vParam) {
        return { type: 'video', id: vParam };
      }

      if (url.hostname === 'youtu.be') {
        const pathId = url.pathname.slice(1);
        if (pathId) return { type: 'video', id: pathId };
      }
    } catch (e) {
      // Not a valid URL, treat as raw ID fallback
    }

    return { type: 'playlist', id: trimmed };
  }

  function applyYouTubeTarget(target) {
    if (!target || !target.id) return;
    localStorage.setItem('sonic_music_yt_id', target.id);
    if (ytInput) ytInput.value = target.id;

    if (ytFrame) {
      if (target.type === 'video') {
        ytFrame.src = `https://www.youtube.com/embed/${target.id}?autoplay=1&enablejsapi=1`;
      } else {
        ytFrame.src = `https://www.youtube.com/embed/videoseries?list=${target.id}&autoplay=1&enablejsapi=1`;
      }
    }
  }

  // Load button action
  if (ytLoadBtn && ytInput) {
    ytLoadBtn.onclick = () => {
      const target = extractYouTubeTarget(ytInput.value);
      if (target) applyYouTubeTarget(target);
    };
  }

  // Preset button actions
  const presetBtns = document.querySelectorAll('.yt-preset-btn');
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      const pid = btn.getAttribute('data-yt-id');
      if (pid) applyYouTubeTarget({ type: 'playlist', id: pid });
    };
  });

  // Deep-link to YouTube Music native app with browser fallback
  if (ytOpenAppBtn) {
    ytOpenAppBtn.onclick = () => {
      const currentVal = ytInput ? ytInput.value.trim() : '';
      const target = extractYouTubeTarget(currentVal) || { id: '' };

      const isPlaylist = target.type === 'playlist';
      const webUrl = isPlaylist 
        ? `https://music.youtube.com/playlist?list=${target.id}` 
        : `https://music.youtube.com/watch?v=${target.id}`;

      // Native URI schemes for YouTube Music
      const appUri = isPlaylist
        ? `youtubemusic://playlist?list=${target.id}`
        : `youtubemusic://watch?v=${target.id}`;

      const start = Date.now();
      window.location.href = appUri;

      setTimeout(() => {
        // Fall back to web client if native intent doesn't resolve within 1.2s
        if (Date.now() - start < 1500) {
          window.open(webUrl, '_blank', 'noopener');
        }
      }, 800);
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

async function handleIncomingFiles(rawFiles) {
  const countEl = document.getElementById('localQueueCount');
  
  if (!rawFiles || rawFiles.length === 0) {
    if (countEl) countEl.innerText = 'No files selected.';
    return;
  }

  if (countEl) countEl.innerText = `Processing ${rawFiles.length} files...`;

  const tracks = parseRelativeFileList(rawFiles);

  if (tracks.length === 0) {
    if (countEl) countEl.innerText = 'No supported audio files (.mp3, .m4a, .flac) found in selection.';
    return;
  }

  try {
    await commitTracksToPlaylist(tracks);
  } catch (err) {
    if (countEl) countEl.innerText = `Save error: ${err.message || 'Storage full'}`;
  }
}

// Ingest, store in IndexedDB, and set active playlist
async function commitTracksToPlaylist(trackObjects) {
  const countEl = document.getElementById('localQueueCount');
  if (countEl) countEl.innerText = `Saving ${trackObjects.length} tracks (with subfolders) to offline vault...`;

  // Free previous object URLs
  localPlaylist.forEach(t => URL.revokeObjectURL(t.url));

  // Store raw blobs into IndexedDB
  await saveTracksToIDB(trackObjects);

  // Hydrate playable playlist
  localPlaylist = trackObjects.map(t => ({
    name: t.name,
    url: URL.createObjectURL(t.blob)
  }));

  currentTrackIndex = 0;
  if (countEl) countEl.innerText = `Queue: ${localPlaylist.length} tracks cached (All subfolders included)`;
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
    loadTrack(currentTrackIndex, false);
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

  // Repeat One: replay the same track from start
  if (repeatMode === 'one') {
    localAudio.currentTime = 0;
    localAudio.play().catch(() => {});
    return;
  }

  // Push current index to history for reliable back-skipping
  playbackHistory.push(currentTrackIndex);
  if (playbackHistory.length > 50) playbackHistory.shift();

  if (isShuffle && localPlaylist.length > 1) {
    // Pick random index different from current
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * localPlaylist.length);
    } while (nextIndex === currentTrackIndex);
    currentTrackIndex = nextIndex;
  } else {
    // Sequential
    if (currentTrackIndex + 1 >= localPlaylist.length && repeatMode === 'off') {
      updatePlayPauseState(false);
      return;
    }
    currentTrackIndex = (currentTrackIndex + 1) % localPlaylist.length;
  }

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
