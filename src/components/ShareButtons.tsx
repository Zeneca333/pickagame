"use client";

import { useState } from "react";

interface ShareButtonsProps {
  shelfUrl: string;
  ogImageUrl: string;
  onRollAgain: () => void;
}

export default function ShareButtons({ shelfUrl, ogImageUrl, onRollAgain }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shelfUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadImage() {
    try {
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-board-game-lineup.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image:", e);
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button onClick={handleDownloadImage}
        className="px-6 py-3 bg-accent text-white font-mono font-bold text-sm rounded-lg hover:brightness-110 transition-all shadow-sm">
        DOWNLOAD IMAGE
      </button>
      <button onClick={handleCopyLink}
        className="px-6 py-3 bg-ink/10 text-ink font-mono font-bold text-sm rounded-lg hover:bg-ink/15 transition-all">
        {copied ? "COPIED!" : "COPY LINK"}
      </button>
      <button onClick={onRollAgain}
        className="px-6 py-3 border-2 border-ink/10 font-mono text-sm rounded-lg text-muted hover:border-accent hover:text-accent transition-all">
        PICK AGAIN
      </button>
    </div>
  );
}
