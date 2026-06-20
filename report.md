<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
<!-- Before you pass: your project repo needs at least 3 GitHub stars (ask teammates
     to open your repo and click ⭐). This proves it is a real, shared project. -->
# ch-3 Personal Project — Report

github_username: shirleyshyun-lgtm
personal_repo_url: https://github.com/shirleyshyun-lgtm/MoodPlaylist
project_summary: Describe your mood and get a real playlist with AI-generated song recommendations and album art
slides_url: slides/pitch.md

## Methodology

I used a project-based approach, building MoodPlaylist incrementally from a simple Express server to a full AI-powered playlist generator. I started by setting up the backend with Groq API integration for mood-based song recommendations, then added the frontend UI, and finally integrated the iTunes API for album artwork. Throughout development, I committed each feature as I built it, keeping a clean git history that shows the progression from MVP to polished product.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: Context7 MCP server for fetching up-to-date library documentation (Express, Node.js, etc.) and Claude Memory plugin for persistent context across sessions

### Skill
- path: .claude/skills/mood-playlist/SKILL.md
- what: Defines the mood-to-playlist generation workflow — how to parse mood descriptions, call the Groq API, fetch album art from iTunes, and return formatted playlists

### Agent
- path: .claude/agents/playlist-curator.md
- what: A music curator agent that helps users discover songs matching their mood, suggests playlist themes, and explains why certain songs fit emotional states
