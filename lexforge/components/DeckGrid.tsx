"use client";

import Link from "next/link";
import type { DeckMeta } from "@/lib/cards/decks";
import { useStarred } from "@/lib/db/hooks";

export function DeckGrid({ decks }: { decks: (DeckMeta & { count: number })[] }) {
  const starred = useStarred();
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => {
        const count = deck.starredOnly ? starred.size : deck.count;
        const unit = deck.kind === "roots" ? "roots" : "words";
        return (
          <li key={deck.id}>
            <Link
              href={`/cards/${deck.id}`}
              className="group flex h-full flex-col rounded-2xl border border-rule bg-card p-5 shadow-[0_1px_0_var(--rule)] transition hover:-translate-y-0.5 hover:border-cobalt"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-xl font-semibold group-hover:text-cobalt">
                  {deck.starredOnly && <span className="text-ember" aria-hidden>★ </span>}
                  {deck.title}
                </span>
                <span className="shrink-0 font-mono text-sm text-ink-soft">
                  {count} {unit}
                </span>
              </span>
              <span className="mt-2 text-sm text-ink-soft">{deck.blurb}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
