import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import type { StudySettings } from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

type ShowOption = "both" | "front" | "back" | "none";

const showHanziOptions: { value: StudySettings["show_hanzi"]; label: string }[] = [
  { value: "both", label: "Cả hai mặt" },
  { value: "front", label: "Chỉ mặt trước" },
  { value: "back", label: "Chỉ mặt sau" },
];

const showPinyinOptions: { value: StudySettings["show_pinyin"]; label: string }[] = [
  { value: "both", label: "Cả hai mặt" },
  { value: "back", label: "Chỉ mặt sau" },
  { value: "none", label: "Ẩn" },
];

const showMeaningOptions: { value: StudySettings["show_meaning"]; label: string }[] = [
  { value: "both", label: "Cả hai mặt" },
  { value: "back", label: "Chỉ mặt sau" },
  { value: "none", label: "Ẩn" },
];

function SelectRow<T extends ShowOption>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E8E0D5] last:border-b-0">
      <span className="text-sm text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="text-sm text-gray-700 bg-gray-50 border border-[#E8E0D5] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E8E0D5] last:border-b-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#C0392B]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPanel({ open, onClose }: Props) {
  const { random_order, show_hanzi, show_pinyin, show_meaning, auto_pronounce, setSettings } = useSettingsStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl shadow-xl max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E0D5]">
              <h2 className="text-base font-semibold text-gray-900">Cài đặt học</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Settings */}
            <div className="px-5 pb-8">
              <ToggleRow
                label="Thứ tự ngẫu nhiên"
                checked={random_order}
                onChange={(v) => setSettings({ random_order: v })}
              />
              <ToggleRow
                label="Tự đọc phát âm"
                checked={auto_pronounce}
                onChange={(v) => setSettings({ auto_pronounce: v })}
              />
              <SelectRow
                label="Hiển thị Hán tự"
                value={show_hanzi}
                options={showHanziOptions}
                onChange={(v) => setSettings({ show_hanzi: v })}
              />
              <SelectRow
                label="Hiển thị Phiên âm"
                value={show_pinyin}
                options={showPinyinOptions}
                onChange={(v) => setSettings({ show_pinyin: v })}
              />
              <SelectRow
                label="Hiển thị Nghĩa"
                value={show_meaning}
                options={showMeaningOptions}
                onChange={(v) => setSettings({ show_meaning: v })}
              />

              <p className="text-xs text-gray-400 mt-4 text-center">
                Thay đổi áp dụng từ phiên học tiếp theo
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
