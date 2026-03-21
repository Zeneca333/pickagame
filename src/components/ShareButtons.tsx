"use client";

interface ShareButtonsProps {
  shelfUrl: string;
  onRollAgain: () => void;
}

export default function ShareButtons({ shelfUrl, onRollAgain }: ShareButtonsProps) {
  async function handleCopyLink() {
    await navigator.clipboard.writeText(shelfUrl);
  }

  return (
    <div className="flex gap-3">
      <button onClick={handleCopyLink}
        className="px-5 py-2.5 bg-accent text-black font-mono font-bold text-xs rounded hover:brightness-110 transition-all">
        COPY LINK
      </button>
      <button onClick={onRollAgain}
        className="px-5 py-2.5 border border-white/15 font-mono text-xs rounded text-gray-300 hover:border-accent transition-all">
        ROLL AGAIN
      </button>
    </div>
  );
}
