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
        roll for your
        <br />
        next obsession<span className="text-accent">_</span>
      </h1>
      <p className="text-muted text-lg max-w-md mb-10">
        answer a few quick questions. get matched with board games you&apos;ll
        actually want to play.
      </p>
      <button
        onClick={onStart}
        className="bg-accent text-white font-mono font-bold text-xl px-10 py-4 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/20"
      >
        ROLL &rarr;
      </button>
      <p className="font-mono text-sm text-muted mt-8">
        no sign-up. no bs. just games.
      </p>
    </div>
  );
}
