# Frontend Sub-agent Guide (Frontend/AGENTS.md)

File này hướng dẫn chi tiết cho **Sub-agent FE Developer** và **bất kỳ AI agent nào thao tác trong thư mục `Frontend/`**. Mọi agent khi code frontend PHẢI tuân thủ nghiêm ngặt các quy định dưới đây.

---

## 1. Vai trò & Phạm vi của Sub-agent Frontend

- **Vai trò:** Chuyên trách phát triển và bảo trì giao diện, component, page, hook, service và tích hợp API.
- **Phạm vi tác động:** Chỉ thao tác bên trong thư mục `Frontend/`.
- **Tuyệt đối không:** Tự ý can thiệp hoặc sửa code ngoài thư mục `Frontend/`. Nếu phát hiện lỗi Backend, hãy **ghi nhận và báo lại cho Leader/User**, không tự sửa Backend (trừ khi có yêu cầu full-stack rõ ràng từ người dùng).

---

## 2. Tech Stack Frontend

### Dependencies chính

- **React 19** + **React DOM 19** + **TypeScript** (~6.0)
- **Vite 8** — build tool
- **react-router-dom** — routing
- **axios** — gọi API (cấu hình tập trung tại `Frontend/src/api/`)
- **@tanstack/react-query** — quản lý server state và caching
- **@tanstack/react-table** — bảng dữ liệu
- **zustand** — client state management
- **Tailwind CSS v4** (`@tailwindcss/vite`) — styling
- **framer-motion / motion** — animation
- **lucide-react** — icon chính
- **morphicons** + **lucide** — icon tương tác (bật/tắt)
- **dayjs** — xử lý ngày giờ (kèm plugin `relativeTime` và locale `vi`)
- **clsx / tailwind-merge / class-variance-authority** — utility class (`cn`)
- **@base-ui-components/react** / **@base-ui/react** — headless UI primitives
- **@tiptap/\*\*** — rich text editor cho mô tả/yêu cầu công việc
- **@hello-pangea/dnd** — kéo thả (kanban / application pipeline)
- **react-to-print** — in ấn và xuất CV
- **gsap** — animation nâng cao

### Thư viện component

| Thư mục                  | Nguồn      | Dùng khi                                                                      |
| ------------------------ | ---------- | ----------------------------------------------------------------------------- |
| `components/ui/`         | shadcn/ui  | Component giao diện cơ bản (Dialog, Dropdown, Input, Badge...), ưu tiên dùng  |
| `components/common/`     | Tự viết    | Các modal và component dùng chung toàn app (`ApplyJobModal`, `QuickView`...)  |
| `components/job/`        | Tự viết    | Component đặc thù việc làm (`JobCard`, `JobFilterSidebar`, `JobDetailDrawer`) |
| `components/company/`    | Tự viết    | Component doanh nghiệp (`CompanyCard`, `CompanyHeader`...)                    |
| `components/catalog/`    | Tự viết    | Bộ chọn danh mục (`LocationCombobox`, `SkillSelector`, `IndustrySelector`...) |
| `components/animate-ui/` | animate-ui | Component cần hiệu ứng animation chuyển động đặc biệt                         |
| `components/lightswind/` | lightswind | Hiệu ứng đặc biệt trang trí                                                   |
| `components/external/`   | reactbits  | Component bên ngoài                                                           |
| `components/Button.tsx`  | Tự viết    | Button dùng chung chuẩn toàn app, ưu tiên dùng cao nhất                       |

### Dev dependencies

- **ESLint** + **Prettier** + **prettier-plugin-tailwindcss**
- **@tailwindcss/typography**

### Quy tắc API & Validation

- Mọi request đều qua axios tại `Frontend/src/api/` — có xử lý lỗi tập trung, nạp token và gắn base url `api/v1`.
- Hiện chưa có thư viện validate schema riêng (Zod/Yup); muốn thêm thư viện validate → **BẮT BUỘC hỏi user trước**.

---

## 3. Cấu trúc thư mục `Frontend/src/`

```
Frontend/src/
├── api/           # Cấu hình axios client, interceptors, xử lý lỗi tập trung
├── assets/        # Hình ảnh, logo tĩnh, minh họa
├── components/    # Component phân chia theo chức năng và nguồn gốc:
│   ├── ui/        # Component UI nguyên tử (shadcn/base-ui: input, dialog, popover, badge...)
│   ├── common/    # Component dùng chung giữa các role (ApplyJobModal, Loading...)
│   ├── job/       # Component hiển thị & lọc việc làm (JobCard, JobFilterSidebar, JobDetailDrawer...)
│   ├── company/   # Component liên quan đến công ty (CompanyCard, CompanyHeader...)
│   ├── catalog/   # Các combobox chọn địa điểm, kỹ năng, ngành nghề
│   ├── animate-ui/# Component hiệu ứng motion
│   ├── lightswind/# Component trang trí hiệu ứng ánh sáng
│   ├── external/  # Component bên thứ ba (reactbits)
│   └── Button.tsx # Nút bấm chuẩn của toàn hệ thống
├── constants/     # Hằng số toàn cục:
│   ├── paths.ts            # Định nghĩa toàn bộ URL frontend (tuyệt đối không hardcode link)
│   ├── apiEndpoints.ts     # Đường dẫn endpoint backend (đã có tiền tố /api/v1 từ base)
│   ├── apiErrorsMessage.ts # Bảng tra cứu mã lỗi trả về từ BE sang thông điệp tiếng Việt
│   ├── mockData.ts         # Mock data phục vụ preview/fallback
│   └── SidebarData.ts      # Cấu hình menu sidebar theo từng role
├── hooks/         # Custom hooks React + hooks/queries/ (TanStack React Query bọc service)
├── layouts/       # Layout khung trang (CandidateLayout, RecruiterLayout, AdminLayout, MainLayout)
├── lib/           # queryClient.ts (cấu hình TanStack Query), utils.ts (hàm cn)
├── pages/         # Các trang hoàn chỉnh tương ứng với từng route
├── routes/        # router.tsx + ProtectedRoute (kiểm tra allowRoles) + PublicRoute
├── services/      # Các hàm gọi API thông qua axios instance (trả về Promise)
├── stores/        # Zustand stores quản lý client state (authStore, applyJobModalStore, breadcrumbStore...)
├── types/         # Khai báo TypeScript types tập trung (job.ts, company.ts, application.ts, cv.ts...)
├── utils/         # Helper functions dùng chung:
│   ├── helper.ts     # getLoremAvt, getTimeAgo, getDashboardPathByRole, getProfilePathByRole...
│   └── jobHelpers.ts # extractJobDisplayData, formatSalaryCompact, normalizeJobLevel, JOB_LEVEL_OPTIONS...
├── index.css      # Biến CSS global (@theme Tailwind v4) — ưu tiên dùng màu/biến có sẵn
└── lightswind.css # Thư viện ngoài, KHÔNG tự can thiệp
```

---

## 4. Quy tắc Code Frontend (Frontend Coding Rules)

### Trước khi code

- **Lập kế hoạch:** Xác định rõ input, output (goal). Nếu thiếu thông tin → hỏi Leader/User cho rõ ràng.
- **Đọc code hiện có:** Đọc các component/service/helper tương tự trước khi viết mới để tránh viết lại logic đã có sẵn.

### Quy tắc Helper: Tập trung và Không trùng lặp (DRY Principle)

- **TUYỆT ĐỐI KHÔNG** tự viết các hàm format nhỏ lẻ cục bộ trong từng component (ví dụ: tự viết hàm tính thời gian đăng, format mức lương, parse cấp bậc, ghép địa chỉ xã/huyện/tỉnh...).
- **BẮT BUỘC** tập trung toàn bộ tiện ích hiển thị vào thư mục `Frontend/src/utils/`:
  - Dữ liệu tin tuyển dụng: Dùng `extractJobDisplayData(job)` trong `utils/jobHelpers.ts` để bóc tách an toàn toàn bộ thông tin (`companyName`, `companyLogoUrl`, `displayLocation`, `salaryInfo`, `jobLevelLabel`, `workModeLabel`...).
  - Mức lương: Dùng `formatSalaryCompact`, `formatSalaryRange`, `isSalaryNegotiable`, `toMillion`.
  - Cấp bậc (`JobLevel`): Luôn dùng `JOB_LEVEL_OPTIONS` và `getJobLevelLabel` chuẩn hóa 9 cấp bậc tiếng Việt: _Thực tập sinh, Nhân viên, Trưởng nhóm, Giám sát viên, Trưởng phòng, Giám đốc chi nhánh, Phó giám đốc, Giám đốc, Lãnh đạo cấp cao_.
  - Thời gian: Dùng `getTimeAgo` từ `utils/helper.ts`.
  - Fallback Avatar / Logo: Dùng `getLoremAvt(name)` khi `logoFileUrl` / `logoUrl` /`avatarUrl` rỗng.

### Quản lý Modal & Drawer qua Zustand Store

- Tránh truyền callback mở/đóng modal xuyên qua quá nhiều tầng component (prop drilling).
- Các modal/drawer dùng chung (ví dụ: `ApplyJobModal`, `JobDetailDrawer`) **bắt buộc** được điều khiển qua Zustand store (như `useApplyJobModalStore((state) => state.openModal(job))`).

### Đồng bộ URL Search Params & Phân trang

- Bộ lọc và tìm kiếm ở các trang danh sách (Job Search, Candidate Dashboard...) cần đồng bộ với URL qua `useSearchParams`.
- Trước khi đẩy query lên URL hoặc gửi API, **phải loại bỏ** các tham số rỗng, `null`, `undefined` hoặc giá trị mặc định ("all", "0").
- Phân trang trên giao diện tích hợp với API Backend là **1-based** (`page = 1`).

### Styling & Theme

- **Chỉ dùng Tailwind v4 + biến CSS trong `index.css`**. Tuyệt đối không dùng inline style.
- Ưu tiên sử dụng màu và các biến cấu hình sẵn trong `index.css` (ví dụ: `text-text-main`, `bg-bg`, `border-border`).
- `lightswind.css` là file của thư viện ngoài, không tự ý can thiệp hoặc sửa đổi.
- **Không spam shadow và border**: Trong hầu hết trường hợp không dùng shadow, không dùng border corner quá rounded-2xl. Giao diện cần thanh thoát, phẳng và hiện đại.
- Ngoài các tiêu đề lớn (các thẻ `h1`, `h2`, `h3`), độ đậm nhất của chữ trong nội dung là **semibold (`font-semibold`)**.

```css
@theme {
  --font-sans: "Montserrat", sans-serif;

  /* Primary */
  --color-primary: #1b3b6f;
  --color-primary-dark: #122a52;
  --color-primary-light: #3e5e8f;

  /* Secondary */
  --color-secondary: #a6e1fa;
  --color-secondary-light: #d6f1fc;
  --color-secondary-dark: #6fc3e8;

  /* Neutral */
  --color-bg: #f7fafc;
  --color-bg-stone: #f9f9f9;
  --color-bg-white-blue: #ecf5f9;

  --color-surface: #ffffff;
  --color-border: #e2e8f0;

  /* Text */
  --color-text-main: #1a202c;
  --color-text-muted: #64748b;

  /* Status */
  --color-status-success: #22c55e;
  --color-status-warning: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-info: #3b82f6;
  --color-status-active: #a6e1fa;

  /* Sidebar */
  --color-sidebar: var(--color-bg);
  --color-sidebar-foreground: var(--color-text-main);
  --color-sidebar-accent: #eaf0f6;
  --color-sidebar-accent-foreground: var(--color-text-main);
  --color-sidebar-border: var(--color-border);
  --color-sidebar-ring: var(--color-primary);
}
```

### Component & State

- Ưu tiên tái sử dụng component có sẵn. Cần thêm component mới từ shadcn hay animate-ui thì hỏi user trước khi cài.
- **Tách nhỏ component ở mức vừa phải:** Giảm phụ thuộc và giảm tải state phức tạp trong 1 file.
- `Button.tsx` ở `components/` là component button dùng chung mặc định, ưu tiên dùng. Riêng `Button.tsx`, nếu có ghi className thêm khi gọi để override thì phải dùng thêm `!` (ví dụ: `font-light!`), hạn chế tối đa dùng `variant="outline"`.

### Label và tiêu đề

- Nếu đã ghi tiếng Việt, **không được** mở ngoặc ghi tiếng Anh kèm theo (Ví dụ: viết _"Tiêu đề"_, KHÔNG viết _"Tiêu đề (Title)"_).

### Icon & Hình ảnh

- **Icon mặc định:** Sử dụng `lucide-react`. Sử dụng màu sắc đồng nhất theo theme, hạn chế mỗi badge mỗi icon một màu tùy tiện.
- **Icon có tính tương tác** (nhấn đổi hình như ẩn/hiện mật khẩu, bookmark): Dùng `<MorphIcon icon={isX ? IconA : IconB} />` với `IconA`, `IconB` import từ `lucide` (KHÔNG phải `lucide-react`).
- **Logo tĩnh:** Lấy từ thư mục `assets/`.
- **Hình ảnh động (`img`):** Luôn luôn có fallback qua `onError` hoặc placeholder phòng trường hợp URL ảnh từ Cloudinary/S3 bị lỗi hoặc `null`.

### Performance & React Conventions

- **Tuyệt đối không** gọi `setState` đồng bộ trong `useEffect` gây re-render vô hạn.
- **Responsive:** Bắt buộc responsive mượt mà trên tất cả thiết bị (Mobile, Tablet, Desktop).
- **Comment code:** Ngắn gọn bằng **tiếng Việt**, chỉ giải thích **"tại sao/mục đích"**, không giải thích lại đoạn code đang làm gì. Không comment vô nghĩa.
- **Tên biến, hàm, file:** Tiếng Anh (`PascalCase` cho Component/Page, `camelCase` cho hàm/biến, `useX` cho Hook).

---

## 5. Quy trình tích hợp API mới, sửa đổi liên quan đến API (Bắt buộc 5 bước)

Backend SmartHire trả về dữ liệu theo cấu trúc Envelope chuẩn:
`{ data: TData, meta?: PaginationMeta, correlationId: string }`

Mỗi khi tích hợp API mới từ Backend, Sub-agent phải làm theo đúng thứ tự:

1. **Khảo sát Request & Response:**
   - Kiểm tra payload gửi lên là gì, dữ liệu trả về nằm trong field `data` hay phân trang qua `meta`.
   - Lưu ý các trường hợp field linh động từ Backend (ví dụ `company.logoFileUrl` vs `company.logoUrl`, `createdAt` vs `createAt`).
2. **Khảo sát Enum từ Backend:**
   - Kiểm tra định dạng enum (viết hoa/thường, ví dụ `staff` vs `Staff`, `OPEN` vs `Open`).
   - Cập nhật định nghĩa TypeScript tương ứng trong `Frontend/src/types/` và hàm chuẩn hóa trong `utils/jobHelpers.ts`.
3. **Kiểm tra Store (Zustand):**
   - Xác định dữ liệu có cần lưu vào store toàn cục (như thông tin user trong `authStore`, trạng thái modal trong `applyJobModalStore`) hay chỉ cần cache qua React Query.
4. **Kiểm tra Error Mapping:**
   - Kiểm tra trong `constants/apiErrorsMessage.ts` đã mapping mã lỗi từ Backend (`AppErrorKind` hoặc mã nghiệp vụ) sang câu thông báo thân thiện bằng tiếng Việt chưa. Nếu chưa có, bổ sung ngay.
5. **Viết theo luồng chuẩn:**
   - **Service (`services/`):** Viết hàm gọi API qua instance axios đã cấu hình.
   - **Hook Query/Mutation (`hooks/queries/`):** Bọc service bằng `@tanstack/react-query`, định nghĩa query key chuẩn hóa.
   - **Tích hợp UI:** Sử dụng hook trong Component/Page, kết hợp xử lý trạng thái `isLoading`, `isError`, empty state và fallback UI.

---

## 6. Lệnh thường dùng trong Frontend

Chạy trong thư mục `Frontend/`:

| Lệnh            | Dùng để                                                    |
| --------------- | ---------------------------------------------------------- |
| `pnpm install`  | Cài đặt các thư viện (trên Windows chạy với BypassSandbox) |
| `pnpm add ....` | Cài thư viện cụ thể (bắt buộc phải hỏi user trước)         |
| `pnpm dev`      | Chạy dev server Vite                                       |
| `pnpm build`    | Build production + kiểm tra TypeScript (`tsc -b && vite`)  |
| `pnpm lint`     | Kiểm tra lỗi format & code style với ESLint                |

> [!NOTE]
> Khi hoàn thành bất kỳ tính năng hoặc sửa lỗi nào, **bắt buộc chạy `pnpm build`** để đảm bảo 0 lỗi TypeScript trước khi báo cáo hoàn thành.

---

## 7. Ranh giới an toàn cho Frontend

- **Không tự ý cài thêm thư viện npm mới:** Phải hỏi và được user đồng ý trước khi `pnpm add`.
- **Không tự ý thêm thư viện validation mới:** Phải xin ý kiến trước.
- **Không bao giờ sửa code bên ngoài `Frontend/`:** Mọi lỗi backend chỉ ghi nhận và báo cáo (trừ khi user chỉ định full-stack).
- **Không commit file `.env` hoặc để lộ token/khóa bí mật.**
