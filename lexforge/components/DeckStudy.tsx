"use client";

import Link from "next/link";
import { useState } from "react";
import { getDeck } from "@/lib/cards/decks";
import { FlipDeck } from "./FlipDeck";
import { MatchGame } from "./MatchGame";

const TABS = [
  { id: "flip", label: "Flashcards" },
  { id: "match", label: "Match" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function DeckStudy({ deckId }: { deckId: string }) {
  const deck = getDeck(deckId)!;
  const [tab, setTab] = useState<Tab>("flip");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← All decks
        </Link>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{deck.title}</h1>
        <p className="mt-1 text-ink-soft">{deck.blurb}</p>
      </div>

      <div role="tablist" aria-label="Study mode" className="inline-flex rounded-full border border-rule bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
            onClick={() => setTab(t.id)}
            className={`min-h-10 rounded-full px-5 text-sm font-semibold transition-colors ${tab === t.id ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "flip" ? <FlipDeck deck={deck} /> : <MatchGame deck={deck} />}
      </section>
    </div>
  );
}
