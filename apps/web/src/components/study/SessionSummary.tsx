import { motion } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw, ChevronLeft } from "lucide-react";
import type { StudyResult } from "@/store/studySessionStore";

interface Props {
  results: StudyResult[];
  deckName: string;
  onRestart: () => void;
  onBack: () => void;
}

export function SessionSummary({ results, deckName, onRestart, onBack }: Props) {
  const total = results.length;
  const knownCount = results.filter((r) => r.result === "known").length;
  const unknownCount = total - knownCount;
  const knownPct = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FDFAF6] flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-1">{deckName}</p>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả phiên học</h1>
        </div>

        {/* Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#E8E0D5" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#27AE60"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - knownPct / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{knownPct}%</span>
              <span className="text-xs text-gray-500">đã biết</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D5] p-5 text-center">
            <CheckCircle className="w-6 h-6 text-[#27AE60] mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{knownCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Đã biết</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D5] p-5 text-center">
            <XCircle className="w-6 h-6 text-[#E74C3C] mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{unknownCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Chưa biết</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-[#E8E0D5] p-5 text-center">
            <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-[#F39C12] font-bold text-lg">
              📚
            </div>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tổng cộng</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#C0392B] text-white rounded-xl font-semibold text-sm hover:bg-[#A93226] active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            Học lại
          </button>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#E8E0D5] text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
            Về bộ thẻ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
