import { describe, expect, it } from "vitest";
import { createDeck, deckReducer, deckView, type DeckAction, type DeckState } from "@/lib/cards/deck";

const ids = ["a", "b", "c", "d", "e"];
const none = new Set<string>();
const apply = (s: DeckState, actions: DeckAction[], starred: ReadonlySet<string> = none) => actions.reduce((acc, a) => deckReducer(acc, a, starred), s);

describe("flashcard deck navigation", () => {
  it("starts on the first card, unflipped", () => {
    const s = createDeck(ids);
    expect(deckView(s, none)).toMatchObject({ index: 0, currentId: "a", atStart: true, atEnd: false });
    expect(s.flipped).toBe(false);
  });

  it("moves forward and back and clamps at both ends", () => {
    let s = apply(createDeck(ids), [{ type: "prev" }]);
    expect(deckView(s, none).currentId).toBe("a");
    s = apply(s, [{ type: "next" }, { type: "next" }]);
    expect(deckView(s, none).currentId).toBe("c");
    s = apply(s, Array<DeckAction>(10).fill({ type: "next" }));
    expect(deckView(s, none)).toMatchObject({ currentId: "e", atEnd: true });
    s = apply(s, [{ type: "prev" }]);
    expect(deckView(s, none).currentId).toBe("d");
  });

  it("flips, and navigating resets the card to its front", () => {
    let s = apply(createDeck(ids), [{ type: "flip" }]);
    expect(s.flipped).toBe(true);
    s = apply(s, [{ type: "next" }]);
    expect(s.flipped).toBe(false);
    s = apply(s, [{ type: "flip" }, { type: "flip" }]);
    expect(s.flipped).toBe(false);
  });

  it("goto jumps to an index and clamps out-of-range values", () => {
    expect(deckView(apply(createDeck(ids), [{ type: "goto", index: 3 }]), none).currentId).toBe("d");
    expect(deckView(apply(createDeck(ids), [{ type: "goto", index: 99 }]), none).currentId).toBe("e");
  });

  it("shuffle is a deterministic permutation and restarts at the top", () => {
    const s = apply(createDeck(ids), [{ type: "next" }, { type: "toggleShuffle", seed: 42 }]);
    const view = deckView(s, none);
    expect([...view.order].sort()).toEqual(ids);
    expect(view.order).not.toEqual(ids);
    expect(view.index).toBe(0);
    expect(deckView(apply(createDeck(ids), [{ type: "toggleShuffle", seed: 42 }]), none).order).toEqual(view.order);
    const unshuffled = apply(s, [{ type: "toggleShuffle" }]);
    expect(deckView(unshuffled, none).order).toEqual(ids);
  });

  it("starred-only filters the deck and keeps the current card when it survives", () => {
    const starred = new Set(["b", "d"]);
    let s = apply(createDeck(ids), [{ type: "next" }, { type: "next" }, { type: "next" }], starred); // on "d"
    s = apply(s, [{ type: "toggleStarredOnly" }], starred);
    expect(deckView(s, starred)).toMatchObject({ order: ["b", "d"], currentId: "d", index: 1 });
    s = apply(createDeck(ids), [{ type: "toggleStarredOnly" }], starred); // on "a", not starred
    expect(deckView(s, starred).currentId).toBe("b");
  });

  it("handles an empty starred deck without crashing", () => {
    const s = createDeck(ids, { starredOnly: true });
    expect(deckView(s, none)).toMatchObject({ order: [], currentId: null });
    expect(apply(s, [{ type: "next" }, { type: "flip" }, { type: "prev" }])).toEqual(s);
  });

  it("unstarring the current card in starred-only mode falls back to a neighbour", () => {
    const s = createDeck(ids, { starredOnly: true }, new Set(["b", "d"]));
    expect(deckView(s, new Set(["d"])).currentId).toBe("d");
  });
});
