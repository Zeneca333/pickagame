import type { RecommendedGame } from "@/lib/types";

interface MatchCardProps {
  game: RecommendedGame;
}

export default function MatchCard({ game }: MatchCardProps) {
  return (
    <div className="border border-white/15 rounded-lg p-8 max-w-sm w-full bg-white/[0.02] text-center">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-4">YOUR TOP MATCH</p>
      <h3 className="font-mono text-2xl font-bold mb-3">{game.name}</h3>
      <div className="flex justify-center gap-6 text-sm font-mono mb-4">
        {game.rating > 0 && (
          <div className="text-center">
            <div className="text-gray-500 text-[10px]">Rating</div>
            <div className="text-white">{game.rating}</div>
          </div>
        )}
        {game.playerCount && (
          <div className="text-center">
            <div className="text-gray-500 text-[10px]">Players</div>
            <div className="text-white">{game.playerCount}</div>
          </div>
        )}
        {game.playtime && (
          <div className="text-center">
            <div className="text-gray-500 text-[10px]">Time</div>
            <div className="text-white">{game.playtime}</div>
          </div>
        )}
        {game.weight > 0 && (
          <div className="text-center">
            <div className="text-gray-500 text-[10px]">Complexity</div>
            <div className="text-white">{game.weight}/5</div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-300 italic mb-5 leading-relaxed">
        &ldquo;{game.pitch}&rdquo;
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[...game.mechanics, ...game.categories].slice(0, 3).map((tag) => (
          <span key={tag} className="px-3 py-1 border border-white/15 rounded font-mono text-[11px]">
            {tag}
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] text-gray-600 mt-6">pickagame.fun</p>
    </div>
  );
}
