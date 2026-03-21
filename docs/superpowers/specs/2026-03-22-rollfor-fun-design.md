# rollfor.fun — Design Spec

## Overview

A board game matchmaker web app. Users answer quick questions about their scenario, mood, and preferences, then get AI-powered recommendations from BoardGameGeek data. Results are shareable as visual match cards and a "game shelf" image designed for viral sharing.

**Working title**: rollfor.fun
**Tagline**: "Roll for your next obsession"

## User Flow

1. **Landing** — Hero with tagline and single CTA ("ROLL →"). No sign-up, no friction.
2. **Scenario Select** — "Who's at the table?" — 6 tiles: Family Night, Date Night, Friends & Chaos, Hardcore Crew, Solo Quest, Kids in the Mix. Single select, auto-advances.
3. **Mood Select** — "What energy?" — 4-6 tiles: Competitive, Cozy, Chaotic, Brainy, Social, Chill. Single select, auto-advances.
4. **Quick Quiz** — 3-5 snappy multiple choice questions, one at a time:
   - Player count: 2 / 3-4 / 5+ / don't care
   - Game length: under 30min / 30-60min / 60-120min / marathon
   - Complexity: easy to learn / some strategy / brain burner
   - Optional free text: "Any games you already love?"
5. **AI Matching + Swipe** — Loading state ("Rolling the dice...") while AI works. Then ~10 game cards presented one at a time as a card stack. Each card shows the game name, stats, and AI pitch. Two buttons: "Add to Shelf" (like) and "Skip" (next). Liked games build the shelf (up to 5). Progress bar shows how many cards remain.
6. **Results** — Two shareable outputs:
   - **Match Card**: Top pick with name, BGG rating, player count, playtime, complexity, AI-written pitch line, and mechanic/theme tags
   - **Your Shelf**: Top 5 displayed as colored game box spines in a shelf visual
   - Share buttons (download image, copy link), "Roll Again" to restart

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS, dark-mode-first
- **Typography**: Space Mono (headings/monospace), Inter (body)
- **AI**: Claude API via Next.js API route (`/api/recommend`)
- **BGG Data**: Server-side fetch to BGG XML API v2, parsed and cached
- **Image Generation**: Vercel `satori` for OG images and shareable cards
- **Hosting**: Vercel (free tier)
- **State Management**: React state + URL params (linear flow, no complex state needed)

## Architecture

### Pages & Routes

- `/` — Single-page app with step transitions (no page reloads)
- `/api/recommend` — POST endpoint: receives user inputs, queries BGG, calls Claude, returns ranked games as JSON
- `/api/og/[id]` — GET endpoint: generates OG image for a shared shelf/card
- `/shelf/[id]` — Shareable result page: displays a saved shelf with "Roll your own" CTA

### API Route: `/api/recommend`

**Input:**
```json
{
  "scenario": "friends-chaos",
  "mood": "chaotic",
  "playerCount": "3-4",
  "gameLength": "30-60",
  "complexity": "some-strategy",
  "favorites": "Catan, Ticket to Ride"
}
```

**Process:**
1. Build BGG search query from hard filters (player count, playtime, complexity weight)
2. Fetch top ~50 matching games from BGG XML API v2 (`/xmlapi2/search` + `/xmlapi2/thing?id=...&stats=1`)
3. Send game metadata + user preferences to Claude with system prompt
4. Parse Claude's JSON response (top 10 ranked games with pitch lines)
5. Return results

**Output:**
```json
{
  "games": [
    {
      "rank": 1,
      "name": "Cosmic Encounter",
      "bggId": 39463,
      "rating": 7.6,
      "playerCount": "3-5",
      "playtime": "60-120min",
      "weight": 2.5,
      "pitch": "The game where your best friend becomes your worst enemy.",
      "matchReason": "Perfect for chaotic friend groups who love negotiation",
      "mechanics": ["Negotiation", "Bluffing"],
      "categories": ["Sci-Fi"],
      "thumbnail": "https://..."
    }
  ]
}
```

**Claude prompt strategy:**
- System: "You are a board game sommelier. Return strict JSON only."
- Context: user preferences + ~50 candidate games with full BGG metadata
- Output: top 10 ranked, each with pitch line and match reason
- ~3-5k input tokens (50 games × ~60 tokens each + prompt), ~500 output tokens per call

### BGG API Integration

**Candidate sourcing strategy:** BGG's XML API does not support filtering by player count, playtime, or complexity directly. Instead:

1. **Seed list**: Maintain a local JSON file of ~500 curated BGG game IDs spanning diverse categories, player counts, and complexity levels. This is the candidate pool.
2. **Pre-filter locally**: Filter the seed list by the user's hard constraints (player count, playtime, complexity range) to narrow to ~50-100 candidates.
3. **Fetch details on demand**: Call BGG `/xmlapi2/thing?id=1,2,3,...&stats=1` (batched, up to 20 IDs per request) to get fresh ratings, descriptions, and metadata for the filtered candidates.
4. **Feed to Claude**: Send the enriched game data + user preferences to Claude for ranking.

The seed list is a static JSON file checked into the repo, periodically updated. This avoids reliance on BGG's search endpoint and gives us full control over the candidate pool quality.

- Details endpoint: `https://boardgamegeek.com/xmlapi2/thing?id=1,2,3&stats=1`
- Parse XML server-side (use `fast-xml-parser`)
- Cache BGG responses for 24 hours (in-memory or Vercel KV)
- Rate limit: respect BGG's limits, batch ID requests (max 20 per call)

### Shareable Results

- **Image generation**: `satori` (Vercel's OG image library) renders JSX → SVG → PNG
- **Match card**: dark card with game name, stats, pitch line, `rollfor.fun` branding
- **Shelf image**: colored box spines in a row, varying heights, shelf line underneath
- **Share URL**: `/shelf/[encoded]` where `encoded` is a base64url-encoded JSON string containing the game IDs and pitch lines. No database needed — all data lives in the URL. URLs will be ~200-400 chars, well within platform limits.
- **OG tags**: dynamic `og:image` via `/api/og/[encoded]` on share URLs so previews show the shelf in Twitter/Discord/iMessage
- **Storage**: none — results are fully encoded in the URL. No KV store or database required.

## Visual Design

### Color Palette
- **Background**: near-black (#0a0a0a or gray-950)
- **Text**: white/gray hierarchy (white headings, gray-400 body, gray-600 subtle)
- **Accent**: emerald green (#10b981) — CTAs, selected states, highlights
- **Shelf colors**: vibrant set for game spines (emerald, indigo, amber, red, violet)

### Typography
- **Headings**: Space Mono, bold, monospace
- **Body**: Inter, regular weight
- **Labels/meta**: Space Mono, small, uppercase, tracked-out, low opacity

### Design Patterns
- Dark-mode only (no light mode toggle needed)
- Terminal/code aesthetic: trailing underscore in headings, monospace labels
- Minimal chrome: no persistent navbar, step indicator only during flow
- Generous whitespace, centered single-column layout
- Subtle borders (rgba white at 0.1-0.15), no shadows
- Green accent for interactive elements (buttons, selected tiles)
- Emoji icons on scenario/mood tiles for quick scanning

## Viral Mechanics

- **No sign-up gate**: straight to the quiz, zero friction
- **Two shareable artifacts**: match card (single game) + shelf (top 5)
- **Share URL with preview**: OG image renders in social feeds, drawing clicks
- **Viral loop**: share → friend clicks → sees shelf + "Roll your own" CTA → rolls → shares
- **Conversation starter**: shelf designed to provoke "you haven't played THAT?" reactions
- **Fast experience**: under 60 seconds from landing to shareable result

## Cost & Rate Limiting

- **Claude API**: ~$0.01-0.02 per recommendation call
- **BGG API**: free, cached 24h
- **Rate limiting**: 10 requests/minute per IP on `/api/recommend`
- **Vercel**: free tier covers initial traffic; upgrade if viral

## Out of Scope (v1)

- User accounts / saved history
- Database (all state is ephemeral or URL-encoded)
- Light mode
- Mobile app
- Social features (comments, reactions)
- Game purchase links / affiliate revenue
