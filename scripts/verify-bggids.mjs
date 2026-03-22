// Verifies bggIds by checking the BGG thing name via geekdo API
// Flags mismatches where the BGG-listed name doesn't match our name
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../src/data/seed-games.json");
const games = JSON.parse(readFileSync(seedPath, "utf-8"));

// Use BGG xmlapi2 search to find correct bggId by exact name
async function searchBgg(name) {
  try {
    const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(name)}&type=boardgame&exact=1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const xml = await res.text();
    // Extract first result's id
    const match = xml.match(/item.*?id="(\d+)"/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

// Use geekdo API to get the actual game name for a bggId
async function getGameName(bggId) {
  try {
    // The geekdo thing API returns game info including name
    const url = `https://api.geekdo.com/api/geekitems?objectid=${bggId}&objecttype=thing&nosession=1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data.item?.name || null;
  } catch {
    return null;
  }
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/secondedition|2ndedition|thirdedition|3rdedition/g, "");
}

function namesMatch(a, b) {
  if (!a || !b) return false;
  const na = normalize(a);
  const nb = normalize(b);
  // Check if one contains the other (handles subtitles)
  return na === nb || na.includes(nb) || nb.includes(na);
}

console.log(`Verifying ${games.length} games...\n`);

const mismatches = [];
const bggSearchFailed = [];

for (let i = 0; i < games.length; i += 3) {
  const batch = games.slice(i, i + 3);
  const results = await Promise.all(
    batch.map(async (game) => {
      const actualName = await getGameName(game.bggId);
      if (!actualName) {
        return { game, status: "api-fail" };
      }
      if (namesMatch(game.name, actualName)) {
        return { game, status: "ok", actualName };
      }
      return { game, status: "mismatch", actualName };
    })
  );

  for (const r of results) {
    if (r.status === "ok") {
      process.stdout.write(".");
    } else if (r.status === "mismatch") {
      console.log(`\n  MISMATCH: "${r.game.name}" (${r.game.bggId}) -> BGG says: "${r.actualName}"`);

      // Try to find correct ID via search
      const correctId = await searchBgg(r.game.name);
      if (correctId && correctId !== r.game.bggId) {
        // Verify the search result
        const verifyName = await getGameName(correctId);
        if (verifyName && namesMatch(r.game.name, verifyName)) {
          console.log(`    FIXED: ${r.game.name} -> bggId ${correctId} (verified: "${verifyName}")`);
          r.game.bggId = correctId;
          r.game.thumbnail = ""; // Clear wrong thumbnail
          mismatches.push({ name: r.game.name, oldId: r.game.bggId, newId: correctId });
        } else {
          console.log(`    SEARCH found ${correctId} but verify says "${verifyName}" - skipping`);
          bggSearchFailed.push(r.game.name);
        }
      } else {
        console.log(`    Could not find correct ID via search`);
        bggSearchFailed.push(r.game.name);
      }
    } else {
      process.stdout.write("?");
    }
  }

  if (i + 3 < games.length) await new Promise((r) => setTimeout(r, 500));
}

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total games: ${games.length}`);
console.log(`Mismatches fixed: ${mismatches.length}`);
console.log(`Mismatches unresolved: ${bggSearchFailed.length}`);
if (bggSearchFailed.length > 0) {
  console.log(`Unresolved: ${bggSearchFailed.join(", ")}`);
}

// Save fixed file
writeFileSync(seedPath, JSON.stringify(games, null, 2) + "\n");
console.log(`\nSaved updated seed-games.json`);
