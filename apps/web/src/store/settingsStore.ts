import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudySettings } from "@/types/api";

interface SettingsState extends StudySettings {
  setSettings: (s: Partial<StudySettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      random_order: true,
      show_hanzi: "both",
      show_pinyin: "back",
      show_meaning: "back",
      auto_pronounce: false,
      setSettings: (s) => set((state) => ({ ...state, ...s })),
    }),
    { name: "friflash-study-settings" }
  )
);
