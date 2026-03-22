"use client";

import { useState, useEffect } from "react";
import type { FlowStep, Scenario, Mood, PlayerCount, GameLength, Complexity, Discovery, RecommendedGame } from "@/lib/types";
import Landing from "@/components/Landing";
import ScenarioSelect from "@/components/ScenarioSelect";
import MoodSelect from "@/components/MoodSelect";
import QuizStep from "@/components/QuizStep";
import LoadingState from "@/components/LoadingState";
import Results from "@/components/Results";

export default function Home() {
  const [step, setStep] = useState<FlowStep>("landing");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [playerCount, setPlayerCount] = useState<PlayerCount | null>(null);
  const [gameLength, setGameLength] = useState<GameLength | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);

  useEffect(() => {
    if (step !== "loading") return;
    if (!scenario || !mood || !playerCount || !gameLength || !complexity || !discovery) return;

    const fetchRecommendations = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario, mood, playerCount, gameLength, complexity, discovery }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error ${res.status}`);
        }
        const data = await res.json();
        setRecommendations(data.games);
        setStep("results");
      } catch (error) {
        console.error(error);
        alert("Something went wrong — try again!");
        setStep("landing");
      }
    };

    fetchRecommendations();
  }, [step, scenario, mood, playerCount, gameLength, complexity, discovery]);

  function handleRollAgain() {
    setStep("landing");
    setScenario(null);
    setMood(null);
    setPlayerCount(null);
    setGameLength(null);
    setComplexity(null);
    setDiscovery(null);
    setRecommendations([]);
  }

  const skipsPlayerCount = scenario === "solo-quest" || scenario === "date-night";
  const totalSteps = skipsPlayerCount ? 5 : 6;

  return (
    <main className="min-h-screen">
      {step === "landing" && (
        <div className="animate-fade-in" key="landing">
          <Landing onStart={() => setStep("scenario")} />
        </div>
      )}
      {step === "scenario" && (
        <div className="animate-fade-in" key="scenario">
          <ScenarioSelect onSelect={(s) => { setScenario(s); setStep("mood"); }} onBack={() => setStep("landing")} />
        </div>
      )}
      {step === "mood" && (
        <div className="animate-fade-in" key="mood">
          <MoodSelect onSelect={(m) => {
            setMood(m);
            if (scenario === "solo-quest") {
              setPlayerCount("1");
              setStep("quiz-length");
            } else if (scenario === "date-night") {
              setPlayerCount("2");
              setStep("quiz-length");
            } else {
              setStep("quiz-playercount");
            }
          }} onBack={() => setStep("scenario")} />
        </div>
      )}
      {step === "quiz-playercount" && (
        <div className="animate-fade-in" key="quiz-playercount">
          <QuizStep
            stepNumber={`STEP 3 OF ${totalSteps}`}
            question="how many players?"
            options={[
              { value: "2", label: "Just 2 of us" },
              { value: "3-4", label: "3-4 players" },
              { value: "5+", label: "5 or more" },
              { value: "any", label: "Don't care" },
            ]}
            onSelect={(v) => { setPlayerCount(v as PlayerCount); setStep("quiz-length"); }}
            onBack={() => setStep("mood")}
          />
        </div>
      )}
      {step === "quiz-length" && (
        <div className="animate-fade-in" key="quiz-length">
          <QuizStep
            stepNumber={`STEP ${skipsPlayerCount ? 3 : 4} OF ${totalSteps}`}
            question="how long you got?"
            options={[
              { value: "under-30", label: "Quick — under 30 min" },
              { value: "30-60", label: "Standard — 30 to 60 min" },
              { value: "60-120", label: "Committed — 1 to 2 hours" },
              { value: "marathon", label: "Marathon — 2+ hours" },
            ]}
            onSelect={(v) => { setGameLength(v as GameLength); setStep("quiz-complexity"); }}
            onBack={() => setStep(scenario === "solo-quest" || scenario === "date-night" ? "mood" : "quiz-playercount")}
          />
        </div>
      )}
      {step === "quiz-complexity" && (
        <div className="animate-fade-in" key="quiz-complexity">
          <QuizStep
            stepNumber={`STEP ${skipsPlayerCount ? 4 : 5} OF ${totalSteps}`}
            question="how crunchy?"
            options={[
              { value: "easy", label: "Easy to learn, hard to put down" },
              { value: "some-strategy", label: "Some strategy, some luck" },
              { value: "brain-burner", label: "Full brain-burner" },
            ]}
            onSelect={(v) => { setComplexity(v as Complexity); setStep("quiz-discovery"); }}
            onBack={() => setStep("quiz-length")}
          />
        </div>
      )}
      {step === "quiz-discovery" && (
        <div className="animate-fade-in" key="quiz-discovery">
          <QuizStep
            stepNumber={`STEP ${skipsPlayerCount ? 5 : 6} OF ${totalSteps}`}
            question="what kind of picks?"
            options={[
              { value: "popular", label: "The hits — crowd favorites" },
              { value: "hidden-gems", label: "Hidden gems — surprise me" },
              { value: "surprise-me", label: "Mix it up — dealer's choice" },
            ]}
            onSelect={(v) => { setDiscovery(v as Discovery); setStep("loading"); }}
            onBack={() => setStep("quiz-complexity")}
          />
        </div>
      )}
      {step === "loading" && (
        <div className="animate-fade-in" key="loading">
          <LoadingState />
        </div>
      )}
      {step === "results" && (
        <div className="animate-fade-in" key="results">
          <Results
            games={recommendations}
            onRollAgain={handleRollAgain}
            scenario={scenario!}
            mood={mood!}
            playerCount={playerCount!}
            gameLength={gameLength!}
            complexity={complexity!}
            discovery={discovery!}
          />
        </div>
      )}
    </main>
  );
}
