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
  it("drops filler words", () => {
    expect(translate("what is your name").map((x) => x.source)).toEqual(["what", "your", "name"]);
  });
});
