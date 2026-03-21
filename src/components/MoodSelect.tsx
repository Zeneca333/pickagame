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
}

export default function MoodSelect({ onSelect }: MoodSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">STEP 2 OF 4</p>
      <h2 className="font-mono text-2xl font-bold mb-1">what energy?</h2>
      <p className="text-gray-500 text-sm mb-8">pick your vibe</p>
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {moods.map((m) => (
          <button key={m.value} onClick={() => onSelect(m.value)}
            className="p-4 border border-white/15 rounded-md text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
            <div className="text-xl mb-1">{m.emoji}</div>
            <div className="font-mono text-sm font-bold">{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
