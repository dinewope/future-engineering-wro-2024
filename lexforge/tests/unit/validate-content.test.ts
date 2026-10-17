import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { containsForm, validateContent } from "@/lib/content/validate";

const contentDir = join(__dirname, "..", "..", "content");
const realFiles = readdirSync(join(contentDir, "words"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ slug: f.replace(/\.json$/, ""), data: JSON.parse(readFileSync(join(contentDir, "words", f), "utf8")) as unknown }));
const realRoots = JSON.parse(readFileSync(join(contentDir, "roots.json"), "utf8")) as unknown;

/** A minimal valid word; tests break one rule at a time. */
function word(overrides: Record<string, unknown> = {}) {
  return {
    id: "mitigate",
    lemma: "mitigate",
    pos: "verb",
    primarySense: "to make something bad less severe",
    forms: ["mitigate", "mitigated"],
    roots: [{ rootId: "mitis", part: "miti" }],
    connotation: "neutral",
    category: "Change & causation",
    collocations: ["mitigate the risk"],
    nearSynonyms: [{ word: "alleviate", difference: "about suffering" }],
    antonyms: ["exacerbate"],
    examples: [
      { domain: "science", text: "Mangroves mitigate storm damage by absorbing waves.", highConstraint: true },
      { domain: "history", text: "The treaty did little to mitigate tensions.", highConstraint: true },
      { domain: "social-science", text: "Free lunches mitigated, but did not erase, the gap.", highConstraint: true },
    ],
    satPassage: "Dark asphalt traps heat in cities across the world every summer. To ____ this effect, several cities now coat their roads with reflective paint, which lowered surface temperatures by several degrees in trials.",
    verified: true,
    ...overrides,
  };
}
const roots = { roots: [{ id: "mitis", form: "mitis", origin: "Latin", meaning: "mild", wordIds: ["mitigate"] }], affixes: [] };
const run = (w: unknown, r: unknown = roots) => validateContent([{ slug: "change", data: [w] }], r);

describe("validateContent", () => {
  it("accepts the shipped content with zero errors", () => {
    const report = validateContent(realFiles, realRoots);
    expect(report.errors).toEqual([]);
    expect(report.words.length).toBeGreaterThanOrEqual(150);
    expect(report.roots.length).toBeGreaterThanOrEqual(32);
  });

  it("every shipped word has a passage and ≥3 distinct-domain examples", () => {
    const { words } = validateContent(realFiles, realRoots);
    for (const w of words) {
      expect(w.satPassage, w.id).toBeDefined();
      expect(new Set(w.examples.map((e) => e.domain)).size, w.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("accepts a valid minimal word", () => {
    expect(run(word()).errors).toEqual([]);
  });

  it("fails on missing fields", () => {
    const { connotation: _drop, ...noConnotation } = word();
    expect(run(noConnotation).errors.join("\n")).toMatch(/connotation/);
  });

  it("fails on fewer than 3 examples", () => {
    const w = word();
    expect(run({ ...w, examples: w.examples.slice(0, 2) }).errors.join("\n")).toMatch(/at least 3 examples/);
  });

  it("fails on duplicate example domains", () => {
    const w = word();
    const examples = w.examples.map((e) => ({ ...e, domain: "science" }));
    expect(run({ ...w, examples }).errors.join("\n")).toMatch(/duplicate example domains/);
  });

  it("fails when an example does not contain the word", () => {
    const w = word();
    const examples = [...w.examples.slice(0, 2), { domain: "literature", text: "She softened the blow.", highConstraint: true }];
    expect(run({ ...w, examples }).errors.join("\n")).toMatch(/does not contain the word/);
  });

  it("fails when a root is referenced but not defined", () => {
    expect(run(word({ roots: [{ rootId: "ghost", part: "miti" }] })).errors.join("\n")).toMatch(/not defined in roots\.json/);
  });

  it("fails when a root's wordIds and the word disagree", () => {
    const r = { roots: [{ id: "mitis", form: "mitis", origin: "Latin", meaning: "mild", wordIds: [] }], affixes: [] };
    expect(run(word(), r).errors.join("\n")).toMatch(/does not list it/);
  });

  it("fails when the passage leaks the answer or lacks a blank", () => {
    expect(run(word({ satPassage: word().satPassage.replace("____", "mitigate") })).errors.join("\n")).toMatch(/exactly one blank/);
    expect(run(word({ satPassage: word().satPassage + " Engineers mitigated it." })).errors.join("\n")).toMatch(/leaks the answer/);
  });

  it("fails on duplicate ids and on a wrong category file", () => {
    const report = validateContent([{ slug: "change", data: [word(), word()] }], roots);
    expect(report.errors.join("\n")).toMatch(/duplicate id/);
    expect(validateContent([{ slug: "tone", data: [word()] }], roots).errors.join("\n")).toMatch(/does not match file/);
  });

  it("requires highConstraint: true on every example", () => {
    const w = word();
    const examples = w.examples.map((e, i) => (i === 0 ? { ...e, highConstraint: false } : e));
    expect(run({ ...w, examples }).errors.length).toBeGreaterThan(0);
  });
});

describe("containsForm", () => {
  it("matches whole words case-insensitively", () => {
    expect(containsForm("Mitigated by rain.", ["mitigated"])).toBe(true);
    expect(containsForm("The unmitigated disaster.", ["mitigated"])).toBe(false);
    expect(containsForm("irreverent jokes", ["reverent"])).toBe(false);
  });
});
