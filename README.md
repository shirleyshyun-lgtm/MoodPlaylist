# MoodPlaylist

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![Groq API](https://img.shields.io/badge/Groq_API-Llama_3.3-FF6B6B?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-1DB954?style=flat-square)

**Describe your mood. Get a real playlist.**

MoodPlaylist is a web app that transforms your feelings into curated playlists. Type how you're feeling -- whether it's "post-breakup melancholy," "Sunday morning coffee vibes," or "need energy for a workout" -- and get a playlist of 8-10 real, well-known songs that match your mood.

Powered by the Groq API (Llama 3.3 70B), it generates thoughtful playlists with creative titles and even links each track to YouTube so you can start listening immediately.

---

## Features

- **Mood-to-Playlist AI** -- Describe any feeling, emotion, or scenario and get a tailored playlist
- **Real Songs Only** -- No generic recommendations; actual tracks by real artists
- **YouTube Integration** -- Each track includes a direct link to search YouTube for instant playback
- **Creative Playlist Titles** -- AI generates catchy, thematic names for every playlist
- **Cover Art Descriptions** -- Vivid descriptions of what the album artwork would look like
- **Dark OLED Design** -- Spotify-inspired dark theme optimized for OLED screens
- **Fully Responsive** -- Works seamlessly on desktop and mobile
- **Accessible** -- ARIA live regions, reduced motion support, semantic HTML

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 18+ |
| **Server** | Express 4.x |
| **AI/LLM** | Groq API (Llama 3.3 70B Versatile) |
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Fonts** | Google Fonts (Poppins, Righteous) |
| **Design** | Custom CSS design tokens (dark OLED theme) |

---

## Screenshots

> Add screenshots of the following states:

1. **Home Screen** -- The empty form with the mood input textarea and "Generate Playlist" button
2. **Loading State** -- The spinner animation while the AI generates the playlist
3. **Generated Playlist** -- A full playlist card showing the title, cover art description, and numbered track list with YouTube links
4. **Mobile View** -- The responsive layout on a narrow screen
5. **Error State** -- The error toast when the API call fails

---

## Getting Started

### Prerequisites

- **Node.js 18+** -- [Download here](https://nodejs.org/)
- **Groq API Key** -- Get a free key at [console.groq.com](https://console.groq.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/MoodPlaylist.git
cd MoodPlaylist

# Install dependencies
npm install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Groq API key
GROQ_API_KEY=gsk_your_actual_key_here
```

### Running the App

```bash
# Start the server
npm start
```

The app will be available at **http://localhost:3000**.

---

## How It Works

```
User enters mood
       |
       v
Frontend (app.js) sends POST /api/generate
       |
       v
Express server (server.js) forwards to Groq API
       |
       v
Llama 3.3 70B generates playlist JSON
       |
       v
Server parses response, returns structured data
       |
       v
Frontend renders playlist card with tracks + YouTube links
```

1. **Input** -- The user types a natural-language description of their mood, feeling, or situation into the textarea (max 500 characters)
2. **Generation** -- The server sends the mood to Groq's Llama 3.3 70B model with a carefully crafted prompt requesting 8-10 real songs
3. **Response** -- The AI returns a JSON object containing a playlist title, cover art description, and an array of tracks (song + artist)
4. **Display** -- The frontend renders the playlist as a styled card with numbered tracks, each linked to a YouTube search for instant playback

---

## API Reference

### Generate Playlist

```
POST /api/generate
```

**Request Body:**

```json
{
  "mood": "feeling nostalgic about summer road trips"
}
```

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| `mood` | string | Yes      | Natural-language description of the user's mood or feeling (max 500 chars) |

**Response (200):**

```json
{
  "title": "Windows Down, Stars Out",
  "coverArt": "A warm sunset highway stretching into the horizon, dashboard lit in amber, a mixtape half-visible in the cupholder",
  "tracks": [
    { "song": "Fast Car", "artist": "Tracy Chapman" },
    { "song": "On The Road Again", "artist": "Willie Nelson" },
    { "song": "Take It Easy", "artist": "Eagles" },
    { "song": "Born to Run", "artist": "Bruce Springsteen" },
    { "song": "Radar Love", "artist": "Golden Earring" },
    { "song": "Life is a Highway", "artist": "Tom Cochrane" },
    { "song": "Shut Up and Drive", "artist": "Rihanna" },
    { "song": "Drive", "artist": "Incubus" }
  ]
}
```

**Error Response (400/500):**

```json
{
  "error": "mood is required"
}
```

---

## Project Structure

```
MoodPlaylist/
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore rules (node_modules, .env)
├── .mcp.json             # MCP server configuration (fetch, git)
├── package.json          # Dependencies and scripts
├── server.js             # Express server + Groq API integration
└── public/
    ├── index.html        # Single-page HTML structure
    ├── style.css         # Design system and styles
    └── app.js            # Frontend logic and DOM manipulation
```

---

## Design System

The UI uses a custom dark-mode design system with Spotify-inspired aesthetics.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1DB954` | Buttons, accents, active states |
| `--color-primary-hover` | `#1ed760` | Button hover state |
| `--color-background` | `#000000` | Page background (OLED black) |
| `--color-surface` | `#121212` | Card backgrounds |
| `--color-surface-elevated` | `#1a1a1a` | Elevated elements |
| `--color-foreground` | `#ffffff` | Primary text |
| `--color-foreground-muted` | `#a0a0a0` | Secondary text |
| `--color-error` | `#e74c3c` | Error states |

### Typography

| Token | Font | Usage |
|-------|------|-------|
| `--font-display` | Righteous | Headings, playlist titles |
| `--font-body` | Poppins | Body text, UI elements |

### Spacing

4px base grid: `--space-1` (4px) through `--space-16` (64px)

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 10px | Inputs, cards |
| `--radius-lg` | 16px | Large cards |
| `--radius-full` | 9999px | Pills, circles |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- Add Spotify/Apple Music links alongside YouTube
- Implement playlist history (localStorage)
- Add genre or decade filters
- Create a "share playlist" feature
- Add loading skeleton animations
- Implement rate limiting on the API
- Add unit tests

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 MoodPlaylist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Built with AI and good taste in music.
