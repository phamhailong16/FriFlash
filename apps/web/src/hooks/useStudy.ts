import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/study";

export function useStudyWords(deckId: string, dueOnly = false) {
  return useQuery({
    queryKey: ["study-words", deckId, dueOnly],
    queryFn: () => studyApi.getWords(deckId, dueOnly),
    staleTime: 30_000,
  });
}
