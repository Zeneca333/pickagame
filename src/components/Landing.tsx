interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="font-mono text-xs tracking-[4px] text-gray-500 mb-4">
        BOARD GAME MATCHMAKER
      </p>
      <h1 className="font-mono text-4xl md:text-5xl font-bold mb-2 leading-tight">
        roll for your
        <br />
        next obsession_
      </h1>
      <p className="text-gray-400 text-sm max-w-md mb-8">
        answer a few quick questions. get matched with board games you&apos;ll
        actually want to play.
      </p>
      <button
        onClick={onStart}
        className="bg-accent text-black font-mono font-bold text-lg px-8 py-3 rounded hover:brightness-110 transition-all"
      >
        ROLL →
      </button>
      <p className="font-mono text-[11px] text-gray-600 mt-6">
        no sign-up. no bs. just games.
      </p>
    </div>
  );
}
