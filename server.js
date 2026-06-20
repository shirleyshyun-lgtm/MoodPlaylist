require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;

const app = express();
const client = new Anthropic();

app.use(express.static('public'));
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { mood } = req.body;
  if (!mood) return res.status(400).json({ error: 'mood is required' });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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
      }]
    });

    const text = message.content[0].text;
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
