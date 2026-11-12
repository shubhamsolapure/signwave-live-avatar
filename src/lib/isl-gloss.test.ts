import { describe, expect, it } from "vitest";
import { matchGloss, officialGlossCatalog } from "./isl-gloss";

describe("AI gloss official clip matching", () => {
  it("matches available official signer clips in gloss order", () => {
    expect(matchGloss(["TODAY", "I", "WATER"])).toEqual([
      { gloss: "TODAY", video: "Iji2l3tYxHc", letters: [] },
      { gloss: "I", video: "1f6OchgCQrE", letters: [] },
      { gloss: "WATER", video: "iFW-jmBq7wc", letters: [] },
    ]);
  });
  it("flags unsupported signs and keeps their fingerspelling", () => {
    expect(matchGloss(["NEED"])).toEqual([{ gloss: "NEED", video: null, letters: ["N", "E", "E", "D"] }]);
  });
  it("does not guess a sign for a name", () => {
    expect(matchGloss(["SHUBHAM"])[0]).toEqual({ gloss: "SHUBHAM", video: null, letters: ["S", "H", "U", "B", "H", "A", "M"] });
  });
  it("does not remove unsupported negation or question tokens", () => {
    expect(matchGloss(["I", "NOT", "UNDERSTAND", "WHY"]).map((s) => s.gloss)).toEqual(["I", "NOT", "UNDERSTAND", "WHY"]);
    expect(matchGloss(["NOT", "WHY"]).every((s) => s.video === null)).toBe(true);
  });
  it("excludes unverified prototypes from the model's clip catalog", () => {
    expect(officialGlossCatalog()).toContain("HELLO");
    expect(officialGlossCatalog()).not.toContain("NEED");
    expect(officialGlossCatalog()).not.toContain("YOU");
  });
  it("matches the thank-you concept to its official clip", () => {
    expect(matchGloss(["THANK-YOU"])[0]?.video).toBe("wK8amEJAK1Y");
  });
});