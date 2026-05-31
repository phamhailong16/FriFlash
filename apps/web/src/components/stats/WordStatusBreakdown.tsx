import type { WordStatusCount } from "@/types/api";

interface Props {
  status: WordStatusCount;
}

const SEGMENTS = [
  { key: "mastered" as const, label: "Thuộc", color: "#27AE60" },
  { key: "familiar" as const, label: "Quen", color: "#F39C12" },
  { key: "learning" as const, label: "Đang học", color: "#E74C3C" },
  { key: "new" as const, label: "Mới", color: "#D1D5DB" },
];

export function WordStatusBreakdown({ status }: Props) {
  const total = status.total || 1; // avoid div/0

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-3 bg-gray-100">
        {SEGMENTS.map(({ key, color }) => {
          const pct = (status[key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              style={{ width: `${pct}%`, backgroundColor: color }}
              className="transition-all duration-500"
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {SEGMENTS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold text-gray-800">{status[key]}</span>
          </div>
        ))}
      </div>

      {status.total === 0 && (
        <p className="text-sm text-gray-400 mt-2">Chưa có từ nào trong bộ thẻ.</p>
      )}
    </div>
  );
}
