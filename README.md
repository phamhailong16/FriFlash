# FriFlash

Ứng dụng flashcard học tiếng Trung dành cho người Việt — Vietnamese-first Chinese vocabulary flashcard app.

> **Trạng thái:** Phase 2 hoàn thành — Deck Management (CRUD, search, pagination, merge, bulk delete). Đang phát triển tích cực.

## Tính năng (MVP)

- **Quản lý bộ thẻ** — Tạo, sửa, xoá, gộp bộ thẻ, import từ Excel / Google Sheets
- **Từ vựng thông minh** — Tự động tra hanzii.net khi thêm chữ Hán, hỗ trợ nhiều âm đọc (VariantGroup)
- **Chế độ học** — Lật thẻ 3D, vuốt phải/trái để đánh dấu Đã Nhớ / Chưa Nhớ
- **Thống kê** — Biểu đồ hoạt động, tỉ lệ nhớ, phân loại từ theo mức độ (Mới / Đang học / Quen / Thuộc)
- **Tiếng Việt hoàn toàn** — Giao diện và thông báo lỗi 100% tiếng Việt

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | TanStack Query v5 + Zustand |
| Animation | Framer Motion + @use-gesture/react |
| Backend | FastAPI (Python 3.12+) + SQLAlchemy 2.0 async |
| Database | PostgreSQL + Alembic migrations |
| Auth | JWT (15 min) + HttpOnly refresh cookie (7 ngày) |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

## Cài đặt & Chạy Local

### Yêu cầu
- Node.js ≥ 20, pnpm ≥ 9
- Python ≥ 3.12
- PostgreSQL (local hoặc cloud — Supabase / Neon free tier)

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

# Windows
.venv\Scripts\pip install fastapi uvicorn sqlalchemy alembic asyncpg pydantic pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" httpx openpyxl xlrd python-multipart

# Mac/Linux
.venv/bin/pip install fastapi uvicorn sqlalchemy alembic asyncpg pydantic pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" httpx openpyxl xlrd python-multipart

# Cấu hình .env
cp .env.example .env
# Sửa DATABASE_URL thành connection string của bạn

# Chạy migration
.venv/Scripts/python.exe -m alembic upgrade head  # Windows
# .venv/bin/alembic upgrade head                   # Mac/Linux

# Khởi động server
.venv/Scripts/python.exe -m uvicorn app.main:app --reload  # Windows
# .venv/bin/uvicorn app.main:app --reload                   # Mac/Linux
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

## Cấu trúc dự án

```
friflash/
├── apps/
│   ├── web/                          # React PWA
│   │   └── src/
│   │       ├── components/
│   │       │   ├── layout/           # AppShell, BottomNav, PageHeader
│   │       │   ├── decks/            # DeckCard, DeckForm ✅
│   │       │   └── study/            # SwipeableCard, Flashcard (Phase 5)
│   │       ├── hooks/                # useDecks ✅ (TanStack Query hooks)
│   │       ├── lib/                  # api.ts, decks.ts ✅, messages.ts, queryClient
│   │       ├── pages/                # AuthPage, DecksPage ✅, StudyPage, StatsPage
│   │       ├── store/                # authStore, settingsStore
│   │       └── types/api.ts          # TypeScript interfaces
│   └── api/                          # FastAPI backend
│       ├── migrations/versions/      # 001_initial_schema.py ✅
│       └── app/
│           ├── api/v1/               # auth ✅, decks ✅, words, study, stats, import
│           ├── core/                 # config, security (JWT), deps (auth middleware)
│           ├── db/models/            # User, Deck, Word, VariantGroup, StudySession
│           ├── schemas/              # auth ✅, deck ✅ (Pydantic request/response)
│           └── services/             # deck ✅, hanzii.py, import_service.py, stats_service.py
├── FriFlash_BRD.docx                 # Business Requirements
├── FriFlash_FRD.docx                 # Functional Requirements
└── CLAUDE.md                         # Hướng dẫn cho Claude Code
```

## Trạng thái Phases

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 1 | Foundation — monorepo, auth, DB models | ✅ Hoàn thành |
| 2 | Deck Management — CRUD, search, pagination, merge | ✅ Hoàn thành |
| 3 | Word Management — CRUD, auto-lookup hanzii.net | 🔜 Tiếp theo |
| 4 | Import — Excel / Google Sheets | 🔜 |
| 5 | Study Mode — card flip, swipe gestures | 🔜 |
| 6 | Statistics — charts, word status breakdown | 🔜 |
| 7 | Bulk ops + PWA polish | 🔜 |
| 8 | Performance audit + Production deploy | 🔜 |

## Môi trường biến

Tạo file `apps/api/.env` từ `.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/friflash
SECRET_KEY=<openssl rand -hex 32>
CORS_ORIGINS=["http://localhost:5173"]
```

## API Docs

Sau khi chạy backend, truy cập `http://localhost:8000/docs` để xem Swagger UI đầy đủ.
