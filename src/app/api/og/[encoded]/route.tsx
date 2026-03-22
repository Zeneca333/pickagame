import { ImageResponse } from "next/og";
import { decodeShelfData } from "@/lib/share";
import { readFile } from "fs/promises";
import { join } from "path";
import type { Scenario, Mood, GameLength, Complexity, Discovery, PlayerCount } from "@/lib/types";

export const runtime = "nodejs";

function StatPill({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <span style={{
      fontSize: 9,
      color: accent ? "white" : "#6b6660",
      backgroundColor: accent ? "#e85d3a" : "#f0ede8",
      padding: "3px 7px",
      borderRadius: 4,
      fontWeight: 700,
      display: "flex",
    }}>
      {text}
    </span>
  );
}

const SCENARIO_LABELS: Record<Scenario, string> = {
  "family-night": "family game night",
  "date-night": "date night",
  "friends-chaos": "chaotic friend hangout",
  "hardcore-crew": "serious gaming session",
  "solo-quest": "solo adventure",
  "kids-in-mix": "playing with kids",
};

const MOOD_LABELS: Record<Mood, string> = {
  competitive: "competitive",
  cozy: "cozy",
  chaotic: "chaotic",
  brainy: "brainy",
  social: "social",
  chill: "chill",
};

const LENGTH_LABELS: Record<GameLength, string> = {
  "under-30": "quick games",
  "30-60": "30\u201360 min sessions",
  "60-120": "1\u20132 hour commitments",
  marathon: "marathon sessions",
};

const COMPLEXITY_LABELS: Record<Complexity, string> = {
  easy: "easy to pick up",
  "some-strategy": "some strategy",
  "brain-burner": "full brain-burners",
};

const PLAYER_LABELS: Record<PlayerCount, string> = {
  "1": "1 player",
  "2": "2 players",
  "3-4": "3\u20134 players",
  "5+": "5+ players",
  any: "any player count",
};

function buildSummary(data: {
  scenario?: Scenario;
  mood?: Mood;
  gameLength?: GameLength;
  complexity?: Complexity;
  inputPlayerCount?: PlayerCount;
}): string {
  const parts: string[] = [];

  if (data.scenario) parts.push(`Picked for a ${SCENARIO_LABELS[data.scenario]}`);
  if (data.mood) parts.push(`${MOOD_LABELS[data.mood]} vibes`);
  if (data.inputPlayerCount) parts.push(PLAYER_LABELS[data.inputPlayerCount]);
  if (data.gameLength) parts.push(LENGTH_LABELS[data.gameLength]);
  if (data.complexity) parts.push(COMPLEXITY_LABELS[data.complexity]);

  if (parts.length === 0) return "5 games picked just for you — find yours at pickagame.fun";

  return parts.join(" · ");
}

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

  const games = data.games.slice(0, 5);
  const summary = buildSummary(data);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf7f2",
          fontFamily: "SpaceMono",
        }}
      >
        {/* Accent bar */}
        <div style={{ width: "100%", height: 5, backgroundColor: "#e85d3a", display: "flex" }} />

        {/* Header row */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 48px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Dice icon — 5-dot pattern */}
            <div style={{
              width: 36,
              height: 36,
              backgroundColor: "#e85d3a",
              borderRadius: 8,
              display: "flex",
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: 6, left: 6, width: 7, height: 7, backgroundColor: "white", borderRadius: 7, display: "flex" }} />
              <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, backgroundColor: "white", borderRadius: 7, display: "flex" }} />
              <div style={{ position: "absolute", top: 14, left: 14, width: 7, height: 7, backgroundColor: "white", borderRadius: 7, display: "flex" }} />
              <div style={{ position: "absolute", bottom: 6, left: 6, width: 7, height: 7, backgroundColor: "white", borderRadius: 7, display: "flex" }} />
              <div style={{ position: "absolute", bottom: 6, right: 6, width: 7, height: 7, backgroundColor: "white", borderRadius: 7, display: "flex" }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#e85d3a" }}>pickagame.fun</span>
          </div>
          <span style={{ fontSize: 12, letterSpacing: 4, color: "#8a857d", fontWeight: 700 }}>MY LINEUP</span>
        </div>

        {/* Games row — compact, no stretch */}
        <div style={{
          display: "flex",
          padding: "14px 48px 0",
          gap: 14,
        }}>
          {games.map((game, i) => {
            const stats: { text: string; accent?: boolean }[] = [];
            if (game.playerCount) stats.push({ text: game.playerCount, accent: true });
            if (game.playtime) stats.push({ text: game.playtime });
            if (game.weight && game.weight > 0) stats.push({ text: `${game.weight}/5` });

            return (
              <div key={game.bggId} style={{
                display: "flex",
                flexDirection: "column",
                width: 204,
                backgroundColor: "white",
                border: i === 0 ? "2px solid rgba(232, 93, 58, 0.3)" : "2px solid rgba(45, 42, 38, 0.08)",
                borderRadius: 14,
                overflow: "hidden",
              }}>
                {/* Thumbnail */}
                <div style={{ display: "flex", position: "relative" }}>
                  {game.thumbnail ? (
                    <img
                      src={game.thumbnail}
                      width={204}
                      height={170}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 204,
                      height: 170,
                      backgroundColor: "#f0ede8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 40, color: "#ccc" }}>?</span>
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    width: 26,
                    height: 26,
                    backgroundColor: i === 0 ? "#e85d3a" : "rgba(45, 42, 38, 0.75)",
                    color: "white",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                </div>

                {/* Info */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 12px 12px",
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2d2a26",
                    lineHeight: 1.25,
                    marginBottom: 6,
                  }}>
                    {game.name}
                  </span>

                  {stats.length > 0 ? (
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 5,
                      marginBottom: 8,
                    }}>
                      {stats.map((s) => (
                        <StatPill key={s.text} text={s.text} accent={s.accent} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", marginBottom: 8 }} />
                  )}

                  <span style={{
                    fontSize: 10,
                    color: "#8a857d",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}>
                    {game.pitch}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary banner — fills remaining space */}
        <div style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "0 48px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(232, 93, 58, 0.06)",
            borderRadius: 12,
            padding: "14px 32px",
            width: "100%",
          }}>
            <span style={{
              fontSize: 14,
              color: "#6b6660",
              textAlign: "center",
              lineHeight: 1.5,
            }}>
              {summary}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 48px 14px",
        }}>
          <span style={{ fontSize: 12, color: "#8a857d" }}>
            built by yoshizen.co
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "SpaceMono", data: fontRegular, weight: 400 },
        { name: "SpaceMono", data: fontBold, weight: 700 },
      ],
    }
  );
}
