# AGENTS.md

File này hướng dẫn các AI agent (Antigravity, Claude Code, Codex, Cursor, Copilot...) cách làm việc trong repo này.

---

## CỔNG KIỂM SOÁT BẮT BUỘC (MANDATORY GATEWAY RULE)

> **MỌI AGENT VÀ SUB-AGENT PHẢI ĐỌC ĐIỀU NÀY TRƯỚC TIÊN:**
>
> Bất cứ khi nào nhận yêu cầu liên quan đến **Frontend** hoặc chuẩn bị đọc/sửa file trong thư mục `Frontend/`:
>
> 1. **BẮT BUỘC PHẢI ĐỌC** file hướng dẫn chi tiết tại [.agent/rules/frontend.md](.agent/rules/frontend.md) trước khi thực hiện bất kỳ thao tác viết code nào.
> 2. **Agent Leader (Agent chính)** khi gọi Sub-agent hoặc tự mình xử lý Frontend **phải đảm bảo toàn bộ quy tắc trong `.agent/rules/frontend.md` được tuân thủ nghiêm ngặt**.

---

## Quy tắc giao tiếp

- **Luôn trả lời bằng tiếng Việt**, trừ khi người dùng yêu cầu khác.
- **Nói đơn giản, dễ hiểu.** Thuật ngữ tiếng Anh bắt buộc (ví dụ `JWT`, `hook`) thì giải thích ngắn lần đầu.
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
| `Backend/`     | API server                          | Agent FE **không tự ý sửa**; nếu phát hiện lỗi BE thì ghi nhận và báo user |
| `compose.yaml` | Docker Compose                      | Cấu hình chạy toàn bộ ứng dụng                                             |

---

## 2. Quy tắc bắt buộc

1. **Trả lời và viết tài liệu bằng tiếng Việt.**
2. **Tuân thủ tuyệt đối [.agent/rules/frontend.md](.agent/rules/frontend.md)** khi làm việc với Frontend.
3. **Không cài thư viện npm mới khi chưa hỏi user.**
4. **Chỉ commit/push khi user yêu cầu.** Nhánh phát triển: `develop`, nhánh chính: `main`.
5. **Không tự ý sửa code ngoài phạm vi phụ trách** (ví dụ: làm Frontend thì không tự sửa code `Backend/`).
6. **Test:** Chỉ viết khi user yêu cầu.
7. **Phát hiện bug Backend:** Ghi nhận rõ ràng, báo user, không tự sửa.
8. **Khi user nói "hướng dẫn tôi làm":** Chỉ giải thích từng bước, không tự thực hiện.

---

## 3. Quy ước Git & Nhánh

- **Commit:** Kiểu `loại: mô tả ngắn`, ví dụ: `feat: thêm trang danh sách job`, `fix: sửa lỗi filter`.
- **Nhánh:** Tách từ `develop`, PR vào `develop`.
  - Feature: `feat/<mô-tả-ngắn>`
  - Sửa lỗi: `fix/<mô-tả-ngắn>`
  - Khác: `chore/...`, `docs/...`

---

## 4. Quy trình làm việc tổng quát

Khi nhận yêu cầu:

1. **Hiểu yêu cầu:** Xác định rõ input, output (goal). Thiếu thông tin → hỏi user trước khi làm.
2. **Đọc hướng dẫn theo vùng:** Nếu làm Frontend → đọc ngay [.agent/rules/frontend.md](.agent/rules/frontend.md).
3. **Xem code hiện có:** Đọc file liên quan, nắm cách làm của code xung quanh.
4. **Lập kế hoạch:** Lên kế hoạch các bước sửa đổi.
5. **Thực hiện đúng phạm vi:** Làm thay đổi nhỏ gọn, đúng mục tiêu.
6. **Kiểm tra chất lượng:** Chạy lệnh build và lint tương ứng của khu vực đó.
7. **Báo cáo trung thực:** Nói rõ đã làm gì, cái gì chưa xong hoặc phát hiện lỗi phát sinh.

---

## 5. Ranh giới an toàn

**Tuyệt đối không:**

- Commit file `.env`, mật khẩu, khóa, token thật.
- Tự ý sửa code Backend khi đang làm task Frontend.
- `git push --force`, `git reset --hard`, xóa nhánh khi chưa được user đồng ý.

**Phải hỏi user trước khi:**

- Cài thêm thư viện mới hoặc thay đổi phiên bản framework.
- Sửa cấu hình deploy (`Dockerfile`, `compose.yaml`).
- Thao tác ảnh hưởng dữ liệu thật hoặc gửi thông tin ra dịch vụ ngoài.

---

## 6. Mô hình Sub-agent

### Agent chính (Leader / Orchestrator)

- Đóng vai trò tiếp nhận yêu cầu, phân tích bài toán, phân chia công việc.
- Khi làm task Frontend, **Leader có trách nhiệm nạp file `.agent/rules/frontend.md`** hoặc giao nhiệm vụ cho Sub-agent kèm chỉ thị tuân thủ file này.
- Review diff trước khi chấp nhận, tự chạy lệnh kiểm tra (`build`, `lint`). Không coi báo cáo của sub-agent là bằng chứng đã xong.

### Sub-agent: FE Developer

- Chuyên trách code frontend trong `Frontend/src/`.
- **Quy tắc:** Tuân thủ 100% tất cả các mục trong [.agent/rules/frontend.md](.agent/rules/frontend.md).
- Không tự ý cài thư viện, không tự ý sửa cấu hình ngoài `Frontend/src/`.

---

## Backend

> **Phần Backend để trống có chủ đích.** Agent FE không làm việc với Backend. Nếu cần bổ sung hướng dẫn Backend cho agent BE sau này, thêm vào đây hoặc tạo `Backend/AGENTS.md`.
