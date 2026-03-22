import OpenAI from "openai";
import type { UserInputs, RecommendedGame, SeedGame } from "./types";
import type { BggGameDetails } from "./bgg";

// Lazy initialization avoids throwing at module load when API key is absent
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.VENICE_API_KEY,
      baseURL: "https://api.venice.ai/api/v1",
    });
  }
  return _client;
}

export function buildPrompt(
  inputs: UserInputs,
  games: BggGameDetails[]
): { systemMessage: string; userMessage: string } {
  const systemMessage = `You are a board game sommelier — an expert at matching people with the perfect board game. You must return ONLY valid JSON, no other text.

Return a JSON object with a "games" array containing exactly 5 games, ranked from best match to worst. Each game object must have:
- "bggId": number (from the provided list)
- "name": string
- "pitch": string (one witty sentence selling this game to THIS specific person)
- "matchReason": string (why this fits their scenario and mood)
- "mechanics": string[] (2-3 key mechanics)
- "categories": string[] (1-2 categories)`;

  const gameList = games
    .map(
      (g) =>
        `- ${g.name} (ID: ${g.bggId}) | Rating: ${g.rating} | Players: ${g.minPlayers}-${g.maxPlayers} | Time: ${g.minPlaytime}-${g.maxPlaytime}min | Weight: ${g.weight}/5`
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

Pick the 5 best matches from this list. Return JSON only.`;

  return { systemMessage, userMessage };
}

function formatPlayers(min: number, max: number): string {
  if (min === max) return `${min}p`;
  return `${min}-${max}p`;
}

function formatPlaytime(min: number, max: number): string {
  if (min === max) return `~${min}min`;
  return `${min}-${max}min`;
}

export async function getRecommendations(
  inputs: UserInputs,
  games: BggGameDetails[],
  seedGames: SeedGame[]
): Promise<RecommendedGame[]> {
  // If BGG fetch failed, build BggGameDetails from seed data
  const effectiveGames =
    games.length > 0
      ? games
      : seedGames.map((s) => ({
          bggId: s.bggId,
          name: s.name,
          description: `${s.categories.join(", ")} game with ${s.mechanics.join(", ")}`,
          thumbnail: s.thumbnail || "",
          minPlayers: s.minPlayers,
          maxPlayers: s.maxPlayers,
          minPlaytime: s.minPlaytime,
          maxPlaytime: s.maxPlaytime,
          rating: 0,
          weight: s.weight,
        }));

  const { systemMessage, userMessage } = buildPrompt(inputs, effectiveGames);

  const response = await getClient().chat.completions.create({
    model: "gemini-3-flash-preview",
    max_tokens: 3000,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
  });

  let text = response.choices[0]?.message?.content || "";

  // Strip markdown code fences if present (e.g. ```json ... ```)
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  // Try to extract JSON if wrapped in other text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    text = jsonMatch[0];
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("[AI] Failed to parse response:", text.slice(0, 500));
    throw new Error("AI returned invalid JSON");
  }
  const recommended: RecommendedGame[] = parsed.games.map(
    (g: Record<string, unknown>, i: number) => {
      const bggGame = effectiveGames.find((bg) => bg.bggId === Number(g.bggId));
      const seed = seedGames.find((s) => s.bggId === Number(g.bggId));
      return {
        rank: i + 1,
        name: g.name as string,
        bggId: g.bggId as number,
        rating: bggGame?.rating || 0,
        playerCount: bggGame
          ? formatPlayers(bggGame.minPlayers, bggGame.maxPlayers)
          : seed
            ? formatPlayers(seed.minPlayers, seed.maxPlayers)
            : "",
        playtime: bggGame
          ? formatPlaytime(bggGame.minPlaytime, bggGame.maxPlaytime)
          : seed
            ? formatPlaytime(seed.minPlaytime, seed.maxPlaytime)
            : "",
        weight: bggGame?.weight || seed?.weight || 0,
        pitch: g.pitch as string,
        matchReason: g.matchReason as string,
        mechanics: g.mechanics as string[],
        categories: g.categories as string[],
        thumbnail: bggGame?.thumbnail || seed?.thumbnail || "",
      };
    }
  );

  // Ensure exactly 5 results — pad from unused seed games if AI returned fewer
  if (recommended.length < 5) {
    const usedIds = new Set(recommended.map((r) => r.bggId));
    const unused = seedGames.filter((s) => !usedIds.has(s.bggId));
    for (const s of unused) {
      if (recommended.length >= 5) break;
      recommended.push({
        rank: recommended.length + 1,
        name: s.name,
        bggId: s.bggId,
        rating: 0,
        playerCount: formatPlayers(s.minPlayers, s.maxPlayers),
        playtime: formatPlaytime(s.minPlaytime, s.maxPlaytime),
        weight: s.weight,
        pitch: `A ${s.categories[0]?.toLowerCase() || "great"} game worth checking out.`,
        matchReason: "",
        mechanics: s.mechanics,
        categories: s.categories,
        thumbnail: s.thumbnail || "",
      });
    }
  }

  return recommended.slice(0, 5);
}
