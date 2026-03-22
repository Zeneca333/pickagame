"use client";

import { useMemo } from "react";
import type { RecommendedGame } from "@/lib/types";
import { encodeShelfData } from "@/lib/share";
import ShareButtons from "./ShareButtons";

interface ResultsProps {
  games: RecommendedGame[];
  onRollAgain: () => void;
}

function bggUrl(bggId: number) {
  return `https://boardgamegeek.com/boardgame/${bggId}`;
}

export default function Results({ games, onRollAgain }: ResultsProps) {
  const topPick = games[0];
  const runners = games.slice(1);

  const encoded = useMemo(() => {
    return encodeShelfData({
      games: games.map((g) => ({ name: g.name, bggId: g.bggId, pitch: g.pitch })),
    });
  }, [games]);

  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shelf/${encoded}`;
    }
    return `/shelf/${encoded}`;
  }, [encoded]);

  const ogImageUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/og/${encoded}`;
    }
    return `/api/og/${encoded}`;
  }, [encoded]);

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="font-mono text-muted text-lg mb-4">No matches found. Try again?</p>
        <button onClick={onRollAgain} className="px-8 py-4 bg-accent text-white font-mono font-bold text-lg rounded-lg">
          PICK AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-16">
      <p className="font-mono text-sm tracking-[4px] text-muted mb-10">YOUR LINEUP</p>

      {/* Hero: #1 pick */}
      {topPick && (
        <a
          href={bggUrl(topPick.bggId)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-3xl mb-12 block group"
        >
          <div className="border-2 border-accent/20 rounded-2xl p-8 bg-bg-card shadow-md group-hover:border-accent/40 group-hover:shadow-lg transition-all">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="relative flex-shrink-0">
                <span className="absolute -top-4 -left-4 w-10 h-10 bg-accent text-white font-mono font-bold text-lg rounded-full flex items-center justify-center shadow-md">
                  1
                </span>
                {topPick.thumbnail ? (
                  <img
                    src={topPick.thumbnail}
                    alt={topPick.name}
                    className="w-48 h-48 object-cover rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="w-48 h-48 bg-bg-hover rounded-xl flex items-center justify-center">
                    <span className="text-muted text-4xl">?</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs tracking-[3px] text-accent font-bold mb-2">TOP MATCH</p>
                <h2 className="font-mono text-3xl font-bold mb-3 text-ink group-hover:text-accent transition-colors">{topPick.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm font-mono text-muted mb-4">
                  {topPick.playerCount && <span>{topPick.playerCount}</span>}
                  {topPick.playtime && <span>{topPick.playtime}</span>}
                  {topPick.weight > 0 && <span>{topPick.weight}/5 complexity</span>}
                </div>
                <p className="text-base text-ink/70 italic leading-relaxed">
                  &ldquo;{topPick.pitch}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Runners: #2-5 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl w-full mb-12">
        {runners.map((game, i) => (
          <a
            key={game.bggId}
            href={bggUrl(game.bggId)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-ink/8 rounded-xl p-4 bg-bg-card shadow-sm hover:border-accent/30 hover:shadow-md transition-all group block"
          >
            <div className="relative mb-4">
              <span className="absolute -top-3 -left-3 w-7 h-7 bg-ink/10 text-ink font-mono font-bold text-xs rounded-full flex items-center justify-center">
                {i + 2}
              </span>
              {game.thumbnail ? (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-bg-hover rounded-lg flex items-center justify-center">
                  <span className="text-muted text-2xl">?</span>
                </div>
              )}
            </div>
            <h3 className="font-mono text-sm font-bold leading-tight mb-2 text-ink group-hover:text-accent transition-colors">
              {game.name}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-muted mb-3">
              {game.playerCount && <span>{game.playerCount}</span>}
              {game.playtime && <span>{game.playtime}</span>}
            </div>
            <p className="text-xs text-ink/50 italic leading-relaxed">
              &ldquo;{game.pitch}&rdquo;
            </p>
          </a>
        ))}
      </div>

      <p className="font-mono text-sm text-muted mb-4">pickagame.fun</p>
      <p className="text-xs text-muted mb-8">
        built by{" "}
        <a href="https://yoshizen.co" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
          Yoshizen Co
        </a>
        {" "}·{" "}
        <a href="https://twitter.com/yoshizenco" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          @yoshizenco
        </a>
      </p>

      <ShareButtons shelfUrl={shareUrl} ogImageUrl={ogImageUrl} onRollAgain={onRollAgain} />
    </div>
  );
}
