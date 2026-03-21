"use client";

import { useMemo } from "react";
import type { RecommendedGame } from "@/lib/types";
import { encodeShelfData } from "@/lib/share";
import MatchCard from "./MatchCard";
import ShelfVisual from "./ShelfVisual";
import ShareButtons from "./ShareButtons";

interface ResultsProps {
  shelf: RecommendedGame[];
  onRollAgain: () => void;
}

export default function Results({ shelf, onRollAgain }: ResultsProps) {
  const topPick = shelf[0];

  const shelfUrl = useMemo(() => {
    const encoded = encodeShelfData({
      games: shelf.map((g) => ({ name: g.name, bggId: g.bggId, pitch: g.pitch })),
    });
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shelf/${encoded}`;
    }
    return `/shelf/${encoded}`;
  }, [shelf]);

  if (shelf.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="font-mono text-gray-400 mb-4">No games added to shelf. Try again?</p>
        <button onClick={onRollAgain} className="px-6 py-3 bg-accent text-black font-mono font-bold rounded">
          ROLL AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 gap-12">
      {topPick && <MatchCard game={topPick} />}
      <ShelfVisual games={shelf} />
      <ShareButtons shelfUrl={shelfUrl} onRollAgain={onRollAgain} />
    </div>
  );
}
