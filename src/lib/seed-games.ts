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
    case "brain-burner": return { min: 3.01, max: 5.0 };
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
