# mood-playlist skill

Generate a playlist based on a user's mood description.

## When to use

When the user describes how they're feeling and wants music recommendations.

## Steps

1. Parse the user's mood description (e.g., "happy and energetic", "sad and rainy day")
2. Call the Groq API with the mood to generate 8-10 real song recommendations
3. Fetch album art from iTunes Search API for each track
4. Return a formatted playlist with title, cover art description, and tracks

## API Details

- **Groq API**: `https://api.groq.com/openai/v1/chat/completions`
  - Model: `llama-3.3-70b-versatile`
  - Requires `GROQ_API_KEY` in `.env`
- **iTunes Search API**: `https://itunes.apple.com/search`
  - Free, no key needed
  - Used for album artwork (300x300)

## Example

User: "I'm feeling nostalgic about summer"

Output:
```json
{
  "title": "Summer Memories",
  "coverArt": "A golden sunset over the ocean with footprints in the sand",
  "tracks": [
    { "song": "Summer of '69", "artist": "Bryan Adams", "albumArt": "https://..." },
    { "song": "Summertime Sadness", "artist": "Lana Del Rey", "albumArt": "https://..." }
  ]
}
```
