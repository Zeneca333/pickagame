import { Metadata } from "next";
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
    : "rollfor.fun — Board Game Matchmaker";

  return {
    title,
    description: "Check out my board game shelf! Roll for your own at rollfor.fun",
    openGraph: {
      title: "My Board Game Shelf",
      description: data
        ? data.games.map((g) => g.name).join(" · ")
        : "Roll for your next obsession",
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
        <a href="/" className="mt-4 text-accent font-mono text-sm hover:underline">
          Roll your own →
        </a>
      </div>
    );
  }

  return <ShelfPageClient data={data} />;
}
