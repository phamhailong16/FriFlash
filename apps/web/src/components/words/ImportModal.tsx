import { useRef, useState } from "react";
import { X, Upload, Link, CheckCircle2, AlertCircle } from "lucide-react";
import { getMessage } from "../../lib/messages";
import { useImportExcel, useImportSheets } from "../../hooks/useImport";
import type { ImportResult } from "../../types/api";

type Tab = "excel" | "sheets";

interface ImportModalProps {
  open: boolean;
  deckId: string;
  onClose: () => void;
}

export function ImportModal({ open, deckId, onClose }: ImportModalProps) {
  const [tab, setTab] = useState<Tab>("excel");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const importExcel = useImportExcel(deckId);
  const importSheets = useImportSheets(deckId);

  const isLoading = importExcel.isPending || importSheets.isPending;

  function reset() {
    setResult(null);
    setErrorMsg(null);
    setSheetsUrl("");
    importExcel.reset();
    importSheets.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(getMessage("ERR-I003"));
      return;
    }
    setErrorMsg(null);
    setResult(null);
    try {
      const r = await importExcel.mutateAsync(file);
      setResult(r);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(getMessage(detail ?? "ERR-I005"));
    }
  }

  async function handleSheetsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sheetsUrl.trim()) return;
    setErrorMsg(null);
    setResult(null);
    try {
      const r = await importSheets.mutateAsync(sheetsUrl.trim());
      setResult(r);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(getMessage(detail ?? "ERR-I005"));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-[#FDFAF6] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E0D5]">
          <h2 className="text-lg font-semibold text-gray-900">Nhập từ vựng</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setTab("excel"); reset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "excel" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Excel (.xlsx/.xls)
            </button>
            <button
              onClick={() => { setTab("sheets"); reset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "sheets" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Google Sheets
            </button>
          </div>

          {/* Success state */}
          {result && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Nhập thành công {result.imported_count} từ!
                </p>
                {result.skipped_count > 0 && (
                  <p className="text-xs text-green-700 mt-0.5">
                    Bỏ qua {result.skipped_count} dòng không có Hanzi.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {errorMsg && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Excel tab */}
          {tab === "excel" && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-[#C0392B] bg-red-50"
                    : "border-[#E8E0D5] hover:border-[#C0392B]/50 hover:bg-gray-50"
                } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  {isLoading ? "Đang xử lý..." : "Chọn hoặc kéo file vào đây"}
                </p>
                <p className="text-xs text-gray-400 mt-1">.xlsx hoặc .xls · Tối đa 10MB · 5.000 dòng</p>
              </div>

              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <p className="font-medium mb-1">Định dạng file cần có cột:</p>
                <p>
                  <code className="bg-amber-100 px-1 rounded">hanzi</code> (bắt buộc) ·{" "}
                  <code className="bg-amber-100 px-1 rounded">pinyin</code> ·{" "}
                  <code className="bg-amber-100 px-1 rounded">han_viet</code> ·{" "}
                  <code className="bg-amber-100 px-1 rounded">meaning</code> ·{" "}
                  <code className="bg-amber-100 px-1 rounded">part_of_speech</code> ·{" "}
                  <code className="bg-amber-100 px-1 rounded">note</code>
                </p>
              </div>
            </div>
          )}

          {/* Google Sheets tab */}
          {tab === "sheets" && (
            <form onSubmit={handleSheetsSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Đường dẫn Google Sheets
                </label>
                <input
                  type="url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-white text-sm outline-none focus:border-[#C0392B] transition-colors disabled:opacity-60"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                Bảng tính phải được chia sẻ công khai ("Bất kỳ ai có đường liên kết").
              </div>

              <button
                type="submit"
                disabled={isLoading || !sheetsUrl.trim()}
                className="w-full py-2.5 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#A93226] disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Đang tải..." : "Nhập từ Google Sheets"}
              </button>
            </form>
          )}

          {/* Close button after success */}
          {result && (
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl border border-[#E8E0D5] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
