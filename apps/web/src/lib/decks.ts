import { api } from "./api";
import type { Deck, DeckListResponse } from "../types/api";

export interface DeckListParams {
  search?: string;
  page: number;
  size: number;
}

export interface DeckCreateBody {
  name: string;
  description?: string | null;
}

export interface DeckUpdateBody {
  name?: string;
  description?: string | null;
}

export const decksApi = {
  list: async (params: DeckListParams): Promise<DeckListResponse> => {
    const { data } = await api.get("/decks", { params });
    return data;
  },

  create: async (body: DeckCreateBody): Promise<Deck> => {
    const { data } = await api.post("/decks", body);
    return data;
  },

  update: async (id: string, body: DeckUpdateBody): Promise<Deck> => {
    const { data } = await api.patch(`/decks/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/decks/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post("/decks/bulk-delete", { ids });
  },

  merge: async (source_id: string, target_id: string): Promise<Deck> => {
    const { data } = await api.post("/decks/merge", { source_id, target_id });
    return data;
  },
};
