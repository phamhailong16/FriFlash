import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { WordRow } from "@/components/words/WordRow";
import { WordForm } from "@/components/words/WordForm";
import { ImportModal } from "@/components/words/ImportModal";
import { useWords, useDeleteWord } from "@/hooks/useWords";
import { useDecks } from "@/hooks/useDecks";
import type { Word } from "@/types/api";

export function WordsPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: deckData } = useDecks({ page: 1, size: 50 });
  const deck = deckData?.items.find((d) => d.id === deckId);

  const { data, isLoading } = useWords(deckId!, { page, size: 20 });
  const deleteWord = useDeleteWord(deckId!);

  function handleEdit(word: Word) {
    setEditingWord(word);
    setFormOpen(true);
  }

  function handleDelete(word: Word) {
    if (!window.confirm(`Xoá từ "${word.hanzi}"?`)) return;
    deleteWord.mutate(word.id);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingWord(null);
  }

  function handleAddNew() {
    setEditingWord(null);
    setFormOpen(true);
  }

  const totalPages = data?.pages ?? 1;

  return (
    <div className="min-h-screen bg-[#FDFAF6] pb-24">
      <PageHeader
        title={deck?.name ?? "Từ vựng"}
        left={
          <button
            onClick={() => navigate("/decks")}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Bộ thẻ
          </button>
        }
      />

      <div className="px-4 pt-4">
        {/* Stats bar + import button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {deck && <span>{deck.card_count} từ</span>}
            {data && totalPages > 1 && (
              <>
                <span>·</span>
                <span>Trang {page}/{totalPages}</span>
              </>
            )}
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-[#E8E0D5] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Nhập file
          </button>
        </div>

        {/* Word list */}
        {isLoading ? (
          <div className="space-y-0 bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-100 border-b border-[#E8E0D5] last:border-b-0" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              无
            </div>
            <p className="text-gray-500 text-sm mb-6">Bộ thẻ này chưa có từ vựng nào.</p>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C0392B] text-white rounded-xl text-sm font-semibold hover:bg-[#A93226] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm từ đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden">
              {data.items.map((word) => (
                <WordRow
                  key={word.id}
                  word={word}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-[#E8E0D5] text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-[#E8E0D5] text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleAddNew}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#C0392B] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#A93226] active:scale-95 transition-all"
        aria-label="Thêm từ"
      >
        <Plus className="w-6 h-6" />
      </button>

      <WordForm
        open={formOpen}
        deckId={deckId!}
        word={editingWord}
        onClose={handleFormClose}
      />

      <ImportModal
        open={importOpen}
        deckId={deckId!}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
