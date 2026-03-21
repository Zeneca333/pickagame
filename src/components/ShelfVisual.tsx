import type { RecommendedGame } from "@/lib/types";

const spineColors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];
const spineHeights = [180, 160, 190, 150, 170];

interface ShelfVisualProps {
  games: RecommendedGame[];
}

export default function ShelfVisual({ games }: ShelfVisualProps) {
  return (
    <div className="text-center">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-6">YOUR TOP {games.length}</p>
      <div className="flex justify-center gap-1.5 items-end h-[200px] mb-6">
        {games.map((game, i) => (
          <div key={game.bggId} style={{
            width: 52, height: spineHeights[i % spineHeights.length],
            backgroundColor: spineColors[i % spineColors.length],
            borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
            writingMode: "vertical-rl", textOrientation: "mixed", padding: "8px 4px",
          }}>
            <span className="font-mono text-[10px] font-bold"
              style={{ color: [1, 3].includes(i % 5) ? "#fff" : "#000" }}>
              {game.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="w-72 h-1 bg-white/15 mx-auto rounded" />
      <p className="font-mono text-[10px] text-gray-600 mt-4">rollfor.fun</p>
    </div>
  );
}
