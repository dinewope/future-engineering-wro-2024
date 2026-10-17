# LEXFORGE — SAT Vocabulary Through Use, Not Recognition

> **How to use this file:** open Claude Code in this folder and say:
> *"Read CLAUDE.md. Build Milestone N, run the tests, then stop and show me."*
> Then continue milestone by milestone. Progress so far is in `CHANGELOG.md`.

---

## 0. The one-sentence product

A web app where every SAT word is learned by **climbing a ladder from guessing → recognizing → recalling → typing it into SAT-style blanks → writing your own sentences that prove you understand it**, scheduled by a modern spaced-repetition algorithm, with Latin/Greek roots as the connective tissue between words.

Quizlet asks *"do you recognize this?"* LexForge asks *"can you use this so precisely that nothing else would fit?"* — which is exactly what the Digital SAT asks.

---

## 1. Why the design looks like this (research → features)

Every feature below exists because of one of these findings. Do not remove a mechanic without understanding which principle it serves.

| # | Finding | What it means for the app |
|---|---------|---------------------------|
| R1 | **Spaced retrieval beats restudying.** Testing yourself across spaced sessions produced better one-week recall *and* better transfer to new definitions than re-reading (Alakbarova, UT Arlington, 2022). | Almost no passive "read the card" time. Every exposure after the first is a retrieval attempt. |
| R2 | **Spacing only works once retrieval can succeed.** Under fixed time, more early repetitions helped, especially for hard items; spacing paid off only after enough prior repetitions (Cognitive Science Society, 2025, N≈1,589). | New words go through short *learning steps* (minutes apart, same session) before the long-interval scheduler takes over. |
| R3 | **Expanding intervals outperform contracting ones** for long-term L2 vocabulary retention (KATE journal study, Japanese university learners). | Intervals grow after each success. Handled by FSRS (R4). |
| R4 | **FSRS > SM-2.** FSRS models each card with difficulty, stability, retrievability; it's in Anki since 23.10, and benchmarks show it needs noticeably fewer reviews for the same retention than SM-2. | Use the open-source `ts-fsrs` package. Target retention 0.90 by default, user-adjustable. |
| R5 | **Generating sentences beats copying definitions.** Students who wrote a meaningful sentence with each word outperformed definition-only and definition-inference groups at 48 hours and 21 days (Badgett, UNLV, 2003). Longer generated sentences → better recall (Psychonomic Society). | Sentence writing is the core mastery gate, not an optional extra. |
| R6 | **But generation is not magic on first contact.** Some studies found no generation benefit for initial L2 vocabulary, and Barcroft found sentence writing during first exposure can *hurt* learning of the word form. | Do NOT make users write sentences the first time they see a word. Production unlocks only after recognition + recall succeed. |
| R7 | **Varied contexts build flexible knowledge.** Meeting a word in four disparate contexts let learners apply it to new situations better than four related contexts (Nitsch, 1978); many encounters are needed and meaning builds incrementally. | Every word ships with ≥3 example sentences from *different domains* (science, history, literature, economics/social science) — the four domains SAT passages come from. |
| R8 | **Many encounters are required.** Estimates range from ~8 to 20+ encounters; ~10 exposures can give recognition but not usable knowledge. | Mastery = multiple successful *productive* uses on different days, not one correct flashcard flip. |
| R9 | **Roots link words into families.** ~76% of high-frequency academic words share morphological roots (Newton, *Education Sciences*, 2018); explicit Latin/Greek morphology instruction is an effective path to academic vocabulary. | A Root graph. Every word links to its roots; every root shows its family. A "Root Detective" mode makes you decode unseen words. |
| R10 | **Pretesting effect.** Attempting an answer *before* studying improves later memory, even when the guess is wrong. | First contact with a word = "guess from context" before the definition is revealed. |
| R11 | **Keyword mnemonics: fast in, fast out.** Better immediate recall, but faster forgetting than rote unless reviewed repeatedly; with ~5 reviews it caught up to context-based learning (Wang et al., 1992/1995). | Mnemonics are *optional hooks* displayed on lapse, never a replacement for context practice. |
| R12 | **The Digital SAT tests high-utility words in context.** Words in Context sits in Craft & Structure (~28% of R&W questions, along with Text Structure & Cross-Text). Passages are ~25–150 words; the common format is "choose the most logical and precise word" for a blank. Precision, connotation, and secondary meanings of common words are what's tested — not obscure words. | (a) The word list is high-utility academic vocabulary, not "pulchritude." (b) A Bluebook-style practice mode. (c) A dedicated deck for *common words with uncommon meanings*. (d) "Nuance Duels" for near-synonyms with different connotation (frugal vs stingy). |
| R13 | **Producing a word aloud** improves memory relative to reading silently (production effect). | Optional "say it" step with Web Speech API pronunciation. |

---

## 2. The Learning Ladder (core mechanic)

Each word has a **depth level 0–6**. Each level is a different exercise type. Depth only goes up on success and drops one level on a lapse (never to zero after level 3).

| Level | Name | Exercise | Input | Passing condition |
|---|---|---|---|---|
| 0 | **Guess** | Show the word in one high-constraint SAT-style sentence. "What do you think it means?" (R10) | Free text OR 4 options | Any attempt (it's a pretest — always "passes") |
| 1 | **Meet** | Card reveals: definition, POS, root breakdown, 3 varied-domain sentences, connotation tag, collocations, near-synonym contrast, pronunciation | Read + press "Got it" | Time-on-card ≥ 4s (prevents skip-spam) |
| 2 | **Recognize** | Definition → pick the word (4 options, distractors from same semantic cluster) | Click | Correct |
| 3 | **Recall** | Definition + first letter → **type the word** | Typing | Exact or typo-tolerant match (see §6) |
| 4 | **Blank** | SAT-format: 25–150 word passage with a blank → **type** the word (no options) | Typing | Accept the word or any valid inflection |
| 5 | **Forge** | **Write your own sentence** using the word. Graded by AI (see §5) | Typing | Grade ≥ "solid" on meaning AND context strength |
| 6 | **Transfer** | Forge again, but in an assigned domain different from your previous sentences ("Use *mitigate* in a sentence about the French Revolution") OR win a Nuance Duel | Typing / click | Pass + on a different calendar day than level 5 |

**Mastered** = reached level 6 on two separate days. Mastered words still enter FSRS review, but reviews rotate through levels 3–6 so you're never just flipping cards.

Learning steps (R2): levels 0–3 happen in the same session with short gaps (1 min → 10 min re-checks); FSRS long-interval scheduling begins once level 3 is first passed.

### The "Echo" loop (signature feature)
Every sentence the user writes in Forge is saved. Weeks later, it **comes back as a Level 4 Blank** — the user's own sentence with the word removed. Your past self becomes your quiz writer. This fuses generation (R5) with spaced retrieval (R1) and makes the context personally meaningful.

---

## 3. Feature list

### 3.1 Daily Session (home screen hero)
- One button: **"Start today's session"** (~15–20 min).
- Session composer interleaves: due reviews (FSRS) → new words (default 10/day, setting 5–25) → 1 root of the day → 1–2 Echo cards → 1 Nuance Duel.
- Never two consecutive cards for the same word. Interleave word types.
- End-of-session summary: words climbed, lapses, tomorrow's due count, one sentence from today shown back ("Your best sentence today").

### 3.2 Flashcards (Quizlet-style)
- **Flip mode:** big card, click/space to flip, ←/→ to navigate, ★ to star. Front/back configurable (word→definition, definition→word, root→meaning, sentence-with-blank→word).
- **Learn mode:** Quizlet-"Learn"-like adaptive loop, but backed by the Ladder levels 2–4.
- **Match game:** 6–8 tiles (words + definitions or roots + meanings), timed, personal best per deck.
- **Test mode:** generate a mixed test (MCQ, typed recall, blanks) of N questions from a deck, with a score report.
- Shuffle, starred-only, "only words I've lapsed on" filters.
- Smooth 3D flip animation (CSS `transform: rotateY`), respects `prefers-reduced-motion`.
- **Self-rating after flip** uses FSRS grades: Again / Hard / Good / Easy (keys 1–4).

### 3.3 Forge (sentence writing)
- Text box with the target word, its POS, and an optional domain prompt.
- Live checks before submit: contains a form of the word; ≥ 8 words; not identical to an example sentence.
- After submit: AI feedback card (see §5) with score chips, one-line fix, and an upgraded version of *their* sentence (not a fresh example).
- "Swap test" visual: shows their sentence with the word replaced by a generic word ("good", "change", "big"). If the sentence still makes sense, the sentence doesn't prove understanding → nudge to add a context clue.

### 3.4 Root Explorer
- Grid/graph of roots (force-directed graph with d3 or a clean grid fallback on mobile).
- Click root → meaning, origin (Latin/Greek), family of words, which family words you've mastered (progress ring).
- **Root Detective mode:** show an unfamiliar word built from known roots (e.g., *circumspect* after learning *circum* + *spec*) → user guesses meaning → reveal. This turns roots into a transfer tool (R9).
- Roots are also FSRS cards.

### 3.5 Nuance Duels
- Two (or three) near-synonyms, one sentence, pick the one that fits by connotation/strength: *frugal* vs *stingy*, *candid* vs *blunt*, *skeptical* vs *cynical*, *mitigate* vs *eliminate*, *assert* vs *suggest*.
- Explanation after each answer. Tied to R12 (precision is what the SAT rewards).

### 3.6 Bluebook Mode (SAT simulation)
- Two-pane layout mimicking the Digital SAT: short passage on the left, question + 4 choices on the right, question navigator, timer (~71 sec/question budget), "mark for review."
- Question types: "most logical and precise word or phrase" (blank) and "as used in the text, what does X most nearly mean?"
- Items generated from the word bank + user's mastered words; distractors must be real words that are close in meaning but wrong in connotation/precision.

### 3.7 Lexicon (personal word book)
- Every word: depth level, FSRS stability, next due date, all user sentences (with grades), lapse history.
- Search, filter by level/root/category/connotation.
- Export: CSV / Anki-compatible TSV / **Quizlet import format** (term TAB definition, newline between cards).
- Import: paste a Quizlet export or CSV → new deck. Enriched later via AI if key is set.

### 3.8 Progress & Insight
- Retention forecast: "If you stop today, you'll still know ~N words in 30 days" (from FSRS retrievability).
- Depth histogram (how many words at each Ladder level).
- Heatmap calendar of study days (GitHub-style). Streak shown but **soft** — missing a day never wipes progress.
- "Leeches": words lapsed ≥ 4 times → flagged for a special treatment (mnemonic hook shown, extra varied sentences, root re-teach).

### 3.9 Small but important
- Pronunciation via `speechSynthesis` (free, offline). Optional "say it aloud" checkbox step (R13).
- Keyboard-first everywhere; full mobile support (thumb-reachable buttons, swipe on flashcards).
- Dark mode.
- PWA: installable, works offline (except AI grading).

---

## 4. Content: words, roots, and the data model

### 4.1 Word selection rules (R12)
- Prioritize **high-utility academic (Tier 2) words** that SAT passages use for argument, tone, evidence, and cause/effect.
- Include a **"common words, uncommon meanings"** deck — the SAT loves secondary senses.
- Exclude archaic/obscure words that old pre-2016 lists contained.
- Target: ship with **~400 words** at launch; the seed below is ~150. **Expand to ~400 using the same categories, then verify every definition against a reputable dictionary (Merriam-Webster / Oxford wording paraphrased, never copied).** Mark each entry `verified: true/false`.

### 4.2 Seed list (by function)

**Argument & reasoning**
assert, contend, posit, refute, rebut, concede, corroborate, substantiate, undermine, bolster, validate, dispute, infer, deduce, speculate, presume, advocate, endorse, discredit, reconcile, synthesize, extrapolate, underscore, allude, dismiss

**Evidence & certainty**
tentative, conclusive, compelling, plausible, dubious, tenuous, robust, negligible, marginal, substantial, preliminary, definitive, anecdotal, empirical, provisional, cursory, rigorous, spurious

**Change & causation**
catalyze, precipitate, exacerbate, mitigate, alleviate, curtail, augment, diminish, proliferate, wane, burgeon, stagnate, induce, foster, impede, hinder, facilitate, galvanize, perpetuate, supplant, undergird, erode, accelerate, stymie

**Tone & attitude**
ambivalent, indifferent, skeptical, wary, reverent, dismissive, sardonic, wistful, candid, earnest, ardent, apprehensive, disdainful, nostalgic, laudatory, incredulous, scathing, conciliatory, pragmatic, idealistic, cynical, measured, irreverent, deferential

**People & character**
meticulous, diligent, frugal, prudent, audacious, tenacious, complacent, eloquent, reticent, gregarious, magnanimous, obstinate, versatile, resilient, judicious, scrupulous, aloof, benevolent, pugnacious, diffident

**Structure & relationships**
analogous, disparate, contingent, inherent, intrinsic, ubiquitous, paradoxical, ambiguous, explicit, implicit, coherent, novel, conventional, unprecedented, arbitrary, incongruous, comprehensive, discrete, reciprocal, peripheral, salient, nuanced, homogeneous, anomalous

**Common words, uncommon meanings** *(store the SAT-relevant sense as `primarySense`)*
- qualify — to limit or modify a claim
- check — to restrain or hold back
- sound — reliable, well-founded
- grave — serious, solemn
- arrest — to stop; *arresting* = striking, attention-grabbing
- command — to have mastery of ("a command of three languages")
- appreciate — to rise in value
- economy — efficient use, thrift ("economy of language")
- yield — to produce; to give way
- concrete — specific, tangible
- deliberate — careful and intentional; (verb) to consider carefully
- discriminating — showing refined judgment
- entertain — to consider an idea
- host — a large number ("a host of problems")
- reserve — restraint in expression
- temper — to moderate
- betray — to reveal unintentionally ("her voice betrayed her nerves")
- champion — to support or defend
- flag — to weaken or lose energy
- fast — firmly fixed ("hold fast")
- telling — revealing
- marked — noticeable, distinct
- novel — new and original
- conviction — firm belief
- regard — to consider or view

### 4.3 Roots (seed — expand to ~60)

| Root | Origin | Meaning | Family (from word bank) |
|---|---|---|---|
| bene | L | good, well | benevolent, benign, benefactor |
| mal | L | bad | malevolent, malicious, malign |
| vol | L | wish, will | benevolent, malevolent, volition |
| ambi | L | both | ambivalent, ambiguous |
| cred | L | believe | credible, incredulous, discredit |
| dict | L | say | contradict, dictate, verdict |
| duc / duct | L | lead | induce, deduce, conducive |
| equ | L | equal | equitable, equivocal, equanimity |
| fid | L | faith, trust | fidelity, confide, diffident |
| flu / flux | L | flow | fluctuate, affluent, superfluous |
| gen | L/G | birth, kind | generate, genesis, homogeneous |
| loqu / locu | L | speak | eloquent, loquacious, circumlocution |
| luc / lum | L | light | lucid, elucidate, luminous |
| mut | L | change | mutable, immutable, commute |
| nov | L | new | novel, innovate, renovate |
| path | G | feeling, suffering | empathy, apathy, pathos |
| pugn / pug | L | fight | pugnacious, repugnant, impugn |
| scrib / script | L | write | prescribe, inscribe, circumscribe |
| sequ / secu | L | follow | consequence, subsequent, sequential |
| spec / spic | L | look | speculate, conspicuous, circumspect |
| ten / tain | L | hold | tenacious, tenable, sustain |
| tenu | L | thin | tenuous, attenuate |
| vers / vert | L | turn | divert, adversity, versatile, averse |
| voc / vok | L | call, voice | evoke, provoke, advocate, equivocal |
| ced / cess | L | go, yield | precede, concede, recede |
| ver | L | true | veracity, verify, aver |
| jud / jur | L | judge, law | judicious, prejudice, jurisdiction |
| magn | L | great | magnanimous, magnitude |
| anim | L | mind, spirit | magnanimous, animosity, unanimous |
| plac | L | please, calm | placate, complacent, placid |
| mit / miss | L | send | remit, intermittent, dismiss |
| chron | G | time | chronic, anachronism, chronicle |
| mitis | L | mild, soft | mitigate |
| ag / act | L | drive, do | mitigate, agent, react |

**Prefixes:** circum- (around), contra-/anti- (against), sub- (under), trans- (across), pre- (before), pro- (forward), de- (down/away), dis- (apart/not), in-/im- (not), inter- (between), re- (again/back), ex-/e- (out).
**Suffixes:** -ous/-ose (full of), -ity (state of), -ize/-ate (to make), -ible/-able (capable of), -ive (tending to), -ent/-ant (one who / being).

### 4.4 Data model (TypeScript — keep these names)

Implemented in `lib/content/types.ts` (content) and `lib/db/types.ts` (user state). Zod mirrors in `lib/content/schema.ts`.

```ts
type POS = "noun" | "verb" | "adjective" | "adverb";
type Domain = "science" | "history" | "literature" | "social-science";
type Connotation = "positive" | "negative" | "neutral";

interface Word {
  id: string;                 // slug, e.g. "mitigate"
  lemma: string;
  pos: POS;
  primarySense: string;       // SAT-relevant definition, ≤ 15 words, original wording
  otherSenses?: string[];
  forms: string[];            // ["mitigate","mitigates","mitigated","mitigating","mitigation"]
  roots: { rootId: string; part: string }[];   // [{rootId:"mitis", part:"miti"}, ...]
  etymologyNote?: string;     // "Latin mitis 'mild' + agere 'to drive'"
  connotation: Connotation;
  intensity?: 1 | 2 | 3;      // for near-synonym scales (e.g. dislike < disdain < loathe)
  category: string;           // from §4.2
  collocations: string[];     // ["mitigate risk", "mitigate the effects of"]
  nearSynonyms: { word: string; difference: string }[];
  antonyms: string[];
  confusables?: { word: string; note: string }[];   // mitigate vs militate
  examples: { domain: Domain; text: string; highConstraint: true }[]; // ≥3, distinct domains
  satPassage?: string;        // 25–150 words, blank marked as ____
  mnemonic?: string;          // optional, shown on lapse (R11)
  verified: boolean;
}

interface Root { id: string; form: string; origin: "Latin" | "Greek"; meaning: string; wordIds: string[]; }

interface UserWordState {
  wordId: string;
  depth: 0|1|2|3|4|5|6;
  fsrs: import("ts-fsrs").Card;        // persisted FSRS card
  level6Days: string[];                // ISO dates on which level 6 was passed
  lapses: number;
  isLeech: boolean;
  starred: boolean;
}

interface UserSentence {
  id: string; wordId: string; text: string; domain?: Domain;
  createdAt: string;
  grade?: SentenceGrade;
  echoDueAt?: string;                  // when it comes back as a blank
}

interface ReviewLog { wordId: string; at: string; exercise: "guess"|"recognize"|"recall"|"blank"|"forge"|"transfer"|"duel"|"flip"; correct: boolean; rating?: 1|2|3|4; ms: number; }
```

### 4.5 Quality bar for every word

See `content/words/change.json` → `mitigate` for the reference entry.

**High-constraint rule:** every example and passage must contain a context clue (contrast, cause/effect, restatement, or example) strong enough that a reader could infer the meaning. "It was mitigated" alone is useless.

---

## 5. AI sentence grading (Forge + Transfer)

### 5.1 Architecture
- Server route `POST /api/grade` (Next.js route handler) calls the Claude API. **API key lives in `.env.local` as `ANTHROPIC_API_KEY`, never in the client bundle.**
- Model configurable via `GRADER_MODEL` env var; default to a small fast Claude model (e.g. `claude-haiku-5-5`). Use structured JSON output and validate it with Zod; on invalid JSON, retry once, then fall back.
- Cache grades by hash(word + sentence).
- **No key? Fallback mode:** rule-based checks (word form present, length, not a copy of an example, swap-test heuristic) + user self-grade with a rubric checklist. App must be 100% usable without AI.

### 5.2 Rubric the grader returns

```ts
interface SentenceGrade {
  meaningCorrect: boolean;      // used in the intended sense (or a valid other sense — say which)
  grammarOk: boolean;           // correct POS and form
  collocationNatural: boolean;  // "mitigate a risk" ✓, "mitigate a happiness" ✗
  contextStrength: 0|1|2|3;     // 0 = word is replaceable by a generic word; 3 = meaning inferable from the sentence alone
  swapTestPassed: boolean;      // fails if a generic word (good/bad/change/big) fits equally well
  overall: "redo" | "almost" | "solid" | "excellent";
  feedback: string;             // ≤ 2 sentences, specific, encouraging, no generic praise
  upgradedVersion: string;      // the USER's sentence improved minimally — not a brand-new sentence
}
```

Pass = `meaningCorrect && grammarOk && contextStrength >= 2`.

### 5.3 Grader system prompt (put in `lib/grader/prompt.ts`)
> You are an exacting but kind SAT writing coach. Grade one student sentence that uses the target word. Judge whether the sentence *proves* the student understands the word: would a reader who didn't know the word be able to infer its meaning from this sentence? Penalize sentences where a generic word could replace the target with no loss. Check part of speech, form, and natural collocation. Keep feedback to two sentences, specific to this sentence. For `upgradedVersion`, change as few words as possible in the student's own sentence. Return only JSON matching the schema.

Include in the prompt: lemma, POS, primarySense, connotation, collocations, and the student's sentence. Never send personal data.

---

## 6. Answer checking for typed input (levels 3–4)

- Normalize: trim, lowercase, collapse spaces, strip punctuation at edges.
- Accept any entry in `forms`.
- Typo tolerance: Damerau-Levenshtein distance ≤ 1 for words ≤ 7 letters, ≤ 2 for longer words → mark **"correct, but check spelling"** and show the correct spelling; FSRS rating capped at *Hard*.
- Wrong but is a near-synonym from `nearSynonyms` → special feedback: "Close in meaning — here's why *X* fits better," and count as incorrect.
- Show the correct answer with the root breakdown on every miss (re-encoding moment).

---

## 7. Tech stack & project rules

- **Next.js (App Router) + TypeScript (strict) + Tailwind CSS.**
- **ts-fsrs** for scheduling (do not hand-roll SM-2).
- **Dexie (IndexedDB)** for all user data — local-first, no login needed for v1. Keep a repository layer (`lib/db/*`) so a cloud backend (e.g. Supabase) can be swapped in later.
- **Zod** for content and API schemas. Content lives in `content/words/*.json` and `content/roots.json`, validated at build time by a script (`npm run validate:content`) that fails on: missing fields, <3 examples, duplicate domains, examples without the word, roots referenced but not defined.
- **Framer Motion** for card flips/transitions (respect reduced motion).
- **Vitest** for unit tests (answer checker, session composer, depth-level transitions, FSRS integration). **Playwright** for one end-to-end happy path per milestone.
- PWA via `next-pwa` or equivalent in the last milestone.
- No user tracking/analytics. No ads. No external fonts except via Google Fonts.

### Folder layout
```
app/            (routes: /, /session, /cards/[deck], /forge, /roots, /duels, /bluebook, /lexicon, /progress, /settings)
components/
lib/
  fsrs/         (wrapper around ts-fsrs)
  ladder/       (depth transitions, exercise selection)
  session/      (daily session composer)
  check/        (typed-answer checker)
  grader/       (prompt, schema, fallback)
  db/           (Dexie schema + repositories)
content/
  words/        (one JSON per category)
  roots.json
scripts/validate-content.ts
tests/
```

---

## 8. Visual design direction

**"Scholar's index card, rebuilt for the future."** Warm off-white paper surfaces with subtle grain, ink-black type, one accent color (deep cobalt) for actions and one (ember orange) for streak/lapse signals. Display serif (e.g. Fraunces or Newsreader) for the word itself — the word should feel *heavy* on the card. Clean sans (Inter) for UI, **monospace for roots** so morphemes look like code fragments: `circum·spect`. Root parts are color-coded and the same color everywhere a root appears. Dark mode = "night library": charcoal paper, cream ink.

Rules: large word, generous whitespace, one primary action per screen, no confetti spam — mastery moments get a single tasteful animation (the word "stamps" into the Lexicon).

---

## 9. Milestones (build in order; stop after each for review)

**M1 — Content + Flashcards** ✅ (see CHANGELOG)
- Data model, Zod schemas, content validator, seed of 150 words + 32 roots fully populated to §4.5's bar.
- Flashcards: flip, star, shuffle, keyboard shortcuts, Match game.
- Lexicon list with search/filter.
- Tests: content validator, card navigation.

**M2 — Ladder + FSRS + Daily Session**
- Levels 0–4 with typed-answer checker (§6).
- ts-fsrs integration, learning steps, session composer (§3.1), Again/Hard/Good/Easy.
- Tests: depth transitions, scheduler, checker edge cases (inflections, typos, near-synonyms).

**M3 — Forge, Transfer, Echo**
- `/api/grade` with Claude, Zod-validated output, caching, no-key fallback.
- Level 5–6, swap-test visualization, Echo loop scheduling user sentences back as blanks.

**M4 — Roots, Duels, Bluebook**
- Root Explorer + Root Detective, Nuance Duels, Bluebook simulation mode.
- Expand content to ~400 words / ~60 roots.

**M5 — Insight + Polish**
- Progress page (retention forecast, depth histogram, heatmap, leeches).
- Import/export (CSV, Anki TSV, Quizlet format), PWA, dark mode audit, mobile audit, accessibility pass (focus states, ARIA on cards, contrast ≥ 4.5:1).

---

## 10. Definition of done (every milestone)
- `npm run build`, `npm test`, `npm run validate:content` all pass.
- Works on a 375px-wide phone screen and on desktop.
- No console errors. Lighthouse accessibility ≥ 95.
- A short `CHANGELOG.md` entry describing what was built and what's next.

---

## 11. Future ideas (don't build yet — keep architecture open for them)
- **Reading Radar:** paste any article → highlights words from your bank and words worth adding, with one-click "add to deck."
- **Duel a friend:** shared Nuance Duel rooms (needs backend).
- **Adaptive word bank:** use the user's Bluebook mistakes to auto-prioritize which categories to introduce next.
- **Voice Forge:** say your sentence aloud; speech-to-text → grader.
- **Teacher mode:** a class code, assigned decks, sentence wall.

---

## Sources (research behind §1)
- Spaced retrieval vs restudy for vocabulary — UT Arlington thesis (Alakbarova, 2022): https://uta-ir.tdl.org/uta-ir/handle/10106/31392
- Spacing vs repetition under time constraints — Cognitive Science Society: https://escholarship.org/uc/item/61p4p686
- Expanding vs equal vs contracting intervals — KATE journal: https://www.jstage.jst.go.jp/browse/katejournal/list/-char/en
- FSRS vs SM-2 — Anki FAQ: https://faqs.ankiweb.net/what-spaced-repetition-algorithm ; overview: https://www.mindomax.com/fsrs-vs-sm2-spaced-repetition-algorithm
- Sentence generation & vocabulary (Badgett, 2003): https://oasis.library.unlv.edu/rtds/1577 ; long vs short generated sentences: https://link.springer.com/article/10.3758/BF03330366
- Limits of generation in L2 vocabulary: https://etheses.bham.ac.uk/id/eprint/14831 ; word writing (Barcroft): https://uwe-repository.worktribe.com/OutputFile/869189
- Morphology & academic vocabulary (Newton, 2018): https://www.mdpi.com/2227-7102/8/4/161/xml
- Varied contexts (Nitsch, 1978, via Lextutor): https://www.lextutor.ca/text_encounters/Ch05.doc ; encounters needed: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01396/pdf
- Keyword mnemonic long-term retention: https://stars.library.ucf.edu/scopus1990/1045 ; https://archive.memory-key.com/node/1518
- Pretesting effect: https://par.nsf.gov/search/author:"Sana, F"
- Production effect (saying words aloud): https://www.academia.edu/Documents/in/Generation_Effect
- Digital SAT Words in Context / Craft & Structure: https://num8ers.com/sat/sat-reading-synonym-context-clues-determine-word-meanings/ ; https://num8ers.com/sat/find-words-using-context-sat-quiz-foundation/ ; https://www.oneprep.co/blog/best-ways-to-study-sat-vocabulary-in-context
