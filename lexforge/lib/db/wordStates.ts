import { createEmptyCard } from "ts-fsrs";
import { getDB } from "./schema";
import type { UserWordState } from "./types";

export function newWordState(wordId: string, now = new Date()): UserWordState {
  return { wordId, depth: 0, fsrs: createEmptyCard(now), level6Days: [], lapses: 0, isLeech: false, starred: false };
}

export async function getOrCreateWordState(wordId: string): Promise<UserWordState> {
  const db = getDB();
  return db.transaction("rw", db.wordStates, async () => {
    const existing = await db.wordStates.get(wordId);
    if (existing) return existing;
    const fresh = newWordState(wordId);
    await db.wordStates.add(fresh);
    return fresh;
  });
}
