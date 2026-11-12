import { z } from "zod";
import { APPROVED_SIGNS } from "./isl";

export const glossInputSchema = z.object({ message: z.string().trim().min(1).max(1000) });
export const glossSchema = z.object({
  tokens: z.array(z.string().trim().min(1).max(60).regex(/^[A-Za-z0-9]+(?:[- ][A-Za-z0-9]+)*$/)).min(1).max(100),
  notes: z.array(z.string().max(300)).max(5),
});

export type GlossClip = { gloss: string; video: string | null; letters: string[] };
export type GlossResult = { message: string; sequence: GlossClip[]; notes: string[] };

// Only dictionary-backed entries are eligible; never trust model-provided URLs or approval flags.
export function officialGlossCatalog() {
  return Object.entries(APPROVED_SIGNS)
    .filter(([, sign]) => /^[A-Za-z0-9_-]{11}$/.test(sign.video))
    .map(([key]) => key.toUpperCase());
}

export function matchGloss(tokens: string[]): GlossClip[] {
  return tokens.map((token) => {
    const gloss = token.trim().toUpperCase();
    const key = gloss.toLowerCase();
    const sign = APPROVED_SIGNS[key === "thank-you" || key === "thank you" ? "thank" : key];
    const video = sign && /^[A-Za-z0-9_-]{11}$/.test(sign.video) ? sign.video : null;
    return { gloss, video, letters: video ? [] : gloss.replace(/[^A-Z0-9]/g, "").split("") };
  });
}

export const glossOutputFormat = {
  type: "json_schema" as const,
  name: "isl_gloss",
  strict: true,
  schema: {
    type: "object",
    properties: {
      tokens: { type: "array", items: { type: "string" } },
      notes: { type: "array", items: { type: "string" } },
    },
    required: ["tokens", "notes"],
    additionalProperties: false,
  },
};