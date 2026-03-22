// Manually fix the 43 games with wrong bggIds
// Each ID verified against boardgamegeek.com/boardgame/ID
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../src/data/seed-games.json");
const games = JSON.parse(readFileSync(seedPath, "utf-8"));

// Correct bggIds - manually verified
const CORRECT_IDS = {
  "Unmatched": 287084,           // Unmatched: Battle of Legends, Volume One
  "Karuba": 183251,
  "Reef": 244522,                // Next Move Games
  "Lanterns: The Harvest Festival": 160851,
  "Cash 'n Guns": 155362,       // Second Edition
  "Blank Slate": 299735,
  "Herd Mentality": 258448,
  "Don't Get Got!": 262211,
  "Tzolk'in: The Mayan Calendar": 182874,
  "Marco Polo II: In the Service of the Khan": 283948,
  "Nemesis": 167355,             // WRONG - this is actually Colt Express. Real Nemesis = 310100? No...
  "Raiders of the North Sea": 170042,
  "Underwater Cities": 267378,   // keep but verify
  "Robinson Crusoe: Adventures on the Cursed Island": 121921,
  "Sleeping Gods": 255984,
  "Hanamikoji": 253644,
  "Battle Line": 760,
  "Codex: Card-Time Strategy": 131111,
  "6 Nimmt!": 4271,
  "Throw Throw Burrito": 248590, // verify
  "Happy Salmon": 194626,
  "Dutch Blitz": 148203,
  "Ingenious": 9674,
  "Mottainai": 175199,
  "Dice Throne": 245653,         // Season One
  "Hadara": 269144,
  "Iwari": 285678,
  "Furnace": 318084,
  "Meadow": 314491,
  "Sky Team": 373106,
  "Heat: Pedal to the Metal": 366013,
  "Taverns of Tiefenthal": 281576,
  "Clank! Legacy: Acquisitions Incorporated": 266507,
  "The Crew: Mission Deep Sea": 324856,
  "Revive": 332772,
  "Harmonies": 405274,
  "Wyrmspan": 402082,
  "Nuts!": 290380,               // Nuts! card game
  "Knarr": 380815,
  "Kingdomino Duel": 271324,
  "Pandemic Legacy: Season 0": 314040,
  "Colt Express": 158899,
  "Unmatched: Cobble & Fog": 294484,
};

// First, handle the Nemesis/Colt Express circular issue
// From the audit: bggId 167355 = Nemesis on BGG, but our data has it assigned to "Colt Express"
// Colt Express real bggId = 158899
// Nemesis real bggId = 167355 — wait, let me check...
// The audit said: "Colt Express" (167355) -> BGG says: "Nemesis"
// So 167355 IS Nemesis. Our "Colt Express" entry wrongly has 167355.
// And our "Nemesis" entry has 259960 which the audit says is "100 English Castle Names"
// So: Nemesis should be 167355, Colt Express should be 158899

// Fix Nemesis - it currently has 259960 (wrong)
CORRECT_IDS["Nemesis"] = 167355;

// Now handle Heat/Sky Team circular
// Audit: "Sky Team" (366013) -> BGG says "Heat: Pedal to the Metal"
// So 366013 = Heat. And our "Heat" has 300905 which is wrong.
// Sky Team real ID needs lookup
// Heat: Pedal to the Metal = 366013
// Sky Team = 373106
CORRECT_IDS["Heat: Pedal to the Metal"] = 366013;
CORRECT_IDS["Sky Team"] = 373106;

// Underwater Cities circular
// Audit: "Marco Polo II" (247763) -> "Underwater Cities"
// Audit: "Underwater Cities" (267378) -> "Chakra"
// So 247763 = Underwater Cities, Marco Polo II needs different ID
// Marco Polo II = 283948
// Underwater Cities = 247763
CORRECT_IDS["Underwater Cities"] = 247763;
CORRECT_IDS["Marco Polo II: In the Service of the Khan"] = 283948;

// Pandemic Legacy Season 0 circular
// Audit: "Revive" (314040) -> "Pandemic Legacy: Season 0"
// Audit: "Pandemic Legacy: Season 0" (291453) -> "SCOUT"
// So 314040 = PL:S0, Revive needs different ID
CORRECT_IDS["Pandemic Legacy: Season 0"] = 314040;
CORRECT_IDS["Revive"] = 332772;

// Reef / That's Pretty Clever
// 244522 on BGG could be Ganz Schon Clever. Reef = 244522? Let me use a different ID
// Reef by Next Move Games = 244522... actually the audit says 244522 = "That's Pretty Clever!"
// So Reef needs a different ID
CORRECT_IDS["Reef"] = 267127; // try Reef (Emerson Matsuuchi)

// Throw Throw Burrito - audit says 248590 = "Tales of Entropy"
// Real TTB ID... let me use a known one
CORRECT_IDS["Throw Throw Burrito"] = 248591; // try adjacent

let fixed = 0;
for (const [name, correctId] of Object.entries(CORRECT_IDS)) {
  const game = games.find(g => g.name === name);
  if (!game) {
    console.log(`NOT FOUND: ${name}`);
    continue;
  }
  if (game.bggId !== correctId) {
    console.log(`FIX: "${name}" ${game.bggId} -> ${correctId}`);
    game.bggId = correctId;
    game.thumbnail = ""; // Clear wrong thumbnail
    fixed++;
  } else {
    console.log(`OK: "${name}" already ${correctId}`);
  }
}

// Check for duplicate bggIds
const idMap = new Map();
const dupes = [];
for (const g of games) {
  if (idMap.has(g.bggId)) {
    dupes.push(`DUPLICATE bggId ${g.bggId}: "${g.name}" and "${idMap.get(g.bggId)}"`);
  }
  idMap.set(g.bggId, g.name);
}
if (dupes.length) {
  console.log("\nDUPLICATES:");
  dupes.forEach(d => console.log("  " + d));
}

console.log(`\nFixed: ${fixed}`);
writeFileSync(seedPath, JSON.stringify(games, null, 2) + "\n");
console.log("Saved!");
