import type { RecommendedGame } from "@/lib/types";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [220, 195, 230, 185, 210];

interface ShelfVisualProps {
  games: RecommendedGame[];
}

export default function ShelfVisual({ games }: ShelfVisualProps) {
  return (
    <div className="text-center" id="shelf-visual">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-6">YOUR TOP {games.length}</p>
      <div className="flex justify-center gap-2 items-end h-[240px] mb-4">
        {games.map((game, i) => (
          <div key={game.bggId} style={{
            width: 72, height: spineHeights[i % spineHeights.length],
            backgroundColor: spineColors[i % spineColors.length],
            borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
            writingMode: "vertical-rl", textOrientation: "mixed", padding: "10px 6px",
          }}>
            <span className="font-mono font-bold"
              style={{
                fontSize: 12,
                color: [1, 3].includes(i % 5) ? "#fff" : "#000",
                letterSpacing: "0.5px",
              }}>
              {game.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-white/15 mx-auto rounded" style={{ width: games.length * 74 + 8 }} />
      <p className="font-mono text-[10px] text-gray-600 mt-4">pickagame.fun</p>
    </div>
  );
}
