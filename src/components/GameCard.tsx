import type { RecommendedGame } from "@/lib/types";

interface GameCardProps {
  game: RecommendedGame;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="border border-white/15 rounded-lg p-6 max-w-sm w-full bg-white/[0.02]">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-4">YOUR MATCH</p>
      <h3 className="font-mono text-2xl font-bold mb-3">{game.name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-4">
        {game.rating > 0 && (
          <div className="text-gray-400">
            <span className="text-gray-500 text-xs">Rating</span>
            <br />
            <span className="text-white">{game.rating}/10</span>
          </div>
        )}
        {game.playerCount && (
          <div className="text-gray-400">
            <span className="text-gray-500 text-xs">Players</span>
            <br />
            <span className="text-white">{game.playerCount}</span>
          </div>
        )}
        {game.playtime && (
          <div className="text-gray-400">
            <span className="text-gray-500 text-xs">Time</span>
            <br />
            <span className="text-white">{game.playtime}</span>
          </div>
        )}
        {game.weight > 0 && (
          <div className="text-gray-400">
            <span className="text-gray-500 text-xs">Complexity</span>
            <br />
            <span className="text-white">{game.weight}/5</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">
        &ldquo;{game.pitch}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        {[...game.mechanics, ...game.categories].slice(0, 3).map((tag) => (
          <span key={tag} className="px-3 py-1 border border-white/15 rounded font-mono text-[11px]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
