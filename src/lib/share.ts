import type { ShelfData } from "./types";

export function encodeShelfData(data: ShelfData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString("base64");
  // Make URL-safe: replace +/ with -_, remove =
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShelfData(encoded: string): ShelfData | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4 !== 0) base64 += "=";
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as ShelfData;
  } catch {
    return null;
  }
}
