import { create } from "zustand";
import type { Word } from "@/types/api";

export interface StudyResult {
  wordId: string;
  result: "known" | "unknown";
}

interface StudySessionState {
  deckId: string | null;
  cards: Word[];
  currentIndex: number;
  results: StudyResult[];
  isComplete: boolean;

  startSession: (deckId: string, words: Word[], randomOrder: boolean) => void;
  submitResult: (result: "known" | "unknown") => void;
  reset: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useStudySessionStore = create<StudySessionState>()((set) => ({
  deckId: null,
  cards: [],
  currentIndex: 0,
  results: [],
  isComplete: false,

  startSession: (deckId, words, randomOrder) => {
    const cards = randomOrder ? shuffle(words) : [...words];
    set({ deckId, cards, currentIndex: 0, results: [], isComplete: false });
  },

  submitResult: (result) =>
    set((state) => {
      const word = state.cards[state.currentIndex];
      if (!word) return state;
      const results = [...state.results, { wordId: word.id, result }];
      const nextIndex = state.currentIndex + 1;
      const isComplete = nextIndex >= state.cards.length;
      return { results, currentIndex: nextIndex, isComplete };
    }),

  reset: () =>
    set({ deckId: null, cards: [], currentIndex: 0, results: [], isComplete: false }),
}));
