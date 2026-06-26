require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Log anonymous stat
async function logStat(status, errorMessage = null) {
  try {
    await supabase.from('playlist_stats').insert({ status, error_message: errorMessage });
  } catch (err) {
    console.error('Failed to log stat:', err.message);
  }
}

// Fetch album art from iTunes
async function fetchAlbumArt(song, artist) {
  try {
    const query = encodeURIComponent(`${song} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
    const data = await res.json();
    if (data.results?.length > 0) {
      return data.results[0].artworkUrl100?.replace('100x100', '300x300') || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Call Groq API
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
    if (retries > 0) return generatePlaylist(mood, retries - 1);
    throw new Error(errMsg);
  }

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    if (retries > 0) return generatePlaylist(mood, retries - 1);
    throw new Error('Invalid response from AI');
  }
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body manually for Vercel serverless
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  const { mood } = body || {};

  // Validate
  if (typeof mood !== 'string' || mood.trim().length === 0) {
    return res.status(400).json({ error: 'Please tell me how you\'re feeling' });
  }

  const sanitized = mood.trim().replace(/<[^>]*>/g, '');
  if (sanitized.length > 500) {
    return res.status(400).json({ error: 'Mood description too long (max 500 characters)' });
  }

  try {
    const parsed = await generatePlaylist(sanitized);

    if (!parsed.title || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) {
      throw new Error('Invalid playlist format');
    }

    const artPromises = parsed.tracks.map(t => fetchAlbumArt(t.song, t.artist));
    const artUrls = await Promise.all(artPromises);

    parsed.tracks = parsed.tracks.map((t, i) => ({
      ...t,
      albumArt: artUrls[i]
    }));

    logStat('success');
    res.json(parsed);
  } catch (err) {
    console.error('Generate error:', err.message);
    logStat('error', err.message);
    res.status(500).json({ error: 'Failed to generate playlist. Please try again.' });
  }
};
