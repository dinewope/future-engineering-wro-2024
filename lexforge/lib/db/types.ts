import type { Card } from "ts-fsrs";
import type { Domain } from "@/lib/content/types";
import type { SentenceGrade } from "@/lib/grader/types";

export type Depth = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface UserWordState {
  wordId: string;
  depth: Depth;
  fsrs: Card;
  level6Days: string[];
  lapses: number;
  isLeech: boolean;
  starred: boolean;
}

export interface UserSentence {
  id: string;
  wordId: string;
  text: string;
  domain?: Domain;
  createdAt: string;
  grade?: SentenceGrade;
  echoDueAt?: string;
}

export type Exercise = "guess" | "recognize" | "recall" | "blank" | "forge" | "transfer" | "duel" | "flip";

export interface ReviewLog {
  id?: number;
  wordId: string;
  at: string;
  exercise: Exercise;
  correct: boolean;
  rating?: 1 | 2 | 3 | 4;
  ms: number;
}

export interface MatchScore {
  deckId: string;
  bestMs: number;
  achievedAt: string;
}

/** Root decks star roots, not words; stars for them live here. */
export interface RootStar {
  rootId: string;
}
