import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, BookOpen, GitMerge } from "lucide-react";
import type { Deck } from "../../types/api";

interface DeckCardProps {
  deck: Deck;
  selected?: boolean;
  selectMode?: boolean;
  onEdit: (deck: Deck) => void;
  onDelete: (deck: Deck) => void;
  onSelect?: (id: string) => void;
  onOpen?: (deck: Deck) => void;
  onMerge?: (deck: Deck) => void;
}

export function DeckCard({
  deck,
  selected = false,
  selectMode = false,
  onEdit,
  onDelete,
  onSelect,
  onOpen,
  onMerge,
}: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleCardClick() {
    if (selectMode) {
      onSelect?.(deck.id);
    } else if (onOpen) {
      onOpen(deck);
    } else {
      navigate(`/decks/${deck.id}/words`);
    }
  }

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all cursor-pointer group ${
        selected
          ? "border-[#C0392B] ring-2 ring-[#C0392B]/20"
          : "border-[#E8E0D5] hover:shadow-md hover:border-[#C0392B]/30"
      }`}
      onClick={handleCardClick}
    >
      {/* Select checkbox */}
      {selectMode && (
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? "bg-[#C0392B] border-[#C0392B]" : "border-gray-300 bg-white"
            }`}
          >
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{deck.name}</h3>
            {deck.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{deck.description}</p>
            )}
          </div>

          {/* Menu button */}
          {!selectMode && (
            <div className="relative flex-shrink-0">
              <button
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white border border-[#E8E0D5] rounded-xl shadow-lg py-1 min-w-[130px]">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(deck);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Chỉnh sửa
                    </button>
                    {onMerge && (
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          onMerge(deck);
                        }}
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        Gộp vào...
                      </button>
                    )}
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(deck);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xoá
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#E8E0D5]">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">
            {deck.card_count} {deck.card_count === 1 ? "thẻ" : "thẻ"}
          </span>
        </div>
      </div>
    </div>
  );
}
