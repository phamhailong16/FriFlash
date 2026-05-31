import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { decksApi, type DeckCreateBody, type DeckListParams, type DeckUpdateBody } from "../lib/decks";

export const DECKS_KEY = ["decks"] as const;

export function useDecks(params: DeckListParams) {
  return useQuery({
    queryKey: [...DECKS_KEY, params],
    queryFn: () => decksApi.list(params),
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeckCreateBody) => decksApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useUpdateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DeckUpdateBody }) =>
      decksApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => decksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useBulkDeleteDecks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => decksApi.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useMergeDecks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      decksApi.merge(sourceId, targetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}
