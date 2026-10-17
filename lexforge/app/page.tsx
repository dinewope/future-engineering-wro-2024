import Link from "next/link";
import { DeckGrid } from "@/components/DeckGrid";
import { DECKS, deckItemIds } from "@/lib/cards/decks";
import { roots, words } from "@/lib/content";

const LADDER = ["Guess", "Meet", "Recognize", "Recall", "Blank", "Forge", "Transfer"];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-ember">SAT vocabulary</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Learn words so precisely that <em className="text-cobalt">nothing else would fit.</em>
          </h1>
          <p className="mt-4 max-w-prose text-lg text-ink-soft">
            {words.length} high-utility SAT words, each with varied-domain examples, an SAT-style passage, and the Latin and Greek
            roots that tie {roots.length} word families together.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/cards/all" className="inline-flex min-h-12 items-center rounded-full bg-cobalt px-6 font-semibold text-cobalt-ink transition hover:opacity-90">
              Study flashcards
            </Link>
            <Link href="/lexicon" className="inline-flex min-h-12 items-center rounded-full px-5 font-medium text-ink-soft hover:text-ink">
              Browse the Lexicon →
            </Link>
          </div>
        </div>

        <aside aria-label="The Learning Ladder" className="rounded-2xl border border-rule bg-card p-5">
          <h2 className="font-serif text-lg font-semibold">The Learning Ladder</h2>
          <p className="mt-1 text-sm text-ink-soft">Every word climbs from a first guess to a sentence only you could write. Flashcards and Match train the first rungs today.</p>
          <ol className="mt-4 space-y-1.5">
            {LADDER.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule font-mono text-xs">{i}</span>
                <span className={i < 2 ? "font-medium" : "text-ink-soft"}>{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section aria-labelledby="decks">
        <h2 id="decks" className="font-serif text-2xl font-semibold">Decks</h2>
        <div className="mt-4">
          <DeckGrid decks={DECKS.map((d) => ({ ...d, count: deckItemIds(d).length }))} />
        </div>
      </section>
    </div>
  );
}
