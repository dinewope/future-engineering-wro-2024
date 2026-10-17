import { CATEGORIES, categorySlugs, roots, words, wordsInCategory, type CategorySlug } from "@/lib/content";

export type DeckKind = "words" | "roots";

export interface DeckMeta {
  id: string;
  title: string;
  kind: DeckKind;
  /** Starred deck: same cards as "all", always filtered to starred. */
  starredOnly?: boolean;
  blurb: string;
}

const CATEGORY_BLURBS: Record<CategorySlug, string> = {
  argument: "How writers claim, support, and attack ideas.",
  evidence: "How strong is the proof? From anecdotal to conclusive.",
  change: "Cause and effect: what speeds things up, slows them, or makes them worse.",
  tone: "The author's attitude — the SAT's favorite question.",
  character: "Words for how people think and behave.",
  structure: "How ideas relate: similar, opposed, hidden, central.",
  common: "Everyday words in the secondary senses the SAT tests.",
};

export const DECKS: DeckMeta[] = [
  { id: "all", title: "All words", kind: "words", blurb: "The full word bank, every category." },
  ...categorySlugs.map((slug) => ({ id: slug, title: CATEGORIES[slug], kind: "words" as const, blurb: CATEGORY_BLURBS[slug] })),
  { id: "roots", title: "Latin & Greek roots", kind: "roots", blurb: "The morphemes that link word families together." },
  { id: "starred", title: "Starred", kind: "words", starredOnly: true, blurb: "Only the cards you've starred." },
];

export function getDeck(id: string): DeckMeta | undefined {
  return DECKS.find((d) => d.id === id);
}

/** Ids of the items (word ids or root ids) a deck contains, in canonical order. */
export function deckItemIds(deck: DeckMeta): string[] {
  if (deck.kind === "roots") return roots.map((r) => r.id);
  if (deck.id === "all" || deck.starredOnly) return words.map((w) => w.id);
  return wordsInCategory(deck.id as CategorySlug).map((w) => w.id);
}

/** Which face goes on the front. Root decks only support root→meaning. */
export type CardMode = "word-def" | "def-word" | "blank-word" | "root-meaning";

export const WORD_MODES: { id: CardMode; label: string }[] = [
  { id: "word-def", label: "Word → definition" },
  { id: "def-word", label: "Definition → word" },
  { id: "blank-word", label: "Passage blank → word" },
];

export function modesFor(deck: DeckMeta): { id: CardMode; label: string }[] {
  return deck.kind === "roots" ? [{ id: "root-meaning", label: "Root → meaning" }] : WORD_MODES;
}

export interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

export function matchPairsFor(deck: DeckMeta, ids: string[]): MatchPair[] {
  if (deck.kind === "roots") {
    return ids.flatMap((id) => {
      const r = roots.find((x) => x.id === id);
      return r ? [{ id: r.id, term: r.form, definition: r.meaning }] : [];
    });
  }
  return ids.flatMap((id) => {
    const w = words.find((x) => x.id === id);
    return w ? [{ id: w.id, term: w.lemma, definition: w.primarySense }] : [];
  });
}
