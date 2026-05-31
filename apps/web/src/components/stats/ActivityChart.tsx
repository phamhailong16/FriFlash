import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyActivity } from "@/types/api";

interface Props {
  data: DailyActivity[];
  days: number;
}

function formatDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  if (days <= 7) return `${d.getDate()}/${d.getMonth() + 1}`;
  if (days <= 30) {
    // Show every ~5 days
    return d.getDate() % 5 === 1 ? `${d.getDate()}/${d.getMonth() + 1}` : "";
  }
  // 90 days: show every ~2 weeks
  return d.getDate() === 1 || d.getDate() === 15
    ? `${d.getDate()}/${d.getMonth() + 1}`
    : "";
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = new Date((label ?? "") + "T00:00:00");
  const dateLabel = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  return (
    <div className="bg-white border border-[#E8E0D5] rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium text-gray-700 mb-1">{dateLabel}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function ActivityChart({ data, days }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDate(d.date, days),
  }));

  const hasData = data.some((d) => d.cards_studied > 0);

  return (
    <div className="w-full">
      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          Chưa có dữ liệu học trong khoảng thời gian này.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="knownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27AE60" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#27AE60" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="unknownGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v, days)}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="known"
              name="Đã thuộc"
              stroke="#27AE60"
              strokeWidth={2}
              fill="url(#knownGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="unknown"
              name="Chưa thuộc"
              stroke="#E74C3C"
              strokeWidth={2}
              fill="url(#unknownGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
