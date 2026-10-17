import { shuffle } from "./random";
import type { MatchPair } from "./decks";

export const MATCH_PAIRS = 6;
export const MISTAKE_PENALTY_MS = 1000;

export interface MatchTile {
  id: string; // `${pairId}:term` | `${pairId}:def`
  pairId: string;
  kind: "term" | "definition";
  text: string;
}

export interface MatchState {
  tiles: MatchTile[];
  selectedId: string | null;
  matchedPairIds: string[];
  /** The last wrong pair, shown briefly as an error flash. */
  wrong: [string, string] | null;
  mistakes: number;
  startedAt: number | null;
  finishedAt: number | null;
}

/** Picks `MATCH_PAIRS` pairs at random and lays their tiles out shuffled. */
export function createMatch(pool: MatchPair[], seed: number, pairs = MATCH_PAIRS): MatchState {
  const chosen = shuffle(pool, seed).slice(0, pairs);
  const tiles = chosen.flatMap<MatchTile>((p) => [
    { id: `${p.id}:term`, pairId: p.id, kind: "term", text: p.term },
    { id: `${p.id}:def`, pairId: p.id, kind: "definition", text: p.definition },
  ]);
  return { tiles: shuffle(tiles, seed + 1), selectedId: null, matchedPairIds: [], wrong: null, mistakes: 0, startedAt: null, finishedAt: null };
}

export function isFinished(state: MatchState): boolean {
  return state.finishedAt !== null;
}

export function selectTile(state: MatchState, tileId: string, now: number): MatchState {
  if (isFinished(state)) return state;
  const tile = state.tiles.find((t) => t.id === tileId);
  if (!tile || state.matchedPairIds.includes(tile.pairId)) return state;

  const startedAt = state.startedAt ?? now;
  if (state.selectedId === null) return { ...state, startedAt, selectedId: tileId, wrong: null };
  if (state.selectedId === tileId) return { ...state, startedAt, selectedId: null };

  const first = state.tiles.find((t) => t.id === state.selectedId)!;
  if (first.kind === tile.kind) return { ...state, startedAt, selectedId: tileId, wrong: null };

  if (first.pairId === tile.pairId) {
    const matchedPairIds = [...state.matchedPairIds, tile.pairId];
    const done = matchedPairIds.length * 2 === state.tiles.length;
    return { ...state, startedAt, selectedId: null, wrong: null, matchedPairIds, finishedAt: done ? now : null };
  }
  return { ...state, startedAt, selectedId: null, wrong: [first.id, tile.id], mistakes: state.mistakes + 1 };
}

/** Elapsed time plus a penalty per mistake — the number personal bests compare. */
export function finalTimeMs(state: MatchState): number | null {
  if (state.startedAt === null || state.finishedAt === null) return null;
  return state.finishedAt - state.startedAt + state.mistakes * MISTAKE_PENALTY_MS;
}

export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
