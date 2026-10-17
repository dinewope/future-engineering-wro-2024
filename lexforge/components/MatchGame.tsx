"use client";

import { useEffect, useMemo, useState } from "react";
import { deckItemIds, matchPairsFor, type DeckMeta } from "@/lib/cards/decks";
import { createMatch, finalTimeMs, formatMs, MATCH_PAIRS, selectTile, type MatchState } from "@/lib/cards/match";
import { newSeed } from "@/lib/cards/random";
import { useBestMatchTime, useStarred } from "@/lib/db/hooks";
import { recordMatchTime } from "@/lib/db/matchScores";

const MIN_PAIRS = 3;

export function MatchGame({ deck }: { deck: DeckMeta }) {
  const starred = useStarred(deck.kind === "roots" ? "root" : "word");
  const pool = useMemo(() => {
    const ids = deckItemIds(deck);
    return matchPairsFor(deck, deck.starredOnly ? ids.filter((id) => starred.has(id)) : ids);
  }, [deck, starred]);

  const best = useBestMatchTime(deck.id);
  const [game, setGame] = useState<MatchState | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{ ms: number; newBest: boolean } | null>(null);

  const running = game !== null && game.startedAt !== null && game.finishedAt === null;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [running]);

  // Wrong pairs flash briefly, then clear.
  useEffect(() => {
    if (!game?.wrong) return;
    const t = setTimeout(() => setGame((g) => (g ? { ...g, wrong: null } : g)), 600);
    return () => clearTimeout(t);
  }, [game?.wrong]);

  useEffect(() => {
    if (!game || game.finishedAt === null || result) return;
    const ms = finalTimeMs(game)!;
    void recordMatchTime(deck.id, ms).then((newBest) => setResult({ ms, newBest }));
  }, [game, result, deck.id]);

  function start() {
    setResult(null);
    setGame(createMatch(pool, newSeed(), Math.min(MATCH_PAIRS, pool.length)));
  }

  if (pool.length < MIN_PAIRS) {
    return (
      <div className="rounded-3xl border border-dashed border-rule bg-card p-10 text-center">
        <p className="font-serif text-2xl">Star at least {MIN_PAIRS} cards to play Match with this deck.</p>
      </div>
    );
  }

  const elapsed = game?.startedAt ? (game.finishedAt ?? now) - game.startedAt : 0;
  const isRoot = deck.kind === "roots";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-soft">
          Pair each {isRoot ? "root with its meaning" : "word with its definition"}. Each mistake adds 1 second.
        </p>
        <div className="flex items-center gap-4 font-mono text-sm">
          <span aria-label="Elapsed time">⏱ {formatMs(elapsed)}</span>
          {game && <span className="text-ember">✗ {game.mistakes}</span>}
          <span className="text-ink-soft">Best: {best ? formatMs(best) : "—"}</span>
        </div>
      </div>

      {!game || result ? (
        <div className="rounded-3xl border border-rule bg-card p-10 text-center">
          {result ? (
            <>
              <p className="font-mono text-sm uppercase tracking-widest text-ink-soft">Finished</p>
              <p className="mt-2 font-serif text-5xl font-bold">{formatMs(result.ms)}</p>
              <p className={`mt-2 ${result.newBest ? "font-semibold text-ember" : "text-ink-soft"}`} role="status">
                {result.newBest ? "New personal best!" : `Personal best: ${best ? formatMs(best) : "—"}`}
              </p>
            </>
          ) : (
            <p className="font-serif text-2xl">Match {Math.min(MATCH_PAIRS, pool.length)} pairs as fast as you can.</p>
          )}
          <button type="button" onClick={start} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cobalt px-6 font-semibold text-cobalt-ink transition hover:opacity-90">
            {result ? "Play again" : "Start game"}
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Match tiles">
          {game.tiles.map((tile) => {
            const matched = game.matchedPairIds.includes(tile.pairId);
            const selected = game.selectedId === tile.id;
            const wrong = game.wrong?.includes(tile.id) ?? false;
            return (
              <li key={tile.id}>
                <button
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => setGame((g) => (g ? selectTile(g, tile.id, Date.now()) : g))}
                  className={`flex min-h-24 w-full items-center justify-center rounded-2xl border p-3 text-center transition-all duration-200 ${
                    matched
                      ? "invisible scale-95 opacity-0"
                      : wrong
                        ? "border-bad bg-bad-soft text-bad"
                        : selected
                          ? "border-cobalt bg-cobalt-soft"
                          : "border-rule bg-card hover:border-ink"
                  } ${tile.kind === "term" ? (isRoot ? "font-mono text-lg font-semibold" : "font-serif text-xl font-semibold") : "text-sm leading-snug"}`}
                >
                  {tile.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
