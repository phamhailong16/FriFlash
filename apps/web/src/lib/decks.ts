import { api } from "./api";
import axios from "axios";
import type { Deck, DeckListResponse, SharedDeck } from "../types/api";

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

  toggleShare: async (id: string): Promise<Deck> => {
    const { data } = await api.post(`/decks/${id}/share`);
    return data;
  },

  getShared: async (token: string): Promise<SharedDeck> => {
    const baseURL = (import.meta.env.VITE_API_URL ?? "") + "/api/v1";
    const { data } = await axios.get(`${baseURL}/share/${token}`);
    return data;
  },
};
