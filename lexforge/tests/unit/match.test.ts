import { describe, expect, it } from "vitest";
import { createMatch, finalTimeMs, MISTAKE_PENALTY_MS, selectTile } from "@/lib/cards/match";

const pool = Array.from({ length: 10 }, (_, i) => ({ id: `w${i}`, term: `term${i}`, definition: `def${i}` }));

describe("match game", () => {
  it("deals 6 pairs as 12 shuffled tiles", () => {
    const s = createMatch(pool, 7);
    expect(s.tiles).toHaveLength(12);
    const pairIds = new Set(s.tiles.map((t) => t.pairId));
    expect(pairIds.size).toBe(6);
    for (const id of pairIds) expect(s.tiles.filter((t) => t.pairId === id).map((t) => t.kind).sort()).toEqual(["definition", "term"]);
  });

  it("matches correct pairs, counts mistakes, and finishes with a penalty", () => {
    let s = createMatch(pool, 3);
    const [first, ...rest] = [...new Set(s.tiles.map((t) => t.pairId))];
    const wrongDef = `${rest[0]}:def`;
    s = selectTile(s, `${first}:term`, 1000);
    s = selectTile(s, wrongDef, 1500);
    expect(s.mistakes).toBe(1);
    expect(s.wrong).toEqual([`${first}:term`, wrongDef]);
    for (const [i, id] of [first!, ...rest].entries()) {
      s = selectTile(s, `${id}:def`, 2000 + i);
      s = selectTile(s, `${id}:term`, 2000 + i);
    }
    expect(s.matchedPairIds).toHaveLength(6);
    expect(s.finishedAt).toBe(2005);
    expect(finalTimeMs(s)).toBe(2005 - 1000 + MISTAKE_PENALTY_MS);
  });

  it("re-selects instead of matching two tiles of the same kind; clicking twice deselects", () => {
    let s = createMatch(pool, 1);
    const terms = s.tiles.filter((t) => t.kind === "term");
    s = selectTile(s, terms[0]!.id, 0);
    s = selectTile(s, terms[1]!.id, 1);
    expect(s.selectedId).toBe(terms[1]!.id);
    expect(s.mistakes).toBe(0);
    s = selectTile(s, terms[1]!.id, 2);
    expect(s.selectedId).toBeNull();
  });
});
