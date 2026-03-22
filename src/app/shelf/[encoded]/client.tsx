"use client";

import Link from "next/link";
import type { ShelfData } from "@/lib/types";

interface ShelfPageClientProps {
  data: ShelfData;
}

export default function ShelfPageClient({ data }: ShelfPageClientProps) {
  const topPick = data.games[0];
  const runners = data.games.slice(1);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <p className="font-mono text-sm tracking-[4px] text-muted mb-10">
        SOMEONE&apos;S LINEUP
      </p>

      {topPick && (
        <div className="w-full max-w-md mb-8">
          <div className="border-2 border-accent/20 rounded-2xl p-6 bg-bg-card shadow-md text-center">
            <p className="font-mono text-xs tracking-[3px] text-accent font-bold mb-2">TOP MATCH</p>
            <h2 className="font-mono text-2xl font-bold mb-3 text-ink">{topPick.name}</h2>
            <p className="text-base text-ink/60 italic">&ldquo;{topPick.pitch}&rdquo;</p>
          </div>
        </div>
      )}

      {runners.length > 0 && (
        <div className="grid grid-cols-2 gap-4 max-w-md w-full mb-10">
          {runners.map((game, i) => (
            <div key={game.bggId} className="border-2 border-ink/8 rounded-xl p-4 bg-bg-card shadow-sm">
              <div className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted mt-0.5">#{i + 2}</span>
                <div>
                  <h3 className="font-mono text-sm font-bold leading-tight text-ink">{game.name}</h3>
                  <p className="text-xs text-ink/50 italic mt-1 line-clamp-2">
                    &ldquo;{game.pitch}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/" className="px-8 py-4 bg-accent text-white font-mono font-bold text-base rounded-lg hover:brightness-110 transition-all shadow-sm">
        PICK YOUR OWN &rarr;
      </Link>
      <p className="font-mono text-sm text-muted mt-8">pickagame.fun</p>
    </div>
  );
}
