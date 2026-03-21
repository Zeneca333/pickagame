"use client";

import { useState, useEffect } from "react";
import type { FlowStep, Scenario, Mood, PlayerCount, GameLength, Complexity, RecommendedGame } from "@/lib/types";
import Landing from "@/components/Landing";
import ScenarioSelect from "@/components/ScenarioSelect";
import MoodSelect from "@/components/MoodSelect";
import QuizStep from "@/components/QuizStep";
import LoadingState from "@/components/LoadingState";
import SwipeCards from "@/components/SwipeCards";
import Results from "@/components/Results";

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

  useEffect(() => {
    if (step !== "loading") return;
    if (!scenario || !mood || !playerCount || !gameLength || !complexity) return;

    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario, mood, playerCount, gameLength, complexity,
            favorites: favorites || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to get recommendations");
        const data = await res.json();
        setRecommendations(data.games);
        setStep("swipe");
      } catch (error) {
        console.error(error);
        setStep("landing");
      }
    };

    fetchRecommendations();
  }, [step, scenario, mood, playerCount, gameLength, complexity, favorites]);

  function handleRollAgain() {
    setStep("landing");
    setScenario(null);
    setMood(null);
    setPlayerCount(null);
    setGameLength(null);
    setComplexity(null);
    setFavorites("");
    setRecommendations([]);
    setShelf([]);
  }

  return (
    <main className="min-h-screen">
      {step === "landing" && (
        <div className="animate-fade-in" key="landing">
          <Landing onStart={() => setStep("scenario")} />
        </div>
      )}
      {step === "scenario" && (
        <div className="animate-fade-in" key="scenario">
          <ScenarioSelect onSelect={(s) => { setScenario(s); setStep("mood"); }} />
        </div>
      )}
      {step === "mood" && (
        <div className="animate-fade-in" key="mood">
          <MoodSelect onSelect={(m) => { setMood(m); setStep("quiz-playercount"); }} />
        </div>
      )}
      {step === "quiz-playercount" && (
        <div className="animate-fade-in" key="quiz-playercount">
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
        </div>
      )}
      {step === "quiz-length" && (
        <div className="animate-fade-in" key="quiz-length">
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
        </div>
      )}
      {step === "quiz-complexity" && (
        <div className="animate-fade-in" key="quiz-complexity">
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
        </div>
      )}
      {step === "quiz-favorites" && (
        <div className="animate-fade-in" key="quiz-favorites">
          <QuizStep
            stepNumber="STEP 4 OF 4"
            question="any games you already love?"
            options={[]}
            onSelect={() => {}}
            showTextInput
            textPlaceholder="e.g. Catan, Wingspan, Codenames..."
            onTextSubmit={(v) => { setFavorites(v); setStep("loading"); }}
          />
        </div>
      )}
      {step === "loading" && (
        <div className="animate-fade-in" key="loading">
          <LoadingState />
        </div>
      )}
      {step === "swipe" && (
        <div className="animate-fade-in" key="swipe">
          <SwipeCards games={recommendations} onComplete={(liked) => { setShelf(liked); setStep("results"); }} />
        </div>
      )}
      {step === "results" && (
        <div className="animate-fade-in" key="results">
          <Results shelf={shelf} onRollAgain={handleRollAgain} />
        </div>
      )}
    </main>
  );
}
