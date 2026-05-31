import { useState } from "react";
import { BookOpen, Trophy, Layers, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActivityChart } from "@/components/stats/ActivityChart";
import { WordStatusBreakdown } from "@/components/stats/WordStatusBreakdown";
import { DeckStatsTable } from "@/components/stats/DeckStatsTable";
import { useStatsOverview, useStatsActivity, useStatsBreakdown } from "@/hooks/useStats";

const DAY_OPTIONS = [7, 30, 90] as const;
type DayOption = (typeof DAY_OPTIONS)[number];

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E0D5] p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E0D5] p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E8E0D5] p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-6 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function StatsPage() {
  const [days, setDays] = useState<DayOption>(30);

  const { data: overview, isLoading: overviewLoading } = useStatsOverview();
  const { data: activity, isLoading: activityLoading } = useStatsActivity(days);
  const { data: breakdown, isLoading: breakdownLoading } = useStatsBreakdown();

  return (
    <div className="pb-6">
      <PageHeader title="Thống Kê" />

      <div className="px-4 space-y-4 mt-2">
        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-3">
          {overviewLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={<Layers size={18} />}
                label="Bộ thẻ"
                value={overview?.total_decks ?? 0}
                color="#C0392B"
              />
              <StatCard
                icon={<BookOpen size={18} />}
                label="Tổng từ"
                value={overview?.total_words ?? 0}
                color="#3B82F6"
              />
              <StatCard
                icon={<Trophy size={18} />}
                label="Đã thuộc"
                value={overview?.mastered_words ?? 0}
                color="#27AE60"
              />
              <StatCard
                icon={<Flame size={18} />}
                label="Chuỗi ngày học"
                value={`${overview?.streak_days ?? 0} ngày`}
                color="#F39C12"
              />
            </>
          )}
        </div>

        {/* Activity chart */}
        <SectionCard title="Hoạt động học tập">
          {/* Time filter */}
          <div className="flex gap-2 mb-4">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  days === d
                    ? "bg-[#C0392B] text-white"
                    : "bg-[#F5F0EA] text-gray-600 hover:bg-[#E8E0D5]"
                }`}
              >
                {d} ngày
              </button>
            ))}
          </div>
          {activityLoading ? (
            <Skeleton className="h-40" />
          ) : activity ? (
            <ActivityChart data={activity.data} days={days} />
          ) : null}
        </SectionCard>

        {/* Word status breakdown */}
        <SectionCard title="Phân bố trạng thái từ">
          {breakdownLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 rounded-full" />
              <div className="flex gap-3 mt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-16 rounded-full" />
                ))}
              </div>
            </div>
          ) : breakdown ? (
            <WordStatusBreakdown status={breakdown.global_status} />
          ) : null}
        </SectionCard>

        {/* Deck stats table */}
        <SectionCard title="Chi tiết theo bộ thẻ">
          {breakdownLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : breakdown ? (
            <DeckStatsTable decks={breakdown.decks} />
          ) : null}
        </SectionCard>
      </div>
    </div>
  );
}
