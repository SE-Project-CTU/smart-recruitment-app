# AGENTS.md

File này hướng dẫn các AI agent (Antigravity, Claude Code, Codex, Cursor, Copilot...) cách làm việc trong repo này.

## Quy tắc giao tiếp

- **Luôn trả lời bằng tiếng Việt**, trừ khi người dùng yêu cầu khác.
- **Nói đơn giản, dễ hiểu.** Thuật ngữ tiếng Anh bắt buộc (ví dụ `JWT`, `hook`) thì giải thích ngắn lần đầu.
- **Giải thích phức tạp phải có ví dụ** cụ thể.
- **File `.md` do AI viết phải bằng tiếng Việt.** Tên file, biến, code giữ nguyên tiếng Anh.

## 1. Tổng quan dự án

**SmartHire** — ứng dụng tuyển dụng thông minh, gợi ý job cho ứng viên dựa trên cơ chế chấm match giữa CV và JD. Có chức năng AI gợi ý chỉnh sửa câu từ/ngữ pháp trên CV (chỉ gợi ý, không tự sửa).

**Vai trò (Roles):** Candidate, Recruiter, Admin. Backend trả về mảng string (`user.roles`), không phải lúc nào cũng truy cập bằng `user.roles[0]` — tùy ngữ cảnh mà chọn cách đọc phù hợp.

**Cấu trúc repo:**

| Khu vực        | Vai trò                             | Ghi chú                                                               |
| -------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `Frontend/`    | Web app (React + Vite + TypeScript) | **Phạm vi chính của agent**                                           |
| `Backend/`     | API server                          | Agent FE **không tự ý sửa**; nếu phát hiện lỗi BE thì ghi nhận và báo |
| `compose.yaml` | Docker Compose                      | Cấu hình chạy toàn bộ                                                 |

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

### Quy tắc API

- Mọi request đều qua axios tại `Frontend/src/api/` — có xử lý lỗi tập trung và nạp env
- Chưa có cơ chế validate mạnh; muốn thêm thư viện validate → **hỏi user trước**

## 3. Cấu trúc thư mục Frontend

```
Frontend/src/
├── api/           # Cấu hình axios, xử lý lỗi tập trung
├── assets/        # Hình ảnh, logo, trang trí
├── components/    # Xem bảng thư viện component ở mục 2
├── constants/     # Hằng số và file quan trọng:
│   ├── paths.ts           # URL frontend (hạn chế hardcode)
│   ├── apiEndpoints.ts    # Endpoint backend (env đã có baseApi = api/v1)
│   ├── apiErrorsMessage.ts # Mapping mã lỗi từ BE — kiểm tra đủ khi pull code mới
│   └── mockData.ts        # Mock data demo UI
├── hooks/         # Custom hooks + hooks/queries/ (tanstack query kết hợp services/)
├── layouts/       # Layout dùng chung
├── lib/           # utils.ts (thư viện, không sửa), queryClient.ts (cấu hình tanstack query)
├── pages/         # Mỗi URL = 1 page
├── routes/        # router.ts + ProtectedRoute (allowRoles) + PublicRoute
├── services/      # Gọi API bằng axios đã cấu hình
├── stores/        # Zustand store
├── types/         # Type/interface tập trung
├── utils/         # Helpers hiển thị dữ liệu, cookie
├── index.css      # Biến CSS global — ưu tiên dùng màu/biến có sẵn
└── lightswind.css # Thư viện ngoài, KHÔNG can thiệp
```

## 4. Quy tắc code Frontend

### Trước khi code

- **Lập kế hoạch:** xác định rõ input, output (goal). Thiếu thông tin → hỏi user.
- **Đọc code liên quan** trước khi viết mới.

### Styling

- **Chỉ dùng Tailwind v4 + biến CSS trong `index.css`**. Không inline style.
- Ưu tiên màu và biến cấu hình sẵn trong `index.css` (ví dụ `text-text-main`).
- `lightswind.css` — thư viện ngoài, không tự ý can thiệp hay sử dụng.

### Component

- Ưu tiên component có sẵn. Cần thêm → hỏi user để cài từ shadcn / animate-ui.
- **Tách nhỏ component ở mức vừa phải** — giảm phụ thuộc, giảm state phức tạp.
- `Button.tsx` ở `components/` là button dùng chung — ưu tiên dùng lại.

### Icon & Hình ảnh

- Icon: **lucide-react** là mặc định.
- Icon có tính tương tác (bật/tắt): dùng `<MorphIcon icon={isX ? IconA : IconB} />` với `IconA`, `IconB` import từ `lucide` (không phải `lucide-react`).
- Logo: lấy từ `assets/`.
- Hình ảnh (`img`): **luôn có fallback**.

### Code rules

- Không gọi `setState` đồng bộ trong `useEffect`.
- Comment ngắn gọn bằng **tiếng Việt**, chỉ comment khi cần — không nhắc lại chức năng code.
- Tên biến, hàm, class, file: **tiếng Anh**.
- **Responsive bắt buộc** cho tất cả thiết bị.
- **Phạm vi:** chỉ tác động thư mục `Frontend/`. Phát hiện lỗi Backend → ghi nhận, báo user, không tự sửa.

### Tích hợp API mới (quy trình bắt buộc)

1. Kiểm tra Request gì, Response gì (hỏi hoặc tự kiểm tra)
2. Kiểm tra cần store không? Store hiện tại đủ chưa hay tạo mới?
3. Kiểm tra mapping lỗi trong `apiErrorsMessage.ts` đã đủ chưa
4. Viết **service** → viết **hook** (tanstack query) → tích hợp vào **UI**

## 5. Quy tắc bắt buộc

1. **Trả lời và viết tài liệu bằng tiếng Việt.**
2. **Không cài thư viện npm mới khi chưa hỏi user.**
3. **Chỉ commit/push khi user yêu cầu.** Nhánh phát triển: `develop`, nhánh chính: `main`.
4. **Không tự ý sửa code ngoài `Frontend/`.**
5. **Mọi trang/component phải responsive.**
6. **Test:** chỉ viết khi user yêu cầu.
7. **Phát hiện bug Backend:** ghi nhận rõ ràng, báo user, không tự sửa.
8. **Khi user nói "hướng dẫn tôi làm":** chỉ giải thích từng bước, không tự thực hiện.

## 6. Lệnh thường dùng

### Frontend (chạy trong `Frontend/`)

| Lệnh            | Dùng để                                |
| --------------- | -------------------------------------- |
| `pnpm install`  | Cài thư viện                           |
| `pnpm add ....` | Cài thư viện cụ thể                    |
| `pnpm dev`      | Chạy dev server                        |
| `pnpm build`    | Build production + kiểm tra TypeScript |
| `pnpm lint`     | Kiểm tra code style                    |

## 7. Quy ước code

**Chung**

- Tên biến, hàm, class, file: **tiếng Anh**. Comment: **tiếng Việt ngắn gọn**.
- Viết code giống code xung quanh: cùng cách đặt tên, cùng mức comment.
- Comment giải thích **"tại sao/mục đích"**, không lặp lại "code đang làm gì".
- Sửa đúng phạm vi yêu cầu, không tiện tay dọn dẹp chỗ khác.

**Frontend (TypeScript / React)**

- Component viết bằng function, tên `PascalCase` (`JobCard.tsx`).
- Hook bắt đầu bằng `use` (`useAuth.ts`).
- Style chỉ bằng Tailwind class + biến `index.css`, không inline style.

**Commit**

- Kiểu `loại: mô tả ngắn`, ví dụ `feat: thêm trang danh sách job`, `fix: sửa lỗi filter`.

**Nhánh**

- Tách từ `develop`, PR vào `develop`.
- Feature: `feat/<mô-tả-ngắn>`, sửa lỗi: `fix/<mô-tả-ngắn>`, khác: `chore/...`, `docs/...`.

## 8. Quy trình làm việc

Khi nhận yêu cầu:

1. **Hiểu yêu cầu.** Thiếu thông tin → hỏi. Việc nhỏ rõ ràng → cứ làm.
2. **Xem code hiện có** — đọc file liên quan, xem cách các phần tương tự đã làm.
3. **Lập kế hoạch** — xác định input/output trước khi code.
4. **Làm thay đổi đúng phạm vi.** Theo quy trình tích hợp API nếu liên quan.
5. **Kiểm tra:** chạy `pnpm build` và `pnpm lint` để đảm bảo không lỗi.
6. **Báo cáo trung thực:** nói rõ đã làm gì, cái gì chưa xong hoặc bị lỗi.

## 9. Ranh giới an toàn

**Tuyệt đối không:**

- Commit file `.env`, mật khẩu, khóa, token thật.
- Tự ý sửa code Backend.
- `git push --force`, `git reset --hard`, xóa nhánh khi chưa được user đồng ý.

**Phải hỏi user trước khi:**

- Cài thêm thư viện npm mới hoặc đổi phiên bản framework.
- Thêm thư viện validate mới.
- Sửa cấu hình deploy (`Dockerfile`, `compose.yaml`).
- Thao tác ảnh hưởng dữ liệu thật hoặc gửi thông tin ra dịch vụ ngoài.

## 10. Sub-agent

### Cấu hình sub-agent cho Frontend

Agent chính đóng vai **leader**: nhận yêu cầu, phân tích, chia việc, review kết quả.

**Sub-agent: FE Developer**

- **Vai trò:** Chuyên code frontend — viết component, page, hook, service, tích hợp API.
- **Phạm vi:** Chỉ sửa file trong `Frontend/src/`.
- **Quy tắc:** Tuân theo mọi quy tắc ở mục 3, 4, 5 của file này.
- **Không được:** Cài thư viện mới, sửa cấu hình build, sửa file ngoài `Frontend/`.

**Agent chính (Leader) phải:**

- Review diff từ sub-agent trước khi chấp nhận.
- Tự chạy `pnpm build` và `pnpm lint` để xác nhận.
- Không coi báo cáo sub-agent là bằng chứng hoàn tất.

### Quy tắc phân chia công việc

- Việc nhỏ, rõ ràng → agent chính tự làm.
- Việc lớn hoặc nhiều phần độc lập → dùng sub-agent FE Developer.
- Tránh để nhiều agent cùng sửa một file.

## Backend

> ⚠️ **Phần Backend để trống có chủ đích.** Agent FE không làm việc với Backend. Nếu cần bổ sung hướng dẫn Backend cho agent BE sau này, thêm vào đây.
