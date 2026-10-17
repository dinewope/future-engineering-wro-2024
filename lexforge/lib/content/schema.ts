import { z } from "zod";
import { CATEGORIES, CONNOTATIONS, DOMAINS, POS_VALUES } from "./constants";

export { CATEGORIES, CONNOTATIONS, DOMAINS, POS_VALUES };
export type { CategorySlug } from "./constants";

export const CATEGORY_NAMES = Object.values(CATEGORIES) as [string, ...string[]];

const slug = z.string().regex(/^[a-z][a-z0-9-]*$/, "must be a lowercase slug");
const nonEmpty = z.string().trim().min(1);

export const ExampleSchema = z.object({
  domain: z.enum(DOMAINS),
  text: nonEmpty,
  highConstraint: z.literal(true),
});

export const WordSchema = z.object({
  id: slug,
  lemma: nonEmpty,
  pos: z.enum(POS_VALUES),
  primarySense: nonEmpty,
  otherSenses: z.array(nonEmpty).optional(),
  forms: z.array(nonEmpty).min(1),
  roots: z.array(z.object({ rootId: slug, part: nonEmpty })),
  etymologyNote: nonEmpty.optional(),
  connotation: z.enum(CONNOTATIONS),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  category: z.enum(CATEGORY_NAMES),
  collocations: z.array(nonEmpty).min(1),
  nearSynonyms: z.array(z.object({ word: nonEmpty, difference: nonEmpty })).min(1),
  antonyms: z.array(nonEmpty),
  confusables: z.array(z.object({ word: nonEmpty, note: nonEmpty })).optional(),
  examples: z.array(ExampleSchema).min(3, "needs at least 3 examples"),
  satPassage: nonEmpty.optional(),
  mnemonic: nonEmpty.optional(),
  verified: z.boolean(),
}).strict();

export const RootSchema = z.object({
  id: slug,
  form: nonEmpty,
  origin: z.enum(["Latin", "Greek"]),
  meaning: nonEmpty,
  wordIds: z.array(slug),
  /** Family members outside the word bank — shown in the Root Explorer, not linked. */
  relatedWords: z.array(nonEmpty).default([]),
}).strict();

export const AffixSchema = z.object({
  form: nonEmpty,
  kind: z.enum(["prefix", "suffix"]),
  meaning: nonEmpty,
}).strict();

export const RootsFileSchema = z.object({
  roots: z.array(RootSchema),
  affixes: z.array(AffixSchema),
}).strict();
