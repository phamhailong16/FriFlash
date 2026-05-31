import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { getMessage } from "../../lib/messages";
import { wordsApi } from "../../lib/words";
import { useCreateWord, useUpdateWord } from "../../hooks/useWords";
import type { Word } from "../../types/api";

const variantSchema = z.object({
  pinyin: z.string().optional().or(z.literal("")),
  han_viet: z.string().optional().or(z.literal("")),
  part_of_speech: z.string().optional().or(z.literal("")),
  meaning: z.string().optional().or(z.literal("")),
});

const schema = z.object({
  hanzi: z.string().min(1, getMessage("ERR-W001")).trim(),
  note: z.string().optional().or(z.literal("")),
  variants: z.array(variantSchema).min(1),
});

type FormValues = z.infer<typeof schema>;

const emptyVariant = () => ({
  pinyin: "",
  han_viet: "",
  part_of_speech: "",
  meaning: "",
});

interface WordFormProps {
  open: boolean;
  deckId: string;
  word?: Word | null;
  onClose: () => void;
}

export function WordForm({ open, deckId, word, onClose }: WordFormProps) {
  const isEdit = Boolean(word);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState(false);

  const createWord = useCreateWord(deckId);
  const updateWord = useUpdateWord(deckId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hanzi: "", note: "", variants: [emptyVariant()] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    if (open) {
      if (word) {
        reset({
          hanzi: word.hanzi,
          note: word.note ?? "",
          variants: word.variant_groups.map((vg) => ({
            pinyin: vg.pinyin ?? "",
            han_viet: vg.han_viet ?? "",
            part_of_speech: vg.part_of_speech ?? "",
            meaning: vg.meaning ?? "",
          })),
        });
      } else {
        reset({ hanzi: "", note: "", variants: [emptyVariant()] });
      }
      setLookupError(false);
    }
  }, [open, word, reset]);

  async function handleHanziBlur() {
    if (isEdit) return;
    const hanzi = watch("hanzi").trim();
    if (!hanzi) return;

    // Only auto-lookup if all current variants are empty
    const current = watch("variants");
    const hasContent = current.some(
      (v) => v.pinyin || v.han_viet || v.meaning || v.part_of_speech
    );
    if (hasContent) return;

    setLookingUp(true);
    setLookupError(false);
    try {
      const results = await wordsApi.lookup(deckId, hanzi);
      if (results.length > 0) {
        setValue(
          "variants",
          results.map((r) => ({
            pinyin: r.pinyin ?? "",
            han_viet: r.han_viet ?? "",
            part_of_speech: r.part_of_speech ?? "",
            meaning: r.meaning ?? "",
          }))
        );
      }
    } catch {
      setLookupError(true);
    } finally {
      setLookingUp(false);
    }
  }

  async function onSubmit(values: FormValues) {
    const body = {
      hanzi: values.hanzi.trim(),
      note: values.note?.trim() || null,
      variants: values.variants.map((v, i) => ({
        pinyin: v.pinyin?.trim() || null,
        han_viet: v.han_viet?.trim() || null,
        part_of_speech: v.part_of_speech?.trim() || null,
        meaning: v.meaning?.trim() || null,
        sort_order: i,
      })),
    };

    try {
      if (isEdit && word) {
        await updateWord.mutateAsync({ wordId: word.id, body });
      } else {
        await createWord.mutateAsync(body);
      }
      onClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      if (detail === "ERR-W001") {
        setError("hanzi", { message: getMessage("ERR-W001") });
      } else {
        setError("root", { message: getMessage(detail ?? "ERR-UNKNOWN") });
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#FDFAF6] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E0D5] shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Chỉnh sửa từ vựng" : "Thêm từ vựng"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto flex-1 px-5 py-4 space-y-4"
        >
          {/* Hanzi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Chữ Hán <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("hanzi")}
                onBlur={handleHanziBlur}
                autoFocus={!isEdit}
                placeholder="VD: 你好"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-gray-900 text-2xl placeholder:text-base placeholder:text-gray-400 outline-none transition-colors ${
                  errors.hanzi
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#E8E0D5] focus:border-[#C0392B]"
                }`}
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              />
              {lookingUp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C0392B]" />
                </div>
              )}
            </div>
            {errors.hanzi && (
              <p className="text-xs text-red-500 mt-1.5">{errors.hanzi.message}</p>
            )}
            {lookupError && (
              <p className="text-xs text-amber-600 mt-1.5">{getMessage("ERR-W005")}</p>
            )}
            {!isEdit && !lookingUp && !lookupError && (
              <p className="text-xs text-gray-400 mt-1">
                Rời ô để tự động tra cứu từ điển.
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ghi chú
            </label>
            <input
              {...register("note")}
              placeholder="Ghi chú thêm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E0D5] bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none focus:border-[#C0392B] transition-colors"
            />
          </div>

          {/* Variant groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Cách đọc / nghĩa
              </label>
              <button
                type="button"
                onClick={() => append(emptyVariant())}
                className="flex items-center gap-1 text-xs text-[#C0392B] hover:text-[#A93226] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm nghĩa
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-white border border-[#E8E0D5] rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Nghĩa {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Xoá nghĩa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pinyin</label>
                      <input
                        {...register(`variants.${index}.pinyin`)}
                        placeholder="nǐ hǎo"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-[#FDFAF6] text-sm outline-none focus:border-[#C0392B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hán Việt</label>
                      <input
                        {...register(`variants.${index}.han_viet`)}
                        placeholder="nễ hảo"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-[#FDFAF6] text-sm outline-none focus:border-[#C0392B] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Từ loại</label>
                    <input
                      {...register(`variants.${index}.part_of_speech`)}
                      placeholder="đại từ, động từ..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-[#FDFAF6] text-sm outline-none focus:border-[#C0392B] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nghĩa</label>
                    <textarea
                      {...register(`variants.${index}.meaning`)}
                      rows={2}
                      placeholder="Xin chào..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-[#FDFAF6] text-sm outline-none focus:border-[#C0392B] resize-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errors.root && (
            <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">
              {errors.root.message}
            </p>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || lookingUp}
              className="flex-1 py-2.5 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-[#A93226] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm từ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
