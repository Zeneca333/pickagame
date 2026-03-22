"use client";

import { useEffect, useState } from "react";

const messages = [
  "Rolling the dice...",
  "Consulting the board game gods...",
  "Shuffling through the collection...",
  "Finding your perfect match...",
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="animate-spin text-5xl mb-6">🎲</div>
      <p className="font-mono text-xl text-muted animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
