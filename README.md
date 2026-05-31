# FriFlash

Ứng dụng flashcard học tiếng Trung dành cho người Việt — Vietnamese-first Chinese vocabulary flashcard app.

> **Trạng thái:** Tất cả phases hoàn thành — app sẵn sàng deploy. Bao gồm SM-2 spaced repetition, TTS phát âm, chia sẻ bộ thẻ công khai, PWA service worker, E2E Playwright tests.

## Tính năng (MVP)

- **Quản lý bộ thẻ** — Tạo, sửa, xoá, gộp bộ thẻ (merge), bulk delete, tìm kiếm, phân trang
- **Từ vựng thông minh** — Tự động tra hanzii.net khi thêm chữ Hán, hỗ trợ nhiều âm đọc / nghĩa (VariantGroup)
- **Import hàng loạt** — Nhập từ file Excel (.xlsx/.xls) hoặc Google Sheets (public link)
- **Chế độ học** — Lật thẻ 3D, vuốt phải/trái để đánh dấu Đã Biết / Chưa Biết, SM-2 spaced repetition, lọc "chỉ ôn tập hôm nay"
- **TTS Phát âm** — Tự động đọc chữ Hán khi lật thẻ (Web Speech API, zh-CN), nút phát âm manual
- **Chia sẻ bộ thẻ** — Tạo link công khai để người khác xem mà không cần đăng nhập
- **Thống kê** — Biểu đồ hoạt động (7/30/90 ngày), phân bố trạng thái từ, bảng tiến độ per-deck, chuỗi ngày học liên tiếp
- **PWA** — Service worker (offline app shell), cài đặt như app native (Add to Home Screen)
- **Tiếng Việt hoàn toàn** — Giao diện và thông báo lỗi 100% tiếng Việt

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS (PWA) |
| State | TanStack Query v5 (server) + Zustand (UI) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion (3D flip, drag gesture, spring animation) |
| Backend | FastAPI (Python 3.12+) + SQLAlchemy 2.0 async |
| Database | PostgreSQL + Alembic migrations |
| Auth | JWT access token (15 min, in-memory) + HttpOnly refresh cookie (7 ngày) |
| Import | openpyxl (xlsx) + xlrd (xls) + httpx CSV export |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

## Cài đặt & Chạy Local

### Yêu cầu
- Node.js ≥ 20, pnpm ≥ 9
- Python ≥ 3.12
- PostgreSQL (local hoặc cloud — Supabase / Neon free tier đều được)

### Frontend

```bash
pnpm install
pnpm dev:web
# → http://localhost:5173
```

### Backend

```bash
cd apps/api

# Tạo virtual environment (lần đầu)
python -m venv .venv

# Cài dependencies
# Windows
.venv\Scripts\pip install -e .
# Mac/Linux
.venv/bin/pip install -e .

# Cấu hình .env
cp .env.example .env
# Sửa DATABASE_URL thành connection string PostgreSQL của bạn

# Chạy migration (cần PostgreSQL đang chạy)
.venv/Scripts/python.exe -m alembic upgrade head   # Windows
# .venv/bin/alembic upgrade head                    # Mac/Linux

# Tạo tài khoản test (local dev)
.venv/Scripts/python.exe seed.py
# → test@friflash.dev / test1234

# Khởi động server
.venv/Scripts/python.exe -m uvicorn app.main:app --reload  # Windows
# .venv/bin/uvicorn app.main:app --reload                   # Mac/Linux
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI tự động)
```

## Cấu trúc dự án

```
friflash/
├── apps/
│   ├── web/                          # React PWA
│   │   └── src/
│   │       ├── components/
│   │       │   ├── layout/           # AppShell, BottomNav, PageHeader
│   │       │   ├── ui/               # Skeleton ✅
│   │       │   ├── decks/            # DeckCard ✅, DeckForm ✅, MergeDeckModal ✅
│   │       │   ├── words/            # WordRow ✅, WordForm ✅, ImportModal ✅
│   │       │   ├── study/            # SwipeableCard ✅, SettingsPanel ✅, SessionSummary ✅
│   │       │   └── stats/            # ActivityChart ✅, WordStatusBreakdown ✅, DeckStatsTable ✅
│   │       ├── hooks/                # useDecks ✅, useWords ✅, useImport ✅, useStudy ✅, useStats ✅
│   │       ├── lib/                  # api.ts, decks.ts ✅, words.ts ✅, import.ts ✅, study.ts ✅, stats.ts ✅, messages.ts
│   │       ├── pages/                # AuthPage ✅, DecksPage ✅, WordsPage ✅, StudyPage ✅, StatsPage ✅
│   │       ├── store/                # authStore, settingsStore, studySessionStore ✅
│   │       └── types/api.ts          # TypeScript interfaces
│   └── api/                          # FastAPI backend
│       ├── migrations/versions/      # 001_initial_schema ✅, 002_sm2_and_sharing ✅
│       └── app/
│           ├── api/v1/               # auth ✅, decks ✅, words ✅, imports ✅, study ✅, stats ✅, share ✅
│           ├── core/                 # config, security (JWT), deps (auth middleware)
│           ├── db/models/            # User, Deck, Word, VariantGroup, StudySession
│           ├── schemas/              # auth ✅, deck ✅, word ✅, import_ ✅, study ✅, stats ✅
│           └── services/             # deck ✅, word ✅, import_ ✅, study ✅, stats ✅
├── FriFlash_BRD.docx                 # Business Requirements
├── FriFlash_FRD.docx                 # Functional Requirements
└── CLAUDE.md                         # Hướng dẫn cho Claude Code
```

## Trạng thái Phases

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 1 | Foundation — monorepo, auth API + UI, DB models | ✅ Hoàn thành |
| 2 | Deck Management — CRUD, search, pagination, merge, bulk delete | ✅ Hoàn thành |
| 3 | Word Management — CRUD, auto-lookup hanzii.net, multi-variant | ✅ Hoàn thành |
| 4 | Import — Excel (.xlsx/.xls) + Google Sheets public link | ✅ Hoàn thành |
| 5 | Study Mode — card flip 3D, swipe gestures, session summary | ✅ Hoàn thành |
| 6 | Statistics — activity chart, word status breakdown, deck stats | ✅ Hoàn thành |
| 7 | Polish — Merge deck UI, skeleton loaders, PWA manifest | ✅ Hoàn thành |
| 8 | Launch Prep — Sentry, CORS hardening, deploy configs, k6 load tests | ✅ Hoàn thành |
| Post | SM-2, TTS, Deck Sharing, PWA Service Worker, E2E Playwright | ✅ Hoàn thành |

## Import Format

Khi nhập từ Excel hoặc Google Sheets, file cần có các cột (tên cột không phân biệt hoa/thường):

| Cột | Bắt buộc | Mô tả |
|---|---|---|
| `hanzi` | ✅ | Chữ Hán — dòng không có cột này sẽ bị bỏ qua |
| `pinyin` | | Phiên âm (VD: nǐ hǎo) |
| `han_viet` | | Âm Hán Việt |
| `part_of_speech` | | Từ loại (động từ, danh từ...) |
| `meaning` | | Nghĩa tiếng Việt |
| `note` | | Ghi chú thêm |

Giới hạn: **10 MB** · **5.000 dòng**. Duplicate được cho phép.

## Môi trường biến

**Backend** — tạo `apps/api/.env` từ `.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/friflash
SECRET_KEY=<openssl rand -hex 32>
CORS_ORIGINS=["http://localhost:5173"]
SENTRY_DSN=                          # để trống khi dev
```

**Frontend** — tạo `apps/web/.env.local` (dev không cần, chỉ cần khi build cho prod):

```env
VITE_API_URL=https://your-railway-app.up.railway.app
VITE_SENTRY_DSN=                     # để trống khi dev
```

> Khi dev, frontend dùng Vite proxy (`/api` → `localhost:8000`) nên không cần `VITE_API_URL`.

## Statistics API

| Endpoint | Mô tả |
|---|---|
| `GET /api/v1/stats/overview` | Tổng quan: số deck, từ, từ đã thuộc, tổng phiên, chuỗi ngày học |
| `GET /api/v1/stats/activity?days=30` | Hoạt động theo ngày (7 / 30 / 90 ngày) |
| `GET /api/v1/stats/breakdown` | Phân bố trạng thái từ (global + per deck) |

## API Docs

Sau khi chạy backend, truy cập `http://localhost:8000/docs` để xem Swagger UI với toàn bộ endpoints.
