# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FriFlash (Friday Flash) is a Vietnamese-first flashcard app for learning Chinese vocabulary. This repository currently holds product documentation only; no application code exists yet.

**Stack (confirmed):** React 18 + Vite (PWA) · FastAPI (Python 3.12) · PostgreSQL 16 · pnpm monorepo

## Repository Contents

| File | Purpose |
|---|---|
| `FriFlash_BRD.docx` | Business Requirements Document — personas, KPIs, scope |
| `FriFlash_FRD.docx` | Functional Requirements Document — use cases, data model, error catalog |

## Architecture

**Monorepo layout (pnpm workspaces):**
```
apps/web/     React 18 + Vite + TypeScript + Tailwind + shadcn/ui (PWA)
apps/api/     FastAPI (Python 3.12) + SQLAlchemy 2.0 async + Alembic
```

**Frontend key libraries:** TanStack Query v5 (server state) · Zustand (session state) · Framer Motion + @use-gesture/react (card flip & swipe) · Recharts (statistics) · React Hook Form + Zod

**Backend key libraries:** httpx async (hanzii.net proxy) · openpyxl/xlrd (Excel import) · python-jose + passlib[bcrypt] (JWT auth)

**Auth:** JWT access token (15 min, Authorization header) + refresh token (7 days, HttpOnly cookie)

**Deploy:** Vercel (frontend) + Railway (backend + managed PostgreSQL)

## Design Tokens

- **Primary:** `#C0392B` (đỏ son) — CTAs, active states
- **Gold:** `#F39C12` — progress bar, achievements
- **Background:** `#FDFAF6` — warm ivory (not pure white)
- **Known:** `#27AE60` · **Unknown:** `#E74C3C`
- **Hanzi flashcard font (64px):** Noto Serif SC
- **Hanzi list font (22px):** Noto Sans SC
- **Vietnamese UI + Pinyin:** Be Vietnam Pro

## Domain Knowledge

**Core data hierarchy:** User → Deck → Word → VariantGroup

- A **Deck** groups vocabulary by topic (e.g., HSK 1, Business Chinese).
- A **Word** has a required `hanzi` field plus optional `note`. One word can have multiple **VariantGroup** records — each group represents one pronunciation/meaning combination (e.g., 行 has *xíng* = verb "to walk" and *háng* = noun "profession").
- Study progress is tracked per Word via `known_count` / `unknown_count` counters.
- Word learning state: **New** (never studied) → **Learning** (unknown ≥ known) → **Familiar** (known > unknown) → **Mastered** (known ≥ 5 AND known ≥ 5 total, with known > unknown).

**Auto-lookup:** When a user adds a word, the system calls `https://hanzii.net/?hl=vi` to auto-fill VariantGroups. All fields except `hanzi` are optional; missing ones can stay empty.

**Import rules:** `hanzi` is the key field. Rows without `hanzi` are skipped. Duplicates are allowed. Max 10 MB / 5,000 rows per import.

## Key Business Rules

- Deck names must be unique per user (max 50 chars); descriptions max 200 chars.
- A Word must always have at least 1 VariantGroup — the delete icon on a VariantGroup is hidden when only 1 remains.
- Study Mode settings (random order, display fields, auto-pronunciation) are persisted per user and restored on next session.
- In Study Mode, at least one field must be shown on the front side of a card.
- Merge creates a new deck named `"DeckA-DeckB"` (truncated to 50 chars with `...` if over limit); duplicates are kept.
- All user-facing text and error messages must be in Vietnamese (see error catalog in `FriFlash_FRD.docx`, Section IX).

## Error Message Reference

Full error code catalog is in `FriFlash_FRD.docx` Section IX. Prefixes:
- `ERR-D*` — Deck errors
- `ERR-W*` — Word errors
- `ERR-I*` — Import errors
- `ERR-S*` — Study/Statistics errors
- `ERR-NET` — Network errors
