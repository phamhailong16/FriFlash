import { useState } from "react";
import type { Word, WordStatus } from "../../types/api";

const STATUS_LABEL: Record<WordStatus, string> = {
  new: "Mới",
  learning: "Đang học",
  familiar: "Quen",
  mastered: "Thuộc",
};

const STATUS_COLOR: Record<WordStatus, string> = {
  new: "bg-gray-100 text-gray-600",
  learning: "bg-blue-100 text-blue-700",
  familiar: "bg-yellow-100 text-yellow-700",
  mastered: "bg-green-100 text-green-700",
};

interface WordRowProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (word: Word) => void;
}

export function WordRow({ word, onEdit, onDelete }: WordRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryVariant = word.variant_groups[0];

  return (
    <div className="flex items-start gap-4 px-4 py-3 border-b border-[#E8E0D5] last:border-b-0 hover:bg-[#F5F0EA] transition-colors">
      {/* Hanzi */}
      <div className="w-16 shrink-0 text-center">
        <span
          className="text-[22px] leading-tight text-gray-900"
          style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
        >
          {word.hanzi}
        </span>
      </div>

      {/* Variants info */}
      <div className="flex-1 min-w-0">
        {primaryVariant ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {primaryVariant.pinyin && (
                <span className="text-sm text-[#C0392B] font-medium">
                  {primaryVariant.pinyin}
                </span>
              )}
              {primaryVariant.han_viet && (
                <span className="text-sm text-gray-500 italic">
                  {primaryVariant.han_viet}
                </span>
              )}
              {primaryVariant.part_of_speech && (
                <span className="text-xs text-gray-400 border border-gray-300 rounded px-1">
                  {primaryVariant.part_of_speech}
                </span>
              )}
            </div>
            {primaryVariant.meaning && (
              <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">
                {primaryVariant.meaning}
              </p>
            )}
            {word.variant_groups.length > 1 && (
              <span className="text-xs text-gray-400 mt-0.5 inline-block">
                +{word.variant_groups.length - 1} nghĩa khác
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">Chưa có nghĩa</span>
        )}
        {word.note && (
          <p className="text-xs text-gray-500 mt-1 italic">{word.note}</p>
        )}
      </div>

      {/* Status badge */}
      <div className="shrink-0 flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[word.status as WordStatus]}`}
        >
          {STATUS_LABEL[word.status as WordStatus]}
        </span>

        {/* Dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
            aria-label="Tùy chọn"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-6 z-20 bg-white border border-[#E8E0D5] rounded-lg shadow-lg py-1 min-w-[120px]">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(word); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(word); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Xoá
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
