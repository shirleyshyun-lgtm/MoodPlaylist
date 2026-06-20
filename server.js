require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/api/generate', async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ error: 'mood is required' });

  try {
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
      console.error('Groq error:', data);
      return res.status(500).json({ error: data.error?.message || 'Groq API error' });
    }

    const text = data.choices[0].message.content;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
