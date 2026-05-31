import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none">
        <div className="bg-[#FDFAF6] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl pointer-events-auto">
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onCancel}
              className="p-1.5 -mt-0.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{message}</p>

          <div className="px-5 pb-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-[#E8E0D5] rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                destructive
                  ? "bg-[#C0392B] hover:bg-[#A93226]"
                  : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
