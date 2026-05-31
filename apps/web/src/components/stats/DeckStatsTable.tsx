import type { DeckStat } from "@/types/api";

interface Props {
  decks: DeckStat[];
}

export function DeckStatsTable({ decks }: Props) {
  if (decks.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Chưa có bộ thẻ nào.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="w-full text-sm min-w-[420px]">
        <thead>
          <tr className="border-b border-[#E8E0D5]">
            <th className="text-left px-4 py-2 font-medium text-gray-500">Bộ thẻ</th>
            <th className="text-right px-3 py-2 font-medium text-gray-500">Tổng</th>
            <th className="text-right px-3 py-2 font-medium text-gray-500">Mới</th>
            <th className="text-right px-3 py-2 font-medium text-gray-500">Học</th>
            <th className="text-right px-3 py-2 font-medium text-gray-500">Quen</th>
            <th className="text-right px-4 py-2 font-medium text-gray-500">Thuộc</th>
          </tr>
        </thead>
        <tbody>
          {decks.map((deck) => {
            const masteredPct =
              deck.total_words > 0
                ? Math.round((deck.mastered / deck.total_words) * 100)
                : 0;
            return (
              <tr
                key={deck.deck_id}
                className="border-b border-[#E8E0D5] last:border-0 hover:bg-[#FDFAF6]"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 truncate max-w-[140px]">
                    {deck.name}
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1 h-1 rounded-full bg-gray-100 w-full">
                    <div
                      className="h-1 rounded-full bg-[#27AE60] transition-all duration-500"
                      style={{ width: `${masteredPct}%` }}
                    />
                  </div>
                </td>
                <td className="text-right px-3 py-3 text-gray-700 font-medium">
                  {deck.total_words}
                </td>
                <td className="text-right px-3 py-3 text-gray-400">{deck.new}</td>
                <td className="text-right px-3 py-3 text-[#E74C3C]">{deck.learning}</td>
                <td className="text-right px-3 py-3 text-[#F39C12]">{deck.familiar}</td>
                <td className="text-right px-4 py-3 text-[#27AE60] font-semibold">
                  {deck.mastered}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
