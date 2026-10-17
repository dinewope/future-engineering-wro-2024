import type { CategorySlug } from "@/lib/content/constants";
import { CATEGORIES } from "@/lib/content/constants";
import type { Connotation, POS, Word } from "@/lib/content/types";

export interface LexiconFilters {
  query: string;
  category: CategorySlug | "all";
  connotation: Connotation | "all";
  pos: POS | "all";
  rootId: string | "all";
  starredOnly: boolean;
}

export const DEFAULT_FILTERS: LexiconFilters = { query: "", category: "all", connotation: "all", pos: "all", rootId: "all", starredOnly: false };

/**
 * Search matches the lemma, its forms, the definition, and near-synonyms, so
 * typing "reduce" finds mitigate. Lemma hits sort first.
 */
export function filterWords(words: readonly Word[], f: LexiconFilters, starred: ReadonlySet<string>): Word[] {
  const q = f.query.trim().toLowerCase();
  const scored: { w: Word; score: number }[] = [];
  for (const w of words) {
    if (f.category !== "all" && w.category !== CATEGORIES[f.category]) continue;
    if (f.connotation !== "all" && w.connotation !== f.connotation) continue;
    if (f.pos !== "all" && w.pos !== f.pos) continue;
    if (f.rootId !== "all" && !w.roots.some((r) => r.rootId === f.rootId)) continue;
    if (f.starredOnly && !starred.has(w.id)) continue;
    if (!q) {
      scored.push({ w, score: 0 });
      continue;
    }
    let score = -1;
    if (w.lemma.toLowerCase().startsWith(q)) score = 3;
    else if (w.forms.some((x) => x.toLowerCase().includes(q))) score = 2;
    else if (w.primarySense.toLowerCase().includes(q) || w.nearSynonyms.some((s) => s.word.toLowerCase().includes(q))) score = 1;
    if (score >= 0) scored.push({ w, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.w.lemma.localeCompare(b.w.lemma))
    .map((s) => s.w);
}
