import { api } from "./api";
import type { Word } from "../types/api";

export interface StudySessionBody {
  total_cards: number;
  known_count: number;
  unknown_count: number;
}

export const studyApi = {
  getWords: async (deckId: string): Promise<Word[]> => {
    const { data } = await api.get(`/decks/${deckId}/study/words`);
    return data;
  },

  evaluate: async (
    deckId: string,
    wordId: string,
    result: "known" | "unknown"
  ): Promise<void> => {
    await api.post(`/decks/${deckId}/study/evaluate`, { word_id: wordId, result });
  },

  saveSession: async (deckId: string, body: StudySessionBody): Promise<void> => {
    await api.post(`/decks/${deckId}/study/session`, body);
  },
};
