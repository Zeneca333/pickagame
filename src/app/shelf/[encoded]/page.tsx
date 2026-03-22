import { Metadata } from "next";
import Link from "next/link";
import { decodeShelfData } from "@/lib/share";
import ShelfPageClient from "./client";

interface PageProps {
  params: Promise<{ encoded: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { encoded } = await params;
  const data = decodeShelfData(encoded);
  const title = data
    ? `My Board Game Shelf — ${data.games.map((g) => g.name).join(", ")}`
    : "pickagame.fun — Board Game Matchmaker";

  return {
    title,
    description: "Check out my board game picks! Get your own at pickagame.fun",
    openGraph: {
      title: "My Board Game Shelf",
      description: data
        ? data.games.map((g) => g.name).join(" · ")
        : "Pick your next obsession",
      images: [`/api/og/${encoded}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og/${encoded}`],
    },
  };
}

export default async function ShelfPage({ params }: PageProps) {
  const { encoded } = await params;
  const data = decodeShelfData(encoded);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="font-mono text-gray-400">Invalid shelf link.</p>
        <Link href="/" className="mt-4 text-accent font-mono text-sm hover:underline">
          Pick your own →
        </Link>
      </div>
    );
  }

  return <ShelfPageClient data={data} />;
}
