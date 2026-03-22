import { NextRequest, NextResponse } from "next/server";
import type { UserInputs } from "@/lib/types";
import { filterSeedGames, scoreSeedGames } from "@/lib/seed-games";
import { fetchBggDetails } from "@/lib/bgg";
import { getRecommendations } from "@/lib/claude";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as UserInputs;

    // Validate required fields
    if (!body.scenario || !body.mood || !body.playerCount || !body.gameLength || !body.complexity || !body.discovery) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Filter seed games by hard constraints, then score by relevance
    const filtered = filterSeedGames(body);
    if (filtered.length === 0) {
      return NextResponse.json(
        { error: "No games match your criteria. Try broader preferences." },
        { status: 404 }
      );
    }
    const candidates = scoreSeedGames(filtered, body);

    // Fetch fresh details from BGG
    const bggIds = candidates.map((g) => g.bggId);
    const bggDetails = await fetchBggDetails(bggIds);

    // Get AI recommendations (pass seed games as fallback for thumbnails/stats)
    const recommendations = await getRecommendations(body, bggDetails, candidates);

    return NextResponse.json({ games: recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations. Please try again." },
      { status: 500 }
    );
  }
}
