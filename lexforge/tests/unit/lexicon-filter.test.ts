import { describe, expect, it } from "vitest";
import { words } from "@/lib/content";
import { DEFAULT_FILTERS, filterWords } from "@/lib/lexicon/filter";

const none = new Set<string>();

describe("lexicon filters", () => {
  it("returns every word alphabetically with no filters", () => {
    const out = filterWords(words, DEFAULT_FILTERS, none);
    expect(out).toHaveLength(words.length);
    expect(out.map((w) => w.lemma)).toEqual([...words.map((w) => w.lemma)].sort((a, b) => a.localeCompare(b)));
  });

  it("searches lemma first, then forms, then definitions and synonyms", () => {
    const out = filterWords(words, { ...DEFAULT_FILTERS, query: "mitig" }, none);
    expect(out[0]?.id).toBe("mitigate");
    const bySense = filterWords(words, { ...DEFAULT_FILTERS, query: "alleviate" }, none).map((w) => w.id);
    expect(bySense[0]).toBe("alleviate");
    expect(bySense).toContain("mitigate"); // near-synonym hit
  });

  it("filters by category, connotation, root and stars", () => {
    expect(filterWords(words, { ...DEFAULT_FILTERS, category: "common" }, none).every((w) => w.category.startsWith("Common"))).toBe(true);
    expect(filterWords(words, { ...DEFAULT_FILTERS, connotation: "negative" }, none).every((w) => w.connotation === "negative")).toBe(true);
    expect(filterWords(words, { ...DEFAULT_FILTERS, rootId: "ambi" }, none).map((w) => w.id).sort()).toEqual(["ambiguous", "ambivalent"]);
    expect(filterWords(words, { ...DEFAULT_FILTERS, starredOnly: true }, new Set(["wane"])).map((w) => w.id)).toEqual(["wane"]);
  });
});
