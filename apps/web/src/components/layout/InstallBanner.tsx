import { Download, X } from "lucide-react";
import { useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 px-4 pb-2">
      <div className="bg-white border border-[#E8E0D5] rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#C0392B]/10 flex items-center justify-center shrink-0">
          <Download className="w-4 h-4 text-[#C0392B]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Cài đặt FriFlash</p>
          <p className="text-xs text-gray-500 truncate">Học mọi lúc, không cần trình duyệt</p>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#A93226] transition-colors shrink-0"
        >
          Cài đặt
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
