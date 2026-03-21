import { encodeShelfData, decodeShelfData } from "../share";
import type { ShelfData } from "../types";

describe("share encoding", () => {
  const shelfData: ShelfData = {
    games: [
      { name: "Cosmic Encounter", bggId: 39463, pitch: "Betray your friends" },
      { name: "Coup", bggId: 131357, pitch: "Lie until you win" },
    ],
  };

  it("encodes and decodes shelf data roundtrip", () => {
    const encoded = encodeShelfData(shelfData);
    const decoded = decodeShelfData(encoded);
    expect(decoded).toEqual(shelfData);
  });

  it("produces URL-safe strings", () => {
    const encoded = encodeShelfData(shelfData);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for invalid encoded data", () => {
    const decoded = decodeShelfData("invalid-data");
    expect(decoded).toBeNull();
  });
});
