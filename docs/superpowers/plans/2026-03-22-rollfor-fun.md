# rollfor.fun Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a board game matchmaker web app where users answer quick questions and get AI-powered recommendations from BGG data, with shareable match cards and game shelf visuals.

**Architecture:** Next.js 15 App Router SPA with a single page flow (landing → scenario → mood → quiz → swipe → results). Server-side API route calls Claude with pre-filtered BGG game data. Shareable results encoded in URLs with OG images via satori.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Claude API (`@anthropic-ai/sdk`), `fast-xml-parser`, `satori`, Vercel hosting

**Spec:** `docs/superpowers/specs/2026-03-22-rollfor-fun-design.md`

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, global styles
│   ├── page.tsx                # Main SPA: orchestrates step flow
│   ├── globals.css             # Tailwind + custom styles
│   ├── shelf/
│   │   └── [encoded]/
│   │       └── page.tsx        # Shareable shelf view page
│   ├── api/
│   │   ├── recommend/
│   │   │   └── route.ts        # POST: user inputs → BGG filter → Claude → ranked games
│   │   └── og/
│   │       └── [encoded]/
│   │           └── route.tsx   # GET: generates OG shelf image via satori
├── components/
│   ├── Landing.tsx             # Hero section with CTA
│   ├── ScenarioSelect.tsx      # "Who's at the table?" tile grid
│   ├── MoodSelect.tsx          # "What energy?" tile grid
│   ├── QuizStep.tsx            # One-at-a-time multiple choice questions
│   ├── SwipeCards.tsx          # Card stack with like/skip buttons
│   ├── GameCard.tsx            # Single game card (used in swipe + results)
│   ├── Results.tsx             # Match card + shelf + share buttons
│   ├── MatchCard.tsx           # Top pick display card
│   ├── ShelfVisual.tsx         # Top 5 colored box spines
│   ├── ShareButtons.tsx        # Download image + copy link
│   └── LoadingState.tsx        # "Rolling the dice..." animation
├── lib/
│   ├── bgg.ts                  # BGG API fetching + XML parsing
│   ├── claude.ts               # Claude API call: build prompt, parse response
│   ├── seed-games.ts           # Filter logic for the seed list
│   ├── share.ts                # Encode/decode shelf data for URLs
│   └── types.ts                # Shared TypeScript types
├── data/
│   └── seed-games.json         # ~500 curated BGG game IDs with basic metadata
public/
├── fonts/
│   ├── SpaceMono-Regular.ttf   # For satori OG image rendering
│   └── SpaceMono-Bold.ttf
tailwind.config.ts
next.config.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This scaffolds the project with App Router, TypeScript, and Tailwind.

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk fast-xml-parser satori @resvg/resvg-js
```

- [ ] **Step 3: Add fonts**

Download Space Mono Regular and Bold `.ttf` files to `public/fonts/`. These are needed for satori OG image rendering.

```bash
mkdir -p public/fonts
curl -o public/fonts/SpaceMono-Regular.ttf "https://raw.githubusercontent.com/googlefonts/spacemono/main/fonts/SpaceMono-Regular.ttf"
curl -o public/fonts/SpaceMono-Bold.ttf "https://raw.githubusercontent.com/googlefonts/spacemono/main/fonts/SpaceMono-Bold.ttf"
```

- [ ] **Step 4: Configure Tailwind with custom theme**

Update `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        accent: "#10b981",
        bg: "#0a0a0a",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Set up root layout with fonts and metadata**

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "rollfor.fun — Board Game Matchmaker",
  description: "Roll for your next obsession. Answer a few questions, get matched with board games you'll actually want to play.",
  openGraph: {
    title: "rollfor.fun",
    description: "Roll for your next obsession.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable}`}>
      <body className="bg-bg text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Set up globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0a0a;
}
```

- [ ] **Step 7: Create placeholder page and verify dev server**

Update `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="font-mono text-4xl font-bold">rollfor.fun_</h1>
    </main>
  );
}
```

Run: `npm run dev`
Expected: App renders at localhost:3000 with "rollfor.fun_" in Space Mono on dark background.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, fonts, and base config"
```

---

## Task 2: Types and Seed Data

**Files:**
- Create: `src/lib/types.ts`, `src/data/seed-games.json`, `src/lib/seed-games.ts`
- Test: `src/lib/__tests__/seed-games.test.ts`

- [ ] **Step 1: Define shared types**

Create `src/lib/types.ts`:

```ts
export type Scenario =
  | "family-night"
  | "date-night"
  | "friends-chaos"
  | "hardcore-crew"
  | "solo-quest"
  | "kids-in-mix";

export type Mood =
  | "competitive"
  | "cozy"
  | "chaotic"
  | "brainy"
  | "social"
  | "chill";

export type PlayerCount = "2" | "3-4" | "5+" | "any";
export type GameLength = "under-30" | "30-60" | "60-120" | "marathon";
export type Complexity = "easy" | "some-strategy" | "brain-burner";

export interface UserInputs {
  scenario: Scenario;
  mood: Mood;
  playerCount: PlayerCount;
  gameLength: GameLength;
  complexity: Complexity;
  favorites?: string;
}

export interface SeedGame {
  bggId: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  weight: number; // 1-5 BGG complexity weight
  categories: string[];
  mechanics: string[];
}

export interface RecommendedGame {
  rank: number;
  name: string;
  bggId: number;
  rating: number;
  playerCount: string;
  playtime: string;
  weight: number;
  pitch: string;
  matchReason: string;
  mechanics: string[];
  categories: string[];
  thumbnail: string;
}

export interface ShelfData {
  games: Array<{
    name: string;
    bggId: number;
    pitch: string;
  }>;
}

export type FlowStep =
  | "landing"
  | "scenario"
  | "mood"
  | "quiz-playercount"
  | "quiz-length"
  | "quiz-complexity"
  | "quiz-favorites"
  | "loading"
  | "swipe"
  | "results";
```

- [ ] **Step 2: Create seed games data file**

Create `src/data/seed-games.json` with ~50 games to start (expandable later). Include a diverse spread of player counts, complexity, and categories:

```json
[
  { "bggId": 174430, "name": "Gloomhaven", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 150, "weight": 3.86, "categories": ["Adventure", "Fantasy"], "mechanics": ["Cooperative", "Hand Management"] },
  { "bggId": 167791, "name": "Terraforming Mars", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 120, "maxPlaytime": 120, "weight": 3.24, "categories": ["Sci-Fi", "Economic"], "mechanics": ["Drafting", "Tile Placement"] },
  { "bggId": 233078, "name": "Wingspan", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 40, "maxPlaytime": 70, "weight": 2.44, "categories": ["Animals", "Card Game"], "mechanics": ["Engine Building", "Set Collection"] },
  { "bggId": 316554, "name": "Dune: Imperium", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.01, "categories": ["Sci-Fi"], "mechanics": ["Deck Building", "Worker Placement"] },
  { "bggId": 224517, "name": "Brass: Birmingham", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.91, "categories": ["Economic", "Industrial"], "mechanics": ["Network Building", "Hand Management"] },
  { "bggId": 342942, "name": "Ark Nova", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 90, "maxPlaytime": 150, "weight": 3.71, "categories": ["Animals", "Economic"], "mechanics": ["Hand Management", "Set Collection"] },
  { "bggId": 291457, "name": "Gloomhaven: Jaws of the Lion", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 120, "weight": 3.57, "categories": ["Adventure", "Fantasy"], "mechanics": ["Cooperative", "Hand Management"] },
  { "bggId": 312484, "name": "Lost Ruins of Arnak", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 2.92, "categories": ["Adventure"], "mechanics": ["Deck Building", "Worker Placement"] },
  { "bggId": 220308, "name": "Gaia Project", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 150, "weight": 4.37, "categories": ["Sci-Fi", "Strategy"], "mechanics": ["Network Building", "Variable Player Powers"] },
  { "bggId": 187645, "name": "Star Wars: Rebellion", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 180, "maxPlaytime": 240, "weight": 3.73, "categories": ["Sci-Fi", "Wargame"], "mechanics": ["Area Control", "Hand Management"] },
  { "bggId": 169786, "name": "Scythe", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 90, "maxPlaytime": 115, "weight": 3.40, "categories": ["Economic", "Strategy"], "mechanics": ["Area Control", "Engine Building"] },
  { "bggId": 162886, "name": "Spirit Island", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 90, "maxPlaytime": 120, "weight": 4.05, "categories": ["Fantasy", "Strategy"], "mechanics": ["Cooperative", "Variable Player Powers"] },
  { "bggId": 237182, "name": "Root", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 90, "weight": 3.71, "categories": ["Animals", "Wargame"], "mechanics": ["Area Control", "Variable Player Powers"] },
  { "bggId": 266192, "name": "Wingspan: European Expansion", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 40, "maxPlaytime": 70, "weight": 2.51, "categories": ["Animals", "Card Game"], "mechanics": ["Engine Building", "Set Collection"] },
  { "bggId": 205637, "name": "Arkham Horror: The Card Game", "minPlayers": 1, "maxPlayers": 2, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.48, "categories": ["Horror", "Card Game"], "mechanics": ["Cooperative", "Deck Building"] },
  { "bggId": 28720, "name": "Brass: Lancashire", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.86, "categories": ["Economic", "Industrial"], "mechanics": ["Network Building", "Hand Management"] },
  { "bggId": 161936, "name": "Pandemic Legacy: Season 1", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 60, "weight": 2.84, "categories": ["Medical"], "mechanics": ["Cooperative", "Set Collection"] },
  { "bggId": 12333, "name": "Twilight Struggle", "minPlayers": 2, "maxPlayers": 2, "minPlaytime": 120, "maxPlaytime": 180, "weight": 3.58, "categories": ["Political", "Wargame"], "mechanics": ["Area Control", "Hand Management"] },
  { "bggId": 31260, "name": "Agricola", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 30, "maxPlaytime": 150, "weight": 3.64, "categories": ["Economic", "Farming"], "mechanics": ["Worker Placement", "Hand Management"] },
  { "bggId": 230802, "name": "Azul", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 45, "weight": 1.77, "categories": ["Abstract", "Puzzle"], "mechanics": ["Drafting", "Tile Placement"] },
  { "bggId": 173346, "name": "7 Wonders Duel", "minPlayers": 2, "maxPlayers": 2, "minPlaytime": 30, "maxPlaytime": 30, "weight": 2.22, "categories": ["Ancient", "Card Game"], "mechanics": ["Drafting", "Set Collection"] },
  { "bggId": 68448, "name": "7 Wonders", "minPlayers": 2, "maxPlayers": 7, "minPlaytime": 30, "maxPlaytime": 30, "weight": 2.33, "categories": ["Ancient", "Card Game"], "mechanics": ["Drafting", "Set Collection"] },
  { "bggId": 36218, "name": "Dominion", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 30, "weight": 2.36, "categories": ["Card Game", "Medieval"], "mechanics": ["Deck Building", "Hand Management"] },
  { "bggId": 13, "name": "Catan", "minPlayers": 3, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 2.32, "categories": ["Economic", "Negotiation"], "mechanics": ["Trading", "Dice Rolling"] },
  { "bggId": 9209, "name": "Ticket to Ride", "minPlayers": 2, "maxPlayers": 5, "minPlaytime": 30, "maxPlaytime": 60, "weight": 1.83, "categories": ["Trains"], "mechanics": ["Set Collection", "Route Building"] },
  { "bggId": 30549, "name": "Pandemic", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 45, "maxPlaytime": 45, "weight": 2.42, "categories": ["Medical"], "mechanics": ["Cooperative", "Set Collection"] },
  { "bggId": 148228, "name": "Splendor", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 30, "weight": 1.78, "categories": ["Economic", "Renaissance"], "mechanics": ["Set Collection", "Engine Building"] },
  { "bggId": 178900, "name": "Codenames", "minPlayers": 2, "maxPlayers": 8, "minPlaytime": 15, "maxPlaytime": 15, "weight": 1.31, "categories": ["Party", "Word Game"], "mechanics": ["Team-Based", "Deduction"] },
  { "bggId": 2651, "name": "Power Grid", "minPlayers": 2, "maxPlayers": 6, "minPlaytime": 120, "maxPlaytime": 120, "weight": 3.28, "categories": ["Economic", "Industrial"], "mechanics": ["Auction", "Network Building"] },
  { "bggId": 39463, "name": "Cosmic Encounter", "minPlayers": 3, "maxPlayers": 5, "minPlaytime": 60, "maxPlaytime": 120, "weight": 2.55, "categories": ["Sci-Fi", "Negotiation"], "mechanics": ["Negotiation", "Variable Player Powers"] },
  { "bggId": 131357, "name": "Coup", "minPlayers": 2, "maxPlayers": 6, "minPlaytime": 15, "maxPlaytime": 15, "weight": 1.42, "categories": ["Bluffing", "Card Game"], "mechanics": ["Bluffing", "Deduction"] },
  { "bggId": 209010, "name": "Mechs vs. Minions", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 90, "weight": 2.41, "categories": ["Adventure", "Fantasy"], "mechanics": ["Cooperative", "Programming"] },
  { "bggId": 164928, "name": "Orléans", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 90, "maxPlaytime": 90, "weight": 3.07, "categories": ["Medieval", "Economic"], "mechanics": ["Bag Building", "Worker Placement"] },
  { "bggId": 84876, "name": "The Castles of Burgundy", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 90, "weight": 3.00, "categories": ["Medieval", "Strategy"], "mechanics": ["Dice Rolling", "Tile Placement"] },
  { "bggId": 170216, "name": "Blood Rage", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 90, "weight": 2.88, "categories": ["Fantasy", "Mythology"], "mechanics": ["Area Control", "Drafting"] },
  { "bggId": 205059, "name": "Mansions of Madness", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 120, "maxPlaytime": 180, "weight": 2.67, "categories": ["Horror", "Adventure"], "mechanics": ["Cooperative", "Dice Rolling"] },
  { "bggId": 521, "name": "Crokinole", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 30, "maxPlaytime": 30, "weight": 1.27, "categories": ["Dexterity"], "mechanics": ["Flicking"] },
  { "bggId": 199792, "name": "Everdell", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 40, "maxPlaytime": 80, "weight": 2.81, "categories": ["Animals", "Fantasy"], "mechanics": ["Worker Placement", "Engine Building"] },
  { "bggId": 256960, "name": "Patchwork", "minPlayers": 2, "maxPlayers": 2, "minPlaytime": 15, "maxPlaytime": 30, "weight": 1.61, "categories": ["Abstract", "Puzzle"], "mechanics": ["Tile Placement", "Drafting"] },
  { "bggId": 70323, "name": "King of Tokyo", "minPlayers": 2, "maxPlayers": 6, "minPlaytime": 30, "maxPlaytime": 30, "weight": 1.49, "categories": ["Fantasy", "Fighting"], "mechanics": ["Dice Rolling", "Press Your Luck"] },
  { "bggId": 150376, "name": "Dead of Winter", "minPlayers": 2, "maxPlayers": 5, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.04, "categories": ["Horror", "Zombie"], "mechanics": ["Cooperative", "Traitor", "Dice Rolling"] },
  { "bggId": 124361, "name": "Concordia", "minPlayers": 2, "maxPlayers": 5, "minPlaytime": 90, "maxPlaytime": 120, "weight": 3.04, "categories": ["Ancient", "Economic"], "mechanics": ["Hand Management", "Deck Building"] },
  { "bggId": 193738, "name": "Great Western Trail", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 75, "maxPlaytime": 150, "weight": 3.69, "categories": ["American West", "Economic"], "mechanics": ["Deck Building", "Hand Management"] },
  { "bggId": 215, "name": "Tichu", "minPlayers": 4, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 60, "weight": 2.30, "categories": ["Card Game"], "mechanics": ["Trick-Taking", "Team-Based"] },
  { "bggId": 171623, "name": "The Voyages of Marco Polo", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 40, "maxPlaytime": 100, "weight": 3.20, "categories": ["Medieval", "Travel"], "mechanics": ["Worker Placement", "Dice Rolling"] },
  { "bggId": 192135, "name": "Too Many Bones", "minPlayers": 1, "maxPlayers": 4, "minPlaytime": 60, "maxPlaytime": 120, "weight": 3.66, "categories": ["Adventure", "Fantasy"], "mechanics": ["Cooperative", "Dice Rolling"] },
  { "bggId": 175914, "name": "Food Chain Magnate", "minPlayers": 2, "maxPlayers": 5, "minPlaytime": 120, "maxPlaytime": 240, "weight": 4.21, "categories": ["Economic", "Industrial"], "mechanics": ["Hand Management", "Network Building"] },
  { "bggId": 266524, "name": "PARKS", "minPlayers": 1, "maxPlayers": 5, "minPlaytime": 30, "maxPlaytime": 60, "weight": 2.16, "categories": ["Nature", "Travel"], "mechanics": ["Set Collection", "Worker Placement"] },
  { "bggId": 285967, "name": "Unmatched", "minPlayers": 2, "maxPlayers": 4, "minPlaytime": 20, "maxPlaytime": 40, "weight": 1.90, "categories": ["Fantasy", "Fighting"], "mechanics": ["Hand Management", "Variable Player Powers"] },
  { "bggId": 182028, "name": "Captain Sonar", "minPlayers": 2, "maxPlayers": 8, "minPlaytime": 45, "maxPlaytime": 60, "weight": 2.09, "categories": ["Nautical"], "mechanics": ["Team-Based", "Real-Time"] }
]
```

This is a starter set of 50 games. Expand to ~500 before launch by adding more party games, family games, and niche categories.

- [ ] **Step 3: Write failing test for seed game filtering**

Create `src/lib/__tests__/seed-games.test.ts`:

```ts
import { filterSeedGames } from "../seed-games";
import type { UserInputs } from "../types";

describe("filterSeedGames", () => {
  const baseInputs: UserInputs = {
    scenario: "friends-chaos",
    mood: "chaotic",
    playerCount: "3-4",
    gameLength: "30-60",
    complexity: "some-strategy",
  };

  it("filters by player count 3-4", () => {
    const results = filterSeedGames(baseInputs);
    results.forEach((game) => {
      expect(game.minPlayers).toBeLessThanOrEqual(4);
      expect(game.maxPlayers).toBeGreaterThanOrEqual(3);
    });
  });

  it("filters by game length 30-60", () => {
    const results = filterSeedGames(baseInputs);
    results.forEach((game) => {
      expect(game.maxPlaytime).toBeGreaterThanOrEqual(30);
      expect(game.minPlaytime).toBeLessThanOrEqual(60);
    });
  });

  it("returns all games when playerCount is any", () => {
    const results = filterSeedGames({ ...baseInputs, playerCount: "any" });
    expect(results.length).toBeGreaterThan(
      filterSeedGames(baseInputs).length
    );
  });

  it("filters by complexity", () => {
    const easyResults = filterSeedGames({ ...baseInputs, complexity: "easy" });
    easyResults.forEach((game) => {
      expect(game.weight).toBeLessThanOrEqual(2.0);
    });

    const hardResults = filterSeedGames({ ...baseInputs, complexity: "brain-burner" });
    hardResults.forEach((game) => {
      expect(game.weight).toBeGreaterThan(3.0);
    });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/seed-games.test.ts
```

Expected: FAIL — `filterSeedGames` not found.

- [ ] **Step 5: Implement seed game filter**

Create `src/lib/seed-games.ts`:

```ts
import seedGames from "../data/seed-games.json";
import type { SeedGame, UserInputs } from "./types";

const games: SeedGame[] = seedGames;

function getPlayerRange(playerCount: string): { min: number; max: number } {
  switch (playerCount) {
    case "2": return { min: 2, max: 2 };
    case "3-4": return { min: 3, max: 4 };
    case "5+": return { min: 5, max: 99 };
    case "any": return { min: 1, max: 99 };
    default: return { min: 1, max: 99 };
  }
}

function getPlaytimeRange(gameLength: string): { min: number; max: number } {
  switch (gameLength) {
    case "under-30": return { min: 0, max: 30 };
    case "30-60": return { min: 30, max: 60 };
    case "60-120": return { min: 60, max: 120 };
    case "marathon": return { min: 120, max: 9999 };
    default: return { min: 0, max: 9999 };
  }
}

function getWeightRange(complexity: string): { min: number; max: number } {
  switch (complexity) {
    case "easy": return { min: 0, max: 2.0 };
    case "some-strategy": return { min: 1.5, max: 3.5 };
    case "brain-burner": return { min: 3.0, max: 5.0 };
    default: return { min: 0, max: 5.0 };
  }
}

export function filterSeedGames(inputs: UserInputs): SeedGame[] {
  const players = getPlayerRange(inputs.playerCount);
  const playtime = getPlaytimeRange(inputs.gameLength);
  const weight = getWeightRange(inputs.complexity);

  return games.filter((game) => {
    const playerMatch =
      game.minPlayers <= players.max && game.maxPlayers >= players.min;
    const playtimeMatch =
      game.minPlaytime <= playtime.max && game.maxPlaytime >= playtime.min;
    const weightMatch =
      game.weight >= weight.min && game.weight <= weight.max;

    return playerMatch && playtimeMatch && weightMatch;
  });
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
npx jest src/lib/__tests__/seed-games.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/types.ts src/data/seed-games.json src/lib/seed-games.ts src/lib/__tests__/seed-games.test.ts
git commit -m "feat: add game types, seed data, and filtering logic"
```

---

## Task 3: BGG API Integration

**Files:**
- Create: `src/lib/bgg.ts`
- Test: `src/lib/__tests__/bgg.test.ts`

- [ ] **Step 1: Write failing test for BGG XML parsing**

Create `src/lib/__tests__/bgg.test.ts`:

```ts
import { parseBggResponse } from "../bgg";

const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<items>
  <item type="boardgame" id="174430">
    <name type="primary" value="Gloomhaven"/>
    <description>A tactical combat game</description>
    <image>https://example.com/gloomhaven.jpg</image>
    <thumbnail>https://example.com/gloomhaven_t.jpg</thumbnail>
    <minplayers value="1"/>
    <maxplayers value="4"/>
    <minplaytime value="60"/>
    <maxplaytime value="150"/>
    <statistics>
      <ratings>
        <average value="8.67"/>
        <averageweight value="3.86"/>
      </ratings>
    </statistics>
  </item>
</items>`;

describe("parseBggResponse", () => {
  it("parses game details from BGG XML", () => {
    const games = parseBggResponse(sampleXml);
    expect(games).toHaveLength(1);
    expect(games[0]).toEqual({
      bggId: 174430,
      name: "Gloomhaven",
      description: "A tactical combat game",
      thumbnail: "https://example.com/gloomhaven_t.jpg",
      minPlayers: 1,
      maxPlayers: 4,
      minPlaytime: 60,
      maxPlaytime: 150,
      rating: 8.67,
      weight: 3.86,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/bgg.test.ts
```

Expected: FAIL — `parseBggResponse` not found.

- [ ] **Step 3: Implement BGG parsing and fetching**

Create `src/lib/bgg.ts`:

```ts
import { XMLParser } from "fast-xml-parser";

export interface BggGameDetails {
  bggId: number;
  name: string;
  description: string;
  thumbnail: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  rating: number;
  weight: number;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const cache = new Map<string, { data: BggGameDetails[]; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function parseBggResponse(xml: string): BggGameDetails[] {
  const parsed = parser.parse(xml);
  const items = parsed.items?.item;
  if (!items) return [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.map((item: Record<string, unknown>) => {
    const names = item.name;
    const primaryName = Array.isArray(names)
      ? names.find((n: Record<string, string>) => n["@_type"] === "primary")?.["@_value"]
      : (names as Record<string, string>)?.["@_value"];

    const stats = (item.statistics as Record<string, unknown>)?.ratings as Record<string, Record<string, string>>;

    return {
      bggId: Number(item["@_id"]),
      name: primaryName || "Unknown",
      description: String(item.description || "").slice(0, 200),
      thumbnail: String(item.thumbnail || ""),
      minPlayers: Number((item.minplayers as Record<string, string>)?.["@_value"] || 0),
      maxPlayers: Number((item.maxplayers as Record<string, string>)?.["@_value"] || 0),
      minPlaytime: Number((item.minplaytime as Record<string, string>)?.["@_value"] || 0),
      maxPlaytime: Number((item.maxplaytime as Record<string, string>)?.["@_value"] || 0),
      rating: Number(Number(stats?.average?.["@_value"] || 0).toFixed(2)),
      weight: Number(Number(stats?.averageweight?.["@_value"] || 0).toFixed(2)),
    };
  });
}

export async function fetchBggDetails(bggIds: number[]): Promise<BggGameDetails[]> {
  const cacheKey = bggIds.sort().join(",");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  const results: BggGameDetails[] = [];
  // BGG allows max 20 IDs per request
  for (let i = 0; i < bggIds.length; i += 20) {
    const batch = bggIds.slice(i, i + 20);
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(",")}&stats=1`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const xml = await res.text();
    results.push(...parseBggResponse(xml));
  }

  cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });
  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/lib/__tests__/bgg.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bgg.ts src/lib/__tests__/bgg.test.ts
git commit -m "feat: add BGG XML API parsing and fetching with cache"
```

---

## Task 4: Claude Recommendation Engine

**Files:**
- Create: `src/lib/claude.ts`
- Test: `src/lib/__tests__/claude.test.ts`

- [ ] **Step 1: Write failing test for prompt builder**

Create `src/lib/__tests__/claude.test.ts`:

```ts
import { buildPrompt } from "../claude";
import type { UserInputs } from "../types";
import type { BggGameDetails } from "../bgg";

describe("buildPrompt", () => {
  const inputs: UserInputs = {
    scenario: "friends-chaos",
    mood: "chaotic",
    playerCount: "3-4",
    gameLength: "30-60",
    complexity: "some-strategy",
    favorites: "Catan",
  };

  const games: BggGameDetails[] = [
    {
      bggId: 39463,
      name: "Cosmic Encounter",
      description: "A classic negotiation game",
      thumbnail: "https://example.com/cosmic.jpg",
      minPlayers: 3,
      maxPlayers: 5,
      minPlaytime: 60,
      maxPlaytime: 120,
      rating: 7.6,
      weight: 2.55,
    },
  ];

  it("includes user scenario and mood in prompt", () => {
    const { userMessage } = buildPrompt(inputs, games);
    expect(userMessage).toContain("friends-chaos");
    expect(userMessage).toContain("chaotic");
  });

  it("includes game data in prompt", () => {
    const { userMessage } = buildPrompt(inputs, games);
    expect(userMessage).toContain("Cosmic Encounter");
    expect(userMessage).toContain("7.6");
  });

  it("includes favorites when provided", () => {
    const { userMessage } = buildPrompt(inputs, games);
    expect(userMessage).toContain("Catan");
  });

  it("has a system message about being a board game sommelier", () => {
    const { systemMessage } = buildPrompt(inputs, games);
    expect(systemMessage).toContain("board game");
    expect(systemMessage).toContain("JSON");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/claude.test.ts
```

Expected: FAIL — `buildPrompt` not found.

- [ ] **Step 3: Implement Claude integration**

Create `src/lib/claude.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { UserInputs, RecommendedGame } from "./types";
import type { BggGameDetails } from "./bgg";

const anthropic = new Anthropic();

export function buildPrompt(
  inputs: UserInputs,
  games: BggGameDetails[]
): { systemMessage: string; userMessage: string } {
  const systemMessage = `You are a board game sommelier — an expert at matching people with the perfect board game. You must return ONLY valid JSON, no other text.

Return a JSON object with a "games" array containing exactly 10 games, ranked from best match to worst. Each game object must have:
- "bggId": number (from the provided list)
- "name": string
- "pitch": string (one witty sentence selling this game to THIS specific person)
- "matchReason": string (why this fits their scenario and mood)
- "mechanics": string[] (2-3 key mechanics)
- "categories": string[] (1-2 categories)`;

  const gameList = games
    .map(
      (g) =>
        `- ${g.name} (ID: ${g.bggId}) | Rating: ${g.rating} | Players: ${g.minPlayers}-${g.maxPlayers} | Time: ${g.minPlaytime}-${g.maxPlaytime}min | Weight: ${g.weight}/5 | ${g.description}`
    )
    .join("\n");

  const userMessage = `## Who I am
- Scenario: ${inputs.scenario}
- Mood: ${inputs.mood}
- Player count preference: ${inputs.playerCount}
- Game length preference: ${inputs.gameLength}
- Complexity preference: ${inputs.complexity}
${inputs.favorites ? `- Games I already love: ${inputs.favorites}` : ""}

## Available games to choose from
${gameList}

Pick the 10 best matches from this list. Return JSON only.`;

  return { systemMessage, userMessage };
}

export async function getRecommendations(
  inputs: UserInputs,
  games: BggGameDetails[]
): Promise<RecommendedGame[]> {
  const { systemMessage, userMessage } = buildPrompt(inputs, games);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemMessage,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const parsed = JSON.parse(text);
  const recommended: RecommendedGame[] = parsed.games.map(
    (g: Record<string, unknown>, i: number) => {
      const bggGame = games.find((bg) => bg.bggId === g.bggId);
      return {
        rank: i + 1,
        name: g.name as string,
        bggId: g.bggId as number,
        rating: bggGame?.rating || 0,
        playerCount: bggGame
          ? `${bggGame.minPlayers}-${bggGame.maxPlayers}`
          : "",
        playtime: bggGame
          ? `${bggGame.minPlaytime}-${bggGame.maxPlaytime}min`
          : "",
        weight: bggGame?.weight || 0,
        pitch: g.pitch as string,
        matchReason: g.matchReason as string,
        mechanics: g.mechanics as string[],
        categories: g.categories as string[],
        thumbnail: bggGame?.thumbnail || "",
      };
    }
  );

  return recommended;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/lib/__tests__/claude.test.ts
```

Expected: All 4 tests PASS (only testing `buildPrompt`, not the API call).

- [ ] **Step 5: Commit**

```bash
git add src/lib/claude.ts src/lib/__tests__/claude.test.ts
git commit -m "feat: add Claude recommendation engine with prompt builder"
```

---

## Task 5: Share URL Encoding

**Files:**
- Create: `src/lib/share.ts`
- Test: `src/lib/__tests__/share.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/__tests__/share.test.ts`:

```ts
import { encodeShelfData, decodeShelfData } from "../share";
import type { ShelfData } from "../types";

describe("share encoding", () => {
  const shelfData: ShelfData = {
    games: [
      { name: "Cosmic Encounter", bggId: 39463, pitch: "Betray your friends" },
      { name: "Coup", bggId: 131357, pitch: "Lie until you win" },
    ],
  };

  it("encodes and decodes shelf data roundtrip", () => {
    const encoded = encodeShelfData(shelfData);
    const decoded = decodeShelfData(encoded);
    expect(decoded).toEqual(shelfData);
  });

  it("produces URL-safe strings", () => {
    const encoded = encodeShelfData(shelfData);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for invalid encoded data", () => {
    const decoded = decodeShelfData("invalid-data");
    expect(decoded).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest src/lib/__tests__/share.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement share encoding**

Create `src/lib/share.ts`:

```ts
import type { ShelfData } from "./types";

export function encodeShelfData(data: ShelfData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString("base64");
  // Make URL-safe: replace +/ with -_, remove =
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShelfData(encoded: string): ShelfData | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4 !== 0) base64 += "=";
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as ShelfData;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest src/lib/__tests__/share.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/share.ts src/lib/__tests__/share.test.ts
git commit -m "feat: add base64url share encoding for shelf data"
```

---

## Task 6: API Route — /api/recommend

**Files:**
- Create: `src/app/api/recommend/route.ts`

- [ ] **Step 1: Implement the API route**

Create `src/app/api/recommend/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import type { UserInputs } from "@/lib/types";
import { filterSeedGames } from "@/lib/seed-games";
import { fetchBggDetails } from "@/lib/bgg";
import { getRecommendations } from "@/lib/claude";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as UserInputs;

    // Validate required fields
    if (!body.scenario || !body.mood || !body.playerCount || !body.gameLength || !body.complexity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Filter seed games by hard constraints
    const candidates = filterSeedGames(body);
    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No games match your criteria. Try broader preferences." },
        { status: 404 }
      );
    }

    // Fetch fresh details from BGG
    const bggIds = candidates.map((g) => g.bggId);
    const bggDetails = await fetchBggDetails(bggIds);

    // Get AI recommendations
    const recommendations = await getRecommendations(body, bggDetails);

    return NextResponse.json({ games: recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations. Please try again." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test manually with curl**

Start dev server: `npm run dev`

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"scenario":"friends-chaos","mood":"chaotic","playerCount":"3-4","gameLength":"30-60","complexity":"some-strategy"}'
```

Expected: JSON response with `{ games: [...] }` containing 10 ranked games.

Note: Requires `ANTHROPIC_API_KEY` environment variable. Create `.env.local`:

```
ANTHROPIC_API_KEY=your-key-here
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/recommend/route.ts
git commit -m "feat: add /api/recommend route with rate limiting"
```

---

## Task 7: Landing Page Component

**Files:**
- Create: `src/components/Landing.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the Landing component**

Create `src/components/Landing.tsx`:

```tsx
interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="font-mono text-xs tracking-[4px] text-gray-500 mb-4">
        BOARD GAME MATCHMAKER
      </p>
      <h1 className="font-mono text-4xl md:text-5xl font-bold mb-2 leading-tight">
        roll for your
        <br />
        next obsession_
      </h1>
      <p className="text-gray-400 text-sm max-w-md mb-8">
        answer a few quick questions. get matched with board games you&apos;ll
        actually want to play.
      </p>
      <button
        onClick={onStart}
        className="bg-accent text-black font-mono font-bold text-lg px-8 py-3 rounded hover:brightness-110 transition-all"
      >
        ROLL →
      </button>
      <p className="font-mono text-[11px] text-gray-600 mt-6">
        no sign-up. no bs. just games.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Wire up page.tsx with flow state**

Update `src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { FlowStep, Scenario, Mood, PlayerCount, GameLength, Complexity, RecommendedGame } from "@/lib/types";
import Landing from "@/components/Landing";

export default function Home() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [playerCount, setPlayerCount] = useState<PlayerCount | null>(null);
  const [gameLength, setGameLength] = useState<GameLength | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [favorites, setFavorites] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [shelf, setShelf] = useState<RecommendedGame[]>([]);

  return (
    <main className="min-h-screen">
      {step === "landing" && <Landing onStart={() => setStep("scenario")} />}
      {/* Other steps will be added in subsequent tasks */}
      {step !== "landing" && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="font-mono text-gray-500">Step: {step} (coming soon)</p>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: Landing page renders with "roll for your next obsession_" and the ROLL button. Clicking ROLL shows the placeholder step text.

- [ ] **Step 4: Commit**

```bash
git add src/components/Landing.tsx src/app/page.tsx
git commit -m "feat: add Landing component with flow state scaffolding"
```

---

## Task 8: Scenario and Mood Select Components

**Files:**
- Create: `src/components/ScenarioSelect.tsx`, `src/components/MoodSelect.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build ScenarioSelect**

Create `src/components/ScenarioSelect.tsx`:

```tsx
import type { Scenario } from "@/lib/types";

const scenarios: { value: Scenario; label: string; emoji: string }[] = [
  { value: "family-night", label: "Family Night", emoji: "👨‍👩‍👧‍👦" },
  { value: "date-night", label: "Date Night", emoji: "🍷" },
  { value: "friends-chaos", label: "Friends & Chaos", emoji: "🍻" },
  { value: "hardcore-crew", label: "Hardcore Crew", emoji: "🧠" },
  { value: "solo-quest", label: "Solo Quest", emoji: "🎧" },
  { value: "kids-in-mix", label: "Kids in the Mix", emoji: "🧒" },
];

interface ScenarioSelectProps {
  onSelect: (scenario: Scenario) => void;
}

export default function ScenarioSelect({ onSelect }: ScenarioSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">
        STEP 1 OF 4
      </p>
      <h2 className="font-mono text-2xl font-bold mb-1">
        who&apos;s at the table?
      </h2>
      <p className="text-gray-500 text-sm mb-8">pick one</p>
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {scenarios.map((s) => (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            className="p-4 border border-white/15 rounded-md text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
          >
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="font-mono text-sm font-bold">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build MoodSelect**

Create `src/components/MoodSelect.tsx`:

```tsx
import type { Mood } from "@/lib/types";

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: "competitive", label: "Competitive", emoji: "⚔️" },
  { value: "cozy", label: "Cozy", emoji: "☕" },
  { value: "chaotic", label: "Chaotic", emoji: "🌪️" },
  { value: "brainy", label: "Brainy", emoji: "🧩" },
  { value: "social", label: "Social", emoji: "💬" },
  { value: "chill", label: "Chill", emoji: "🌊" },
];

interface MoodSelectProps {
  onSelect: (mood: Mood) => void;
}

export default function MoodSelect({ onSelect }: MoodSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">
        STEP 2 OF 4
      </p>
      <h2 className="font-mono text-2xl font-bold mb-1">what energy?</h2>
      <p className="text-gray-500 text-sm mb-8">pick your vibe</p>
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => onSelect(m.value)}
            className="p-4 border border-white/15 rounded-md text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
          >
            <div className="text-xl mb-1">{m.emoji}</div>
            <div className="font-mono text-sm font-bold">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into page.tsx**

Add imports and render cases in `src/app/page.tsx`:

```tsx
import ScenarioSelect from "@/components/ScenarioSelect";
import MoodSelect from "@/components/MoodSelect";

// In the return, replace the placeholder:
{step === "scenario" && (
  <ScenarioSelect onSelect={(s) => { setScenario(s); setStep("mood"); }} />
)}
{step === "mood" && (
  <MoodSelect onSelect={(m) => { setMood(m); setStep("quiz-playercount"); }} />
)}
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Expected: Landing → click ROLL → Scenario tiles → click one → Mood tiles → click one → placeholder for quiz.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScenarioSelect.tsx src/components/MoodSelect.tsx src/app/page.tsx
git commit -m "feat: add scenario and mood select steps"
```

---

## Task 9: Quiz Steps Component

**Files:**
- Create: `src/components/QuizStep.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build QuizStep component**

Create `src/components/QuizStep.tsx`:

```tsx
interface QuizOption {
  value: string;
  label: string;
}

interface QuizStepProps {
  stepNumber: string;
  question: string;
  options: QuizOption[];
  onSelect: (value: string) => void;
  showTextInput?: boolean;
  textPlaceholder?: string;
  onTextSubmit?: (value: string) => void;
}

export default function QuizStep({
  stepNumber,
  question,
  options,
  onSelect,
  showTextInput,
  textPlaceholder,
  onTextSubmit,
}: QuizStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">
        {stepNumber}
      </p>
      <h2 className="font-mono text-2xl font-bold mb-8">{question}</h2>
      <div className="flex flex-col gap-3 max-w-md w-full">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="p-4 border border-white/15 rounded-md text-left font-mono text-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {showTextInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem(
              "favorites"
            ) as HTMLInputElement;
            onTextSubmit?.(input.value);
          }}
          className="mt-6 max-w-md w-full"
        >
          <input
            name="favorites"
            type="text"
            placeholder={textPlaceholder}
            className="w-full p-4 bg-transparent border border-white/15 rounded-md font-mono text-sm focus:border-accent focus:outline-none"
          />
          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              className="flex-1 p-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all"
            >
              NEXT →
            </button>
            <button
              type="button"
              onClick={() => onTextSubmit?.("")}
              className="p-3 border border-white/15 font-mono text-sm rounded text-gray-400 hover:border-accent transition-all"
            >
              SKIP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire quiz steps into page.tsx**

Add the quiz step renders to `src/app/page.tsx`:

```tsx
import QuizStep from "@/components/QuizStep";

// Add these cases in the return:
{step === "quiz-playercount" && (
  <QuizStep
    stepNumber="STEP 3 OF 4"
    question="how many players?"
    options={[
      { value: "2", label: "Just 2 of us" },
      { value: "3-4", label: "3-4 players" },
      { value: "5+", label: "5 or more" },
      { value: "any", label: "Don't care" },
    ]}
    onSelect={(v) => { setPlayerCount(v as PlayerCount); setStep("quiz-length"); }}
  />
)}
{step === "quiz-length" && (
  <QuizStep
    stepNumber="STEP 3 OF 4"
    question="how long you got?"
    options={[
      { value: "under-30", label: "Quick — under 30 min" },
      { value: "30-60", label: "Standard — 30 to 60 min" },
      { value: "60-120", label: "Committed — 1 to 2 hours" },
      { value: "marathon", label: "Marathon — 2+ hours" },
    ]}
    onSelect={(v) => { setGameLength(v as GameLength); setStep("quiz-complexity"); }}
  />
)}
{step === "quiz-complexity" && (
  <QuizStep
    stepNumber="STEP 3 OF 4"
    question="how crunchy?"
    options={[
      { value: "easy", label: "Easy to learn, hard to put down" },
      { value: "some-strategy", label: "Some strategy, some luck" },
      { value: "brain-burner", label: "Full brain-burner" },
    ]}
    onSelect={(v) => { setComplexity(v as Complexity); setStep("quiz-favorites"); }}
  />
)}
{step === "quiz-favorites" && (
  <QuizStep
    stepNumber="STEP 4 OF 4"
    question="any games you already love?"
    options={[]}
    onSelect={() => {}}
    showTextInput
    textPlaceholder="e.g. Catan, Wingspan, Codenames..."
    onTextSubmit={(v) => { setFavorites(v); setStep("loading"); }}
  />
)}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: Full quiz flow works — player count → game length → complexity → favorites text input → hits "loading" placeholder.

- [ ] **Step 4: Commit**

```bash
git add src/components/QuizStep.tsx src/app/page.tsx
git commit -m "feat: add quiz step components for player count, length, complexity, favorites"
```

---

## Task 10: Loading State and API Call

**Files:**
- Create: `src/components/LoadingState.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build LoadingState component**

Create `src/components/LoadingState.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

const messages = [
  "Rolling the dice...",
  "Consulting the board game gods...",
  "Shuffling through the collection...",
  "Finding your perfect match...",
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="animate-spin text-4xl mb-6">🎲</div>
      <p className="font-mono text-lg text-gray-300 animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Add API call trigger in page.tsx**

In `src/app/page.tsx`, add a `useEffect` that fires when step becomes `"loading"`:

```tsx
import { useState, useEffect } from "react";
import LoadingState from "@/components/LoadingState";

// Add this useEffect inside Home():
useEffect(() => {
  if (step !== "loading") return;
  if (!scenario || !mood || !playerCount || !gameLength || !complexity) return;

  const fetchRecommendations = async () => {
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          mood,
          playerCount,
          gameLength,
          complexity,
          favorites: favorites || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to get recommendations");

      const data = await res.json();
      setRecommendations(data.games);
      setStep("swipe");
    } catch (error) {
      console.error(error);
      // On error, let user retry
      setStep("landing");
    }
  };

  fetchRecommendations();
}, [step, scenario, mood, playerCount, gameLength, complexity, favorites]);

// Add the render case:
{step === "loading" && <LoadingState />}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev` (with `ANTHROPIC_API_KEY` in `.env.local`)
Expected: After completing quiz, loading animation shows, then transitions to swipe step (placeholder for now).

- [ ] **Step 4: Commit**

```bash
git add src/components/LoadingState.tsx src/app/page.tsx
git commit -m "feat: add loading state with rotating messages and API call"
```

---

## Task 11: Swipe Cards Component

**Files:**
- Create: `src/components/GameCard.tsx`, `src/components/SwipeCards.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build GameCard**

Create `src/components/GameCard.tsx`:

```tsx
import type { RecommendedGame } from "@/lib/types";

interface GameCardProps {
  game: RecommendedGame;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="border border-white/15 rounded-lg p-6 max-w-sm w-full bg-white/[0.02]">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-4">
        YOUR MATCH
      </p>
      <h3 className="font-mono text-2xl font-bold mb-2">{game.name}</h3>
      <div className="flex gap-4 text-xs text-gray-400 font-mono mb-4">
        <span>⭐ {game.rating}</span>
        <span>👥 {game.playerCount}</span>
        <span>⏱ {game.playtime}</span>
        <span>🎯 {game.weight}/5</span>
      </div>
      <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">
        &ldquo;{game.pitch}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        {[...game.mechanics, ...game.categories].slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 border border-white/15 rounded font-mono text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build SwipeCards**

Create `src/components/SwipeCards.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { RecommendedGame } from "@/lib/types";
import GameCard from "./GameCard";

interface SwipeCardsProps {
  games: RecommendedGame[];
  onComplete: (liked: RecommendedGame[]) => void;
}

export default function SwipeCards({ games, onComplete }: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<RecommendedGame[]>([]);

  const currentGame = games[currentIndex];
  const remaining = games.length - currentIndex;
  const shelfCount = liked.length;

  function handleLike() {
    const newLiked = [...liked, currentGame];
    setLiked(newLiked);

    if (newLiked.length >= 5 || currentIndex >= games.length - 1) {
      onComplete(newLiked);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleSkip() {
    if (currentIndex >= games.length - 1) {
      onComplete(liked);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  if (!currentGame) {
    onComplete(liked);
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="flex items-center gap-4 mb-6">
        <p className="font-mono text-xs text-gray-500">
          {remaining} remaining
        </p>
        <p className="font-mono text-xs text-accent">
          {shelfCount}/5 on shelf
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-1 bg-white/10 rounded-full mb-6">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / games.length) * 100}%` }}
        />
      </div>

      <GameCard game={currentGame} />

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSkip}
          className="px-6 py-3 border border-white/15 font-mono text-sm rounded hover:border-white/30 transition-all"
        >
          SKIP
        </button>
        <button
          onClick={handleLike}
          className="px-6 py-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all"
        >
          ADD TO SHELF ✓
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into page.tsx**

```tsx
import SwipeCards from "@/components/SwipeCards";

// Add render case:
{step === "swipe" && (
  <SwipeCards
    games={recommendations}
    onComplete={(liked) => { setShelf(liked); setStep("results"); }}
  />
)}
```

- [ ] **Step 4: Verify in browser**

Expected: After loading, game cards appear one at a time. Like/Skip works. Progress bar fills. After 5 likes or all cards viewed, transitions to results.

- [ ] **Step 5: Commit**

```bash
git add src/components/GameCard.tsx src/components/SwipeCards.tsx src/app/page.tsx
git commit -m "feat: add swipe cards with like/skip and progress tracking"
```

---

## Task 12: Results Page — Match Card, Shelf, and Share

**Files:**
- Create: `src/components/MatchCard.tsx`, `src/components/ShelfVisual.tsx`, `src/components/ShareButtons.tsx`, `src/components/Results.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build MatchCard**

Create `src/components/MatchCard.tsx`:

```tsx
import type { RecommendedGame } from "@/lib/types";

interface MatchCardProps {
  game: RecommendedGame;
}

export default function MatchCard({ game }: MatchCardProps) {
  return (
    <div className="border border-white/15 rounded-lg p-8 max-w-sm w-full bg-white/[0.02] text-center">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-4">
        YOUR TOP MATCH
      </p>
      <h3 className="font-mono text-2xl font-bold mb-2">{game.name}</h3>
      <div className="flex justify-center gap-4 text-xs text-gray-400 font-mono mb-4">
        <span>⭐ {game.rating}</span>
        <span>👥 {game.playerCount}</span>
        <span>⏱ {game.playtime}</span>
        <span>🎯 {game.weight}/5</span>
      </div>
      <p className="text-sm text-gray-300 italic mb-5 leading-relaxed">
        &ldquo;{game.pitch}&rdquo;
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[...game.mechanics, ...game.categories].slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 border border-white/15 rounded font-mono text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] text-gray-600 mt-6">rollfor.fun</p>
    </div>
  );
}
```

- [ ] **Step 2: Build ShelfVisual**

Create `src/components/ShelfVisual.tsx`:

```tsx
import type { RecommendedGame } from "@/lib/types";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [180, 160, 190, 150, 170];

interface ShelfVisualProps {
  games: RecommendedGame[];
}

export default function ShelfVisual({ games }: ShelfVisualProps) {
  return (
    <div className="text-center">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-6">
        YOUR TOP {games.length}
      </p>
      <div className="flex justify-center gap-1.5 items-end h-[200px] mb-6">
        {games.map((game, i) => (
          <div
            key={game.bggId}
            style={{
              width: 52,
              height: spineHeights[i % spineHeights.length],
              backgroundColor: spineColors[i % spineColors.length],
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              padding: "8px 4px",
            }}
          >
            <span
              className="font-mono text-[10px] font-bold"
              style={{
                color: [1, 3].includes(i % 5) ? "#fff" : "#000",
              }}
            >
              {game.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="w-72 h-1 bg-white/15 mx-auto rounded" />
      <p className="font-mono text-[10px] text-gray-600 mt-4">rollfor.fun</p>
    </div>
  );
}
```

- [ ] **Step 3: Build ShareButtons**

Create `src/components/ShareButtons.tsx`:

```tsx
"use client";

interface ShareButtonsProps {
  shelfUrl: string;
  onRollAgain: () => void;
}

export default function ShareButtons({ shelfUrl, onRollAgain }: ShareButtonsProps) {
  async function handleCopyLink() {
    await navigator.clipboard.writeText(shelfUrl);
    // Brief visual feedback could be added here
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopyLink}
        className="px-5 py-2.5 bg-accent text-black font-mono font-bold text-xs rounded hover:brightness-110 transition-all"
      >
        COPY LINK
      </button>
      <button
        onClick={onRollAgain}
        className="px-5 py-2.5 border border-white/15 font-mono text-xs rounded text-gray-300 hover:border-accent transition-all"
      >
        ROLL AGAIN
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Build Results component**

Create `src/components/Results.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import type { RecommendedGame } from "@/lib/types";
import { encodeShelfData } from "@/lib/share";
import MatchCard from "./MatchCard";
import ShelfVisual from "./ShelfVisual";
import ShareButtons from "./ShareButtons";

interface ResultsProps {
  shelf: RecommendedGame[];
  onRollAgain: () => void;
}

export default function Results({ shelf, onRollAgain }: ResultsProps) {
  const topPick = shelf[0];

  const shelfUrl = useMemo(() => {
    const encoded = encodeShelfData({
      games: shelf.map((g) => ({
        name: g.name,
        bggId: g.bggId,
        pitch: g.pitch,
      })),
    });
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shelf/${encoded}`;
    }
    return `/shelf/${encoded}`;
  }, [shelf]);

  if (shelf.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="font-mono text-gray-400 mb-4">
          No games added to shelf. Try again?
        </p>
        <button
          onClick={onRollAgain}
          className="px-6 py-3 bg-accent text-black font-mono font-bold rounded"
        >
          ROLL AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 gap-12">
      {topPick && <MatchCard game={topPick} />}
      <ShelfVisual games={shelf} />
      <ShareButtons shelfUrl={shelfUrl} onRollAgain={onRollAgain} />
    </div>
  );
}
```

- [ ] **Step 5: Wire into page.tsx**

```tsx
import Results from "@/components/Results";

// Add render case and reset function:
function handleRollAgain() {
  setStep("landing");
  setScenario(null);
  setMood(null);
  setPlayerCount(null);
  setGameLength(null);
  setComplexity(null);
  setFavorites("");
  setRecommendations([]);
  setShelf([]);
}

{step === "results" && (
  <Results shelf={shelf} onRollAgain={handleRollAgain} />
)}
```

- [ ] **Step 6: Verify full flow in browser**

Expected: Complete flow from landing → scenario → mood → quiz → loading → swipe → results with match card + shelf visual + share buttons.

- [ ] **Step 7: Commit**

```bash
git add src/components/MatchCard.tsx src/components/ShelfVisual.tsx src/components/ShareButtons.tsx src/components/Results.tsx src/app/page.tsx
git commit -m "feat: add results page with match card, shelf visual, and share buttons"
```

---

## Task 13: Shareable Shelf Page

**Files:**
- Create: `src/app/shelf/[encoded]/page.tsx`

- [ ] **Step 1: Build the shareable shelf page**

Create `src/app/shelf/[encoded]/page.tsx`:

```tsx
import { Metadata } from "next";
import { decodeShelfData } from "@/lib/share";
import ShelfPageClient from "./client";

interface PageProps {
  params: Promise<{ encoded: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { encoded } = await params;
  const data = decodeShelfData(encoded);
  const title = data
    ? `My Board Game Shelf — ${data.games.map((g) => g.name).join(", ")}`
    : "rollfor.fun — Board Game Matchmaker";

  return {
    title,
    description: "Check out my board game shelf! Roll for your own at rollfor.fun",
    openGraph: {
      title: "My Board Game Shelf",
      description: data
        ? data.games.map((g) => g.name).join(" · ")
        : "Roll for your next obsession",
      images: [`/api/og/${encoded}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og/${encoded}`],
    },
  };
}

export default async function ShelfPage({ params }: PageProps) {
  const { encoded } = await params;
  const data = decodeShelfData(encoded);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="font-mono text-gray-400">Invalid shelf link.</p>
        <a href="/" className="mt-4 text-accent font-mono text-sm hover:underline">
          Roll your own →
        </a>
      </div>
    );
  }

  return <ShelfPageClient data={data} />;
}
```

Create `src/app/shelf/[encoded]/client.tsx`:

```tsx
"use client";

import type { ShelfData } from "@/lib/types";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [180, 160, 190, 150, 170];

interface ShelfPageClientProps {
  data: ShelfData;
}

export default function ShelfPageClient({ data }: ShelfPageClientProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-6">
        SOMEONE&apos;S TOP {data.games.length}
      </p>
      <div className="flex justify-center gap-1.5 items-end h-[200px] mb-6">
        {data.games.map((game, i) => (
          <div
            key={game.bggId}
            style={{
              width: 52,
              height: spineHeights[i % spineHeights.length],
              backgroundColor: spineColors[i % spineColors.length],
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              padding: "8px 4px",
            }}
          >
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: [1, 3].includes(i % 5) ? "#fff" : "#000" }}
            >
              {game.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="w-72 h-1 bg-white/15 mx-auto rounded mb-8" />

      <a
        href="/"
        className="px-6 py-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all"
      >
        ROLL YOUR OWN →
      </a>
      <p className="font-mono text-[10px] text-gray-600 mt-6">rollfor.fun</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify by visiting a test shelf URL**

Generate a test URL by completing the full flow, copying the share link, and opening it in a new tab.

- [ ] **Step 3: Commit**

```bash
git add src/app/shelf/
git commit -m "feat: add shareable shelf page with OG metadata"
```

---

## Task 14: OG Image Generation

**Files:**
- Create: `src/app/api/og/[encoded]/route.tsx`

- [ ] **Step 1: Build the OG image route**

Create `src/app/api/og/[encoded]/route.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { decodeShelfData } from "@/lib/share";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [180, 160, 190, 150, 170];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ encoded: string }> }
) {
  const { encoded } = await params;
  const data = decodeShelfData(encoded);

  if (!data) {
    return new Response("Invalid shelf data", { status: 400 });
  }

  const fontBold = await readFile(
    join(process.cwd(), "public/fonts/SpaceMono-Bold.ttf")
  );
  const fontRegular = await readFile(
    join(process.cwd(), "public/fonts/SpaceMono-Regular.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "SpaceMono",
        }}
      >
        <p
          style={{
            fontSize: 14,
            letterSpacing: 4,
            color: "#6b7280",
            marginBottom: 24,
          }}
        >
          MY TOP {data.games.length}
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            height: 200,
            marginBottom: 24,
          }}
        >
          {data.games.map((game, i) => (
            <div
              key={game.bggId}
              style={{
                width: 60,
                height: spineHeights[i % spineHeights.length],
                backgroundColor: spineColors[i % spineColors.length],
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 4px",
              }}
            >
              <p
                style={{
                  writingMode: "vertical-rl",
                  fontSize: 11,
                  fontWeight: 700,
                  color: [1, 3].includes(i % 5) ? "#fff" : "#000",
                  textAlign: "center",
                }}
              >
                {game.name.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            width: 320,
            height: 4,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            marginBottom: 20,
          }}
        />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
          rollfor.fun
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
          Roll for your next obsession
        </p>
      </div>
    ),
    {
      width: 600,
      height: 400,
      fonts: [
        { name: "SpaceMono", data: fontRegular, weight: 400 },
        { name: "SpaceMono", data: fontBold, weight: 700 },
      ],
    }
  );
}
```

- [ ] **Step 2: Verify OG image renders**

Visit `/api/og/<encoded>` in the browser with a valid encoded shelf string. Expected: PNG image with the shelf visual, dark background, rollfor.fun branding.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/og/
git commit -m "feat: add OG image generation for shared shelves"
```

---

## Task 15: Polish and Final Integration

**Files:**
- Modify: `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Add step transitions**

Add CSS transitions to `globals.css` for smooth step changes:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

Wrap each step render in a `<div className="animate-fade-in" key={step}>`.

- [ ] **Step 2: Add .gitignore and .env.example**

Create `.gitignore` (Next.js default + extras):

```
node_modules/
.next/
.env*.local
.superpowers/
```

Create `.env.example`:

```
ANTHROPIC_API_KEY=your-api-key-here
```

- [ ] **Step 3: Full end-to-end test in browser**

Run: `npm run dev`
Walk through the entire flow:
1. Landing → ROLL
2. Scenario → pick one
3. Mood → pick one
4. Quiz → player count → length → complexity → favorites
5. Loading → dice animation
6. Swipe → like/skip cards
7. Results → match card + shelf + copy link
8. Copy link → open in new tab → shelf page renders with "Roll your own" CTA
9. Roll Again → starts over

- [ ] **Step 4: Run build to verify production readiness**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add transitions, gitignore, env example — v1 complete"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Project scaffold | layout, config, fonts |
| 2 | Types + seed data + filtering | types.ts, seed-games.json, seed-games.ts |
| 3 | BGG XML parsing + fetching | bgg.ts |
| 4 | Claude recommendation engine | claude.ts |
| 5 | Share URL encoding | share.ts |
| 6 | /api/recommend route | route.ts |
| 7 | Landing page | Landing.tsx, page.tsx |
| 8 | Scenario + Mood selects | ScenarioSelect.tsx, MoodSelect.tsx |
| 9 | Quiz steps | QuizStep.tsx |
| 10 | Loading + API call | LoadingState.tsx |
| 11 | Swipe cards | GameCard.tsx, SwipeCards.tsx |
| 12 | Results page | MatchCard, ShelfVisual, ShareButtons, Results |
| 13 | Shareable shelf page | /shelf/[encoded] |
| 14 | OG image generation | /api/og/[encoded] |
| 15 | Polish + final integration | transitions, gitignore, e2e test |
