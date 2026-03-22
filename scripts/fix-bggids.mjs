// Fixes wrong bggIds using geekdo search API
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../src/data/seed-games.json");
const games = JSON.parse(readFileSync(seedPath, "utf-8"));

// Known correct bggIds for the 43 mismatched games
const FIXES = {
  "Unmatched": 287084,
  "Karuba": 183251,
  "Reef": 244522, // try 267127
  "Lanterns: The Harvest Festival": 187985, // try 204190
  "Cash 'n Guns": 155362,
  "Blank Slate": 299735,
  "Herd Mentality": 258448,
  "Don't Get Got!": 262211,
  "Tzolk'in: The Mayan Calendar": 182874, // try 150040 was wrong
  "Marco Polo II: In the Service of the Khan": 283948,
  "Nemesis": 167355, // WAIT - 167355 is Colt Express according to the audit. Nemesis = 167355 is WRONG
  "Raiders of the North Sea": 170042,
  "Underwater Cities": 247763, // audit says 247763 = Underwater Cities... but our game says 267378
  "Robinson Crusoe: Adventures on the Cursed Island": 121921,
  "Sleeping Gods": 255984,
  "Hanamikoji": 199163, // try 253644
  "Battle Line": 760,
  "Codex: Card-Time Strategy": 131111, // try another
  "6 Nimmt!": 432, // try 4271
  "Throw Throw Burrito": 248590, // was supposedly fixed...
  "Happy Salmon": 233020, // was supposedly correct but audit says it's Fireball Island
  "Dutch Blitz": 148203,
  "Ingenious": 9674,
  "Mottainai": 175199,
  "Dice Throne": 245653,
  "Hadara": 269144,
  "Iwari": 285678,
  "Furnace": 318084,
  "Meadow": 314491,
  "Sky Team": 373106,
  "Heat: Pedal to the Metal": 366013, // audit says 366013 = Heat... wait circular
  "Taverns of Tiefenthal": 281576,
  "Clank! Legacy: Acquisitions Incorporated": 266507,
  "The Crew: Mission Deep Sea": 324856,
  "Revive": 332772,
  "Harmonies": 405274,
  "Wyrmspan": 402082,
  "Nuts!": 342526, // might not exist on BGG
  "Knarr": 380815,
  "Kingdomino Duel": 271324,
  "Pandemic Legacy: Season 0": 314040, // audit says 314040 = Pandemic Legacy S0? No, it says mismatch
  "Colt Express": 158899,
  "Unmatched: Cobble & Fog": 294484,
};

// Use geekdo search to find correct IDs
async function geekdoSearch(name) {
  try {
    const url = `https://api.geekdo.com/api/geeksearch?objecttype=thing&nosession=1&showcount=5&q=${encodeURIComponent(name)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      id: item.objectid,
      name: item.name,
      subtype: item.subtype,
    })).filter(x => x.subtype === "boardgame");
  } catch {
    return [];
  }
}

async function getGameName(bggId) {
  try {
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
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// The 43 games that need fixing
const needsFix = [
  "Unmatched", "Karuba", "Reef", "Lanterns: The Harvest Festival", "Cash 'n Guns",
  "Blank Slate", "Herd Mentality", "Don't Get Got!", "Tzolk'in: The Mayan Calendar",
  "Marco Polo II: In the Service of the Khan", "Nemesis", "Raiders of the North Sea",
  "Underwater Cities", "Robinson Crusoe: Adventures on the Cursed Island", "Sleeping Gods",
  "Hanamikoji", "Battle Line", "Codex: Card-Time Strategy", "6 Nimmt!",
  "Throw Throw Burrito", "Happy Salmon", "Dutch Blitz", "Ingenious", "Mottainai",
  "Dice Throne", "Hadara", "Iwari", "Furnace", "Meadow", "Sky Team",
  "Heat: Pedal to the Metal", "Taverns of Tiefenthal", "Clank! Legacy: Acquisitions Incorporated",
  "The Crew: Mission Deep Sea", "Revive", "Harmonies", "Wyrmspan", "Nuts!", "Knarr",
  "Kingdomino Duel", "Pandemic Legacy: Season 0", "Colt Express", "Unmatched: Cobble & Fog"
];

let fixed = 0;
let failed = 0;

for (const name of needsFix) {
  const game = games.find(g => g.name === name);
  if (!game) {
    console.log(`  NOT FOUND: ${name}`);
    continue;
  }

  // Search geekdo for the correct ID
  const results = await geekdoSearch(name);

  if (results.length > 0) {
    // Find best match
    const normalName = normalize(name);
    const exact = results.find(r => normalize(r.name) === normalName);
    const match = exact || results[0];

    if (match.id !== game.bggId) {
      console.log(`  FIX: "${name}" ${game.bggId} -> ${match.id} (BGG: "${match.name}")`);
      game.bggId = match.id;
      game.thumbnail = ""; // Clear wrong thumbnail
      fixed++;
    } else {
      console.log(`  OK: "${name}" already ${game.bggId}`);
    }
  } else {
    console.log(`  MISS: "${name}" - no search results`);
    failed++;
  }

  await new Promise(r => setTimeout(r, 300));
}

console.log(`\n=== SUMMARY ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Failed: ${failed}`);

// Also fix any circular references (e.g., Nemesis had Colt Express's ID)
// Check for duplicate bggIds
const idMap = new Map();
for (const g of games) {
  if (idMap.has(g.bggId)) {
    console.log(`DUPLICATE bggId ${g.bggId}: "${g.name}" and "${idMap.get(g.bggId)}"`);
  }
  idMap.set(g.bggId, g.name);
}

writeFileSync(seedPath, JSON.stringify(games, null, 2) + "\n");
console.log(`\nSaved!`);
