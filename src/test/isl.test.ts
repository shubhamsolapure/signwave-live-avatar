import { describe, it, expect } from "vitest";
import { translate } from "@/lib/isl";

describe("translate", () => {
  it("uses approved signs for known words", () => {
    const s = translate("Hello");
    expect(s[0]?.kind).toBe("sign");
  });
  it("fingerspells unknown words instead of guessing", () => {
    const s = translate("Shubham");
    expect(s).toEqual([{ kind: "spell", source: "shubham", letters: ["S", "H", "U", "B", "H", "A", "M"] }]);
  });
  it("treats thank you as one sign", () => {
    expect(translate("thank you").length).toBe(1);
  });
  it("fingerspells words with no official ISLRTC clip", () => {
    expect(translate("you")[0]?.kind).toBe("spell");
  });
  it("every approved sign has an official video", () => {
    expect(translate("hello water doctor").every((x) => x.kind === "sign" && x.sign.video.length === 11)).toBe(true);
  });
  it("drops filler words", () => {
    expect(translate("what is your name").map((x) => x.source)).toEqual(["what", "your", "name"]);
  });
});
