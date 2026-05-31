import { useState } from "react";
import { X, Search, GitMerge } from "lucide-react";
import { useDecks, useMergeDecks } from "@/hooks/useDecks";
import type { Deck } from "@/types/api";

function getMergeName(source: string, target: string): string {
  const full = `${source}-${target}`;
  return full.length <= 50 ? full : full.slice(0, 47) + "...";
}

interface MergeDeckModalProps {
  open: boolean;
  sourceDeck: Deck;
  onClose: () => void;
}

export function MergeDeckModal({ open, sourceDeck, onClose }: MergeDeckModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<Deck | null>(null);

  const { data } = useDecks({ page: 1, size: 100 });
  const merge = useMergeDecks();

  if (!open) return null;

  const candidates = (data?.items ?? [])
    .filter((d) => d.id !== sourceDeck.id)
    .filter((d) =>
      search ? d.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  async function handleMerge() {
    if (!selectedTarget) return;
    await merge.mutateAsync({ sourceId: sourceDeck.id, targetId: selectedTarget.id });
    onClose();
  }

  const previewName = selectedTarget
    ? getMergeName(sourceDeck.name, selectedTarget.name)
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E0D5]">
          <div>
            <h2 className="font-semibold text-gray-900">Gộp bộ thẻ</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gộp{" "}
              <span className="font-medium text-gray-700">"{sourceDeck.name}"</span>{" "}
              vào bộ thẻ khác
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#E8E0D5]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bộ thẻ đích..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#E8E0D5] rounded-lg text-sm outline-none focus:border-[#C0392B] transition-colors"
            />
          </div>
        </div>

        {/* Deck list */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {search ? "Không tìm thấy bộ thẻ nào." : "Không có bộ thẻ nào khác."}
            </p>
          ) : (
            candidates.map((deck) => {
              const isSelected = selectedTarget?.id === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedTarget(isSelected ? null : deck)}
                  className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors flex items-center justify-between border ${
                    isSelected
                      ? "bg-[#C0392B]/8 border-[#C0392B]/30"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{deck.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{deck.card_count} thẻ</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#C0392B] flex items-center justify-center flex-shrink-0 ml-3">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Preview + Confirm */}
        <div className="px-5 py-4 border-t border-[#E8E0D5] space-y-3">
          {previewName && (
            <div className="bg-[#FDFAF6] border border-[#E8E0D5] rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-0.5">Tên bộ thẻ mới</p>
              <p className="font-semibold text-gray-800 text-sm truncate">{previewName}</p>
              <p className="text-xs text-gray-400 mt-1">
                Tất cả từ sẽ được gộp lại, bản sao được giữ nguyên.
              </p>
            </div>
          )}
          <button
            onClick={handleMerge}
            disabled={!selectedTarget || merge.isPending}
            className="w-full py-3 bg-[#C0392B] text-white rounded-xl font-semibold text-sm hover:bg-[#A93226] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <GitMerge className="w-4 h-4" />
            {merge.isPending ? "Đang gộp..." : "Xác nhận gộp"}
          </button>
        </div>
      </div>
    </>
  );
}
