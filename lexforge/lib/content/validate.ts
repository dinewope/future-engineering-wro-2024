import { CATEGORIES, RootsFileSchema, WordSchema, type CategorySlug } from "./schema";
import type { Root, Word } from "./types";

export interface ContentFile {
  /** Category slug, i.e. the file name without `.json`. */
  slug: string;
  data: unknown;
}

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  words: Word[];
  roots: Root[];
}

import { BLANK } from "./constants";

export { BLANK };
const PRIMARY_SENSE_MAX_WORDS = 15;
const PASSAGE_MIN_WORDS = 25;
const PASSAGE_MAX_WORDS = 150;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True if `text` contains any of `forms` as a whole word (case-insensitive). */
export function containsForm(text: string, forms: readonly string[]): boolean {
  return forms.some((f) => new RegExp(`(^|[^a-z])${escapeRegExp(f.toLowerCase())}($|[^a-z])`, "i").test(text));
}

/**
 * Validates every rule from CLAUDE.md §4 and §7. Pure: the CLI script and the
 * unit tests both feed it parsed JSON.
 */
export function validateContent(files: ContentFile[], rootsData: unknown): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const words: Word[] = [];

  for (const file of files) {
    const expectedCategory = CATEGORIES[file.slug as CategorySlug];
    if (!expectedCategory) {
      errors.push(`${file.slug}.json: unknown category file (expected one of ${Object.keys(CATEGORIES).join(", ")})`);
      continue;
    }
    if (!Array.isArray(file.data)) {
      errors.push(`${file.slug}.json: must be a JSON array of words`);
      continue;
    }
    file.data.forEach((raw, i) => {
      const parsed = WordSchema.safeParse(raw);
      const label = `${file.slug}.json[${i}]${typeof (raw as { id?: unknown })?.id === "string" ? ` (${(raw as { id: string }).id})` : ""}`;
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push(`${label}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
        }
        return;
      }
      const w = parsed.data;
      if (w.category !== expectedCategory) {
        errors.push(`${label}: category "${w.category}" does not match file (${expectedCategory})`);
      }
      words.push(w);
    });
  }

  // Per-word semantic rules.
  const seen = new Map<string, string>();
  for (const w of words) {
    const label = w.id;
    if (seen.has(w.id)) errors.push(`${label}: duplicate id (also in ${seen.get(w.id)})`);
    seen.set(w.id, w.category);

    if (w.id !== w.lemma.toLowerCase().replace(/\s+/g, "-")) errors.push(`${label}: id must be the slug of lemma "${w.lemma}"`);
    if (!w.forms.map((f) => f.toLowerCase()).includes(w.lemma.toLowerCase())) errors.push(`${label}: forms must include the lemma`);
    if (countWords(w.primarySense) > PRIMARY_SENSE_MAX_WORDS) errors.push(`${label}: primarySense is over ${PRIMARY_SENSE_MAX_WORDS} words`);

    const domains = w.examples.map((e) => e.domain);
    const dupDomains = domains.filter((d, i) => domains.indexOf(d) !== i);
    if (dupDomains.length) errors.push(`${label}: duplicate example domains (${[...new Set(dupDomains)].join(", ")})`);

    w.examples.forEach((ex, i) => {
      if (!containsForm(ex.text, w.forms)) errors.push(`${label}: example ${i + 1} (${ex.domain}) does not contain the word or one of its forms`);
    });

    if (w.satPassage !== undefined) {
      const blanks = w.satPassage.split(BLANK).length - 1;
      if (blanks !== 1) errors.push(`${label}: satPassage must contain exactly one blank "${BLANK}" (found ${blanks})`);
      const n = countWords(w.satPassage);
      if (n < PASSAGE_MIN_WORDS || n > PASSAGE_MAX_WORDS) errors.push(`${label}: satPassage has ${n} words (must be ${PASSAGE_MIN_WORDS}–${PASSAGE_MAX_WORDS})`);
      if (containsForm(w.satPassage, w.forms)) errors.push(`${label}: satPassage leaks the answer (contains a form of the word)`);
    } else {
      warnings.push(`${label}: no satPassage (Level 4 will fall back to examples)`);
    }

    for (const s of w.nearSynonyms) if (s.word.toLowerCase() === w.lemma.toLowerCase()) errors.push(`${label}: lists itself as a near-synonym`);
    for (const a of w.antonyms) if (a.toLowerCase() === w.lemma.toLowerCase()) errors.push(`${label}: lists itself as an antonym`);
    for (const r of w.roots) {
      if (!w.lemma.toLowerCase().includes(r.part.toLowerCase().replace(/[-·]/g, ""))) {
        errors.push(`${label}: root part "${r.part}" does not appear in "${w.lemma}"`);
      }
    }
    if (!w.verified) warnings.push(`${label}: definition not yet verified against a dictionary`);
  }

  // Roots file and cross-references.
  let roots: Root[] = [];
  const rootsParsed = RootsFileSchema.safeParse(rootsData);
  if (!rootsParsed.success) {
    for (const issue of rootsParsed.error.issues) errors.push(`roots.json: ${issue.path.join(".")} — ${issue.message}`);
  } else {
    roots = rootsParsed.data.roots;
    const rootIds = new Set<string>();
    for (const r of roots) {
      if (rootIds.has(r.id)) errors.push(`roots.json: duplicate root id "${r.id}"`);
      rootIds.add(r.id);
    }
    const wordById = new Map(words.map((w) => [w.id, w]));
    for (const w of words) {
      for (const ref of w.roots) {
        if (!rootIds.has(ref.rootId)) errors.push(`${w.id}: references root "${ref.rootId}" which is not defined in roots.json`);
      }
    }
    for (const r of roots) {
      for (const id of r.wordIds) {
        const w = wordById.get(id);
        if (!w) errors.push(`roots.json: root "${r.id}" lists unknown word "${id}"`);
        else if (!w.roots.some((x) => x.rootId === r.id)) errors.push(`roots.json: root "${r.id}" lists "${id}", but that word does not reference the root`);
      }
    }
    for (const w of words) {
      for (const ref of w.roots) {
        const r = roots.find((x) => x.id === ref.rootId);
        if (r && !r.wordIds.includes(w.id)) errors.push(`${w.id}: references root "${r.id}", but the root's wordIds does not list it`);
      }
    }
  }

  return { errors, warnings, words, roots };
}
