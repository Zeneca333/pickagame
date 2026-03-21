import Anthropic from "@anthropic-ai/sdk";
import type { UserInputs, RecommendedGame } from "./types";
import type { BggGameDetails } from "./bgg";

// Lazy initialization avoids throwing at module load when API key is absent
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic();
  }
  return _anthropic;
}

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

  const response = await getClient().messages.create({
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
