import { api } from "./api";
import type { ImportResult } from "../types/api";

export const importApi = {
  excel: async (deckId: string, file: File): Promise<ImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post(`/decks/${deckId}/import-excel`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  sheets: async (deckId: string, url: string): Promise<ImportResult> => {
    const { data } = await api.post(`/decks/${deckId}/import-sheets`, { url });
    return data;
  },
};
