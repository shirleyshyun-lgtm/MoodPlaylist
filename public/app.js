const form = document.getElementById('moodForm');
const input = document.getElementById('moodInput');
const btn = document.getElementById('generateBtn');
const charCount = document.getElementById('charCount');
const playlist = document.getElementById('playlist');
const title = document.getElementById('playlistTitle');
const coverArt = document.getElementById('coverArt');
const trackList = document.getElementById('trackList');
const error = document.getElementById('error');

// Character count
input.addEventListener('input', () => {
  charCount.textContent = input.value.length;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mood = input.value.trim();
  if (!mood) return;

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

    title.textContent = data.title;
    coverArt.textContent = data.coverArt;
    trackList.innerHTML = data.tracks.map(t => {
      const query = encodeURIComponent(`${t.song} ${t.artist}`);
      const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;
      return `
        <li>
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
  } catch (err) {
    error.textContent = err.message;
    error.classList.remove('hidden');
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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
