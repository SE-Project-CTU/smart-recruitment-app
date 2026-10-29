# Frontend Sub-agent Guide (Frontend/AGENTS.md)

File này hướng dẫn chi tiết cho **Sub-agent FE Developer** và **bất kỳ AI agent nào thao tác trong thư mục `Frontend/`**. Mọi agent khi code frontend PHẢI tuân thủ nghiêm ngặt các quy định dưới đây.

---

## 1. Vai trò & Phạm vi của Sub-agent Frontend

- **Vai trò:** Chuyên trách phát triển và bảo trì giao diện, component, page, hook, service và tích hợp API.
- **Phạm vi tác động:** Chỉ thao tác bên trong thư mục `Frontend/`.
- **Tuyệt đối không:** Tự ý can thiệp hoặc sửa code ngoài thư mục `Frontend/`. Nếu phát hiện lỗi Backend, hãy **ghi nhận và báo lại cho Leader/User**, không tự sửa Backend.

---

## 2. Tech Stack Frontend

### Dependencies chính

- **React 19** + **React DOM 19** + **TypeScript**
- **Vite 8** — build tool
- **react-router-dom** — routing
- **axios** — gọi API (cấu hình tập trung tại `Frontend/src/api/`)
- **@tanstack/react-query** — quản lý server state
- **@tanstack/react-table** — bảng dữ liệu
- **zustand** — client state management
- **Tailwind CSS v4** (`@tailwindcss/vite`) — styling
- **framer-motion / motion** — animation
- **lucide-react** — icon chính
- **morphicons** — icon tương tác (bật/tắt)
- **dayjs** — xử lý ngày
- **clsx / tailwind-merge / class-variance-authority** — utility class
- **@tiptap/\*\*** — rich text editor
- **@hello-pangea/dnd** — drag and drop
- **react-to-print** — in ấn
- **gsap** — animation nâng cao

### Thư viện component

| Thư mục                  | Nguồn      | Dùng khi                                                                      |
| ------------------------ | ---------- | ----------------------------------------------------------------------------- |
| `components/ui/`         | shadcn/ui  | Component chính, ưu tiên dùng                                                 |
| `components/animate-ui/` | animate-ui | Component cần hiệu ứng animation                                              |
| `components/lightswind/` | lightswind | Hiệu ứng đặc biệt trang trí                                                   |
| `components/external/`   | reactbits  | Component ngoài                                                               |
| `components/Button.tsx`  | Tự viết    | Button dùng chung, dùng thường xuyên                                          |
| `components/*.tsx`       | Tự viết    | Component dùng chung khác, một số đã gom nhóm theo chức năng (company/, job/) |

### Dev dependencies

- **ESLint** + **Prettier** + **prettier-plugin-tailwindcss**
- **@tailwindcss/typography**

### Quy tắc API & Validation

- Mọi request đều qua axios tại `Frontend/src/api/` — có xử lý lỗi tập trung và nạp env.
- Hiện chưa có thư viện validate mạnh; muốn thêm thư viện validate (zod, v.v.) → **BẮT BUỘC hỏi user trước**.

---

## 3. Cấu trúc thư mục `Frontend/src/`

```
Frontend/src/
├── api/           # Cấu hình axios, xử lý lỗi tập trung
├── assets/        # Hình ảnh, logo, trang trí
├── components/    # Component theo phân loại (ui, animate-ui, lightswind, external, Button.tsx)
├── constants/     # Hằng số và file quan trọng:
│   ├── paths.ts           # URL frontend (hạn chế hardcode URL)
│   ├── apiEndpoints.ts    # Endpoint backend (env có baseApi = api/v1 nên không lặp lại)
│   ├── apiErrorsMessage.ts # Mapping mã lỗi từ BE — kiểm tra đủ khi tích hợp API mới
│   └── mockData.ts        # Mock data demo UI
├── hooks/         # Custom hooks + hooks/queries/ (tanstack query kết hợp services/)
├── layouts/       # Layout dùng chung
├── lib/           # utils.ts (thư viện ngoài, không sửa), queryClient.ts (cấu hình tanstack query)
├── pages/         # Mỗi URL = 1 page
├── routes/        # router.ts + ProtectedRoute (allowRoles) + PublicRoute
├── services/      # Gọi API bằng axios đã cấu hình (dùng bởi hooks)
├── stores/        # Zustand store
├── types/         # Type/interface tập trung
├── utils/         # Helpers hiển thị dữ liệu, cookie
├── index.css      # Biến CSS global — ưu tiên dùng màu/biến có sẵn
└── lightswind.css # Thư viện ngoài, KHÔNG tự can thiệp
```

---

## 4. Quy tắc Code Frontend (Frontend Coding Rules)

### Trước khi code

- **Lập kế hoạch:** Xác định rõ input, output (goal). Nếu thiếu thông tin → hỏi Leader/User cho rõ ràng.
- **Đọc code hiện có:** Đọc các component/service tương tự trước khi viết mới.

### Styling

- **Chỉ dùng Tailwind v4 + biến CSS trong `index.css`**. Tuyệt đối không dùng inline style.
- Ưu tiên sử dụng màu và các biến cấu hình sẵn trong `index.css` (ví dụ: `text-text-main`).
- `lightswind.css` là file của thư viện ngoài, không tự ý can thiệp hoặc sửa đổi.
- không được spam shadow và border tùm lum
- ngoài các tiêu đề lớn (các thẻ "h") thì độ đậm nhất của chữ là semibold (font-semibold)

@theme {
--font-sans: "Montserrat", sans-serif;

/_ Primary _/
--color-primary: #1b3b6f;
--color-primary-dark: #122a52;
--color-primary-light: #3e5e8f;

/_ Secondary _/
--color-secondary: #a6e1fa;
--color-secondary-light: #d6f1fc;
--color-secondary-dark: #6fc3e8;

/_ ==== Neutral ==== _/

/_ primary background color _/
--color-bg: #f7fafc;
--color-bg-stone: #f9f9f9;
--color-bg-white-blue: #ecf5f9;

--color-surface: #ffffff;
--color-border: #e2e8f0;

/_ text _/
--color-text-main: #1a202c;
--color-text-muted: #64748b;

/_ Status _/
--color-status-success: #22c55e;
--color-status-warning: #f59e0b;
--color-status-error: #ef4444;
--color-status-info: #3b82f6;
--color-status-active: #a6e1fa;

/_ Sidebar _/
--color-sidebar: var(--color-bg);
--color-sidebar-foreground: var(--color-text-main);
--color-sidebar-accent: #eaf0f6;
--color-sidebar-accent-foreground: var(--color-text-main);
--color-sidebar-border: var(--color-border);
--color-sidebar-ring: var(--color-primary);
}

### Component & State

- Ưu tiên tái sử dụng component có sẵn. Cần thêm component mới từ shadcn hay animate-ui thì hỏi user trước khi cài.
- **Tách nhỏ component ở mức vừa phải:** Giảm phụ thuộc và giảm tải state phức tạp trong 1 file.
- `Button.tsx` ở `components/` là component button dùng chung mặc định, ưu tiên dùng, nhưng riêng `Button.tsx` nếu có ghi className thêm khi gọi thì phải dùng thêm ! (ví dụ font-light!), hạn chế tối đa dùng variant="outline"

### Label và tiêu đề

- Nếu đã ghi tiếng việt, không được mở ngoặc ghi tiếng anh (Ví dụ: Tiêu đề (Title))

### Icon & Hình ảnh

- **Icon mặc định:** Sử dụng `lucide-react`. Sử dụng màu đồng nhất, hạn chế mỗi icon, mỗi badge mỗi màu khác nhau
- **Icon có tính tương tác** (nhấn đổi hình như ẩn/hiện mật khẩu): Dùng `<MorphIcon icon={isX ? IconA : IconB} />` với `IconA`, `IconB` import từ `lucide` (KHÔNG phải `lucide-react`).
- **Logo:** Lấy từ thư mục `assets/`.
- **Hình ảnh (`img`):** Luôn luôn có fallback phòng trường hợp ảnh lỗi.

### Performance & React Conventions

- **Tuyệt đối không** gọi `setState` đồng bộ trong `useEffect`.
- **Responsive:** Bắt buộc responsive mượt mà trên tất cả thiết bị (Mobile, Tablet, Desktop).
- **Comment code:** Ngắn gọn bằng **tiếng Việt**, chỉ giải thích **"tại sao/mục đích"**, không giải thích lại đoạn code đang làm gì. Không comment vô nghĩa.
- **Tên biến, hàm, file:** Tiếng Anh (`PascalCase` cho Component, `useX` cho Hook).

---

## 5. Quy trình tích hợp API mới, sửa đổi liên quan đến API (Bắt buộc 5 bước)

Mỗi khi tích hợp API mới từ Backend, Sub-agent phải làm theo đúng thứ tự:

1. **Khảo sát Request & Response:** Kiểm tra payload gửi lên là gì, dữ liệu trả về là gì (hỏi hoặc tự kiểm tra tài liệu/swagger).
2. **Khảo sát enum từ Backend:** Cần kiểm tra lại enum từ backend nếu bước 1 chưa thấy đủ thông tin
3. **Kiểm tra Store:** Có cần lưu dữ liệu vào Zustand store không? Store hiện tại đã đủ hay cần tạo store riêng?
4. **Kiểm tra Error Mapping:** Kiểm tra trong `constants/apiErrorsMessage.ts` đã mapping đủ các mã lỗi có thể xảy ra của API này chưa? Nếu thiếu, bổ sung ngay.
5. **Viết theo luồng chuẩn:**
   - Viết `services/` (dùng instance axios đã cấu hình).
   - Viết `hooks/queries/` (sử dụng `@tanstack/react-query`).
   - Tích hợp hook vào Component/Page trên UI.

---

## 6. Lệnh thường dùng trong Frontend

Chạy trong thư mục `Frontend/`:

| Lệnh            | Dùng để                                |
| --------------- | -------------------------------------- |
| `pnpm install`  | Cài đặt các thư viện                   |
| `pnpm add ....` | Cài thư viện cụ thể (phải hỏi trước)   |
| `pnpm dev`      | Chạy dev server                        |
| `pnpm build`    | Build production + kiểm tra TypeScript |
| `pnpm lint`     | Kiểm tra lỗi format & code style       |

---

## 7. Ranh giới an toàn cho Frontend

- **Không tự ý cài thêm thư viện npm mới:** Phải hỏi trước khi `pnpm add`.
- **Không tự ý thêm thư viện validation mới:** Phải xin ý kiến trước.
- **Không bao giờ sửa code bên ngoài `Frontend/`:** Mọi lỗi backend chỉ ghi nhận và báo cáo.
- **Không commit file `.env` hoặc để lộ token/khóa bí mật.**
