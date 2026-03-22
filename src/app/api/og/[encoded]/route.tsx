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

  const topPick = data.games[0];
  const runners = data.games.slice(1, 5);

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
          padding: 0,
          position: "relative",
        }}
      >
        {/* Accent bar at top */}
        <div style={{ width: "100%", height: 6, backgroundColor: "#e85d3a", display: "flex" }} />

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Dice icon */}
            <div style={{
              width: 32,
              height: 32,
              backgroundColor: "#e85d3a",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
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
          <span style={{ fontSize: 11, letterSpacing: 3, color: "#8a857d", fontWeight: 700 }}>MY LINEUP</span>
        </div>

        {/* Main content */}
        <div style={{
          display: "flex",
          flex: 1,
          padding: "8px 40px 0",
          gap: 24,
        }}>
          {/* Left: Top pick with large thumbnail */}
          {topPick && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: 420,
              border: "2px solid rgba(232, 93, 58, 0.25)",
              borderRadius: 16,
              backgroundColor: "white",
              overflow: "hidden",
            }}>
              <div style={{ display: "flex", gap: 16, padding: 16 }}>
                {/* Thumbnail */}
                {topPick.thumbnail ? (
                  <img
                    src={topPick.thumbnail}
                    width={130}
                    height={130}
                    style={{
                      objectFit: "cover",
                      borderRadius: 12,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 130,
                    height: 130,
                    backgroundColor: "#f0ede8",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 40, color: "#8a857d" }}>?</span>
                  </div>
                )}
                {/* Info */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                }}>
                  <span style={{
                    fontSize: 10,
                    letterSpacing: 3,
                    color: "#e85d3a",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}>
                    #1 TOP MATCH
                  </span>
                  <span style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2d2a26",
                    lineHeight: 1.2,
                    marginBottom: 8,
                  }}>
                    {topPick.name}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: "#6b6660",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    overflow: "hidden",
                  }}>
                    &ldquo;{topPick.pitch.length > 100 ? topPick.pitch.slice(0, 97) + "..." : topPick.pitch}&rdquo;
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Right: Runners #2-5 as a 2x2 grid */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            flex: 1,
          }}>
            {runners.map((game, i) => (
              <div key={game.bggId} style={{
                display: "flex",
                width: "calc(50% - 5px)",
                backgroundColor: "white",
                border: "2px solid rgba(45, 42, 38, 0.08)",
                borderRadius: 12,
                overflow: "hidden",
                gap: 10,
                padding: 10,
              }}>
                {/* Small thumbnail */}
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    width={70}
                    height={70}
                    style={{
                      objectFit: "cover",
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 70,
                    height: 70,
                    backgroundColor: "#f0ede8",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 24, color: "#8a857d" }}>?</span>
                  </div>
                )}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minWidth: 0,
                  justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: 10,
                    color: "#8a857d",
                    fontWeight: 700,
                    marginBottom: 3,
                  }}>
                    #{i + 2}
                  </span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2d2a26",
                    lineHeight: 1.2,
                  }}>
                    {game.name.length > 25 ? game.name.slice(0, 22) + "..." : game.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 40px 20px",
        }}>
          <span style={{ fontSize: 12, color: "#8a857d" }}>
            Pick your next obsession
          </span>
          <span style={{ fontSize: 11, color: "#8a857d" }}>
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
