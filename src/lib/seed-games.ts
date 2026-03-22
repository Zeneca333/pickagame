import seedGames from "../data/seed-games.json";
import type { SeedGame, UserInputs, Scenario, Mood, Discovery } from "./types";

const games: SeedGame[] = seedGames as SeedGame[];

function getPlayerRange(playerCount: string): { min: number; max: number } {
  switch (playerCount) {
    case "1": return { min: 1, max: 1 };
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
    case "brain-burner": return { min: 3.01, max: 5.0 };
    default: return { min: 0, max: 5.0 };
  }
}

const SCENARIO_CATEGORIES: Record<Scenario, string[]> = {
  "family-night": ["Family", "Animals", "Nature", "Puzzle", "Travel"],
  "date-night": ["Abstract", "Puzzle", "Card Game", "Economic"],
  "friends-chaos": ["Party", "Bluffing", "Negotiation", "Fighting", "Word Game"],
  "hardcore-crew": ["Strategy", "Economic", "Sci-Fi", "Wargame", "Industrial"],
  "solo-quest": ["Adventure", "Fantasy", "Puzzle", "Sci-Fi"],
  "kids-in-mix": ["Family", "Animals", "Dexterity", "Party"],
};

const MOOD_MECHANICS: Record<Mood, string[]> = {
  competitive: ["Area Control", "Auction", "Drafting", "Trading"],
  cozy: ["Set Collection", "Tile Placement", "Engine Building", "Route Building"],
  chaotic: ["Dice Rolling", "Press Your Luck", "Real-Time", "Bluffing", "Traitor"],
  brainy: ["Worker Placement", "Hand Management", "Network Building", "Deck Building"],
  social: ["Team-Based", "Negotiation", "Cooperative", "Deduction", "Bluffing"],
  chill: ["Set Collection", "Tile Placement", "Cooperative", "Route Building"],
};

function scoreGame(game: SeedGame, inputs: UserInputs): number {
  let score = 0;

  // Scenario → category match (0-3 points)
  const scenarioCategories = SCENARIO_CATEGORIES[inputs.scenario] || [];
  const categoryMatches = game.categories.filter((c) => scenarioCategories.includes(c)).length;
  score += Math.min(categoryMatches * 1.5, 3);

  // Mood → mechanic match (0-3 points)
  const moodMechanics = MOOD_MECHANICS[inputs.mood] || [];
  const mechanicMatches = game.mechanics.filter((m) => moodMechanics.includes(m)).length;
  score += Math.min(mechanicMatches * 1.5, 3);

  // Discovery preference (0-2 points)
  if (inputs.discovery === "popular" && game.tier === "popular") score += 2;
  else if (inputs.discovery === "hidden-gems" && game.tier === "hidden-gem") score += 2;
  else if (inputs.discovery === "hidden-gems" && game.tier === "classic") score += 1;
  else if (inputs.discovery === "surprise-me") score += 1; // flat boost, let randomness do its thing

  return score;
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

export function scoreSeedGames(candidates: SeedGame[], inputs: UserInputs): SeedGame[] {
  const scored = candidates.map((game) => ({
    game,
    score: scoreGame(game, inputs),
  }));

  // Sort by score descending, then add slight randomness for variety
  scored.sort((a, b) => {
    const diff = b.score - a.score;
    if (Math.abs(diff) < 0.5) return Math.random() - 0.5; // shuffle near-ties
    return diff;
  });

  // For "surprise-me", shuffle the top candidates more aggressively
  if (inputs.discovery === "surprise-me") {
    const top = scored.slice(0, Math.min(30, scored.length));
    for (let i = top.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]];
    }
    return top.map((s) => s.game).slice(0, 15);
  }

  // Return top 15 candidates for the AI to pick from
  return scored.map((s) => s.game).slice(0, 15);
}
