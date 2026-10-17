import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { LexForgeDB, setDB } from "@/lib/db/schema";
import { starredIds, toggleStar } from "@/lib/db/stars";
import { getOrCreateWordState } from "@/lib/db/wordStates";
import { bestMatchTime, recordMatchTime } from "@/lib/db/matchScores";

beforeEach(() => setDB(new LexForgeDB(`test-${Math.random()}`)));

describe("star repository", () => {
  it("toggles word stars and keeps an FSRS card on the state", async () => {
    expect(await toggleStar("mitigate")).toBe(true);
    expect(await starredIds()).toEqual(new Set(["mitigate"]));
    const state = await getOrCreateWordState("mitigate");
    expect(state).toMatchObject({ starred: true, depth: 0, lapses: 0 });
    expect(state.fsrs.reps).toBe(0);
    expect(await toggleStar("mitigate")).toBe(false);
    expect(await starredIds()).toEqual(new Set());
  });

  it("stores root stars separately", async () => {
    await toggleStar("spec", "root");
    expect(await starredIds("root")).toEqual(new Set(["spec"]));
    expect(await starredIds("word")).toEqual(new Set());
  });
});

describe("match scores", () => {
  it("keeps only the personal best", async () => {
    expect(await recordMatchTime("tone", 9000)).toBe(true);
    expect(await recordMatchTime("tone", 12000)).toBe(false);
    expect(await recordMatchTime("tone", 7000)).toBe(true);
    expect(await bestMatchTime("tone")).toBe(7000);
  });
});
