"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, categorySlugs, roots, words } from "@/lib/content";
import { CONNOTATIONS, POS_VALUES } from "@/lib/content/constants";
import { useStarred } from "@/lib/db/hooks";
import { DEFAULT_FILTERS, filterWords, type LexiconFilters } from "@/lib/lexicon/filter";
import { ConnotationChip } from "./CardFaces";
import { SpeakButton } from "./SpeakButton";
import { StarButton } from "./StarButton";
import { WordDetail } from "./WordDetail";

const sortedRoots = [...roots].filter((r) => r.wordIds.length > 0).sort((a, b) => a.form.localeCompare(b.form));

function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-full border border-rule bg-card px-4 text-sm">
      <span className="text-ink-soft">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className="min-w-0 bg-transparent font-medium focus:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Lexicon() {
  const starred = useStarred();
  const [f, setF] = useState<LexiconFilters>(DEFAULT_FILTERS);
  const [open, setOpen] = useState<string | null>(null);
  const results = useMemo(() => filterWords(words, f, starred), [f, starred]);
  const set = <K extends keyof LexiconFilters>(k: K) => (v: LexiconFilters[K]) => setF((p) => ({ ...p, [k]: v }));
  const filtered = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">Search words</span>
          <input
            type="search"
            value={f.query}
            onChange={(e) => set("query")(e.target.value)}
            placeholder="Search a word, form, or meaning — try “reduce”"
            className="min-h-12 w-full rounded-full border border-rule bg-card px-5 text-base placeholder:text-ink-soft focus:border-cobalt focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Select label="Category" value={f.category} onChange={set("category")} options={[{ value: "all" as const, label: "All" }, ...categorySlugs.map((s) => ({ value: s, label: CATEGORIES[s] }))]} />
          <Select label="Tone" value={f.connotation} onChange={set("connotation")} options={[{ value: "all" as const, label: "Any" }, ...CONNOTATIONS.map((c) => ({ value: c, label: c }))]} />
          <Select label="Part of speech" value={f.pos} onChange={set("pos")} options={[{ value: "all" as const, label: "Any" }, ...POS_VALUES.map((p) => ({ value: p, label: p }))]} />
          <Select label="Root" value={f.rootId} onChange={set("rootId")} options={[{ value: "all", label: "Any" }, ...sortedRoots.map((r) => ({ value: r.id, label: `${r.form} (${r.meaning})` }))]} />
          <button
            type="button"
            aria-pressed={f.starredOnly}
            onClick={() => set("starredOnly")(!f.starredOnly)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${f.starredOnly ? "border-ember bg-ember-soft text-ember" : "border-rule bg-card text-ink-soft"}`}
          >
            <span aria-hidden>★</span> Starred
          </button>
          {filtered && (
            <button type="button" onClick={() => setF(DEFAULT_FILTERS)} className="min-h-11 px-3 text-sm font-medium text-cobalt hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-ink-soft" aria-live="polite">
        {results.length} {results.length === 1 ? "word" : "words"}
      </p>

      <ul className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-card">
        {results.map((w) => {
          const isOpen = open === w.id;
          return (
            <li key={w.id}>
              <div className="flex items-center gap-1 pr-2">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? `word-${w.id}` : undefined}
                  onClick={() => setOpen(isOpen ? null : w.id)}
                  className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3 text-left hover:bg-paper sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="flex items-baseline gap-2 sm:w-52 sm:shrink-0">
                    <span className="font-serif text-xl font-semibold">{w.lemma}</span>
                    <span className="text-xs text-ink-soft">{w.pos}</span>
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink-soft">{w.primarySense}</span>
                  <span className="hidden sm:inline">
                    <ConnotationChip word={w} />
                  </span>
                </button>
                <SpeakButton text={w.lemma} />
                <StarButton id={w.id} label={w.lemma} starred={starred.has(w.id)} />
              </div>
              {isOpen && (
                <div id={`word-${w.id}`} className="border-t border-rule bg-card px-4 py-5 sm:px-6">
                  <WordDetail word={w} />
                </div>
              )}
            </li>
          );
        })}
        {results.length === 0 && <li className="p-8 text-center text-ink-soft">No words match those filters.</li>}
      </ul>
    </div>
  );
}
