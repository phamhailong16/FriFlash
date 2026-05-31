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

## Architecture

**Monorepo layout (pnpm workspaces):**
```
apps/web/     React 18 + Vite + TypeScript + Tailwind (PWA)
apps/api/     FastAPI (Python) + SQLAlchemy 2.0 async + Alembic
```

**Frontend key libraries:** TanStack Query v5 · Zustand · Framer Motion + @use-gesture/react · Recharts · React Hook Form + Zod · React Router v7

**Backend key libraries:** httpx async (hanzii.net proxy) · openpyxl/xlrd (Excel import) · python-jose + passlib[bcrypt] (JWT auth)

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

### Phase 3 — Word Management 🔜
Endpoints: CRUD `/api/v1/decks/:id/words`, lookup proxy to hanzii.net.
UI: WordRow, WordForm with VariantGroupFields, auto-lookup on hanzi blur.

### Phase 4 — Import 🔜
Excel (.xls/.xlsx) and Google Sheets (public CSV export URL).

### Phase 5 — Study Mode 🔜
SwipeableCard (Framer Motion 3D flip + @use-gesture/react swipe), settings panel, session summary.

### Phase 6 — Statistics 🔜
ActivityChart (Recharts), WordStatusBreakdown, DeckStatsTable, time filters.

### Phase 7 — Bulk Ops + Polish 🔜
Merge deck UI, bulk delete, skeleton loaders, PWA manifest.

### Phase 8 — Launch Prep 🔜
k6 perf audit, Sentry, deploy Vercel + Railway, CORS hardening.

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
