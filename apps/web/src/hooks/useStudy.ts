import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/study";

export function useStudyWords(deckId: string) {
  return useQuery({
    queryKey: ["study-words", deckId],
    queryFn: () => studyApi.getWords(deckId),
    staleTime: 30_000,
  });
}
