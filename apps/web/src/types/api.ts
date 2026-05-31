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
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedDeck {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
  words: Word[];
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
  status: WordStatus;
  ease_factor: number;
  sm2_interval: number;
  repetitions: number;
  next_review_date: string | null;
  variant_groups: VariantGroup[];
  created_at: string;
  updated_at: string;
}

export type WordStatus = "new" | "learning" | "familiar" | "mastered";

export interface WordListResponse {
  items: Word[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

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
  total_decks: number;
  total_words: number;
  mastered_words: number;
  total_sessions: number;
  streak_days: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  cards_studied: number;
  known: number;
  unknown: number;
}

export interface ActivityResponse {
  days: number;
  data: DailyActivity[];
}

export interface WordStatusCount {
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
  total: number;
}

export interface DeckStat {
  deck_id: string;
  name: string;
  total_words: number;
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
}

export interface BreakdownResponse {
  global_status: WordStatusCount;
  decks: DeckStat[];
}
