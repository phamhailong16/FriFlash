import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wordsApi, type WordCreateBody, type WordListParams, type WordUpdateBody } from "../lib/words";

export const wordsKey = (deckId: string) => ["words", deckId] as const;

export function useWords(deckId: string, params: WordListParams) {
  return useQuery({
    queryKey: [...wordsKey(deckId), params],
    queryFn: () => wordsApi.list(deckId, params),
    enabled: !!deckId,
  });
}

export function useCreateWord(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: WordCreateBody) => wordsApi.create(deckId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wordsKey(deckId) });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

export function useUpdateWord(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, body }: { wordId: string; body: WordUpdateBody }) =>
      wordsApi.update(deckId, wordId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: wordsKey(deckId) }),
  });
}

export function useDeleteWord(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (wordId: string) => wordsApi.delete(deckId, wordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wordsKey(deckId) });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
