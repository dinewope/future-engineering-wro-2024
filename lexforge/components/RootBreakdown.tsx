import { rootById } from "@/lib/content";
import { rootColorClass, segmentLemma } from "@/lib/content/rootColor";
import type { Word } from "@/lib/content/types";

/** `bene·vol·ent` in monospace, each root in its own color, with glosses below. */
export function RootBreakdown({ word, showGloss = true }: { word: Word; showGloss?: boolean }) {
  if (word.roots.length === 0) {
    return word.etymologyNote ? <p className="text-sm text-ink-soft">{word.etymologyNote}</p> : null;
  }
  const segments = segmentLemma(word.lemma, word.roots);
  return (
    <div>
      <p className="font-mono text-lg tracking-tight" aria-label={`Root breakdown of ${word.lemma}`}>
        {segments.map((s, i) => (
          <span key={i}>
            {i > 0 && <span className="text-ink-soft" aria-hidden>·</span>}
            <span className={s.rootId ? `${rootColorClass(s.rootId)} font-semibold` : "text-ink-soft"}>{s.text}</span>
          </span>
        ))}
      </p>
      {showGloss && (
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {word.roots.map((r) => {
            const root = rootById.get(r.rootId);
            return root ? (
              <li key={r.rootId}>
                <span className={`font-mono font-semibold ${rootColorClass(r.rootId)}`}>{root.form}</span>
                <span className="text-ink-soft"> ({root.origin}) {root.meaning}</span>
              </li>
            ) : null;
          })}
        </ul>
      )}
      {showGloss && word.etymologyNote && <p className="mt-1 text-sm text-ink-soft">{word.etymologyNote}</p>}
    </div>
  );
}

export function RootForm({ rootId, form }: { rootId: string; form: string }) {
  return <span className={`font-mono font-semibold ${rootColorClass(rootId)}`}>{form}</span>;
}
