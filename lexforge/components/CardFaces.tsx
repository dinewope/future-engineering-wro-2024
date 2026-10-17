import { rootById, wordById, words } from "@/lib/content";
import type { CardMode } from "@/lib/cards/decks";
import { rootColorClass } from "@/lib/content/rootColor";
import type { Word } from "@/lib/content/types";
import { Passage } from "./Passage";
import { RootBreakdown } from "./RootBreakdown";

const CONNOTATION_STYLE: Record<Word["connotation"], string> = {
  positive: "bg-good-soft text-good",
  negative: "bg-bad-soft text-bad",
  neutral: "bg-cobalt-soft text-cobalt",
};

export function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

export function ConnotationChip({ word }: { word: Word }) {
  return <Chip className={CONNOTATION_STYLE[word.connotation]}>{word.connotation}</Chip>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{children}</p>;
}

function Lemma({ word, size = "lg" }: { word: Word; size?: "lg" | "md" }) {
  return (
    <h2 className={`font-serif font-bold leading-none tracking-tight ${size === "lg" ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"}`}>
      {word.lemma}
    </h2>
  );
}

export function CardFront({ mode, id }: { mode: CardMode; id: string }) {
  if (mode === "root-meaning") {
    const root = rootById.get(id);
    if (!root) return null;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <Label>{root.origin} root</Label>
        <h2 className={`font-mono text-5xl font-bold sm:text-6xl ${rootColorClass(root.id)}`}>{root.form}</h2>
      </div>
    );
  }
  const word = wordById.get(id);
  if (!word) return null;
  if (mode === "def-word") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Label>Definition · {word.pos}</Label>
        <p className="max-w-xl font-serif text-2xl leading-snug sm:text-3xl">{word.primarySense}</p>
        <p className="text-sm text-ink-soft">Starts with “{word.lemma[0]}”</p>
      </div>
    );
  }
  if (mode === "blank-word") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <Label>Which word fits the blank?</Label>
        <Passage text={word.satPassage ?? word.examples[0]!.text} className="font-serif text-lg leading-relaxed sm:text-xl" />
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Label>{word.pos}</Label>
      <Lemma word={word} />
    </div>
  );
}

export function CardBack({ mode, id }: { mode: CardMode; id: string }) {
  if (mode === "root-meaning") {
    const root = rootById.get(id);
    if (!root) return null;
    const bank = root.wordIds.map((w) => wordById.get(w)?.lemma).filter(Boolean);
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-serif text-3xl font-semibold sm:text-4xl">{root.meaning}</p>
        <div className="space-y-1 text-sm">
          {bank.length > 0 && (
            <p>
              <span className="text-ink-soft">In your word bank: </span>
              <span className="font-medium">{bank.join(", ")}</span>
            </p>
          )}
          <p className="text-ink-soft">Also: {root.relatedWords.join(", ")}</p>
        </div>
      </div>
    );
  }
  const word = wordById.get(id);
  if (!word) return null;
  const example = word.examples[0]!;
  if (mode === "word-def") {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="flex items-center gap-2">
          <Label>{word.lemma}</Label>
          <ConnotationChip word={word} />
        </div>
        <p className="font-serif text-2xl leading-snug sm:text-3xl">{word.primarySense}</p>
        <RootBreakdown word={word} />
        <p className="border-l-2 border-rule pl-3 text-ink-soft italic">{example.text}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Lemma word={word} size="md" />
      <div className="flex items-center gap-2">
        <Chip className="border border-rule">{word.pos}</Chip>
        <ConnotationChip word={word} />
      </div>
      <p className="max-w-xl text-lg">{word.primarySense}</p>
      <RootBreakdown word={word} showGloss={false} />
    </div>
  );
}

/** Plain-text summary of a face, for the screen-reader live region. */
export function faceText(mode: CardMode, id: string, side: "front" | "back"): string {
  if (mode === "root-meaning") {
    const r = rootById.get(id);
    return r ? (side === "front" ? `Root ${r.form}` : `${r.form} means ${r.meaning}`) : "";
  }
  const w = wordById.get(id) ?? words[0]!;
  if (side === "back") return `${w.lemma}: ${w.primarySense}`;
  if (mode === "def-word") return `Definition: ${w.primarySense}`;
  if (mode === "blank-word") return "Passage with a blank. Which word fits?";
  return w.lemma;
}
