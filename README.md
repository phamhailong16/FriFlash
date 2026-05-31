# FriFlash

Ứng dụng flashcard học tiếng Trung dành cho người Việt — Vietnamese-first Chinese vocabulary flashcard app.

> **Trạng thái:** Phase 4 hoàn thành — Word Management + Import (Excel / Google Sheets). Đang phát triển tích cực.

## Tính năng (MVP)

- **Quản lý bộ thẻ** — Tạo, sửa, xoá, gộp bộ thẻ, bulk delete, tìm kiếm, phân trang
- **Từ vựng thông minh** — Tự động tra hanzii.net khi thêm chữ Hán, hỗ trợ nhiều âm đọc / nghĩa (VariantGroup)
- **Import hàng loạt** — Nhập từ file Excel (.xlsx/.xls) hoặc Google Sheets (public link)
- **Chế độ học** — Lật thẻ 3D, vuốt phải/trái để đánh dấu Đã Nhớ / Chưa Nhớ *(Phase 5)*
- **Thống kê** — Biểu đồ hoạt động, tỉ lệ nhớ, phân loại từ theo mức độ *(Phase 6)*
- **Tiếng Việt hoàn toàn** — Giao diện và thông báo lỗi 100% tiếng Việt

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS (PWA) |
| State | TanStack Query v5 (server) + Zustand (UI) |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion + @use-gesture/react |
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
│   │       │   ├── decks/            # DeckCard ✅, DeckForm ✅
│   │       │   └── words/            # WordRow ✅, WordForm ✅, ImportModal ✅
│   │       ├── hooks/                # useDecks ✅, useWords ✅, useImport ✅
│   │       ├── lib/                  # api.ts, decks.ts ✅, words.ts ✅, import.ts ✅, messages.ts
│   │       ├── pages/                # AuthPage ✅, DecksPage ✅, WordsPage ✅, StatsPage (placeholder)
│   │       ├── store/                # authStore, settingsStore
│   │       └── types/api.ts          # TypeScript interfaces
│   └── api/                          # FastAPI backend
│       ├── migrations/versions/      # 001_initial_schema.py ✅
│       └── app/
│           ├── api/v1/               # auth ✅, decks ✅, words ✅, imports ✅
│           ├── core/                 # config, security (JWT), deps (auth middleware)
│           ├── db/models/            # User, Deck, Word, VariantGroup, StudySession
│           ├── schemas/              # auth ✅, deck ✅, word ✅, import_ ✅
│           └── services/             # deck ✅, word ✅, import_ ✅
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
| 5 | Study Mode — card flip 3D, swipe gestures, session summary | 🔜 Tiếp theo |
| 6 | Statistics — activity chart, word status breakdown, deck stats | 🔜 |
| 7 | Bulk ops + PWA manifest + skeleton loaders + Dialog polish | 🔜 |
| 8 | Performance audit (k6) + Sentry + Production deploy | 🔜 |

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

Tạo file `apps/api/.env` từ `.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/friflash
SECRET_KEY=<openssl rand -hex 32>
CORS_ORIGINS=["http://localhost:5173"]
```

## API Docs

Sau khi chạy backend, truy cập `http://localhost:8000/docs` để xem Swagger UI với toàn bộ endpoints.
