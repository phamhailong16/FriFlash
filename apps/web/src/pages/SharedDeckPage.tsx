import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { decksApi } from "@/lib/decks";
import { getMessage } from "@/lib/messages";

export function SharedDeckPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-deck", token],
    queryFn: () => decksApi.getShared(token!),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFAF6] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#C0392B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#FDFAF6] flex flex-col items-center justify-center px-5 text-center gap-4">
        <p className="text-gray-600">{getMessage("ERR-SHARE-NOT-FOUND")}</p>
        <button
          onClick={() => navigate("/auth")}
          className="px-5 py-2.5 bg-[#C0392B] text-white rounded-xl text-sm font-semibold hover:bg-[#A93226] transition-colors"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFAF6] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E0D5] px-5 pt-12 pb-5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-[#C0392B] font-medium uppercase tracking-wide mb-1">
            Bộ thẻ công khai
          </p>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            {data.name}
          </h1>
          {data.description && (
            <p className="text-sm text-gray-500 mt-1">{data.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-2">{data.card_count} từ vựng</p>
        </div>
      </div>

      {/* Word list */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {data.words.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Bộ thẻ này chưa có từ vựng.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden">
            {data.words.map((word, idx) => (
              <div
                key={word.id}
                className={`flex items-start gap-4 px-4 py-3 ${
                  idx < data.words.length - 1 ? "border-b border-[#E8E0D5]" : ""
                }`}
              >
                <span
                  className="text-xl text-gray-900 shrink-0"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  {word.hanzi}
                </span>
                <div className="flex-1 min-w-0">
                  {word.variant_groups[0]?.pinyin && (
                    <p className="text-sm text-[#C0392B]">{word.variant_groups[0].pinyin}</p>
                  )}
                  {word.variant_groups[0]?.meaning && (
                    <p className="text-sm text-gray-600 truncate">{word.variant_groups[0].meaning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA banner */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#E8E0D5] px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Muốn học bộ thẻ này?</p>
            <p className="text-xs text-gray-500 truncate">Tạo tài khoản FriFlash miễn phí</p>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-xl hover:bg-[#A93226] transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
