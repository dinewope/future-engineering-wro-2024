import { getDB } from "./schema";
import { newWordState } from "./wordStates";

/** Toggles a star on a word (or a root, for root decks). Returns the new value. */
export async function toggleStar(id: string, kind: "word" | "root" = "word"): Promise<boolean> {
  const db = getDB();
  if (kind === "root") {
    return db.transaction("rw", db.rootStars, async () => {
      if (await db.rootStars.get(id)) {
        await db.rootStars.delete(id);
        return false;
      }
      await db.rootStars.put({ rootId: id });
      return true;
    });
  }
  return db.transaction("rw", db.wordStates, async () => {
    const state = (await db.wordStates.get(id)) ?? newWordState(id);
    const starred = !state.starred;
    await db.wordStates.put({ ...state, starred });
    return starred;
  });
}

export async function starredIds(kind: "word" | "root" = "word"): Promise<Set<string>> {
  const db = getDB();
  if (kind === "root") return new Set((await db.rootStars.toArray()).map((r) => r.rootId));
  const states = await db.wordStates.filter((s) => s.starred).toArray();
  return new Set(states.map((s) => s.wordId));
}
