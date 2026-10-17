# Changelog

## M1 — Content + Flashcards (2026-10-17)

### Built
- **Data model & schemas** — `lib/content/types.ts` + Zod mirrors in `lib/content/schema.ts`; user-state types (`UserWordState`, `UserSentence`, `ReviewLog`) in `lib/db/types.ts`, ready for M2.
- **Content validator** — `npm run validate:content` (also runs before every `npm run build`). Fails on: schema/missing fields, < 3 examples, duplicate example domains, an example without a form of the word, roots referenced but not defined, root ↔ word back-references that disagree, passages without exactly one `____`, passages outside 25–150 words, passages that leak the answer, primary senses over 15 words, duplicate ids, wrong category file, root parts not found in the lemma.
- **Word bank: 159 words** across the 7 §4.2 categories, each with POS, ≤15-word primary sense, all inflected forms, connotation, collocations, near-synonym contrasts, antonyms, 3 high-constraint examples from 3 different SAT domains, and an SAT-style blank passage. `novel` appears once (it was listed in two seed categories).
- **Roots: 34 roots + 18 affixes** (`content/roots.json`), bidirectionally linked to the words that use them; family members outside the bank live in `relatedWords`.
- **Flashcards** (`/cards/[deck]`): 10 decks (all, 7 categories, roots, starred). Four front modes (word→definition, definition→word, passage blank→word, root→meaning). 3D flip with Framer Motion (instant swap under `prefers-reduced-motion`), Space/Enter to flip, ←/→ to navigate, S to star, swipe on touch, shuffle, starred-only filter, progress bar, pronunciation via `speechSynthesis`.
- **Match game**: 6 pairs / 12 tiles, timer, +1 s per mistake, personal best per deck in IndexedDB.
- **Lexicon** (`/lexicon`): search across lemma, forms, definition and near-synonyms; filters for category, connotation, part of speech, root, starred; expandable full "Meet" view per word with color-coded root breakdown (`bene·vol·ent`).
- **Local-first storage** with Dexie (`lib/db/*`): word states (with an empty `ts-fsrs` card each), root stars, match scores, plus empty `sentences`/`reviewLogs` tables for M2–M3.
- **Design**: paper/ink/cobalt/ember tokens, Fraunces + Inter + JetBrains Mono, 8 stable root colors, automatic dark "night library" theme.

### Verified
- `npm run validate:content` → 159 words, 34 roots, 0 errors.
- `npm test` → 30 unit tests (validator rules, deck navigation, match logic, lexicon search, Dexie repositories).
- `npm run build` → passes.
- `npm run test:e2e` → happy path on desktop and a 375 px phone, with an axe WCAG 2.1 AA scan on home, cards and lexicon (0 violations) and no console errors.

### Known gaps
- **Definitions are not yet dictionary-verified**: every entry except `mitigate` ships `verified: false`. They are original wordings written for this project; checking each against Merriam-Webster/Oxford is planned alongside the M4 content expansion.
- Lighthouse was not run (no Lighthouse in the container); axe-core covers the accessibility rules instead.
- "Only words I've lapsed on" filter and Again/Hard/Good/Easy ratings need FSRS state, so they land in M2.

### Next — M2
Ladder levels 0–4 with the typed-answer checker (§6), ts-fsrs scheduling with learning steps, the daily session composer, and FSRS self-ratings on flashcards.
