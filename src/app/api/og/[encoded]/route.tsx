import { ImageResponse } from "next/og";
import { decodeShelfData } from "@/lib/share";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

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
          padding: "20px 48px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 32,
              height: 32,
              backgroundColor: "#e85d3a",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", width: 18, height: 18, gap: 2 }}>
                <div style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 10, display: "flex" }} />
                <div style={{ width: 5, height: 5, display: "flex" }} />
                <div style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 10, display: "flex" }} />
                <div style={{ width: 5, height: 5, display: "flex" }} />
                <div style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 10, display: "flex" }} />
                <div style={{ width: 5, height: 5, display: "flex" }} />
                <div style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 10, display: "flex" }} />
                <div style={{ width: 5, height: 5, display: "flex" }} />
                <div style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 10, display: "flex" }} />
              </div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#e85d3a" }}>pickagame.fun</span>
          </div>
          <span style={{ fontSize: 12, letterSpacing: 4, color: "#8a857d", fontWeight: 700 }}>MY LINEUP</span>
        </div>

        {/* Games row */}
        <div style={{
          display: "flex",
          flex: 1,
          padding: "16px 48px 0",
          gap: 14,
        }}>
          {games.map((game, i) => (
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
                    height={160}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: 204,
                    height: 160,
                    backgroundColor: "#f0ede8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 40, color: "#ccc" }}>?</span>
                  </div>
                )}
                {/* Rank badge */}
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

              {/* Info section */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 12px 12px",
                flex: 1,
              }}>
                {/* Name */}
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2d2a26",
                  lineHeight: 1.25,
                  marginBottom: 6,
                }}>
                  {game.name}
                </span>

                {/* Stats row */}
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 8,
                }}>
                  {game.playerCount && (
                    <span style={{
                      fontSize: 9,
                      color: "white",
                      backgroundColor: "#e85d3a",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}>
                      {game.playerCount}
                    </span>
                  )}
                  {game.playtime && (
                    <span style={{
                      fontSize: 9,
                      color: "#6b6660",
                      backgroundColor: "#f0ede8",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}>
                      {game.playtime}
                    </span>
                  )}
                  {game.weight && game.weight > 0 && (
                    <span style={{
                      fontSize: 9,
                      color: "#6b6660",
                      backgroundColor: "#f0ede8",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}>
                      {game.weight}/5
                    </span>
                  )}
                </div>

                {/* Pitch */}
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
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 48px 18px",
        }}>
          <span style={{ fontSize: 13, color: "#e85d3a", fontWeight: 700 }}>
            pickagame.fun
          </span>
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
