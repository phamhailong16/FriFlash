# FriFlash — Web App

React 18 + Vite + TypeScript + Tailwind CSS frontend cho FriFlash.

## Chạy

```bash
# Từ root của monorepo
pnpm install
pnpm dev:web

# Hoặc trực tiếp
cd apps/web
pnpm dev
```

Mở `http://localhost:5173`. Cần backend đang chạy tại `localhost:8000` — xem `../api/README.md`.

## Cấu trúc `src/`

```
components/
  layout/       AppShell, BottomNav, PageHeader
  study/        SwipeableCard, Flashcard, SessionSummary (Phase 5)
  deck/         DeckCard, DeckForm, MergeModal (Phase 2)
  word/         WordRow, WordForm, VariantGroupFields (Phase 3)
  stats/        ActivityChart, WordStatusBreakdown (Phase 6)
lib/
  api.ts        Axios instance + auth interceptor tự động refresh token
  messages.ts   Map ERR-* code → chuỗi tiếng Việt
  cn.ts         clsx + tailwind-merge helper
pages/          AuthPage, DecksPage, DeckDetailPage, StudyPage, StatsPage
store/
  authStore     User hiện tại, trạng thái loading
  settingsStore Cài đặt học (persisted vào localStorage)
types/api.ts    TypeScript interfaces khớp với Pydantic schemas của backend
```

## Build production

```bash
pnpm build:web
# output: apps/web/dist/
```
