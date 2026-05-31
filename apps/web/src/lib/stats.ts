import { api } from "./api";
import type { StatsOverview, ActivityResponse, BreakdownResponse } from "../types/api";

export const statsApi = {
  getOverview: async (): Promise<StatsOverview> => {
    const { data } = await api.get("/stats/overview");
    return data;
  },

  getActivity: async (days: number): Promise<ActivityResponse> => {
    const { data } = await api.get("/stats/activity", { params: { days } });
    return data;
  },

  getBreakdown: async (): Promise<BreakdownResponse> => {
    const { data } = await api.get("/stats/breakdown");
    return data;
  },
};
