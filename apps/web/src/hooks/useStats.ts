import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/stats";

export function useStatsOverview() {
  return useQuery({
    queryKey: ["stats", "overview"],
    queryFn: statsApi.getOverview,
    staleTime: 60_000,
  });
}

export function useStatsActivity(days: number) {
  return useQuery({
    queryKey: ["stats", "activity", days],
    queryFn: () => statsApi.getActivity(days),
    staleTime: 60_000,
  });
}

export function useStatsBreakdown() {
  return useQuery({
    queryKey: ["stats", "breakdown"],
    queryFn: statsApi.getBreakdown,
    staleTime: 60_000,
  });
}
