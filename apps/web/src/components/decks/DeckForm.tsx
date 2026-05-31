import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { getMessage } from "../../lib/messages";
import { useCreateDeck, useUpdateDeck } from "../../hooks/useDecks";
import type { Deck } from "../../types/api";

const schema = z.object({
  name: z
    .string()
    .min(1, getMessage("ERR-D001"))
    .max(50, getMessage("ERR-D003")),
  description: z
    .string()
    .max(200, getMessage("ERR-D004"))
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface DeckFormProps {
  open: boolean;
  deck?: Deck | null;
  onClose: () => void;
}

export function DeckForm({ open, deck, onClose }: DeckFormProps) {
  const isEdit = Boolean(deck);
  const createDeck = useCreateDeck();
  const updateDeck = useUpdateDeck();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: deck?.name ?? "",
        description: deck?.description ?? "",
      });
    }
  }, [open, deck, reset]);

  async function onSubmit(values: FormValues) {
    const body = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
    };

    try {
      if (isEdit && deck) {
        await updateDeck.mutateAsync({ id: deck.id, body });
      } else {
        await createDeck.mutateAsync(body);
      }
      onClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (detail === "ERR-D002") {
        setError("name", { message: getMessage("ERR-D002") });
      } else {
        setError("root", { message: getMessage(detail ?? "ERR-UNKNOWN") });
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-[#FDFAF6] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E0D5]">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Chỉnh sửa bộ thẻ" : "Tạo bộ thẻ mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tên bộ thẻ <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              autoFocus
              placeholder="VD: HSK 1, Từ vựng kinh doanh..."
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-colors ${
                errors.name
                  ? "border-red-400 focus:border-red-500"
                  : "border-[#E8E0D5] focus:border-[#C0392B]"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Mô tả ngắn về bộ thẻ này..."
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none resize-none transition-colors ${
                errors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-[#E8E0D5] focus:border-[#C0392B]"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1.5">{errors.description.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div className="flex gap-3 pt-2 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E8E0D5] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#A93226] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bộ thẻ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
