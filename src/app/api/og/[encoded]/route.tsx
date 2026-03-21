import { ImageResponse } from "next/og";
import { decodeShelfData } from "@/lib/share";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [180, 160, 190, 150, 170];

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
          backgroundColor: "#0a0a0a",
          fontFamily: "SpaceMono",
        }}
      >
        <p style={{ fontSize: 14, letterSpacing: 4, color: "#6b7280", marginBottom: 24 }}>
          MY TOP {data.games.length}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 200, marginBottom: 24 }}>
          {data.games.map((game, i) => (
            <div key={game.bggId} style={{
              width: 60, height: spineHeights[i % spineHeights.length],
              backgroundColor: spineColors[i % spineColors.length],
              borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "8px 4px",
            }}>
              <p style={{
                writingMode: "vertical-rl", fontSize: 11, fontWeight: 700,
                color: [1, 3].includes(i % 5) ? "#fff" : "#000", textAlign: "center",
              }}>
                {game.name.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
        <div style={{ width: 320, height: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2, marginBottom: 20 }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>rollfor.fun</p>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Roll for your next obsession</p>
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
