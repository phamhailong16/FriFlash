import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importApi } from "../lib/import";
import { wordsKey } from "./useWords";

export function useImportExcel(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importApi.excel(deckId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wordsKey(deckId) });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

export function useImportSheets(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => importApi.sheets(deckId, url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wordsKey(deckId) });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
