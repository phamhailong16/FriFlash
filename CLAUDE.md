# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FriFlash (Friday Flash) is a Vietnamese-first flashcard app for learning Chinese vocabulary.

**Stack:** React 18 + Vite (PWA) · FastAPI (Python 3.12+) · PostgreSQL · pnpm monorepo

## Development Setup

```bash
# Frontend (http://localhost:5173)
pnpm install
pnpm dev:web

# Backend (http://localhost:8000)
cd apps/api
.venv/Scripts/python.exe -m uvicorn app.main:app --reload   # Windows
# source .venv/bin/activate && uvicorn app.main:app --reload  # Mac/Linux

# Database migration (requires PostgreSQL running)
cd apps/api
.venv/Scripts/python.exe -m alembic upgrade head
```

Backend requires `.env` in `apps/api/` — copy from `.env.example` and set `DATABASE_URL`.

```bash
# Seed tài khoản test (sau khi migrate xong)
cd apps/api
.venv/Scripts/python.exe seed.py
# → tạo user: test@friflash.dev / test1234
```

## Architecture

**Monorepo layout (pnpm workspaces):**
```
apps/web/     React 18 + Vite + TypeScript + Tailwind (PWA)
apps/api/     FastAPI (Python) + SQLAlchemy 2.0 async + Alembic
```

**Frontend key libraries:** TanStack Query v5 · Zustand · Framer Motion + @use-gesture/react · Recharts · React Hook Form + Zod · React Router v7

**Backend key libraries:** httpx async (hanzii.net proxy) · openpyxl/xlrd (Excel import) · python-jose + bcrypt (JWT auth)

> ⚠️ `passlib 1.7.4` không tương thích với `bcrypt 5.x`. `security.py` dùng `bcrypt` trực tiếp (không qua passlib) để hash/verify password.

**Auth flow:** On load, App.tsx calls `POST /auth/refresh` (reads HttpOnly cookie) → stores access token in memory → all API calls use `Authorization: Bearer`. On 401, Axios interceptor retries refresh once before redirecting to `/auth`.

**Frontend state split:**
- `authStore` (Zustand) — current user, loading flag
- `settingsStore` (Zustand + `persist`) — study settings, survives refresh via localStorage
- TanStack Query — all server data (decks, words, stats)

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary | `#C0392B` | CTAs, active nav, Known button |
| Gold | `#F39C12` | Progress bar, achievements |
| Background | `#FDFAF6` | App background (warm ivory) |
| Known | `#27AE60` | Swipe-right overlay |
| Unknown | `#E74C3C` | Swipe-left overlay |
| Border | `#E8E0D5` | |

**Fonts:** Hanzi flashcard (64px) = Noto Serif SC · Hanzi list (22px) = Noto Sans SC · UI + Pinyin = Be Vietnam Pro

## Repository Contents

| Path | Purpose |
|---|---|
| `FriFlash_BRD.docx` | Business Requirements — personas, KPIs, scope |
| `FriFlash_FRD.docx` | Functional Requirements — use cases, data model, error catalog |
| `apps/web/` | React PWA frontend |
| `apps/api/` | FastAPI backend |

## Domain Knowledge

**Core data hierarchy:** User → Deck → Word → VariantGroup

- A **Deck** groups vocabulary by topic (e.g., HSK 1, Business Chinese).
- A **Word** has a required `hanzi` field plus optional `note`. One word can have multiple **VariantGroup** records — each group represents one pronunciation/meaning combination (e.g., 行 has *xíng* = "to walk" and *háng* = "profession").
- Study progress tracked per Word via `known_count` / `unknown_count` counters.
- Word learning state: **New** (0/0) → **Learning** (unknown ≥ known) → **Familiar** (known > unknown) → **Mastered** (known ≥ 5 AND known > unknown).

**Auto-lookup:** When a user adds a word, the system proxies to hanzii.net to auto-fill VariantGroups. All fields except `hanzi` are optional; missing ones stay empty.

**Import rules:** `hanzi` is the key field. Rows without `hanzi` are skipped. Duplicates allowed. Max 10 MB / 5,000 rows per import.

## Key Business Rules

- Deck names must be unique per user (max 50 chars); descriptions max 200 chars.
- A Word must always have at least 1 VariantGroup — delete icon hidden when only 1 remains.
- Study Mode settings (random order, display fields, auto-pronunciation) persisted per user, restored on next session.
- In Study Mode, at least one field must be shown on the front side.
- Merge creates deck named `"DeckA-DeckB"` (truncated to 50 chars with `...`); duplicates kept.
- All user-facing text and errors must be in Vietnamese — see `apps/web/src/lib/messages.ts` for the full ERR-* map.

## Error Message Reference

All Vietnamese strings live in `apps/web/src/lib/messages.ts`. Prefixes:
- `ERR-D*` — Deck errors
- `ERR-W*` — Word errors
- `ERR-I*` — Import errors
- `ERR-S*` — Study/Statistics errors
- `ERR-NET` — Network error

Full catalog in `FriFlash_FRD.docx` Section IX.

---

## Implementation Status

### Phase 1 — Foundation ✅ (2026-05-31)
- pnpm monorepo scaffold
- PostgreSQL models: User, Deck, Word, VariantGroup, StudySession (SQLAlchemy 2.0 async)
- Alembic migrations initialized
- Auth API: `POST /auth/register` `/login` `/refresh` `/logout` `GET /auth/me`
- JWT access token (15 min) + HttpOnly refresh cookie (7 days), token rotation on refresh
- Frontend: AuthPage (login/register tabs), AppShell, BottomNav, PageHeader, ProtectedRoute
- Zustand stores: authStore, settingsStore (persisted)
- TanStack Query client, Axios instance with auth interceptor + auto-refresh

### Phase 2 — Deck Management ✅ (2026-05-31)
Endpoints: `GET /api/v1/decks` (search + pagination) · `POST` · `PATCH /:id` · `DELETE /:id` · `POST /bulk-delete` · `POST /merge` — tất cả có auth guard.
UI: DeckCard (dropdown menu, bulk select mode) · DeckForm modal (React Hook Form + Zod, Vietnamese errors) · search debounce 300ms · pagination 10/20/50 · empty state · FAB.

New files:
- `apps/api/migrations/versions/001_initial_schema.py` — migration thủ công tạo 5 tables (viết tay vì PostgreSQL chưa chạy khi autogenerate)
- `apps/api/app/schemas/deck.py` — DeckCreate, DeckUpdate, DeckOut, MergeRequest, BulkDeleteRequest
- `apps/api/app/services/deck.py` — DeckService tách hoàn toàn khỏi router
- `apps/api/app/api/v1/decks.py` — 6 endpoints
- `apps/web/src/lib/decks.ts` — API client functions
- `apps/web/src/hooks/useDecks.ts` — TanStack Query hooks
- `apps/web/src/components/decks/DeckCard.tsx`
- `apps/web/src/components/decks/DeckForm.tsx`
- `apps/web/src/pages/DecksPage.tsx` — fully implemented

⚠️ **Trước khi test:** Start PostgreSQL, sau đó chạy `.venv/Scripts/python.exe -m alembic upgrade head` trong `apps/api/`.

### Phase 3 — Word Management ✅ (2026-05-31)
Endpoints: `GET/POST /api/v1/decks/:id/words` · `PATCH/DELETE /api/v1/decks/:id/words/:id` · `GET /api/v1/decks/:id/words/lookup?hanzi=` (hanzii.net proxy).
UI: WordRow (hanzi + pinyin + nghĩa + status badge + dropdown) · WordForm (React Hook Form + Zod, auto-lookup on blur, multi-variant fields) · WordsPage (list, pagination, FAB) · DeckCard navigates to `/decks/:id/words`.

New files:
- `apps/api/app/schemas/word.py` — WordCreate, WordUpdate, WordOut, VariantGroupOut, WordListResponse
- `apps/api/app/services/word.py` — CRUD + card_count sync + hanzii.net proxy
- `apps/api/app/api/v1/words.py` — 5 endpoints
- `apps/web/src/lib/words.ts` — API client
- `apps/web/src/hooks/useWords.ts` — TanStack Query hooks
- `apps/web/src/components/words/WordRow.tsx`
- `apps/web/src/components/words/WordForm.tsx` — auto-lookup, useFieldArray for variants
- `apps/web/src/pages/WordsPage.tsx`

### Phase 4 — Import ✅ (2026-05-31)
Endpoints: `POST /api/v1/decks/:id/import-excel` (multipart) · `POST /api/v1/decks/:id/import-sheets` (URL body).
UI: ImportModal với 2 tabs (Excel drag-drop + Google Sheets URL), hiển thị kết quả imported/skipped.

New files:
- `apps/api/app/schemas/import_.py` — ImportResult
- `apps/api/app/services/import_.py` — parse xlsx/xls/csv, bulk insert, card_count sync
- `apps/api/app/api/v1/imports.py` — 2 endpoints
- `apps/web/src/lib/import.ts` — API client
- `apps/web/src/hooks/useImport.ts` — useMutation hooks
- `apps/web/src/components/words/ImportModal.tsx`

Column mapping: `hanzi` (required), `pinyin`, `han_viet`, `part_of_speech`, `meaning`, `note` (case-insensitive, underscore-normalized).

### Phase 5 — Study Mode ✅ (2026-05-31)
Endpoints: `GET /api/v1/decks/:id/study/words` · `POST /api/v1/decks/:id/study/evaluate` · `POST /api/v1/decks/:id/study/session` — tất cả có auth guard.
UI: SwipeableCard (Framer Motion 3D flip, drag swipe left/right, known/unknown overlay) · SettingsPanel (slide-up sheet) · SessionSummary (SVG progress ring, known/unknown stats) · StudyPage (full-screen, ngoài AppShell) · Nút "Học ngay" trên WordsPage.

**Luồng học:** WordsPage → "Học ngay" → StudyPage load từ → tap để flip 3D → vuốt hoặc nhấn Known/Unknown → evaluate fire-and-forget → hết thẻ → SessionSummary → học lại hoặc về bộ thẻ.

New files:
- `apps/api/app/schemas/study.py` — EvaluateRequest, EvaluateResponse, StudySessionCreate, StudySessionOut
- `apps/api/app/services/study.py` — get_study_words, evaluate_word, save_session
- `apps/api/app/api/v1/study.py` — 3 endpoints
- `apps/web/src/lib/study.ts` — API client
- `apps/web/src/hooks/useStudy.ts` — useStudyWords (TanStack Query)
- `apps/web/src/store/studySessionStore.ts` — Zustand: queue thẻ, Fisher-Yates shuffle, index, kết quả
- `apps/web/src/components/study/SwipeableCard.tsx` — 3D flip + Framer Motion drag + overlay
- `apps/web/src/components/study/SettingsPanel.tsx` — slide-up sheet cài đặt
- `apps/web/src/components/study/SessionSummary.tsx` — kết quả cuối phiên + SVG progress ring
- `apps/web/src/pages/StudyPage.tsx` — full-screen study flow (route ngoài AppShell)

### Phase 6 — Statistics ✅ (2026-05-31)
Endpoints: `GET /api/v1/stats/overview` · `GET /api/v1/stats/activity?days=` · `GET /api/v1/stats/breakdown` — tất cả có auth guard.
UI: 4 StatCard (tổng deck, tổng từ, đã thuộc, chuỗi ngày) · ActivityChart (Recharts AreaChart, time filter 7/30/90 ngày) · WordStatusBreakdown (stacked bar + legend 4 trạng thái) · DeckStatsTable (bảng per-deck với mini progress bar).

New files:
- `apps/api/app/schemas/stats.py` — StatsOverview, DailyActivity, ActivityResponse, WordStatusCount, DeckStat, BreakdownResponse
- `apps/api/app/services/stats.py` — get_overview (streak tính từ StudySession), get_activity (fill zeros cho ngày không học), get_breakdown (word status per deck)
- `apps/api/app/api/v1/stats.py` — 3 endpoints
- `apps/web/src/lib/stats.ts` — API client
- `apps/web/src/hooks/useStats.ts` — useStatsOverview, useStatsActivity, useStatsBreakdown
- `apps/web/src/components/stats/ActivityChart.tsx` — Recharts AreaChart (known/unknown) + custom tooltip
- `apps/web/src/components/stats/WordStatusBreakdown.tsx` — stacked bar + legend
- `apps/web/src/components/stats/DeckStatsTable.tsx` — bảng per-deck + mini progress bar
- `apps/web/src/pages/StatsPage.tsx` — full implementation thay placeholder

### Phase 7 — Bulk Ops + Polish ✅ (2026-05-31)
- **Merge Deck UI:** `MergeDeckModal` (bottom sheet, searchable deck list, preview tên mới truncated 50 chars), "Gộp vào..." item trong DeckCard dropdown, wired với `useMergeDecks()` hook.
- **Bulk Delete:** Đã có đầy đủ từ Phase 2 — toolbar Chọn/Xoá.
- **Skeleton Loaders:** `Skeleton` component (`components/ui/Skeleton.tsx`); áp dụng vào DecksPage (4 card), WordsPage (5 row), StatsPage (overview cards + `StatCardSkeleton`, activity chart, breakdown bar + table rows).
- **PWA Manifest:** `public/manifest.webmanifest` (name, theme_color `#C0392B`, display: standalone), SVG icons 192/512 (ký tự 闪), meta tags PWA + Apple Touch trong `index.html`.

New files:
- `apps/web/src/components/ui/Skeleton.tsx`
- `apps/web/src/components/decks/MergeDeckModal.tsx`
- `apps/web/public/manifest.webmanifest`
- `apps/web/public/icon-192.svg` · `icon-512.svg`

### Phase 8 — Launch Prep ✅ (2026-05-31)
- `VITE_API_URL` env var + `apps/web/.env.example`
- CORS hardening (restricted methods + headers)
- Sentry backend (`sentry-sdk[fastapi]`) + Sentry frontend (`@sentry/react`)
- Deploy configs: `vercel.json` (SPA routing), `apps/api/railway.toml` (startCommand: alembic + uvicorn)
- k6 load tests: `k6/smoke.js` (1 VU, 30s) + `k6/load.js` (50 VU, 2 phút)

### Post-Launch Features ✅ (2026-05-31)
- **PWA Service Worker** — `vite-plugin-pwa`, NetworkOnly cho `/api/`, StaleWhileRevalidate cho Google Fonts
- **PWA Install Banner** — `usePWAInstall` hook + `InstallBanner` component (trên BottomNav)
- **E2E Tests** — Playwright, 5 spec files (auth, deck-crud, study-flow, tts, share-deck), Pixel 7 device
- **TTS Auto-Pronunciation** — Web Speech API, lang `zh-CN`, rate 0.85, nút Volume2 manual + toggle "Tự đọc phát âm"
- **SM-2 Spaced Repetition** — migration 002, `_sm2_update()`, `due_only` filter, `next_review_date` index
- **Deck Sharing** — `share_token` (base62 12 chars), `is_public`, public GET `/api/v1/share/{token}`, `SharedDeckPage`
- **Production cookie fix** — `samesite="none" + secure=True` khi `ENVIRONMENT=production`

### Post-Launch Bug Fixes ✅ (2026-05-31)
- **Infinite reload loop** — Axios interceptor trong `api.ts` bắt 401 từ chính `/auth/refresh` → gọi redirect liên tục. Fix: thêm `!isRefreshCall` guard để bypass interceptor cho refresh requests.
- **bcrypt compat** — `passlib 1.7.4` crash với `bcrypt 5.x`. Fix: `security.py` dùng `bcrypt.hashpw/checkpw` trực tiếp, bỏ passlib hoàn toàn.
- **UserOut schema** — `created_at: str` crash khi SQLAlchemy trả `datetime`. Fix: đổi thành `created_at: datetime`.
- **N+1 query** — `list_words` và `get_study_words` gọi `db.refresh(word, ["variant_groups"])` trong loop → N roundtrips DB. Fix: dùng `selectinload(Word.variant_groups)` trong query gốc → 2 queries tổng bất kể số từ.
- **seed.py** — Script tạo test user `test@friflash.dev / test1234` cho local dev (idempotent).

### QA & Performance Optimization ✅ (2026-06-01)

**E2E Test Fixes (Playwright):**
- **auth.ts helper** — Đổi `getByPlaceholder` → `getByLabel`; scope submit button vào `locator("form")` để tránh match nút tab "Đăng nhập"
- **AuthPage accessibility** — `Field` component thêm `htmlFor`/`id` (label↔input), `aria-hidden` trên ký tự `*`; thêm `useEffect` redirect khi đã login
- **DeckForm accessibility** — `label htmlFor="deck-name"` + `input id="deck-name"`, `aria-hidden` trên `*`
- **WordForm accessibility** — Thêm `aria-label="Hanzi"` vào hanzi input (label hiển thị là "Chữ Hán" nhưng test dùng `getByLabel("Hanzi")` — Playwright match cả `aria-label`)
- **DeckCard accessibility** — Thêm `aria-label="Tuỳ chọn"` vào menu toggle button; `role="menu"` lên dropdown container; `role="menuitem"` lên 4 menu items
- **SwipeableCard** — Thêm `data-testid="flashcard"` để E2E selector ổn định
- **deck-crud spec** — Đổi `getByRole("button", { name: "Tạo" })` → `{ name: "Tạo bộ thẻ", exact: true }` (FAB cũng match "Tạo")
- **study-flow spec** — Dùng timestamp-based deck name (`Study E2E ${Date.now()}`) tránh ERR-D002; scope FAB click bằng `getByLabel("Thêm từ")`; wait for hanzii lookup trước khi submit (`expect(submit).toBeEnabled({ timeout: 10_000 })`)
- **share-deck spec** — Đọc URL qua `input[readonly].inputValue()` (không phải link href); thêm `.first()` cho strict mode
- **ShareDeckModal stale state (app bug)** — `DecksPage` lưu `sharingDeck` là snapshot → modal không cập nhật sau `toggleShare`. Fix: lưu `sharingDeckId`, derive live từ TanStack Query data. ⚠️ `sharingDeck` phải khai báo SAU `useDecks()` hook (TS error nếu khai báo trước)

**E2E kết quả:** 7/8 pass — 1 skip (`tts.spec.ts`): Web Speech API không hoạt động trong Chromium headless, expected.

**Bundle Optimization (code splitting):**
- `apps/web/src/router.tsx` — Tất cả page components đổi sang `React.lazy()` + `Suspense` (fallback null). AuthPage giữ nguyên eager vì là entry point
- `apps/web/vite.config.ts` — Thêm `build.rollupOptions.output.manualChunks` function (không phải object — Vite 8/Rolldown yêu cầu function form). 7 vendor chunks: `react-vendor`, `router`, `query`, `motion`, `charts`, `forms`, `icons`
- Kết quả: 1 chunk 1,084 KB → lớn nhất 388 KB (charts, lazy); initial load ~130 KB gzip (react-vendor + router + index). Không còn warning > 500 KB

**k6 Smoke test:** 100% checks pass (4 endpoints: login, decks list, stats overview, study/words), avg ~70ms response time.

---

## Important Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Backend language | Python/FastAPI (not Node.js) | Async-first, best Excel parsing ecosystem (openpyxl/xlrd), Pydantic v2 validation, auto OpenAPI docs |
| Email validation | Regex in `schemas/auth.py` (not `pydantic[email]`) | `email-validator` package had install issues on Python 3.14; regex covers all realistic cases |
| Auth token storage | Access token in memory, refresh in HttpOnly cookie | Access token in localStorage is XSS-vulnerable; HttpOnly cookie prevents JS access |
| State management | TanStack Query (server) + Zustand (UI) | TQ handles cache/invalidation/optimistic updates; Zustand handles ephemeral session state |
| Study session data | Client-side Zustand during session, fire-and-forget evaluate API | Offline-tolerant; swipe feedback is instant regardless of network |
| `card_count` cache | Explicit update on word create/delete (no DB trigger) | Triggers add hidden complexity; explicit is easier to reason about |
| Alembic migration (Phase 2) | Viết migration thủ công thay vì `--autogenerate` | `autogenerate` yêu cầu kết nối DB live; PostgreSQL chưa chạy trên máy dev Windows nên viết tay từ model definitions |
| Delete confirmation (Phase 2) | `window.confirm()` thay vì custom Dialog | Chưa có component library Dialog; `window.confirm` đủ dùng cho MVP, sẽ nâng cấp ở Phase 7 polish |
| Service layer (Phase 2) | `app/services/deck.py` tách khỏi router | Theo pattern đã đặt ra — giữ router mỏng, dễ test service riêng biệt |
| hanzii.net proxy timeout (Phase 3) | 5 giây, trả về `[]` khi lỗi | Auto-lookup là UX nice-to-have, không được block người dùng; form vẫn dùng được khi lookup fail |
| Lookup route trước `:word_id` (Phase 3) | `GET /words/lookup` khai báo trước `PATCH /words/{word_id}` | FastAPI match route theo thứ tự — nếu đặt sau, `"lookup"` sẽ bị hiểu là `word_id` |
| Tối thiểu 1 VariantGroup (Phase 3) | Nút xóa ẩn khi chỉ còn 1 variant trong form; backend enforce bằng fallback khi `variants=[]` | Business rule cốt lõi — một Word không thể tồn tại không có VariantGroup |
| Import column mapping (Phase 4) | Normalize header: lowercase + strip + replace space → underscore | Cho phép file Excel có tên cột "Hanzi", "HANZI", "hán tự " đều được nhận dạng; trade-off: tên cột có dấu cách sẽ bị normalize |
| Import: Duplicates allowed (Phase 4) | Không kiểm tra trùng khi import | Theo FRD — người dùng tự quản lý; đơn giản hóa bulk insert |
| Study route ngoài AppShell (Phase 5) | `/decks/:id/study` là ProtectedRoute standalone, không wrap AppShell | Study mode cần full-screen immersive — BottomNav che mất không gian thẻ |
| Framer Motion drag thay @use-gesture (Phase 5) | Dùng `drag="x"` + `onDragEnd` của Framer Motion thay vì `@use-gesture/react` | Package không được cài; Framer Motion drag đủ mượt cho swipe card trên mobile |
| Fire-and-forget evaluate (Phase 5) | Client gọi `POST /evaluate` không await result trước khi chuyển thẻ | UX instant — người dùng không bị chờ network; consistent với quyết định kiến trúc đã ghi ở trên |
| CSS perspective + backfaceVisibility (Phase 5) | perspective trên div container, `style={{ transformStyle: "preserve-3d" }}` trên motion.div flip | Tránh conflict giữa Framer Motion transform và CSS 3D stacking context; perspective phải là parent trực tiếp của phần tử rotate |
| Stats: word status tính trong Python (Phase 6) | Fetch tất cả Words rồi classify trong Python, không dùng SQL CASE | Logic status đã có sẵn ở model; tránh duplicating business logic vào SQL; số từ per user không đủ lớn để cần optimize |
| Stats: streak tính từ StudySession (Phase 6) | Distinct dates từ `started_at` desc, đếm liên tiếp so với `date.today()` | Đơn giản, chính xác; timezone dùng UTC cho MVP |
| Stats: fill zeros cho activity (Phase 6) | Build dict từ DB rows rồi iterate over date range, điền 0 cho ngày thiếu | Recharts cần continuous data; không thể để gap trong array |
| Skeleton component dùng chung (Phase 7) | `components/ui/Skeleton.tsx` thay vì inline `animate-pulse` div | Tái sử dụng ở DecksPage / WordsPage / StatsPage; dễ thay đổi style skeleton sau này |
| MergeDeckModal: bottom sheet (Phase 7) | Sheet trượt từ dưới thay vì dialog giữa màn hình | Pattern chuẩn cho mobile — không che nội dung, UX tự nhiên hơn trên điện thoại |
| PWA: manifest không service worker (Phase 7) | Chỉ thêm `manifest.webmanifest` + meta tags; bỏ qua SW cho Phase 7 | Service worker cần Workbox + chiến lược cache phức tạp; manifest đủ để làm installable prompt trên Chrome; SW sẽ thêm Phase 8 |
| getMergeName truncation (Phase 7) | `full.slice(0, 47) + "..."` nếu `source-target` > 50 chars | Theo FRD business rule; dùng 47 thay 47+3="..." để tổng đúng 50 |
| Skeleton cho StatsPage (Phase 7) | `StatCardSkeleton` riêng biệt thay vì `"—"` placeholder | Shape skeleton sát với layout thật hơn; UX tốt hơn — người dùng thấy layout trước khi data load |
| bcrypt trực tiếp (Post-launch) | `bcrypt.hashpw/checkpw` thay vì `passlib.CryptContext` | `passlib 1.7.4` không support `bcrypt 5.x`; dùng bcrypt trực tiếp đơn giản hơn và không cần wrapper |
| Axios interceptor `!isRefreshCall` (Post-launch) | Guard kiểm tra URL trước khi retry refresh | Interceptor bắt 401 từ chính `/auth/refresh` → redirect `/auth` → reload vô tận; guard ngắt vòng lặp |
| `selectinload` cho variant_groups (Post-launch) | `selectinload(Word.variant_groups)` trong query gốc thay vì loop `db.refresh()` | N+1 queries với deck 600 từ = 600+ roundtrips; selectinload = 2 queries cố định |
| Lazy loading pages (QA session) | `React.lazy()` + `Suspense` cho tất cả pages trừ AuthPage; `manualChunks` function form trong Vite 8 | Bundle đơn 1 MB → 7 vendor chunks + page chunks; initial load giảm 87%; Vite 8/Rolldown dùng function chứ không phải object cho `manualChunks` |
| E2E selectors dùng accessibility API (QA session) | `getByLabel`, `getByRole`, `aria-label`, `htmlFor`/`id` thay vì `getByPlaceholder` hay CSS class | Selectors dựa trên accessibility bền hơn — không bị break khi đổi UI, đồng thời enforce chuẩn a11y trong app |
| `sharingDeckId` vs `sharingDeck` snapshot (QA session) | Track ID, derive live deck object từ TanStack Query data | Snapshot bị stale sau `toggleShare` → modal không cập nhật; tracking ID đảm bảo luôn nhận data mới nhất từ query cache |
