require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' })); // Limit request body size

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ---- Rate Limiting: 10 requests per minute per IP ----
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/generate', limiter);

// ---- Input Validation ----
function validateMood(mood) {
  if (typeof mood !== 'string') return { valid: false, error: 'Mood must be a string' };
  const trimmed = mood.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Please tell me how you\'re feeling' };
  if (trimmed.length > 500) return { valid: false, error: 'Mood description too long (max 500 characters)' };
  // Strip HTML tags but keep emojis and special chars
  const sanitized = trimmed.replace(/<[^>]*>/g, '');
  return { valid: true, sanitized };
}

// ---- Fetch album art from iTunes Search API ----
async function fetchAlbumArt(song, artist) {
  try {
    const query = encodeURIComponent(`${song} ${artist}`);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100?.replace('100x100', '300x300') || null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Call Groq API with retry ----
async function generatePlaylist(mood, retries = 1) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `The user is feeling: "${mood}"

Generate a playlist of 8-10 REAL, well-known songs that match this mood. Return ONLY valid JSON in this exact format, no markdown, no explanation:

{
  "title": "A creative, catchy playlist title",
  "coverArt": "A vivid description of what the playlist cover art would look like",
  "tracks": [
    { "song": "Song Name", "artist": "Artist Name" }
  ]
}

Pick real songs by real artists that genuinely match the mood described.`
      }],
      temperature: 0.8
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.error?.message || 'Groq API error';
    if (retries > 0) {
      console.log('Retrying after error:', errMsg);
      return generatePlaylist(mood, retries - 1);
    }
    throw new Error(errMsg);
  }

  // Parse JSON with error handling
  const text = data.choices[0].message.content;
  try {
    return JSON.parse(text);
  } catch (parseErr) {
    console.error('JSON parse failed:', text);
    if (retries > 0) {
      console.log('Retrying after JSON parse error');
      return generatePlaylist(mood, retries - 1);
    }
    throw new Error('Received invalid response from AI. Please try again.');
  }
}

// ---- API Route ----
app.post('/api/generate', async (req, res) => {
  const { mood } = req.body;

  // Validate input
  const validation = validateMood(mood);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const parsed = await generatePlaylist(validation.sanitized);

    // Validate response structure
    if (!parsed.title || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) {
      throw new Error('Invalid playlist format received');
    }

    // Fetch album art for all tracks in parallel
    const artPromises = parsed.tracks.map(t => fetchAlbumArt(t.song, t.artist));
    const artUrls = await Promise.all(artPromises);

    // Add albumArt URL to each track
    parsed.tracks = parsed.tracks.map((t, i) => ({
      ...t,
      albumArt: artUrls[i]
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({
      error: 'Failed to generate playlist. Please try again.'
    });
  }
});

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
