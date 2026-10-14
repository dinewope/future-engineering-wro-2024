# CSUcribe: Connecting the CSU Patient Journey

Clickable pitch prototype for the 2026 Teen Corporate Mentoring Program healthcare case
("Immunology: End the CSU Diagnostic Odyssey").

**Elena records. AI connects. Humans decide.**

> Prototype with fictional data. Not a medical device. No backend, no external calls, no real patient data.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # rule-engine + safety-stop unit tests (vitest)
npm run build    # static site in dist/, opens offline (dist/index.html)
```

## Sections

| Key | Section | What to show the judges |
|---|---|---|
| 1 | **Pitch** | Scrolling story, one idea per screen |
| 2 | **Elena's App** | Phone mock: UAS-worded hives/itch, swelling, EN/ES, App · Text · Call · Paper. Tick *Throat / tongue* → hard-coded 911 stop |
| 3 | **Clinician View** | Before/After toggle, swim-lane timeline (click a point → source note), *Replay weeks 1–12* pauses when the first flag appears (week 7), Refer · E-consult · Not now (reason required), printable Visit Prep sheet |
| 4 | **Impact & Plan** | Measures table, German model evidence, rollout |

`P` toggles presenter mode (hides nav, bigger text); `Esc` exits.

## Demo script (≈90 s)

1. Clinician View, **Before**: six isolated dots, no flag.
2. Switch to **After**: check-ins stitched in, *Review suggested* with 4 rules and evidence.
3. **First 12 weeks → Replay**: the flag appears at week 7, versus a month-24 referral today.
4. Elena's App: save a flare, press *Please review my story*, then back to Clinician View: the voice rule fires.
5. Tick *Throat / tongue*: red 911 banner, and nothing is saved.

## Where things live

- `src/rules.ts`: transparent "Pattern Flag" rules (time, fragmentation, burden, voice, data) + evidence strength + missing info
- `src/safety.ts`: emergency stop, deliberately **outside** the rule engine
- `src/terms.ts`: patient words → structured terms lexicon
- `src/data/elena.json`: fictional demo record
- `src/content.ts`: every statistic; fictional ones labelled, real ones with source links
