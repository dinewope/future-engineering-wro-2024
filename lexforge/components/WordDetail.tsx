import { DOMAINS } from "@/lib/content/constants";
import type { Word } from "@/lib/content/types";
import { Chip, ConnotationChip } from "./CardFaces";
import { Passage } from "./Passage";
import { RootBreakdown } from "./RootBreakdown";

const DOMAIN_LABEL: Record<(typeof DOMAINS)[number], string> = {
  science: "Science",
  history: "History",
  literature: "Literature",
  "social-science": "Social science",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="font-mono text-xs uppercase tracking-widest text-ink-soft">{title}</h4>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

/** Everything a Level 1 "Meet" card shows (CLAUDE.md §2). */
export function WordDetail({ word }: { word: Word }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-5">
        <Section title="Meaning">
          <p className="text-lg">{word.primarySense}</p>
          {word.otherSenses && <p className="mt-1 text-sm text-ink-soft">Also: {word.otherSenses.join("; ")}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip className="border border-rule">{word.pos}</Chip>
            <ConnotationChip word={word} />
          </div>
        </Section>
        <Section title="Roots">
          <RootBreakdown word={word} />
        </Section>
        <Section title="Collocations">
          <ul className="flex flex-wrap gap-2">
            {word.collocations.map((c) => (
              <li key={c} className="rounded-md bg-paper px-2 py-1 text-sm">
                {c}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Near-synonyms — not interchangeable">
          <ul className="space-y-1 text-sm">
            {word.nearSynonyms.map((s) => (
              <li key={s.word}>
                <span className="font-semibold">{s.word}</span> <span className="text-ink-soft">— {s.difference}</span>
              </li>
            ))}
          </ul>
        </Section>
        {word.antonyms.length > 0 && (
          <Section title="Antonyms">
            <p className="text-sm">{word.antonyms.join(", ")}</p>
          </Section>
        )}
        {word.confusables && (
          <Section title="Don't confuse with">
            <ul className="space-y-1 text-sm">
              {word.confusables.map((c) => (
                <li key={c.word}>
                  <span className="font-semibold">{c.word}</span> <span className="text-ink-soft">— {c.note}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
      <div className="space-y-5">
        <Section title="In context">
          <ul className="space-y-3">
            {word.examples.map((e) => (
              <li key={e.domain} className="border-l-2 border-rule pl-3">
                <span className="font-mono text-xs text-ink-soft">{DOMAIN_LABEL[e.domain]}</span>
                <p className="font-serif">{e.text}</p>
              </li>
            ))}
          </ul>
        </Section>
        {word.satPassage && (
          <Section title="SAT-style passage">
            <Passage text={word.satPassage} className="rounded-xl bg-paper p-3 font-serif text-sm leading-relaxed" />
          </Section>
        )}
        {word.mnemonic && (
          <Section title="Memory hook">
            <p className="text-sm text-ink-soft">{word.mnemonic}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
