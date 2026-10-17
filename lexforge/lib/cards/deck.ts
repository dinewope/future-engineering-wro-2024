import { shuffle } from "./random";

/**
 * Flip-mode navigation state. Pure: the starred set lives in IndexedDB, so it
 * is passed in rather than stored here.
 */
export interface DeckState {
  baseIds: string[];
  currentId: string | null;
  flipped: boolean;
  shuffled: boolean;
  starredOnly: boolean;
  seed: number;
}

export type DeckAction =
  | { type: "next" }
  | { type: "prev" }
  | { type: "flip" }
  | { type: "goto"; index: number }
  | { type: "toggleShuffle"; seed?: number }
  | { type: "toggleStarredOnly" }
  | { type: "restart" };

export function createDeck(baseIds: string[], opts: Partial<Pick<DeckState, "shuffled" | "starredOnly" | "seed">> = {}, starred: ReadonlySet<string> = new Set()): DeckState {
  const draft: DeckState = {
    baseIds,
    currentId: null,
    flipped: false,
    shuffled: opts.shuffled ?? false,
    starredOnly: opts.starredOnly ?? false,
    seed: opts.seed ?? 1,
  };
  return { ...draft, currentId: deckOrder(draft, starred)[0] ?? null };
}

/** The visible card order after the shuffle and starred filters. */
export function deckOrder(state: DeckState, starred: ReadonlySet<string>): string[] {
  const filtered = state.starredOnly ? state.baseIds.filter((id) => starred.has(id)) : state.baseIds;
  return state.shuffled ? shuffle(filtered, state.seed) : filtered;
}

export interface DeckView {
  order: string[];
  index: number;
  currentId: string | null;
  atStart: boolean;
  atEnd: boolean;
}

export function deckView(state: DeckState, starred: ReadonlySet<string>): DeckView {
  const order = deckOrder(state, starred);
  let index = state.currentId ? order.indexOf(state.currentId) : -1;
  if (index === -1) index = 0;
  const currentId = order[index] ?? null;
  return { order, index, currentId, atStart: index <= 0, atEnd: index >= order.length - 1 };
}

export function deckReducer(state: DeckState, action: DeckAction, starred: ReadonlySet<string>): DeckState {
  const { order, index } = deckView(state, starred);
  const moveTo = (i: number): DeckState => {
    const clamped = Math.max(0, Math.min(order.length - 1, i));
    const id = order[clamped] ?? null;
    if (id === state.currentId && clamped === index) return state.flipped ? { ...state, flipped: false } : state;
    return { ...state, currentId: id, flipped: false };
  };

  switch (action.type) {
    case "next":
      return index >= order.length - 1 ? state : moveTo(index + 1);
    case "prev":
      return index <= 0 ? state : moveTo(index - 1);
    case "goto":
      return moveTo(action.index);
    case "flip":
      return order.length ? { ...state, flipped: !state.flipped } : state;
    case "restart":
      return moveTo(0);
    case "toggleShuffle": {
      const next: DeckState = { ...state, shuffled: !state.shuffled, seed: action.seed ?? state.seed, flipped: false };
      return { ...next, currentId: deckOrder(next, starred)[0] ?? null };
    }
    case "toggleStarredOnly": {
      const next: DeckState = { ...state, starredOnly: !state.starredOnly, flipped: false };
      const nextOrder = deckOrder(next, starred);
      // Stay on the current card if it survives the filter.
      const keep = state.currentId && nextOrder.includes(state.currentId);
      return { ...next, currentId: keep ? state.currentId : nextOrder[0] ?? null };
    }
  }
}
