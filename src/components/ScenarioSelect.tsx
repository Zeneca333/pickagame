import type { Scenario } from "@/lib/types";

const scenarios: { value: Scenario; label: string; emoji: string }[] = [
  { value: "family-night", label: "Family Night", emoji: "👨‍👩‍👧‍👦" },
  { value: "date-night", label: "Date Night", emoji: "🍷" },
  { value: "friends-chaos", label: "Friends & Chaos", emoji: "🍻" },
  { value: "hardcore-crew", label: "Hardcore Crew", emoji: "🧠" },
  { value: "solo-quest", label: "Solo Quest", emoji: "🎧" },
  { value: "kids-in-mix", label: "Kids in the Mix", emoji: "🧒" },
];

interface ScenarioSelectProps {
  onSelect: (scenario: Scenario) => void;
  onBack: () => void;
}

export default function ScenarioSelect({ onSelect, onBack }: ScenarioSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <button onClick={onBack} className="font-mono text-sm text-muted hover:text-accent transition-colors mb-4">
        &larr; back
      </button>
      <p className="font-mono text-sm tracking-[3px] text-muted mb-2">STEP 1 OF 6</p>
      <h2 className="font-mono text-3xl font-bold mb-1 text-ink">who&apos;s at the table?</h2>
      <p className="text-muted text-base mb-8">pick one</p>
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        {scenarios.map((s) => (
          <button key={s.value} onClick={() => onSelect(s.value)}
            className="p-5 border-2 border-ink/10 rounded-xl text-center hover:border-accent hover:bg-accent-light transition-all cursor-pointer bg-bg-card shadow-sm">
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="font-mono text-base font-bold text-ink">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
