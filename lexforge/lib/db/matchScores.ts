import { getDB } from "./schema";

export async function bestMatchTime(deckId: string): Promise<number | null> {
  return (await getDB().matchScores.get(deckId))?.bestMs ?? null;
}

/** Saves the time if it beats the personal best. Returns true on a new best. */
export async function recordMatchTime(deckId: string, ms: number): Promise<boolean> {
  const db = getDB();
  return db.transaction("rw", db.matchScores, async () => {
    const prev = await db.matchScores.get(deckId);
    if (prev && prev.bestMs <= ms) return false;
    await db.matchScores.put({ deckId, bestMs: ms, achievedAt: new Date().toISOString() });
    return true;
  });
}
