export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeckListResponse {
  items: Deck[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface VariantGroup {
  id: string;
  word_id: string;
  pinyin: string | null;
  han_viet: string | null;
  part_of_speech: string | null;
  meaning: string | null;
  sort_order: number;
}

export interface Word {
  id: string;
  deck_id: string;
  hanzi: string;
  note: string | null;
  known_count: number;
  unknown_count: number;
  variant_groups: VariantGroup[];
  created_at: string;
  updated_at: string;
}

export type WordStatus = "new" | "learning" | "familiar" | "mastered";

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  total_cards: number;
  known_count: number;
  unknown_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface StudySettings {
  random_order: boolean;
  show_hanzi: "both" | "front" | "back";
  show_pinyin: "both" | "back" | "none";
  show_meaning: "both" | "back" | "none";
  auto_pronounce: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ImportResult {
  deck_id: string;
  deck_name: string;
  imported_count: number;
  skipped_count: number;
}

export interface StatsOverview {
  total_words: number;
  studied_words: number;
  known_words: number;
  known_rate: number;
  session_count: number;
}

export interface ActivityData {
  dates: string[];
  counts: number[];
}

export interface WordStatusData {
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
}

export interface DeckStat {
  deck_id: string;
  deck_name: string;
  total: number;
  studied: number;
  known_rate: number;
  last_studied: string | null;
}
