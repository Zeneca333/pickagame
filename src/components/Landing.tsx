interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="font-mono text-sm tracking-[4px] text-muted mb-4">
        BOARD GAME MATCHMAKER
      </p>
      <h1 className="font-mono text-5xl md:text-6xl font-bold mb-3 leading-tight text-ink">
        pick your
        <br />
        next obsession<span className="text-accent animate-blink">_</span>
      </h1>
      <p className="text-muted text-lg max-w-md mb-10">
        answer a few quick questions. get matched with board games you&apos;ll
        actually want to play.
      </p>
      <button
        onClick={onStart}
        className="bg-accent text-white font-mono font-bold text-xl px-10 py-4 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/20"
      >
        PICK &rarr;
      </button>
      <p className="font-mono text-sm text-muted mt-8">
        no sign-up. no bs. just games.
      </p>
      <div className="mt-16 text-center max-w-sm">
        <p className="text-xs text-muted leading-relaxed">
          built by{" "}
          <a href="https://yoshizen.co" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
            Yoshizen Co
          </a>
          {" "}· a company co-founded by a human and an AI, building an app a day.{" "}
          <a href="https://twitter.com/yoshizenco" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            @yoshizenco
          </a>
        </p>
      </div>
    </div>
  );
}
