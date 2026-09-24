# Frontend Setup

Tài liệu này mô tả trạng thái thiết lập hiện tại và cách chạy ứng dụng Frontend của Smart Recruitment App.

## 1. Đã thiết lập

Frontend hiện đã được thiết lập ở mức nền tảng để phát triển tiếp:

- React 19 + TypeScript 6.
- Vite 8 làm dev server và công cụ build.
- ESLint cho kiểm tra mã nguồn.
- Tailwind CSS 4 và `@tailwindcss/typography`.
- React Router với các route mẫu:
  - `/`
  - `/login`
  - `/candidate/cv-builder`
  - `/employer/applicants`
  - `*` cho trang không tồn tại.
- Layout dùng chung `BaseLayout` với thanh điều hướng và `Outlet`.
- Alias import `@` trỏ tới thư mục `src`, ví dụ:

  ```ts
  import Page from "@/components/Page.tsx";
  ```

- API client Axios tại `src/api/axios.ts`:
  - Dùng `VITE_API_BASE_URL` làm địa chỉ API.
  - Mặc định dùng `http://localhost:5000/api` nếu biến môi trường chưa được khai báo.
  - Tự động thêm Bearer token lấy từ `localStorage` với key `token`.
    (tạm thời)
  - Có xử lý lỗi API cơ bản cho các mã HTTP phổ biến.
- Cấu hình giao diện cơ bản trong `src/index.css`:
  - Tailwind CSS.
  - Font Montserrat.
  - Màu sắc ứng dụng và trạng thái dùng qua theme variables.
- Các thư viện nền tảng đã được thêm sẵn cho những tính năng tiếp theo:
  - TipTap cho trình soạn thảo.
  - `@hello-pangea/dnd` cho kéo thả.
  - Zustand cho state management.
  - `react-to-print` cho in ấn.
  - Lucide React cho icon.

### Mức độ hoàn thiện hiện tại

Routing, layout, cấu hình build, styling nền tảng và khung gọi API đã sẵn sàng. Các màn hình nghiệp vụ hiện vẫn là component placeholder để kiểm tra Router; logic đăng nhập, CV Builder, ATS, store nghiệp vụ và các API service cụ thể chưa được triển khai hoàn chỉnh.

## 2. Yêu cầu môi trường

- Node.js phiên bản LTS hiện hành.
- pnpm phiên bản hỗ trợ lockfile `pnpm-lock.yaml`.
- Backend API nếu cần kiểm thử các chức năng gọi dữ liệu.

Kiểm tra phiên bản:

```bash
node --version
pnpm --version
```

## 3. Cài đặt Frontend

Từ thư mục `Frontend`:

```bash
pnpm install
```

Nếu đang ở thư mục gốc repository:

```bash
cd Frontend
pnpm install
```

## 4. Cấu hình biến môi trường

Tạo file `.env` từ file mẫu `.env.example`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Mở `.env` và cấu hình:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_API_BASE_URL` phải bắt đầu bằng `VITE_` để Vite cung cấp biến này cho mã nguồn frontend. Nếu không tạo `.env` hoặc không đặt biến này, ứng dụng sẽ dùng mặc định:

```text
http://localhost:5000/api
```

Không commit `.env` vì file này có thể chứa cấu hình riêng của môi trường. Chỉ commit `.env.example` với các giá trị mẫu, không chứa secret thật.

## 5. Chạy ứng dụng

### Development

```bash
pnpm dev
```

Sau khi Vite khởi động, mở URL được hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

Vite hỗ trợ HMR nên thay đổi mã nguồn sẽ được cập nhật trong trình duyệt.

### Kiểm tra lint

```bash
pnpm lint
```

### Kiểm tra type và build production

```bash
pnpm build
```

Lệnh này chạy TypeScript project build trước, sau đó tạo bundle production bằng Vite trong thư mục `dist`.

### Xem bản build production

Sau khi chạy `pnpm build`:

```bash
pnpm preview
```

## 6. Cấu trúc chính

```text
Frontend/
├── .env.example          # Mẫu biến môi trường
├── package.json           # Scripts và dependencies
├── pnpm-lock.yaml        # Lock phiên bản dependencies
├── vite.config.ts        # Vite, React, Tailwind và alias @
├── tsconfig.app.json     # TypeScript cho mã nguồn src
├── src/
│   ├── api/              # Axios client, env và xử lý lỗi API
│   ├── components/       # Component dùng lại
│   ├── layouts/          # Layout dùng chung
│   ├── routes/           # Cấu hình React Router
│   ├── pages/             # Nơi phát triển các page nghiệp vụ
│   ├── services/          # Nơi phát triển các API service
│   ├── stores/            # Nơi phát triển Zustand stores
│   ├── types/             # Nơi định nghĩa TypeScript types
│   ├── utils/             # Hàm tiện ích dùng chung
│   ├── App.tsx            # RouterProvider
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind và theme ứng dụng
└── SETUP.md
```

Khi thêm import từ `src`, ưu tiên dùng alias `@` thay vì đường dẫn tương đối dài:

```ts
import axiosClient from "@/api/axios";
import BaseLayout from "@/layouts/BaseLayout";
```

## 7. Quy trình phát triển đề xuất

1. Cập nhật `.env` theo backend đang chạy.
2. Chạy `pnpm dev`.
3. Tạo page, component, service và type trong đúng thư mục tương ứng.
4. Dùng `axiosClient` cho request tới backend.
5. Chạy `pnpm lint` và `pnpm build` trước khi tạo pull request.

Nếu API không kết nối được, kiểm tra backend có đang chạy đúng địa chỉ trong `VITE_API_BASE_URL` hay không và kiểm tra log của trình duyệt/terminal.
