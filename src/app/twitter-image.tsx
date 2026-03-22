import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "pickagame.fun — Board Game Matchmaker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontBold = await readFile(
    join(process.cwd(), "public/fonts/SpaceMono-Bold.ttf")
  );
  const fontRegular = await readFile(
    join(process.cwd(), "public/fonts/SpaceMono-Regular.ttf")
  );

  // Sample game names to show variety
  const sampleGames = [
    "Wingspan", "Catan", "Ticket to Ride", "Codenames",
    "Azul", "7 Wonders", "Coup", "Pandemic",
  ];

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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent bar */}
        <div style={{ width: "100%", height: 6, backgroundColor: "#e85d3a", display: "flex" }} />

        {/* Background scattered game names — decorative */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          gap: 20,
          padding: 60,
          opacity: 0.06,
        }}>
          {[...sampleGames, ...sampleGames, ...sampleGames].map((name, i) => (
            <span key={i} style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#2d2a26",
              transform: `rotate(${(i % 5) * 3 - 6}deg)`,
            }}>
              {name}
            </span>
          ))}
        </div>

        {/* Center content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          zIndex: 1,
          gap: 0,
        }}>
          {/* Dice icon */}
          <div style={{
            width: 80,
            height: 80,
            backgroundColor: "#e85d3a",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 30px rgba(232, 93, 58, 0.3)",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", width: 44, height: 44, gap: 4 }}>
              <div style={{ width: 12, height: 12, backgroundColor: "white", borderRadius: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, backgroundColor: "white", borderRadius: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, backgroundColor: "white", borderRadius: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, backgroundColor: "white", borderRadius: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, display: "flex" }} />
              <div style={{ width: 12, height: 12, backgroundColor: "white", borderRadius: 12, display: "flex" }} />
            </div>
          </div>

          {/* Title */}
          <span style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#e85d3a",
            marginBottom: 16,
          }}>
            pickagame.fun
          </span>

          {/* Tagline */}
          <span style={{
            fontSize: 24,
            color: "#2d2a26",
            marginBottom: 40,
          }}>
            pick your next obsession
          </span>

          {/* Pill badges showing what you get */}
          <div style={{
            display: "flex",
            gap: 12,
          }}>
            {["Answer 6 questions", "Get 5 perfect matches", "AI-powered"].map((text) => (
              <div key={text} style={{
                display: "flex",
                padding: "10px 20px",
                backgroundColor: "white",
                border: "2px solid rgba(232, 93, 58, 0.2)",
                borderRadius: 50,
                fontSize: 14,
                color: "#6b6660",
                fontWeight: 400,
              }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          padding: "0 40px 24px",
        }}>
          <span style={{ fontSize: 13, color: "#8a857d" }}>
            built by Yoshizen Co · yoshizen.co
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "SpaceMono", data: fontRegular, weight: 400 },
        { name: "SpaceMono", data: fontBold, weight: 700 },
      ],
    }
  );
}
