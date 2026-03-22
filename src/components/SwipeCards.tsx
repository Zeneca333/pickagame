"use client";

import { useState } from "react";
import type { RecommendedGame } from "@/lib/types";

interface SwipeCardsProps {
  games: RecommendedGame[];
  onComplete: (liked: RecommendedGame[]) => void;
}

export default function SwipeCards({ games, onComplete }: SwipeCardsProps) {
  const [shelf, setShelf] = useState<Set<number>>(new Set());

  function toggleShelf(bggId: number) {
    setShelf((prev) => {
      const next = new Set(prev);
      if (next.has(bggId)) {
        next.delete(bggId);
      } else {
        next.add(bggId);
      }
      return next;
    });
  }

  function handleDone() {
    const liked = games.filter((g) => shelf.has(g.bggId));
    onComplete(liked);
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-12">
      <p className="font-mono text-[11px] tracking-[3px] text-gray-500 mb-2">YOUR MATCHES</p>
      <p className="font-mono text-sm text-gray-400 mb-8">
        Pick your favorites to build your shelf
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl w-full mb-10">
        {games.map((game) => {
          const onShelf = shelf.has(game.bggId);
          return (
            <div
              key={game.bggId}
              className={`relative border rounded-lg p-4 bg-white/[0.02] transition-all cursor-pointer ${
                onShelf
                  ? "border-accent bg-accent/5"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => toggleShelf(game.bggId)}
            >
              {onShelf && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">&#10003;</span>
                </div>
              )}

              {game.thumbnail ? (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full aspect-square object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full aspect-square bg-white/5 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl">?</span>
                </div>
              )}

              <h3 className="font-mono text-sm font-bold leading-tight mb-2 line-clamp-2">
                {game.name}
              </h3>

              <div className="flex gap-3 text-[10px] font-mono text-gray-500 mb-2">
                {game.rating > 0 && <span>{game.rating}/10</span>}
                {game.playerCount && <span>{game.playerCount}p</span>}
                {game.weight > 0 && <span>{game.weight}/5</span>}
              </div>

              <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-3">
                &ldquo;{game.pitch}&rdquo;
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShelf(game.bggId);
                }}
                className={`mt-3 w-full py-1.5 font-mono text-[10px] font-bold rounded transition-all ${
                  onShelf
                    ? "bg-accent text-black"
                    : "border border-white/15 text-gray-400 hover:border-accent hover:text-accent"
                }`}
              >
                {onShelf ? "ON SHELF ✓" : "ADD TO SHELF"}
              </button>
            </div>
          );
        })}
      </div>

      {shelf.size > 0 && (
        <div className="sticky bottom-6 animate-fade-in">
          <button
            onClick={handleDone}
            className="px-8 py-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all shadow-lg shadow-accent/20"
          >
            VIEW MY SHELF ({shelf.size})
          </button>
        </div>
      )}
    </div>
  );
}
