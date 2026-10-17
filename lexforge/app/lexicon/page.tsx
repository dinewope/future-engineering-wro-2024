import type { Metadata } from "next";
import { Lexicon } from "@/components/Lexicon";

export const metadata: Metadata = { title: "Lexicon · LexForge" };

export default function LexiconPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Lexicon</h1>
        <p className="mt-1 text-ink-soft">Every word in the bank. Open one to see its roots, contexts, and near-synonyms.</p>
      </div>
      <Lexicon />
    </div>
  );
}
