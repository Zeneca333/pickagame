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
