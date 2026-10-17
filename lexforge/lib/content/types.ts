import type { z } from "zod";
import type { AffixSchema, RootSchema, WordSchema } from "./schema";
import type { CONNOTATIONS, DOMAINS, POS_VALUES } from "./constants";

export type POS = (typeof POS_VALUES)[number];
export type Domain = (typeof DOMAINS)[number];
export type Connotation = (typeof CONNOTATIONS)[number];

export type Word = z.infer<typeof WordSchema>;
export type Root = z.infer<typeof RootSchema>;
export type Affix = z.infer<typeof AffixSchema>;
