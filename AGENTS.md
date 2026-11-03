# AGENTS.md

File này hướng dẫn các AI agent (Antigravity, Claude Code, Codex, Cursor, Copilot...) cách làm việc trong repo này.

---

## CỔNG KIỂM SOÁT BẮT BUỘC (MANDATORY GATEWAY RULE)

**MỌI AGENT VÀ SUB-AGENT PHẢI ĐỌC ĐIỀU NÀY TRƯỚC TIÊN:**

Bất cứ khi nào nhận yêu cầu liên quan đến **Frontend** hoặc chuẩn bị đọc/sửa file trong thư mục `Frontend/`:

> 1. **BẮT BUỘC PHẢI ĐỌC** file hướng dẫn chi tiết tại [.agent/rules/frontend.md](.agent/rules/frontend.md) trước khi thực hiện bất kỳ thao tác viết code nào.
> 2. **Agent Leader (Agent chính)** khi gọi Sub-agent hoặc tự mình xử lý Frontend **phải đảm bảo toàn bộ quy tắc trong `.agent/rules/frontend.md` được tuân thủ nghiêm ngặt**.

Bất cứ khi nào nhận yêu cầu liên quan đến **Backend** hoặc chuẩn bị đọc/sửa/tạo file trong thư mục `Backend/`:

> 1. **BẮT BUỘC PHẢI ĐỌC** file hướng dẫn chi tiết tại [.agent/rules/backend.md](.agent/rules/backend.md) trước khi thực hiện bất kỳ thao tác viết code nào.
> 2. **Agent Leader** khi gọi Sub-agent hoặc tự mình xử lý Backend **phải đảm bảo toàn bộ quy tắc trong `.agent/rules/backend.md` được tuân thủ nghiêm ngặt**.

---

## Quy tắc giao tiếp

- **Luôn trả lời bằng tiếng Việt**, trừ khi người dùng yêu cầu khác.
- **Nói đơn giản, dễ hiểu.** Thuật ngữ tiếng Anh bắt buộc (ví dụ `JWT`, `hook`, `CQRS`, `MediatR`) thì giải thích ngắn lần đầu.
- **Giải thích phức tạp phải có ví dụ** cụ thể.
- **File `.md` do AI viết phải bằng tiếng Việt.** Tên file, biến, code giữ nguyên tiếng Anh.

---

## 1. Tổng quan dự án

**SmartHire** — ứng dụng tuyển dụng thông minh, gợi ý job cho ứng viên dựa trên cơ chế chấm match giữa CV và JD. Có chức năng AI gợi ý chỉnh sửa câu từ/ngữ pháp trên CV (chỉ gợi ý, không tự sửa).

**Vai trò (Roles):** Candidate, Recruiter, Admin. Backend trả về mảng string (`user.roles`), không phải lúc nào cũng truy cập bằng `user.roles[0]` — tùy ngữ cảnh mà chọn cách đọc phù hợp.

**Cấu trúc repo:**

| Khu vực        | Vai trò                             | Hướng dẫn chi tiết                                                         |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `Frontend/`    | Web app (React + Vite + TypeScript) | **ĐỌC BẮT BUỘC TẠI:** [.agent/rules/frontend.md](.agent/rules/frontend.md) |
| `Backend/`     | API server (.NET 8/9 C#)            | **ĐỌC BẮT BUỘC TẠI:** [.agent/rules/backend.md](.agent/rules/backend.md)   |
| `compose.yaml` | Docker Compose                      | Cấu hình chạy toàn bộ ứng dụng                                             |

---

## 2. Quy tắc bắt buộc

1. **Trả lời và viết tài liệu bằng tiếng Việt.**
2. **Tuân thủ tuyệt đối [.agent/rules/frontend.md](.agent/rules/frontend.md)** khi làm việc với Frontend.
3. **Tuân thủ tuyệt đối [.agent/rules/backend.md](.agent/rules/backend.md)** khi làm việc với Backend (.NET C#).
4. **Không tự ý cài package mới (npm hoặc NuGet)** khi chưa hỏi và được user cho phép.
5. **Chỉ commit/push khi user yêu cầu.** Nhánh phát triển: `develop`, nhánh chính: `main`.
6. **Không tự ý sửa code ngoài phạm vi phụ trách** (làm Frontend thì không tự sửa code `Backend/`, và ngược lại, trừ khi có yêu cầu full-stack cụ thể).
7. **Test:** Chỉ viết khi user yêu cầu.
8. **Phát hiện bug ngoài vùng phụ trách:** Ghi nhận rõ ràng, báo user, không tự ý sửa lan man.
9. **Khi user nói "hướng dẫn tôi làm":** Chỉ giải thích từng bước, không tự thực hiện.

---

## 3. Quy ước Git & Nhánh

- **Commit:** Kiểu `loại: mô tả ngắn`, ví dụ: `feat: thêm trang danh sách job`, `fix: sửa lỗi filter`, `feat: thêm api bookmark job`.
- **Nhánh:** Tách từ `develop`, PR vào `develop`.
  - Feature: `feat/<mô-tả-ngắn>`
  - Sửa lỗi: `fix/<mô-tả-ngắn>`
  - Khác: `chore/...`, `docs/...`

---

## 4. Quy trình làm việc tổng quát

Khi nhận yêu cầu:

1. **Hiểu yêu cầu:** Xác định rõ input, output (goal). Thiếu thông tin → hỏi user trước khi làm.
2. **Đọc hướng dẫn theo vùng:**
   - Làm việc với Frontend → đọc ngay [.agent/rules/frontend.md](.agent/rules/frontend.md).
   - Làm việc với Backend → đọc ngay [.agent/rules/backend.md](.agent/rules/backend.md).
3. **Xem code hiện có:** Đọc file liên quan, nắm cách làm của code xung quanh (sử dụng CodeGraph hoặc công cụ tìm kiếm chuẩn).
4. **Lập kế hoạch:** Lên kế hoạch các bước sửa đổi rõ ràng.
5. **Thực hiện đúng phạm vi:** Làm thay đổi nhỏ gọn, bám sát kiến trúc và chuẩn mực quy định.
6. **Kiểm tra chất lượng:**
   - Frontend: Chạy `pnpm build` (`tsc -b && vite build`) đảm bảo 0 lỗi type/lint.
   - Backend: Chạy `dotnet build` đảm bảo 0 errors, 0 warnings.
7. **Báo cáo trung thực:** Nói rõ đã làm gì, cái gì chưa xong hoặc phát hiện lỗi phát sinh.

---

## 5. Ranh giới an toàn

**Tuyệt đối không:**

- Commit file `.env`, mật khẩu, khóa bí mật, token thật, chuỗi kết nối database có pass thật.
- Tự ý sửa code chéo vùng khi chưa có chỉ định rõ ràng.
- `git push --force`, `git reset --hard`, xóa nhánh khi chưa được user đồng ý.

**Phải hỏi user trước khi:**

- Cài thêm thư viện mới (npm package, NuGet package) hoặc thay đổi phiên bản framework.
- Sửa cấu hình deploy (`Dockerfile`, `compose.yaml`).
- Thao tác xóa dữ liệu database thật hoặc gửi thông tin ra dịch vụ ngoài.

---

## 6. Mô hình Sub-agent

### Agent chính (Leader / Orchestrator)

- Tiếp nhận yêu cầu, phân tích bài toán, phân chia công việc.
- Khi làm task Frontend, **Leader có trách nhiệm nạp file `.agent/rules/frontend.md`** cho Sub-agent.
- Khi làm task Backend, **Leader có trách nhiệm nạp file `.agent/rules/backend.md`** cho Sub-agent.
- Review diff trước khi chấp nhận, tự chạy lệnh kiểm tra (`pnpm build`, `dotnet build`). Không coi báo cáo suông của sub-agent là bằng chứng đã xong.

### Sub-agent: FE Developer

- Chuyên trách code frontend trong `Frontend/src/`.
- **Quy tắc:** Tuân thủ 100% tất cả các mục trong [.agent/rules/frontend.md](.agent/rules/frontend.md).
- Không tự ý cài thư viện npm, không tự ý sửa cấu hình ngoài `Frontend/src/`.

### Sub-agent: BE Developer

- Chuyên trách code backend trong `Backend/src/`.
- **Quy tắc:** Tuân thủ 100% tất cả các mục trong [.agent/rules/backend.md](.agent/rules/backend.md).
- Tuân thủ Clean Architecture 4 tầng, CQRS (MediatR), Explicit Validated Record Pattern, `AppException`, `ApiResponseFactory`, Rich Domain Model và `IUnitOfWork`.
- Không tự ý thêm package NuGet khi chưa hỏi user.

---

## 7. Chuẩn mực Backend (.NET C#)

> **TÀI LIỆU GỐC BẮT BUỘC**: Tất cả chi tiết, ví dụ code mẫu và checklist kiểm thử được định nghĩa đầy đủ tại **[.agent/rules/backend.md](.agent/rules/backend.md)**.

### Tóm tắt cốt lõi:

1. **Mô hình kiến trúc Clean Architecture 4 tầng**:
   - `SmartHire.Domain`: Entities, Value Objects, Enums thuần C#, độc lập 100%.
   - `SmartHire.Application`: Use cases, CQRS Commands/Queries (MediatR), Validators, DTOs, Interface Abstractions.
   - `SmartHire.Infrastructure`: EF Core DbContext, Repositories, Entity Configurations, Hangfire, Npgsql.
   - `SmartHire.API`: Controllers, Request Contracts, Middleware, `ApiResponseFactory`.
2. **Quy tắc phụ thuộc**: `Domain` $\leftarrow$ `Application` $\leftarrow$ `Infrastructure` & `API`. Tuyệt đối không để `Domain` hay `Application` phụ thuộc trực tiếp vào `Infrastructure`.
3. **Response Envelope chuẩn**: Mọi API trả kết quả qua `_responseFactory.Success(data)` hoặc `_responseFactory.PagedOneBased(...)`.
4. **Exception & Error Handling**: Ném `AppException` kết hợp `AppErrorKind` (Validation: 422, NotFound: 404, Forbidden: 403, Conflict: 409...) và để `ApiExceptionHandler` middleware tự đóng gói format JSON chuẩn.
5. **Validation Pattern**: Sử dụng **Static Explicit Validator + Validated Record**, không dùng ngầm định qua Pipeline.
6. **Domain Model**: Rich Domain Model, private setter, khởi tạo qua Static Factory `Create(...)`, thay đổi trạng thái qua domain methods.
7. **Transaction**: Nghiệp vụ ghi nhiều bảng hoặc liên chuỗi bắt buộc bọc trong `IUnitOfWork.ExecuteInTransactionAsync`.
8. **Quy trình 7 bước khi mở rộng tính năng mới**:
   `Domain Entity` $\rightarrow$ `EF Configuration & Migration` $\rightarrow$ `Application Abstraction (IRepository)` $\rightarrow$ `Infrastructure Repository` $\rightarrow$ `Application Feature (DTOs, Exceptions, Commands/Queries & Handlers)` $\rightarrow$ `API Request Contract & Controller Action` $\rightarrow$ `Viết tài liệu API (.md)`.
