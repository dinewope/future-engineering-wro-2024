"use client";

import { toggleStar } from "@/lib/db/stars";

export function StarButton({ id, label, starred, kind = "word", className = "" }: { id: string; label: string; starred: boolean; kind?: "word" | "root"; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void toggleStar(id, kind);
      }}
      aria-pressed={starred}
      aria-label={starred ? `Unstar ${label}` : `Star ${label}`}
      title={starred ? "Unstar (S)" : "Star (S)"}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none transition-colors hover:bg-ember-soft ${starred ? "text-ember" : "text-ink-soft"} ${className}`}
    >
      <span aria-hidden>{starred ? "★" : "☆"}</span>
    </button>
  );
}
