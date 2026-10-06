# SmartHire — Hướng dẫn cài đặt & chạy dự án

Dự án **SmartHire** gồm 3 thành phần chạy hoàn toàn qua Docker:

| Thành phần      | Công nghệ                          | URL                              |
| --------------- | ---------------------------------- | -------------------------------- |
| **Database**    | PostgreSQL 16 + pgvector           | _(nội bộ, không expose ra host)_ |
| **Backend API** | ASP.NET Core 10                    | http://localhost:5190            |
| **Frontend**    | React 19 + Vite 8 + Tailwind CSS 4 | http://localhost:5173            |

---

## Mục lục

- [Yêu cầu](#1-yêu-cầu)
- [Cài đặt lần đầu](#2-cài-đặt-lần-đầu)
- [Chạy & dừng stack](#3-chạy--dừng-stack)
- [Các URL quan trọng](#4-các-url-quan-trọng)
- [Quản lý migrations](#5-quản-lý-migrations-khi-đổi-model)
- [Cấu trúc dự án](#6-cấu-trúc-dự-án)
- [Quy ước nhóm](#7-quy-ước-nhóm)

---

## 1. Yêu cầu

| Công cụ        | Kiểm tra         |
| -------------- | ---------------- |
| Git            | `git --version`  |
| Docker Desktop | `docker version` |

> Không cần cài .NET SDK hay Node.js — tất cả build trong container.

---

## 2. Cài đặt lần đầu

### Bước 1 — Clone repo

```bash
git clone <repo-url>
cd smart-recruitment-app
```

### Bước 2 — Tạo file `.env`

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows CMD
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Mở `.env` và đổi `POSTGRES_PASSWORD` thành mật khẩu riêng:

```dotenv
POSTGRES_DB=smarthire_dev
POSTGRES_USER=smarthire_app
POSTGRES_PASSWORD=<mat-khau-rieng-cua-ban>   # ← thay giá trị này
VITE_API_BASE_URL=http://localhost:5190
```

> **Không commit `.env`** — file này đã được `.gitignore` bỏ qua.

---

## 3. Chạy & dừng stack

### Khởi động (lần đầu hoặc sau khi đổi code)

```bash
docker compose up --build
```

### Khởi động nhanh (không đổi code)

```bash
docker compose up
```

### Chạy nền

```bash
docker compose up -d
```

### Kiểm tra trạng thái

```bash
docker compose ps
docker compose logs api --tail=50
docker compose logs frontend --tail=30
```

### Dừng, giữ data

```bash
docker compose down
```

### Dừng và xóa toàn bộ data (reset database)

```bash
docker compose down -v
```

---

## 4. Các URL quan trọng

| URL                                   | Mô tả                                |
| ------------------------------------- | ------------------------------------ |
| http://localhost:5173                 | Frontend (React)                     |
| http://localhost:5190/swagger         | Swagger UI — thử API trực tiếp       |
| http://localhost:5190/openapi/v1.json | OpenAPI spec (JSON)                  |
| http://localhost:5190/hangfire        | Hangfire Dashboard — background jobs |

> Migrations EF Core được áp dụng **tự động** mỗi khi container API khởi động.

---

## 5. Quản lý migrations (khi đổi model)

Migrations chạy **từ máy host** bằng .NET SDK (yêu cầu cài .NET SDK 10 và `dotnet-ef`).

### Khôi phục dotnet-ef tool

```powershell
cd Backend
dotnet tool restore --tool-manifest ./dotnet-tools.json
dotnet ef --version   # → Entity Framework Core .NET Command-line Tools 10.0.x
```

### Cấu hình User Secrets (kết nối tới DB đang chạy trong Docker)

```powershell
# Từ thư mục Backend/
dotnet user-secrets set "ConnectionStrings:DefaultConnection" `
  "Host=localhost;Port=5432;Database=smarthire_dev;Username=smarthire_app;Password=<mat-khau>" `
  --project src/SmartHire.API/SmartHire.Api.csproj

dotnet user-secrets set "ConnectionStrings:HangfireConnection" `
  "Host=localhost;Port=5432;Database=smarthire_dev;Username=smarthire_app;Password=<mat-khau>" `
  --project src/SmartHire.API/SmartHire.Api.csproj
```

> Cần expose port DB ra host: bỏ comment `ports` của service `db` trong `compose.yaml`.

### Tạo migration mới

```powershell
# Từ thư mục Backend/
dotnet ef migrations add <TenMigration> `
  --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj `
  --startup-project src/SmartHire.API/SmartHire.Api.csproj `
  --output-dir Persistence/Migrations
```

### Kiểm tra danh sách migrations (cd vaò Backend, nhớ docker compose up thành công rồi chạy lệnh này)

```powershell
dotnet ef migrations list `
  --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj `
  --startup-project src/SmartHire.API/SmartHire.Api.csproj
```

> Sau khi tạo migration, commit cả file migration và `SmartHireDbContextModelSnapshot.cs`.  
> Thành viên còn lại chỉ cần `docker compose up --build` — migration tự áp dụng.

---

## 6. Cấu trúc dự án

```text
smart-recruitment-app/
├── .env.example                  # Mẫu biến môi trường — copy thành .env
├── compose.yaml                  # Điều phối DB + API + Frontend
│
├── Backend/
│   ├── .dockerignore             # Loại trừ obj/, bin/ khỏi Docker build context
│   ├── SmartHire.slnx            # Solution file
│   ├── dotnet-tools.json         # Ghim phiên bản dotnet-ef
│   └── src/
│       ├── SmartHire.API/        # Entry point: controllers, Program.cs, Dockerfile
│       ├── SmartHire.Application/ # Use cases, interfaces
│       ├── SmartHire.Domain/     # Entities, value objects
│       └── SmartHire.Infrastructure/ # EF Core, Persistence, Migrations
│
└── Frontend/
    ├── .dockerignore
    ├── Dockerfile                # Multi-stage: pnpm build → Nginx
    └── src/
        ├── api/                  # Axios client (VITE_API_BASE_URL + Bearer token)
        ├── components/           # Component dùng lại
        ├── layouts/              # BaseLayout + Outlet
        ├── routes/               # React Router config
        ├── pages/                # Màn hình nghiệp vụ
        ├── services/             # API service calls
        ├── stores/               # Zustand stores
        ├── types/                # TypeScript types
        └── utils/                # Hàm tiện ích
```

### Stack Backend

| Package                       | Mục đích                     |
| ----------------------------- | ---------------------------- |
| EF Core 10 + Npgsql           | ORM + PostgreSQL driver      |
| Pgvector.EntityFrameworkCore  | Vector embedding (AI search) |
| Hangfire + PostgreSQL storage | Background jobs              |
| NLog.Web.AspNetCore           | Structured logging           |
| NSwag / OpenAPI               | API documentation            |

### Stack Frontend

| Package                 | Mục đích                      |
| ----------------------- | ----------------------------- |
| React 19 + TypeScript 6 | UI framework                  |
| Vite 8                  | Dev server + bundler          |
| Tailwind CSS 4          | Utility-first CSS             |
| React Router            | Client-side routing           |
| Axios                   | HTTP client                   |
| Zustand                 | State management              |
| TipTap                  | Rich text editor (CV builder) |
| @hello-pangea/dnd       | Drag & drop                   |
| Lucide React            | Icons                         |

---

## 7. Quy ước nhóm

### Commit

- ✅ Commit: source code, migrations, `compose.yaml`, `dotnet-tools.json`, `.env.example`
- ❌ Không commit: `.env`, User Secrets, log, build output, secrets thật

### Schema Database

- Người thay đổi model Entity → tạo migration → commit cả migration file + snapshot
- Thành viên còn lại: `docker compose up --build` là đủ — migration áp dụng tự động

### Logging

- Dùng `ILogger<T>` qua DI, không dùng `Console.Write`
- Dùng structured logging: `logger.LogInformation("Queued {ResumeId}", id)`
- **Không** log password, connection string, token, dữ liệu cá nhân nhạy cảm

### Background Jobs (Hangfire)

- Job nhận argument nhỏ (ID), không nhận entity lớn hay `HttpContext`
- Thiết kế idempotent vì Hangfire có thể retry
- Queue job sau khi data đã được lưu DB thành công

### Frontend

- Dùng alias `@` thay đường dẫn tương đối dài: `import x from "@/components/X"`
- Gọi API qua `axiosClient` trong `src/api/axios.ts`
- Chạy `pnpm lint` và `pnpm build` trước khi tạo pull request
