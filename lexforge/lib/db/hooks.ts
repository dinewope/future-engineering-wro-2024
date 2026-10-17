"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { starredIds } from "./stars";
import { bestMatchTime } from "./matchScores";

const EMPTY = new Set<string>();

/** Starred ids, or `undefined` while IndexedDB is still loading. */
export function useStarredMaybe(kind: "word" | "root" = "word"): ReadonlySet<string> | undefined {
  return useLiveQuery(() => starredIds(kind), [kind]);
}

export function useStarred(kind: "word" | "root" = "word"): ReadonlySet<string> {
  return useStarredMaybe(kind) ?? EMPTY;
}

export function useBestMatchTime(deckId: string): number | null | undefined {
  return useLiveQuery(() => bestMatchTime(deckId), [deckId]);
}
