import { XMLParser } from "fast-xml-parser";

export interface BggGameDetails {
  bggId: number;
  name: string;
  description: string;
  thumbnail: string;
  minPlayers: number;
  maxPlayers: number;
  minPlaytime: number;
  maxPlaytime: number;
  rating: number;
  weight: number;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const cache = new Map<string, { data: BggGameDetails[]; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function parseBggResponse(xml: string): BggGameDetails[] {
  const parsed = parser.parse(xml);
  const items = parsed.items?.item;
  if (!items) return [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.map((item: Record<string, unknown>) => {
    const names = item.name;
    const primaryName = Array.isArray(names)
      ? names.find((n: Record<string, string>) => n["@_type"] === "primary")?.["@_value"]
      : (names as Record<string, string>)?.["@_value"];

    const stats = (item.statistics as Record<string, unknown>)?.ratings as Record<string, Record<string, string>>;

    return {
      bggId: Number(item["@_id"]),
      name: primaryName || "Unknown",
      description: String(item.description || "").slice(0, 200),
      thumbnail: String(item.thumbnail || ""),
      minPlayers: Number((item.minplayers as Record<string, string>)?.["@_value"] || 0),
      maxPlayers: Number((item.maxplayers as Record<string, string>)?.["@_value"] || 0),
      minPlaytime: Number((item.minplaytime as Record<string, string>)?.["@_value"] || 0),
      maxPlaytime: Number((item.maxplaytime as Record<string, string>)?.["@_value"] || 0),
      rating: Number(Number(stats?.average?.["@_value"] || 0).toFixed(2)),
      weight: Number(Number(stats?.averageweight?.["@_value"] || 0).toFixed(2)),
    };
  });
}

export async function fetchBggDetails(bggIds: number[]): Promise<BggGameDetails[]> {
  const cacheKey = bggIds.sort().join(",");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  const results: BggGameDetails[] = [];
  // BGG allows max 20 IDs per request
  for (let i = 0; i < bggIds.length; i += 20) {
    const batch = bggIds.slice(i, i + 20);
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(",")}&stats=1`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const xml = await res.text();
    results.push(...parseBggResponse(xml));
  }

  cache.set(cacheKey, { data: results, expires: Date.now() + CACHE_TTL });
  return results;
}
