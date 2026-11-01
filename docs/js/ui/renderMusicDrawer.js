// -------------------------------------------------------------
// PERSISTENT COCKPIT DOCK & SLIDE-UP AUDIO DECK
// Modular Component: renderMusicDrawer.js
// -------------------------------------------------------------

let localPlaylist = [];
let currentTrackIndex = 0;
let localAudio = null;

export function initMusicDrawer() {
  const mount = document.getElementById('musicDrawerMount');
  if (!mount) return;

  if (!localAudio) {
    localAudio = new Audio();
    localAudio.addEventListener('ended', playNextTrack);
    localAudio.addEventListener('timeupdate', updateAudioProgress);
  }

  const savedYtId = localStorage.getItem('sonic_music_yt_id') || 'PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D';

  mount.innerHTML = `
    <!-- Slide-Up Drawer Tray (Sits above the fixed dock) -->
    <div id="musicSlideUpTray" class="music-slideup-tray" style="display: none;">
      <div class="music-tray-header">
        <span class="music-tray-title">AUDIO DECK // COCKPIT CONTROLS</span>
        <button id="musicCloseTrayBtn" class="music-tray-close" type="button">✕</button>
      </div>

      <!-- Tabs -->
      <div class="music-tabs">
        <button class="music-tab-btn active" data-source="local">LOCAL PLAYER</button>
        <button class="music-tab-btn" data-source="youtube">YOUTUBE MUSIC</button>
        <button class="music-tab-btn" data-source="pandora">PANDORA</button>
      </div>

      <!-- Tab 1: Local Player -->
      <div id="musicPaneLocal" class="music-pane active">
        <div class="local-player-box">
          <div id="currentTrackTitle" class="track-title-text">NO TRACK LOADED</div>
          <div class="track-progress-bar">
            <div id="trackProgressFill" class="track-progress-fill"></div>
          </div>
          <div class="transport-controls">
            <button id="prevTrackBtn" class="ctrl-btn" title="Previous">⏮</button>
            <button id="playPauseBtn" class="ctrl-btn play-btn" title="Play/Pause">▶</button>
            <button id="nextTrackBtn" class="ctrl-btn" title="Next">⏭</button>
            <label class="file-load-btn" title="Load Audio Files">
              📂 LOAD
              <input type="file" id="localAudioFileInput" multiple accept="audio/*" style="display: none;">
            </label>
          </div>
        </div>
      </div>

      <!-- Tab 2: YouTube Music -->
      <div id="musicPaneYoutube" class="music-pane" style="display: none;">
        <div class="yt-box">
          <div class="yt-input-row">
            <input type="text" id="ytPlaylistInput" class="yt-input" placeholder="Playlist or Video ID" value="${savedYtId}">
            <button id="ytLoadBtn" class="yt-btn">LOAD</button>
          </div>
          <div class="yt-embed-wrap">
            <iframe id="ytPlayerFrame" 
              src="https://www.youtube.com/embed/videoseries?list=${savedYtId}&enablejsapi=1" 
              allow="autoplay; encrypted-media" 
              allowfullscreen>
            </iframe>
          </div>
          <a href="https://music.youtube.com" target="_blank" rel="noopener" class="app-launch-link">
            🚀 LAUNCH YOUTUBE MUSIC APP
          </a>
        </div>
      </div>

      <!-- Tab 3: Pandora -->
      <div id="musicPanePandora" class="music-pane" style="display: none;">
        <div class="pandora-box">
          <div class="pandora-desc">Direct Launchpad for Workout Stations:</div>
          <div class="pandora-btn-grid">
            <a href="https://www.pandora.com" target="_blank" rel="noopener" class="pandora-btn">
              ⚡ WORKOUT RADIO
            </a>
            <a href="https://www.pandora.com/genre/hip-hop-workout" target="_blank" rel="noopener" class="pandora-btn">
              🔥 HIP-HOP WORKOUT
            </a>
            <a href="https://www.pandora.com/genre/electronic-workout" target="_blank" rel="noopener" class="pandora-btn">
              🌀 ELECTRONIC / DNB
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  attachMusicDrawerEvents();
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

  // Tab switching
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

  // Local File Loading
  const fileInput = document.getElementById('localAudioFileInput');
  if (fileInput) {
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      localPlaylist = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file)
      }));

      currentTrackIndex = 0;
      loadTrack(currentTrackIndex, true);
    };
  }

  // Local Transport
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.onclick = () => {
      if (!localAudio.src) return;
      if (localAudio.paused) {
        localAudio.play();
        playPauseBtn.innerText = '⏸';
      } else {
        localAudio.pause();
        playPauseBtn.innerText = '▶';
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
      ytFrame.src = id.length > 20 
        ? `https://www.youtube.com/embed/videoseries?list=${id}&enablejsapi=1`
        : `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    };
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

  const playPauseBtn = document.getElementById('playPauseBtn');
  if (autoPlay) {
    localAudio.play().then(() => {
      if (playPauseBtn) playPauseBtn.innerText = '⏸';
    }).catch(() => {});
  }
}

function playNextTrack() {
  if (localPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex + 1) % localPlaylist.length;
  loadTrack(currentTrackIndex, true);
}

function updateAudioProgress() {
  const fill = document.getElementById('trackProgressFill');
  if (fill && localAudio.duration) {
    const pct = (localAudio.currentTime / localAudio.duration) * 100;
    fill.style.width = `${pct}%`;
  }
}
