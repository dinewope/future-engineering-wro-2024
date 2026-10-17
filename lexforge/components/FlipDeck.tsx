"use client";

import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createDeck, deckReducer, deckView, type DeckAction } from "@/lib/cards/deck";
import { deckItemIds, modesFor, type CardMode, type DeckMeta } from "@/lib/cards/decks";
import { newSeed } from "@/lib/cards/random";
import { rootById, wordById } from "@/lib/content";
import { useStarredMaybe } from "@/lib/db/hooks";
import { toggleStar } from "@/lib/db/stars";
import { CardBack, CardFront, faceText } from "./CardFaces";
import { SpeakButton } from "./SpeakButton";
import { StarButton } from "./StarButton";

const SWIPE_PX = 80;
const EMPTY: ReadonlySet<string> = new Set();

function isTypingTarget(el: EventTarget | null): boolean {
  return el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function FlipDeck({ deck }: { deck: DeckMeta }) {
  const kind = deck.kind === "roots" ? "root" : "word";
  const loadedStars = useStarredMaybe(kind);
  const starred = loadedStars ?? EMPTY;
  const starredRef = useRef(starred);
  starredRef.current = starred;

  const modes = modesFor(deck);
  const [mode, setMode] = useState<CardMode>(modes[0]!.id);
  const [state, setState] = useState(() => createDeck(deckItemIds(deck), { starredOnly: deck.starredOnly }));
  const dispatch = useCallback((a: DeckAction) => setState((s) => deckReducer(s, a, starredRef.current)), []);
  const view = deckView(state, starred);
  const reduceMotion = useReducedMotion();
  const dragged = useRef(false);

  const currentId = view.currentId;
  const label = currentId ? (kind === "root" ? rootById.get(currentId)?.form : wordById.get(currentId)?.lemma) ?? "" : "";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const onButton = e.target instanceof HTMLElement && ["BUTTON", "A"].includes(e.target.tagName);
      if (e.key === "ArrowRight") dispatch({ type: "next" });
      else if (e.key === "ArrowLeft") dispatch({ type: "prev" });
      else if (e.key === " " && !onButton) {
        e.preventDefault();
        dispatch({ type: "flip" });
      } else if (e.key.toLowerCase() === "s" && currentId) void toggleStar(currentId, kind);
      else return;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, currentId, kind]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_PX) dispatch({ type: "next" });
    else if (info.offset.x > SWIPE_PX) dispatch({ type: "prev" });
  }

  const toggleBtn = (pressed: boolean) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
      pressed ? "border-cobalt bg-cobalt-soft text-cobalt" : "border-rule text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {modes.length > 1 && (
          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-4 text-sm">
            <span className="text-ink-soft">Front</span>
            <select value={mode} onChange={(e) => {
                setMode(e.target.value as CardMode);
                dispatch({ type: "goto", index: view.index }); // back to the front, so a new mode never opens on its answer
              }} className="bg-transparent font-medium focus:outline-none">
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" aria-pressed={state.shuffled} onClick={() => dispatch({ type: "toggleShuffle", seed: newSeed() })} className={toggleBtn(state.shuffled)}>
          <span aria-hidden>⤨</span> Shuffle
        </button>
        {!deck.starredOnly && (
          <button type="button" aria-pressed={state.starredOnly} onClick={() => dispatch({ type: "toggleStarredOnly" })} className={toggleBtn(state.starredOnly)}>
            <span aria-hidden>★</span> Starred only
          </button>
        )}
      </div>

      {currentId === null && loadedStars === undefined ? (
        <div className="min-h-[20rem] animate-pulse rounded-3xl border border-rule bg-card sm:min-h-[24rem]" aria-busy="true" />
      ) : currentId === null ? (
        <div className="rounded-3xl border border-dashed border-rule bg-card p-10 text-center">
          <p className="font-serif text-2xl">No starred cards yet.</p>
          <p className="mt-2 text-ink-soft">Press ☆ (or S) on any card to add it here.</p>
          <Link href="/cards/all" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cobalt px-5 font-semibold text-cobalt-ink">
            Go to all words
          </Link>
        </div>
      ) : (
        <>
          <div className="card-3d">
            <motion.div
              key={currentId}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={onDragEnd}
              initial={reduceMotion ? false : { y: 10, scale: 0.985 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="touch-pan-y"
            >
              <div
                role="button"
                tabIndex={0}
                data-testid="flashcard"
                aria-label={`Flashcard ${view.index + 1} of ${view.order.length}, showing ${state.flipped ? "back" : "front"}. Press Space to flip.`}
                onClick={() => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  dispatch({ type: "flip" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") dispatch({ type: "flip" });
                }}
                className="relative block w-full cursor-pointer select-none rounded-3xl text-left"
              >
                <motion.div
                  className="relative min-h-[20rem] sm:min-h-[24rem]"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: reduceMotion ? 0 : state.flipped ? 180 : 0 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
                >
                  {(["front", "back"] as const).map((side) => {
                    const visible = (side === "back") === state.flipped;
                    return (
                      <div
                        key={side}
                        aria-hidden={!visible}
                        className={`card-face absolute inset-0 flex flex-col overflow-y-auto rounded-3xl border border-rule bg-card p-6 shadow-[0_2px_0_var(--rule),0_18px_40px_-24px_rgba(0,0,0,.35)] sm:p-10`}
                        style={{
                          transform: side === "back" && !reduceMotion ? "rotateY(180deg)" : undefined,
                          // Hide the turned-away face once the flip passes 90°, so it is truly hidden (not just back-facing).
                          visibility: visible ? "visible" : "hidden",
                          transition: reduceMotion ? undefined : `visibility 0s linear ${visible ? "0s" : "0.25s"}`,
                        }}
                      >
                        {side === "front" ? <CardFront mode={mode} id={currentId} /> : <CardBack mode={mode} id={currentId} />}
                        <p className="mt-4 text-center text-xs text-ink-soft">{side === "front" ? "Tap or press Space to flip" : "Swipe or ← → to move · S to star"}</p>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </div>
          <p className="sr-only" aria-live="polite">
            {faceText(mode, currentId, state.flipped ? "back" : "front")}
          </p>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "prev" })}
              disabled={view.atStart}
              aria-label="Previous card"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule text-xl transition hover:border-ink disabled:opacity-35"
            >
              ←
            </button>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <StarButton id={currentId} label={label} starred={starred.has(currentId)} kind={kind} />
                {kind === "word" && <SpeakButton text={label} />}
              </div>
              <span className="font-mono text-sm text-ink-soft" aria-live="polite">
                {view.index + 1} / {view.order.length}
              </span>
              <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-rule" aria-hidden>
                <div className="h-full rounded-full bg-cobalt transition-[width]" style={{ width: `${((view.index + 1) / view.order.length) * 100}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "next" })}
              disabled={view.atEnd}
              aria-label="Next card"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rule text-xl transition hover:border-ink disabled:opacity-35"
            >
              →
            </button>
          </div>
          {view.atEnd && (
            <p className="text-center text-sm text-ink-soft">
              End of deck.{" "}
              <button type="button" onClick={() => dispatch({ type: "restart" })} className="font-medium text-cobalt underline-offset-4 hover:underline">
                Start over
              </button>{" "}
              or{" "}
              <button type="button" onClick={() => dispatch({ type: "toggleShuffle", seed: newSeed() })} className="font-medium text-cobalt underline-offset-4 hover:underline">
                {state.shuffled ? "unshuffle" : "shuffle"}
              </button>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
