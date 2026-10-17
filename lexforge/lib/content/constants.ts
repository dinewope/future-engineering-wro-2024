// Zod-free constants so client bundles don't pull in the schema library.

export const DOMAINS = ["science", "history", "literature", "social-science"] as const;
export const POS_VALUES = ["noun", "verb", "adjective", "adverb"] as const;
export const CONNOTATIONS = ["positive", "negative", "neutral"] as const;

/** Category slug → display name. Slugs double as deck ids and content file names. */
export const CATEGORIES = {
  argument: "Argument & reasoning",
  evidence: "Evidence & certainty",
  change: "Change & causation",
  tone: "Tone & attitude",
  character: "People & character",
  structure: "Structure & relationships",
  common: "Common words, uncommon meanings",
} as const;
export type CategorySlug = keyof typeof CATEGORIES;

/** How a passage marks its blank. */
export const BLANK = "____";
