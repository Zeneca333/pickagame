import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "pickagame.fun — Board Game Matchmaker",
  description:
    "Pick your next obsession. Answer a few questions, get matched with board games you'll actually want to play.",
  openGraph: {
    title: "pickagame.fun",
    description: "Answer a few vibes-based questions, get matched with board games you'll actually want to play.",
    type: "website",
    siteName: "pickagame.fun",
  },
  twitter: {
    card: "summary_large_image",
    title: "pickagame.fun — Board Game Matchmaker",
    description: "Answer a few vibes-based questions, get matched with board games you'll actually want to play.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
