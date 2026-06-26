<!-- ch-3 personal-project report -->
# ch-3 Personal Project — Report

github_username: shirleyshyun-lgtm
personal_repo_url: https://github.com/shirleyshyun-lgtm/MoodPlaylist
project_summary: AI-powered mood-to-playlist generator with real songs, album art, playlist history, and admin dashboard
slides_url: slides/pitch.md

## Methodology

I used a project-based approach, building MoodPlaylist incrementally from a simple Express server to a full AI-powered playlist generator. I started by setting up the backend with Groq API integration for mood-based song recommendations, then added the frontend UI, and finally integrated the iTunes API for album artwork. Throughout development, I used Claude Code with skills, agents, and MCP to accelerate development and maintain code quality.

## Evidence — Claude Code usage

### Skills Used

**ui-ux-pro-max (Plugin)**
- Path: `.claude/plugins/cache/ui-ux-pro-max-skill/`
- What: Generated a complete design system for the dark OLED theme, recommended color palettes, typography (Righteous + Poppins), and spacing tokens. Applied 50+ UX guidelines for accessibility, touch targets, and animation timing.

### Agents Used

**Documentation Agent**
- What: Spawned a sub-agent to analyze the entire codebase and generate a comprehensive README.md with 11 sections including API docs, project structure, design system documentation, and contributing guide.

**UI/UX Review Agent**
- What: Used the ui-ux-pro-max skill to review UI code for accessibility issues, contrast ratios, and interaction patterns. Applied fixes for error handling UI, auto-dismiss toasts, and ARIA labels.

### MCP Used

**Supabase MCP** (configured in `.mcp.json`)
- Path: `.mcp.json`
- What: Configured for direct database management of anonymous usage stats. Used for creating tables, managing RLS policies, and querying analytics data.

### Key Development Moments

1. **API Migration**: Switched from Anthropic Claude API to Groq API (free tier) when the original API key was blocked. Required refactoring the server to use OpenAI-compatible API format.

2. **Security Hardening**: Added rate limiting (10 req/min), input validation (500 char limit), HTML tag stripping, and JSON parse error handling with auto-retry.

3. **Vercel Deployment**: Converted Express routes to individual serverless functions (`api/generate.js`, `api/admin-stats.js`) for Vercel compatibility. Added manual body parsing for serverless environment.

4. **Privacy-First Admin**: Designed admin dashboard to only collect anonymous aggregate stats (total count, peak hours, error logs) — no mood text, no IP addresses, no user identity stored.

5. **Playlist History**: Implemented localStorage-based history (last 50 playlists) with settings menu, view/delete functionality, and no login requirement.

## Features Built

| Feature | Description |
|---------|-------------|
| AI Playlist Generation | Groq API (Llama 3.3 70B) generates 8-10 real songs matching user's mood |
| Album Art | Fetches real artwork from iTunes Search API |
| YouTube Links | Direct search links for each track |
| Dark OLED UI | Spotify-inspired theme with CSS design tokens |
| Responsive Design | Works on mobile (375px) to desktop (1440px) |
| Rate Limiting | 10 requests per minute per IP via express-rate-limit |
| Input Validation | Server-side 500 char limit, HTML tag stripping |
| Playlist History | localStorage saves last 50 playlists, no login needed |
| Admin Dashboard | Anonymous usage stats with 7D/2W/1M charts |
| Vercel Deployment | Serverless functions with environment variables |
| Settings Menu | Hamburger menu (☰) for quick access to history |
| Error Handling | Auto-retry on API errors, friendly error messages |

## Technical Decisions

- **Groq over Anthropic**: Free tier, fast inference, OpenAI-compatible API
- **localStorage over database for history**: No login required, device-local, privacy-friendly
- **Supabase for admin stats**: Free tier, easy setup, Row Level Security for anonymous access
- **Serverless over Express on Vercel**: Better scaling, no server management, automatic deployments
- **No emojis as icons**: SVG icons for consistency across platforms
