# AGENTS.md — SmartHire

Hướng dẫn chung cho mọi AI coding agent làm việc trong repository này: Antigravity, Claude Code, Codex, Cursor, Copilot và sub-agent. Đọc file này trước khi khảo sát, sửa code hoặc phân công công việc.

## 1. Phạm vi và tài liệu bắt buộc

- Repository: `smart-recruitment-app/`.
- Chính sách chi tiết nằm trong repository:
  - Frontend: `.agents/rules/frontend.md`
  - Backend: `.agents/rules/backend.md`
  - Skills: `.agents/skills/`
- Nếu yêu cầu chạm vào `Frontend/`, phải đọc toàn bộ `.agents/rules/frontend.md` trước khi đọc sâu hoặc sửa code Frontend.
- Nếu yêu cầu chạm vào `Backend/`, phải đọc toàn bộ `.agents/rules/backend.md` trước khi đọc sâu hoặc sửa code Backend.
- Công việc full-stack phải đọc cả hai rule. Agent chính phải chuyển các rule liên quan cho mọi sub-agent.
- Rule theo thư mục cụ thể (nếu có) luôn ưu tiên hơn file này.

## 2. Ngôn ngữ và cách giao tiếp

- Trả lời người dùng và viết tài liệu Markdown bằng tiếng Việt, trừ khi họ yêu cầu ngôn ngữ khác.
- Giải thích ngắn, rõ; giải thích thuật ngữ chuyên môn khi lần đầu xuất hiện nếu cần.
- Khi người dùng nói “hướng dẫn tôi làm”, chỉ hướng dẫn từng bước, không tự thay đổi code.
- Tên file, code, biến, hàm và API giữ tiếng Anh theo quy ước dự án.

## 3. Bản đồ dự án

| Khu vực        | Công nghệ / vai trò                                                     |
| -------------- | ----------------------------------------------------------------------- |
| `Frontend/`    | React, Vite, TypeScript, Tailwind v4                                    |
| `Backend/`     | .NET 10, Clean Architecture, CQRS, EF Core, PostgreSQL                  |
| `compose.yaml` | Chạy các dịch vụ bằng Docker Compose                                    |
| `.codegraph/`  | Chỉ mục CodeGraph cục bộ, không chỉnh sửa hoặc commit dữ liệu phát sinh |
| `.impeccable/` | Cấu hình và critique cho thiết kế giao diện                             |

SmartHire phục vụ ba vai trò: `Candidate`, `Recruiter`, `Admin`. `user.roles` là mảng string; không mặc định đọc bằng `user.roles[0]` khi logic cần kiểm tra nhiều vai trò.

## 4. Khảo sát code và công cụ

### CodeGraph

Khi cần tìm hoặc hiểu code, ưu tiên CodeGraph trước `grep`, `find` hoặc đọc nhiều file thủ công:

1. Dùng MCP `codegraph_explore` nếu agent có tool này.
2. Nếu không có MCP, dùng `codegraph explore "<symbol, file hoặc câu hỏi>"`.
3. Chỉ dùng tìm kiếm văn bản thông thường khi CodeGraph không có sẵn, chỉ mục không trả lời được câu hỏi, hoặc cần tìm nội dung không phải code.

Không sửa hay commit `.codegraph/` vì đây là dữ liệu cục bộ do công cụ tạo ra.

### Impeccable

Với thay đổi giao diện đáng kể, đọc `.impeccable/design.json` trước khi thiết kế hoặc chỉnh style. Giữ đúng design system đã định nghĩa: dùng token trong `Frontend/src/index.css`, hạn chế shadow, card/dialog tối đa `rounded-2xl`, và không dùng màu Tailwind thô trong component hệ thống.

Nếu Impeccable khả dụng trong môi trường agent, chạy critique sau khi hoàn thành thay đổi UI và xử lý các lỗi phù hợp với phạm vi yêu cầu. Không chỉnh sửa `.impeccable/config.local.json`.

## 5. Skills dùng theo ngữ cảnh

Đọc đúng `SKILL.md` trước khi áp dụng skill. Không dùng skill chỉ vì tên gần giống yêu cầu.

| Tình huống                                                             | Skill bắt buộc                           |
| ---------------------------------------------------------------------- | ---------------------------------------- |
| Yêu cầu mới, phức tạp hoặc mơ hồ; cần quyết định thiết kế              | `.agents/skills/brainstorming/SKILL.md`  |
| Lập kế hoạch cho feature, bug phức tạp hoặc refactor nhiều file        | `.agents/skills/plan-writing/SKILL.md`   |
| Người dùng yêu cầu đơn giản hóa hoặc giảm độ phức tạp                  | `.agents/skills/simplify-code/SKILL.md`  |
| Người dùng yêu cầu tạo skill, hoặc phát hiện quy trình lặp lại rõ ràng | `.agents/skills/skill-creating/SKILL.md` |
| Thêm hoặc chỉnh component có hoạt ảnh cho React UI                     | `.agents/skills/animate-ui/SKILL.md`     |
| Người dùng yêu cầu tạo commit code (chỉ commit, không tự ý push)       | `.agents/skills/git-commit/SKILL.md`     |

Nếu `brainstorming` yêu cầu làm rõ, kiểm tra bối cảnh hiện có trước; chỉ hỏi các quyết định thực sự chặn việc triển khai.

## 6. Quy trình thực hiện

1. Xác định phạm vi: Frontend, Backend hay full-stack; đọc rule và skill tương ứng.
2. Dùng CodeGraph để lần theo luồng xử lý, symbol liên quan và code có sẵn.
3. Với yêu cầu đủ rõ, lập kế hoạch ngắn cho thay đổi có nhiều bước; với yêu cầu chưa rõ, làm rõ theo skill `brainstorming`.
4. Thực hiện thay đổi nhỏ, tập trung; tái sử dụng pattern, helper và component hiện có.
5. Review diff để phát hiện sửa ngoài phạm vi, bí mật hoặc file sinh tự động.
6. Kiểm tra tương ứng với phần đã đổi khi người dùng yêu cầu xác minh hoặc khi rule khu vực bắt buộc:
   - Frontend: chạy `pnpm build` trong `Frontend/`.
   - Backend: chạy `dotnet build` trong `Backend/`.
   - UI đáng kể: chạy Impeccable critique nếu có thể.
7. Báo cáo chính xác: thay đổi nào đã xong, cách kiểm tra, và điều gì còn chưa thực hiện.

## 7. Ranh giới thay đổi

- Không cài package npm/NuGet, nâng phiên bản framework, hoặc sửa cấu hình deploy (`Dockerfile`, `compose.yaml`) khi chưa được người dùng chấp thuận.
- Không tự sửa code ngoài phạm vi được giao; lỗi ở khu vực khác phải ghi nhận và báo lại.
- Không tự viết test khi người dùng không yêu cầu, trừ khi rule khu vực bắt buộc.
- Không commit, push, tạo hoặc xóa branch khi người dùng chưa yêu cầu.
- Không commit `.env`, token, mật khẩu, khóa bí mật, chuỗi kết nối thật, dữ liệu CodeGraph hay cấu hình local.
- Không chạy `git push --force`, `git reset --hard`, xóa branch hoặc xóa dữ liệu thật nếu chưa có chấp thuận rõ ràng.

## 8. Git

- Nhánh chính: `main`; nhánh phát triển: `develop`.
- Feature tách từ `develop` và tạo PR về `develop`.
- Đặt tên nhánh: `feat/<mo-ta>`, `fix/<mo-ta>`, `chore/<mo-ta>`, `docs/<mo-ta>`.
- Commit dùng dạng `type: mô tả ngắn`, ví dụ `feat: thêm trang danh sách việc làm`.

## 9. Phối hợp sub-agent

- Agent chính chịu trách nhiệm phân chia phạm vi, truyền rule/skill bắt buộc và review diff của sub-agent.
- Sub-agent chỉ sửa khu vực được giao; không mở rộng sang Frontend/Backend còn lại nếu chưa được giao rõ.
- Hoàn thành chỉ được xác nhận sau khi agent chính kiểm tra diff và kết quả xác minh phù hợp; không chỉ dựa vào báo cáo của sub-agent.
