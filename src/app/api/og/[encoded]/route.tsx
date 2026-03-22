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
          padding: "24px 48px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Dice icon */}
            <div style={{
              width: 36,
              height: 36,
              backgroundColor: "#e85d3a",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", width: 20, height: 20, gap: 2 }}>
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
            <span style={{ fontSize: 24, fontWeight: 700, color: "#e85d3a" }}>pickagame.fun</span>
          </div>
          <span style={{ fontSize: 13, letterSpacing: 4, color: "#8a857d", fontWeight: 700 }}>MY LINEUP</span>
        </div>

        {/* Games row — all 5 side by side */}
        <div style={{
          display: "flex",
          flex: 1,
          padding: "20px 48px 0",
          gap: 16,
        }}>
          {games.map((game, i) => (
            <div key={game.bggId} style={{
              display: "flex",
              flexDirection: "column",
              width: 200,
              backgroundColor: i === 0 ? "white" : "white",
              border: i === 0 ? "2px solid rgba(232, 93, 58, 0.3)" : "2px solid rgba(45, 42, 38, 0.08)",
              borderRadius: 14,
              overflow: "hidden",
            }}>
              {/* Rank badge + thumbnail */}
              <div style={{ display: "flex", position: "relative" }}>
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    width={200}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: 200,
                    height: 200,
                    backgroundColor: "#f0ede8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 48, color: "#ccc" }}>?</span>
                  </div>
                )}
                {/* Rank badge */}
                <div style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 28,
                  height: 28,
                  backgroundColor: i === 0 ? "#e85d3a" : "rgba(45, 42, 38, 0.7)",
                  color: "white",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  {i + 1}
                </div>
              </div>
              {/* Name + pitch */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 12px",
                flex: 1,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2d2a26",
                  lineHeight: 1.2,
                  marginBottom: 4,
                }}>
                  {game.name.length > 22 ? game.name.slice(0, 20) + "..." : game.name}
                </span>
                <span style={{
                  fontSize: 10,
                  color: "#8a857d",
                  fontStyle: "italic",
                  lineHeight: 1.4,
                }}>
                  {game.pitch.length > 60 ? game.pitch.slice(0, 57) + "..." : game.pitch}
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
          padding: "10px 48px 20px",
        }}>
          <span style={{ fontSize: 13, color: "#8a857d" }}>
            Pick your next obsession
          </span>
          <span style={{ fontSize: 12, color: "#8a857d" }}>
            built by Yoshizen Co
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
