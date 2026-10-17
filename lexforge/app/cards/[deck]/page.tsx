import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeckStudy } from "@/components/DeckStudy";
import { DECKS, getDeck } from "@/lib/cards/decks";

export function generateStaticParams() {
  return DECKS.map((d) => ({ deck: d.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ deck: string }> }): Promise<Metadata> {
  const deck = getDeck((await params).deck);
  return { title: deck ? `${deck.title} · LexForge` : "LexForge" };
}

export default async function DeckPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck } = await params;
  if (!getDeck(deck)) notFound();
  return <DeckStudy deckId={deck} />;
}
