import { createRoot } from "react-dom/client";
import Home from "@/app/page";
import LexiconPage from "@/app/lexicon/page";
import { DeckStudy } from "@/components/DeckStudy";
import { NavLinks } from "@/components/NavLinks";
import { getDeck } from "@/lib/cards/decks";
import Link from "next/link";
import { usePath } from "./router";

function Page() {
  const path = usePath();
  const deckId = path.match(/^\/cards\/([a-z-]+)$/)?.[1];
  if (deckId && getDeck(deckId)) return <DeckStudy key={deckId} deckId={deckId} />;
  if (path === "/lexicon") return <LexiconPage />;
  return <Home />;
}

function App() {
  return (
    <>
      <header className="border-b border-rule">
        <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Lex<span className="text-cobalt">Forge</span>
          </Link>
          <NavLinks />
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pt-10">
        <Page />
      </main>
    </>
  );
}

createRoot(document.getElementById("lexforge-root")!).render(<App />);
