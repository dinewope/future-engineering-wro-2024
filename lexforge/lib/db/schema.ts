import Dexie, { type Table } from "dexie";
import type { MatchScore, ReviewLog, RootStar, UserSentence, UserWordState } from "./types";

export class LexForgeDB extends Dexie {
  wordStates!: Table<UserWordState, string>;
  sentences!: Table<UserSentence, string>;
  reviewLogs!: Table<ReviewLog, number>;
  matchScores!: Table<MatchScore, string>;
  rootStars!: Table<RootStar, string>;

  constructor(name = "lexforge") {
    super(name);
    // IndexedDB cannot index booleans, so `starred`/`isLeech` are filtered in memory.
    this.version(1).stores({
      wordStates: "&wordId, depth",
      sentences: "&id, wordId, echoDueAt",
      reviewLogs: "++id, wordId, at",
      matchScores: "&deckId",
      rootStars: "&rootId",
    });
  }
}

let instance: LexForgeDB | null = null;

/** Lazily created so server rendering never touches IndexedDB. */
export function getDB(): LexForgeDB {
  instance ??= new LexForgeDB();
  return instance;
}

/** Test hook: point the repositories at a fresh database. */
export function setDB(db: LexForgeDB | null): void {
  instance = db;
}
