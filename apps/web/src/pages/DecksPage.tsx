import { useState, useRef } from "react";
import { Plus, Search, X, Trash2, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeckCard } from "@/components/decks/DeckCard";
import { DeckForm } from "@/components/decks/DeckForm";
import { MergeDeckModal } from "@/components/decks/MergeDeckModal";
import { ShareDeckModal } from "@/components/decks/ShareDeckModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDecks, useDeleteDeck, useBulkDeleteDecks } from "@/hooks/useDecks";
import type { Deck } from "@/types/api";

const PAGE_SIZES = [10, 20, 50] as const;

export function DecksPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<(typeof PAGE_SIZES)[number]>(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergingDeck, setMergingDeck] = useState<Deck | null>(null);
  const [sharingDeck, setSharingDeck] = useState<Deck | null>(null);
  const [confirmDeck, setConfirmDeck] = useState<Deck | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useDecks({ search: debouncedSearch, page, size });
  const deleteDeck = useDeleteDeck();
  const bulkDelete = useBulkDeleteDecks();

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }

  function handleEdit(deck: Deck) {
    setEditingDeck(deck);
    setFormOpen(true);
  }

  function handleDelete(deck: Deck) {
    setConfirmDeck(deck);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setConfirmBulk(true);
  }

  async function confirmBulkDelete() {
    await bulkDelete.mutateAsync([...selectedIds]);
    setConfirmBulk(false);
    exitSelectMode();
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingDeck(null);
  }

  const decks = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className="flex flex-col min-h-full bg-[#FDFAF6]">
      <PageHeader title="Bộ Thẻ" />

      <div className="flex-1 px-4 pb-24">
        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm bộ thẻ..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E8E0D5] rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#C0392B] transition-colors"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => handleSearchChange("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-3 mb-4">
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <span className="text-sm text-gray-600">
                  {selectedIds.size} đã chọn
                </span>
                <button
                  onClick={exitSelectMode}
                  className="text-sm text-gray-500 underline underline-offset-2"
                >
                  Huỷ
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                {data?.total ?? 0} bộ thẻ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectMode && selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xoá
              </button>
            )}

            {!selectMode && decks.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Chọn
              </button>
            )}

            {/* Page size */}
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
              className="text-sm border border-[#E8E0D5] rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(debouncedSearch)}
            onClear={() => handleSearchChange("")}
            onCreate={() => setFormOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                selected={selectedIds.has(deck.id)}
                selectMode={selectMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={toggleSelect}
                onMerge={setMergingDeck}
                onShare={setSharingDeck}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E8E0D5] text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ‹ Trước
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E8E0D5] text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sau ›
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      {!selectMode && (
        <button
          onClick={() => setFormOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#C0392B] text-white rounded-full shadow-lg hover:bg-[#A93226] active:scale-95 transition-all flex items-center justify-center z-30"
          aria-label="Tạo bộ thẻ mới"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Deck form modal */}
      <DeckForm open={formOpen} deck={editingDeck} onClose={handleFormClose} />

      {/* Merge modal */}
      {mergingDeck && (
        <MergeDeckModal
          open={true}
          sourceDeck={mergingDeck}
          onClose={() => setMergingDeck(null)}
        />
      )}

      {/* Share modal */}
      {sharingDeck && (
        <ShareDeckModal
          open={true}
          deck={sharingDeck}
          onClose={() => setSharingDeck(null)}
        />
      )}

      {/* Delete single deck confirm */}
      <ConfirmDialog
        open={Boolean(confirmDeck)}
        title={`Xoá "${confirmDeck?.name}"?`}
        message="Tất cả từ vựng trong bộ thẻ sẽ bị xoá. Hành động này không thể hoàn tác."
        confirmLabel="Xoá"
        destructive
        onConfirm={() => {
          if (confirmDeck) deleteDeck.mutate(confirmDeck.id);
          setConfirmDeck(null);
        }}
        onCancel={() => setConfirmDeck(null)}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={confirmBulk}
        title={`Xoá ${selectedIds.size} bộ thẻ?`}
        message="Tất cả từ vựng trong các bộ thẻ đã chọn sẽ bị xoá. Hành động này không thể hoàn tác."
        confirmLabel="Xoá tất cả"
        destructive
        onConfirm={confirmBulkDelete}
        onCancel={() => setConfirmBulk(false)}
      />
    </div>
  );
}

function EmptyState({
  hasSearch,
  onClear,
  onCreate,
}: {
  hasSearch: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm mb-3">Không tìm thấy bộ thẻ nào.</p>
        <button
          onClick={onClear}
          className="text-sm text-[#C0392B] underline underline-offset-2"
        >
          Xoá tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#C0392B]/10 flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-[#C0392B]" />
      </div>
      <p className="text-gray-700 font-medium mb-1">Chưa có bộ thẻ nào</p>
      <p className="text-gray-400 text-sm mb-4">Tạo bộ thẻ đầu tiên để bắt đầu học!</p>
      <button
        onClick={onCreate}
        className="px-5 py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-xl hover:bg-[#A93226] transition-colors"
      >
        Tạo bộ thẻ
      </button>
    </div>
  );
}
