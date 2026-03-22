// Fetches official box front thumbnail URLs from the Geekdo API and updates seed-games.json
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../src/data/seed-games.json");
const games = JSON.parse(readFileSync(seedPath, "utf-8"));

// Captions that strongly indicate official box art
const BOX_ART_PATTERNS = [
  /^box\s*(front|cover)$/i,
  /^(front|cover)\s*$/i,
  /^box\s*(front|cover)\s*\(?english\)?$/i,
  /provided by the publisher/i,
];

function isBoxArtCaption(caption) {
  return BOX_ART_PATTERNS.some((p) => p.test(caption?.trim() || ""));
}

async function fetchThumbnail(bggId) {
  try {
    // Fetch BoxFront tagged images with enough results to find the real box art
    const url = `https://api.geekdo.com/api/images?objectid=${bggId}&objecttype=thing&nosession=1&showcount=15&sort=hot&tag=BoxFront`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    const images = data.images || [];

    if (images.length === 0) return "";

    // Priority 1: caption says "Box Front" or "Box Cover" exactly
    const boxArt = images.find((img) => isBoxArtCaption(img.caption));
    if (boxArt?.imageurl_lg) return boxArt.imageurl_lg;

    // Priority 2: caption contains "box front" or "box cover" (loose match)
    const looseBox = images.find((img) =>
      /box\s*(front|cover)/i.test(img.caption || "")
    );
    if (looseBox?.imageurl_lg) return looseBox.imageurl_lg;

    // Priority 3: caption contains "cover" or "front"
    const coverish = images.find((img) =>
      /\b(cover|front)\b/i.test(img.caption || "")
    );
    if (coverish?.imageurl_lg) return coverish.imageurl_lg;

    // Priority 4: image provided by publisher or official-sounding
    const publisher = images.find((img) =>
      /publisher|official/i.test(img.caption || "")
    );
    if (publisher?.imageurl_lg) return publisher.imageurl_lg;

    // Fallback: most recommended image (hopefully decent)
    const best = images.reduce((a, b) =>
      (b.numrecommend || 0) > (a.numrecommend || 0) ? b : a
    );
    return best.imageurl_lg || "";
  } catch (e) {
    console.error(`  [${bggId}] Error:`, e.message);
    return "";
  }
}

// Incremental mode: only fetch for games missing thumbnails
const needsFetch = games.filter((g) => !g.thumbnail);
const alreadyHave = games.length - needsFetch.length;

console.log(`${games.length} total games, ${alreadyHave} already have thumbnails.`);
console.log(`Fetching box art for ${needsFetch.length} games...`);

for (let i = 0; i < needsFetch.length; i += 5) {
  const batch = needsFetch.slice(i, i + 5);
  const results = await Promise.all(
    batch.map(async (game) => {
      const thumb = await fetchThumbnail(game.bggId);
      console.log(`  [${i + batch.indexOf(game) + 1}/${needsFetch.length}] ${game.name}: ${thumb ? "OK" : "MISS"}`);
      return thumb;
    })
  );
  batch.forEach((game, j) => {
    game.thumbnail = results[j];
  });
  if (i + 5 < needsFetch.length) await new Promise((r) => setTimeout(r, 1000));
}

writeFileSync(seedPath, JSON.stringify(games, null, 2) + "\n");

const found = games.filter((g) => g.thumbnail).length;
console.log(`\nDone! ${found}/${games.length} thumbnails found.`);
