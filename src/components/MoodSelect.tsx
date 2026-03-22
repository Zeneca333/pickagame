import type { Mood } from "@/lib/types";

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: "competitive", label: "Competitive", emoji: "⚔️" },
  { value: "cozy", label: "Cozy", emoji: "☕" },
  { value: "chaotic", label: "Chaotic", emoji: "🌪️" },
  { value: "brainy", label: "Brainy", emoji: "🧩" },
  { value: "social", label: "Social", emoji: "💬" },
  { value: "chill", label: "Chill", emoji: "🌊" },
];

interface MoodSelectProps {
  onSelect: (mood: Mood) => void;
  onBack: () => void;
}

export default function MoodSelect({ onSelect, onBack }: MoodSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <button onClick={onBack} className="font-mono text-sm text-muted hover:text-accent transition-colors mb-4">
        &larr; back
      </button>
      <p className="font-mono text-sm tracking-[3px] text-muted mb-2">STEP 2 OF 6</p>
      <h2 className="font-mono text-3xl font-bold mb-1 text-ink">what energy?</h2>
      <p className="text-muted text-base mb-8">pick your vibe</p>
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {moods.map((m) => (
          <button key={m.value} onClick={() => onSelect(m.value)}
            className="p-5 border-2 border-ink/10 rounded-xl text-center hover:border-accent hover:bg-accent-light transition-all cursor-pointer bg-bg-card shadow-sm">
            <div className="text-2xl mb-2">{m.emoji}</div>
            <div className="font-mono text-base font-bold text-ink">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
