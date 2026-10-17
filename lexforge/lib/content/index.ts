import argument from "@/content/words/argument.json";
import evidence from "@/content/words/evidence.json";
import change from "@/content/words/change.json";
import tone from "@/content/words/tone.json";
import character from "@/content/words/character.json";
import structure from "@/content/words/structure.json";
import common from "@/content/words/common.json";
import rootsFile from "@/content/roots.json";
import { CATEGORIES, type CategorySlug } from "./constants";
import type { Affix, Root, Word } from "./types";

// Content is validated by `npm run validate:content` (run before every build),
// so the app trusts the JSON shape here instead of re-parsing it at runtime.
const byCategory: Record<CategorySlug, Word[]> = {
  argument: argument as Word[],
  evidence: evidence as Word[],
  change: change as Word[],
  tone: tone as Word[],
  character: character as Word[],
  structure: structure as Word[],
  common: common as Word[],
};

export const categorySlugs = Object.keys(CATEGORIES) as CategorySlug[];
export const words: Word[] = categorySlugs.flatMap((slug) => byCategory[slug]);
export const roots: Root[] = (rootsFile.roots as Omit<Root, "relatedWords">[]).map((r) => ({ relatedWords: [], ...r }));
export const affixes: Affix[] = rootsFile.affixes as Affix[];

export const wordById = new Map(words.map((w) => [w.id, w]));
export const rootById = new Map(roots.map((r) => [r.id, r]));

export function wordsInCategory(slug: CategorySlug): Word[] {
  return byCategory[slug];
}

export function categorySlugOf(word: Word): CategorySlug {
  return categorySlugs.find((s) => CATEGORIES[s] === word.category) ?? "argument";
}

export { CATEGORIES };
export type { CategorySlug };
