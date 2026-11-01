import { describe, expect, it } from "vitest";
import { APPROVED_SIGNS, translate } from "./isl";

describe("translate", () => {
  it("returns no frames for empty or punctuation-only input", () => {
    expect(translate("")).toEqual([]);
    expect(translate("?! ...")).toEqual([]);
  });

  it("normalizes joined-up phrases case-insensitively", () => {
    expect(translate("GOODMORNING").map((step) => step.source)).toEqual(["good", "morning"]);
    expect(translate("howareyou").map((step) => step.source)).toEqual(["how", "are", "you"]);
    expect(translate("thankyou").map((step) => step.source)).toEqual(["thank"]);
  });

  it("keeps the thank-you clip and does not invent a separate You clip", () => {
    const steps = translate("Thank you");
    expect(steps).toHaveLength(1);
    expect(steps[0]?.kind).toBe("sign");
    if (steps[0]?.kind === "sign") {
      expect(steps[0].sign.word).toBe("Thank you");
      expect(steps[0].sign.video).toBe(APPROVED_SIGNS.thank?.video);
    }
  });

  it("preserves word order and spells words without a mapping", () => {
    const steps = translate("Hello zorb");
    expect(steps.map((step) => step.source)).toEqual(["hello", "zorb"]);
    expect(steps[0]?.kind).toBe("sign");
    expect(steps[1]).toMatchObject({ kind: "spell", source: "zorb", letters: ["Z", "O", "R", "B"] });
  });

  it("handles punctuation and repeated whitespace", () => {
    expect(translate("  Hello,   world! ").map((step) => step.source)).toEqual(["hello", "world"]);
  });

  it("does not expose a provisional You mapping that reuses the Your clip", () => {
    expect(APPROVED_SIGNS.you).toBeUndefined();
  });
});
