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
    discovery: "popular",
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
