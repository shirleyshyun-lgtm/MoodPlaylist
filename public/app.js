const form = document.getElementById('moodForm');
const input = document.getElementById('moodInput');
const btn = document.getElementById('generateBtn');
const charCount = document.getElementById('charCount');
const playlist = document.getElementById('playlist');
const title = document.getElementById('playlistTitle');
const coverArt = document.getElementById('coverArt');
const trackList = document.getElementById('trackList');
const error = document.getElementById('error');

// Settings menu toggle
const settingsBtn = document.getElementById('settingsBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('hidden');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
    dropdownMenu.classList.add('hidden');
  }
});

// Character count
input.addEventListener('input', () => {
  charCount.textContent = input.value.length;
});

// Check if viewing a playlist from history
const viewPlaylistData = sessionStorage.getItem('viewPlaylist');
if (viewPlaylistData) {
  sessionStorage.removeItem('viewPlaylist');
  const data = JSON.parse(viewPlaylistData);
  renderPlaylist(data);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mood = input.value.trim();
  if (!mood) {
    showError('Please tell me how you\'re feeling');
    input.focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="btn-icon spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
    Generating...
  `;
  playlist.classList.add('hidden');
  error.classList.add('hidden');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Something went wrong');

    renderPlaylist(data, mood);

    // Save to history
    saveToHistory({
      title: data.title,
      coverArt: data.coverArt,
      mood: mood,
      tracks: data.tracks,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Generate Playlist
    `;
  }
});

function renderPlaylist(data, mood) {
  title.textContent = data.title;
  coverArt.textContent = data.coverArt;
  trackList.innerHTML = data.tracks.map(t => {
    const query = encodeURIComponent(`${t.song} ${t.artist}`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;
    const albumArtHtml = t.albumArt
      ? `<img class="track-art" src="${t.albumArt}" alt="${escapeHtml(t.song)} album art" loading="lazy" />`
      : `<div class="track-art-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>`;
    return `
      <li>
        ${albumArtHtml}
        <div class="track-info">
          <div class="track-song">${escapeHtml(t.song)}</div>
          <div class="track-artist">${escapeHtml(t.artist)}</div>
        </div>
        <a class="youtube-link" href="${youtubeUrl}" target="_blank" rel="noopener noreferrer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Play
        </a>
      </li>`;
  }).join('');
  playlist.classList.remove('hidden');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- History Management ----
const HISTORY_KEY = 'moodplaylist_history';
const MAX_HISTORY = 50;

function saveToHistory(playlist) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift(playlist); // Add to beginning (newest first)
    // Keep only last MAX_HISTORY
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

let errorTimeout;

function showError(message) {
  // Clear any existing timeout
  clearTimeout(errorTimeout);

  error.innerHTML = `
    <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span class="error-text">${escapeHtml(message)}</span>
  `;
  error.classList.remove('hidden');

  // Auto-dismiss after 5 seconds
  errorTimeout = setTimeout(() => {
    error.classList.add('hidden');
  }, 5000);
}
