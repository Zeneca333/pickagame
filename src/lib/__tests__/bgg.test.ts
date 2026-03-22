import { parseBggResponse } from "../bgg";

const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<items>
  <item type="boardgame" id="174430">
    <name type="primary" value="Gloomhaven"/>
    <description>A tactical combat game</description>
    <image>https://example.com/gloomhaven.jpg</image>
    <thumbnail>https://example.com/gloomhaven_t.jpg</thumbnail>
    <minplayers value="1"/>
    <maxplayers value="4"/>
    <minplaytime value="60"/>
    <maxplaytime value="150"/>
    <statistics>
      <ratings>
        <average value="8.67"/>
        <averageweight value="3.86"/>
      </ratings>
    </statistics>
  </item>
</items>`;

describe("parseBggResponse", () => {
  it("parses game details from BGG XML", () => {
    const games = parseBggResponse(sampleXml);
    expect(games).toHaveLength(1);
    expect(games[0]).toEqual({
      bggId: 174430,
      name: "Gloomhaven",
      description: "A tactical combat game",
      thumbnail: "https://example.com/gloomhaven.jpg",
      minPlayers: 1,
      maxPlayers: 4,
      minPlaytime: 60,
      maxPlaytime: 150,
      rating: 8.67,
      weight: 3.86,
    });
  });
});
