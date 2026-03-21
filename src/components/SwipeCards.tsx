"use client";

import { useState } from "react";
import type { RecommendedGame } from "@/lib/types";
import GameCard from "./GameCard";

interface SwipeCardsProps {
  games: RecommendedGame[];
  onComplete: (liked: RecommendedGame[]) => void;
}

export default function SwipeCards({ games, onComplete }: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<RecommendedGame[]>([]);

  const currentGame = games[currentIndex];
  const remaining = games.length - currentIndex;
  const shelfCount = liked.length;

  function handleLike() {
    const newLiked = [...liked, currentGame];
    setLiked(newLiked);
    if (newLiked.length >= 5 || currentIndex >= games.length - 1) {
      onComplete(newLiked);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleSkip() {
    if (currentIndex >= games.length - 1) {
      onComplete(liked);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  if (!currentGame) {
    onComplete(liked);
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="flex items-center gap-4 mb-6">
        <p className="font-mono text-xs text-gray-500">{remaining} remaining</p>
        <p className="font-mono text-xs text-accent">{shelfCount}/5 on shelf</p>
      </div>
      <div className="w-full max-w-sm h-1 bg-white/10 rounded-full mb-6">
        <div className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / games.length) * 100}%` }} />
      </div>
      <GameCard game={currentGame} />
      <div className="flex gap-3 mt-6">
        <button onClick={handleSkip}
          className="px-6 py-3 border border-white/15 font-mono text-sm rounded hover:border-white/30 transition-all">
          SKIP
        </button>
        <button onClick={handleLike}
          className="px-6 py-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all">
          ADD TO SHELF ✓
        </button>
      </div>
    </div>
  );
}
