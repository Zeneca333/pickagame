export type Scenario =
  | "family-night"
  | "date-night"
  | "friends-chaos"
  | "hardcore-crew"
  | "solo-quest"
  | "kids-in-mix";

export type Mood =
  | "competitive"
  | "cozy"
  | "chaotic"
  | "brainy"
  | "social"
  | "chill";

export type PlayerCount = "2" | "3-4" | "5+" | "any";
export type GameLength = "under-30" | "30-60" | "60-120" | "marathon";
export type Complexity = "easy" | "some-strategy" | "brain-burner";
export type Discovery = "popular" | "hidden-gems" | "surprise-me";
export type Tier = "popular" | "classic" | "hidden-gem";

export interface UserInputs {
  scenario: Scenario;
  mood: Mood;
  playerCount: PlayerCount;
  gameLength: GameLength;
  complexity: Complexity;
  discovery: Discovery;
  favorites?: string;
}

export interface SeedGame {
  bggId: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  weight: number; // 1-5 BGG complexity weight
  categories: string[];
  mechanics: string[];
  tier: Tier;
  thumbnail?: string;
}

export interface RecommendedGame {
  rank: number;
  name: string;
  bggId: number;
  rating: number;
  playerCount: string;
  playtime: string;
  weight: number;
  pitch: string;
  matchReason: string;
  mechanics: string[];
  categories: string[];
  thumbnail: string;
}

export interface ShelfData {
  games: Array<{
    name: string;
    bggId: number;
    pitch: string;
    thumbnail?: string;
  }>;
}

export type FlowStep =
  | "landing"
  | "scenario"
  | "mood"
  | "quiz-playercount"
  | "quiz-length"
  | "quiz-complexity"
  | "quiz-discovery"
  | "loading"
  | "results";
