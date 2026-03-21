"use client";

import { useState, useEffect } from "react";
import type { FlowStep, Scenario, Mood, PlayerCount, GameLength, Complexity, RecommendedGame } from "@/lib/types";
import Landing from "@/components/Landing";
import ScenarioSelect from "@/components/ScenarioSelect";
import MoodSelect from "@/components/MoodSelect";
import QuizStep from "@/components/QuizStep";

export default function Home() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [playerCount, setPlayerCount] = useState<PlayerCount | null>(null);
  const [gameLength, setGameLength] = useState<GameLength | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [favorites, setFavorites] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [shelf, setShelf] = useState<RecommendedGame[]>([]);

  return (
    <main className="min-h-screen">
      {step === "landing" && <Landing onStart={() => setStep("scenario")} />}
      {step === "scenario" && (
        <ScenarioSelect onSelect={(s) => { setScenario(s); setStep("mood"); }} />
      )}
      {step === "mood" && (
        <MoodSelect onSelect={(m) => { setMood(m); setStep("quiz-playercount"); }} />
      )}
      {step === "quiz-playercount" && (
        <QuizStep
          stepNumber="STEP 3 OF 4"
          question="how many players?"
          options={[
            { value: "2", label: "Just 2 of us" },
            { value: "3-4", label: "3-4 players" },
            { value: "5+", label: "5 or more" },
            { value: "any", label: "Don't care" },
          ]}
          onSelect={(v) => { setPlayerCount(v as PlayerCount); setStep("quiz-length"); }}
        />
      )}
      {step === "quiz-length" && (
        <QuizStep
          stepNumber="STEP 3 OF 4"
          question="how long you got?"
          options={[
            { value: "under-30", label: "Quick — under 30 min" },
            { value: "30-60", label: "Standard — 30 to 60 min" },
            { value: "60-120", label: "Committed — 1 to 2 hours" },
            { value: "marathon", label: "Marathon — 2+ hours" },
          ]}
          onSelect={(v) => { setGameLength(v as GameLength); setStep("quiz-complexity"); }}
        />
      )}
      {step === "quiz-complexity" && (
        <QuizStep
          stepNumber="STEP 3 OF 4"
          question="how crunchy?"
          options={[
            { value: "easy", label: "Easy to learn, hard to put down" },
            { value: "some-strategy", label: "Some strategy, some luck" },
            { value: "brain-burner", label: "Full brain-burner" },
          ]}
          onSelect={(v) => { setComplexity(v as Complexity); setStep("quiz-favorites"); }}
        />
      )}
      {step === "quiz-favorites" && (
        <QuizStep
          stepNumber="STEP 4 OF 4"
          question="any games you already love?"
          options={[]}
          onSelect={() => {}}
          showTextInput
          textPlaceholder="e.g. Catan, Wingspan, Codenames..."
          onTextSubmit={(v) => { setFavorites(v); setStep("loading"); }}
        />
      )}
      {/* Loading, Swipe, and Results steps will be added in Tasks 10-12 */}
      {(step === "loading" || step === "swipe" || step === "results") && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="font-mono text-gray-500">Step: {step} (coming soon)</p>
        </div>
      )}
    </main>
  );
}
