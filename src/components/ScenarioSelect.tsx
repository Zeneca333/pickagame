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
}

export default function ScenarioSelect({ onSelect }: ScenarioSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">STEP 1 OF 4</p>
      <h2 className="font-mono text-2xl font-bold mb-1">who&apos;s at the table?</h2>
      <p className="text-gray-500 text-sm mb-8">pick one</p>
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {scenarios.map((s) => (
          <button key={s.value} onClick={() => onSelect(s.value)}
            className="p-4 border border-white/15 rounded-md text-center hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="font-mono text-sm font-bold">{s.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
