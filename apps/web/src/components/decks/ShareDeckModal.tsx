import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, Check, Globe, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decksApi } from "@/lib/decks";
import { getMessage } from "@/lib/messages";
import type { Deck } from "@/types/api";

interface Props {
  open: boolean;
  deck: Deck;
  onClose: () => void;
}

export function ShareDeckModal({ open, deck, onClose }: Props) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const toggleShare = useMutation({
    mutationFn: () => decksApi.toggleShare(deck.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });

  const shareUrl = deck.share_token
    ? `${window.location.origin}/share/${deck.share_token}`
    : null;

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-[#FDFAF6] rounded-t-2xl shadow-xl max-w-lg mx-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E0D5]">
              <h2 className="text-base font-semibold text-gray-900">Chia sẻ bộ thẻ</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{deck.name}</span>
              </p>

              <button
                onClick={() => toggleShare.mutate()}
                disabled={toggleShare.isPending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  deck.is_public
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-[#C0392B] text-white hover:bg-[#A93226]"
                }`}
              >
                {deck.is_public ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Tắt chia sẻ
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Bật chia sẻ công khai
                  </>
                )}
              </button>

              {deck.is_public && shareUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Liên kết chia sẻ</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 text-xs bg-white border border-[#E8E0D5] rounded-xl px-3 py-2.5 text-gray-700 outline-none truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                        copied
                          ? "bg-[#27AE60] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-[#27AE60] text-center">
                      {getMessage("SHARE-COPY-SUCCESS")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pb-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
