import { api } from "./api";
import type { Word, WordListResponse } from "../types/api";

export interface WordListParams {
  page: number;
  size: number;
}

export interface VariantGroupBody {
  pinyin?: string | null;
  han_viet?: string | null;
  part_of_speech?: string | null;
  meaning?: string | null;
  sort_order?: number;
}

export interface WordCreateBody {
  hanzi: string;
  note?: string | null;
  variants?: VariantGroupBody[];
}

export interface WordUpdateBody {
  hanzi?: string;
  note?: string | null;
  variants?: VariantGroupBody[];
}

export const wordsApi = {
  list: async (deckId: string, params: WordListParams): Promise<WordListResponse> => {
    const { data } = await api.get(`/decks/${deckId}/words`, { params });
    return data;
  },

  create: async (deckId: string, body: WordCreateBody): Promise<Word> => {
    const { data } = await api.post(`/decks/${deckId}/words`, body);
    return data;
  },

  update: async (deckId: string, wordId: string, body: WordUpdateBody): Promise<Word> => {
    const { data } = await api.patch(`/decks/${deckId}/words/${wordId}`, body);
    return data;
  },

  delete: async (deckId: string, wordId: string): Promise<void> => {
    await api.delete(`/decks/${deckId}/words/${wordId}`);
  },

  lookup: async (deckId: string, hanzi: string): Promise<VariantGroupBody[]> => {
    const { data } = await api.get(`/decks/${deckId}/words/lookup`, {
      params: { hanzi },
    });
    return data;
  },
};
