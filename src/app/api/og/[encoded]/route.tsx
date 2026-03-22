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
  const runners = data.games.slice(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf7f2",
          fontFamily: "SpaceMono",
          padding: "40px",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: 4, color: "#8a857d", marginBottom: 20 }}>
          MY LINEUP
        </p>

        {topPick && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            border: "2px solid rgba(232, 93, 58, 0.2)",
            borderRadius: 16,
            padding: "16px 32px",
            backgroundColor: "#ffffff",
          }}>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#e85d3a", fontWeight: 700, marginBottom: 6 }}>
              TOP MATCH
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#2d2a26", marginBottom: 6 }}>
              {topPick.name}
            </p>
            <p style={{ fontSize: 12, color: "#8a857d", fontStyle: "italic" }}>
              &ldquo;{topPick.pitch}&rdquo;
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {runners.map((game, i) => (
            <div key={game.bggId} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 16px",
              border: "2px solid rgba(45, 42, 38, 0.08)",
              borderRadius: 12,
              minWidth: 100,
              maxWidth: 120,
              backgroundColor: "#ffffff",
            }}>
              <p style={{ fontSize: 10, color: "#8a857d", marginBottom: 4 }}>#{i + 2}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#2d2a26", textAlign: "center" }}>
                {game.name}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 16, fontWeight: 700, color: "#e85d3a" }}>pickagame.fun</p>
        <p style={{ fontSize: 12, color: "#8a857d", marginTop: 6 }}>Pick your next obsession</p>
      </div>
    ),
    {
      width: 600,
      height: 400,
      fonts: [
        { name: "SpaceMono", data: fontRegular, weight: 400 },
        { name: "SpaceMono", data: fontBold, weight: 700 },
      ],
    }
  );
}
