# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Ứng viên (Candidate):** Sinh viên, người tìm việc và người đi làm đang tìm kiếm cơ hội nghề nghiệp phù hợp. Nhu cầu chính là xây dựng hồ sơ/CV chuyên nghiệp, khám phá các công việc phù hợp với năng lực và theo dõi sát sao tiến trình ứng tuyển.
- **Nhà tuyển dụng (Recruiter / Doanh nghiệp):** Bộ phận tuyển dụng, HR và doanh nghiệp có nhu cầu đăng tin tuyển dụng nhanh chóng, tiếp nhận và quản lý hồ sơ ứng viên tập trung, theo dõi quy trình xét duyệt qua từng giai đoạn.
- **Quản trị viên (Admin):** Đội ngũ quản trị hệ thống phụ trách kiểm duyệt nội dung, quản lý người dùng và danh mục nghiệp vụ.

## Product Purpose

SmartHire là nền tảng kết nối ứng viên và nhà tuyển dụng kết hợp trình biên tập CV trực quan và các tính năng hỗ trợ bằng AI. Mục tiêu của sản phẩm là số hóa toàn diện quy trình tuyển dụng: từ khâu tạo lập hồ sơ cá nhân, viết CV chuẩn hóa, khám phá cơ hội việc làm cho đến quản lý vòng đời ứng tuyển. Thành công của sản phẩm được đo bằng khả năng giúp ứng viên tạo ra CV chất lượng và tìm được việc làm phù hợp nhanh chóng, đồng thời giúp nhà tuyển dụng tiết kiệm thời gian sàng lọc hồ sơ và tiếp cận đúng nhân tài.

## Positioning

Sử dụng cơ chế so khớp thông minh giữa CV và JD (Mô tả công việc) thông qua vector embedding và AI để đưa ra điểm tương đồng (match score) khách quan. Khác biệt cốt lõi là AI luôn giữ vai trò **cố vấn đồng hành**: hỗ trợ gợi ý hoàn thiện câu từ, ngữ pháp và đối chiếu kỹ năng mà tuyệt đối **không tự ý sửa dữ liệu** hay thay thế quyết định của con người.

## Operating Context

- Ứng dụng web hoạt động trên trình duyệt máy tính và thiết bị di động, ưu tiên trải nghiệm máy tính cho các tác vụ phức tạp như biên tập CV và quản trị tuyển dụng.
- Tích hợp trình soạn thảo nội dung phong phú (TipTap) chuyên biệt cho tạo và định dạng CV.
- Tích hợp dịch vụ lưu trữ media đám mây (Cloudinary) phục vụ lưu trữ ảnh đại diện, logo công ty và tài liệu đính kèm.
- Tiếng Việt là ngôn ngữ giao tiếp và hiển thị chính trong toàn bộ hệ sinh thái sản phẩm.

## Capabilities and Constraints

- **Năng lực cốt lõi:**
  - Xác thực và phân quyền người dùng đa vai trò (`Candidate`, `Recruiter`, `Admin`) qua JWT.
  - Biên tập CV tương tác trực tiếp với giao diện kéo thả và định dạng văn bản.
  - Tìm kiếm, lọc tin tuyển dụng đa tiêu chí (địa điểm, mức lương, kỹ năng, hình thức).
  - Quy trình ứng tuyển trực tuyến với khả năng cập nhật trạng thái hồ sơ nhiều giai đoạn theo thời gian thực.
  - Tính điểm độ tương thích (Match Score) và đề xuất cải thiện nội dung CV bằng AI.
- **Ràng buộc sản phẩm & kỹ thuật:**
  - AI chỉ đóng vai trò gợi ý/cố vấn, không tự động ghi đè nội dung CV của ứng viên.
  - Giao diện tuân thủ chặt chẽ design tokens và biến CSS trong `Frontend/src/index.css`.
  - Phân định ranh giới chặt chẽ giữa Frontend và Backend; không tự ý sửa đổi API/Backend khi chưa có thống nhất.

## Brand Commitments

- **Tên thương hiệu:** SmartHire.
- **Định vị khẩu hiệu:** Nền tảng tuyển dụng thông minh và xây dựng CV tích hợp AI.
- **Giọng điệu (Voice):** Chuyên nghiệp, đáng tin cậy, hiện đại, truyền cảm hứng và tôn trọng quyền tự chủ của người dùng.

## Evidence on Hand

- Tài liệu kiến trúc và hướng dẫn phát triển tại [README.md](smart-recruitment-app/README.md).
- Quy chuẩn code và thiết kế frontend tại [.agent/rules/frontend.md](smart-recruitment-app/.agent/rules/frontend.md).
- Hệ thống mã nguồn và linh kiện UI hiện hữu tại [Frontend/src](smart-recruitment-app/Frontend/src).

## Product Principles

1. **Người dùng luôn nắm quyền kiểm soát:** AI chỉ đóng vai trò trợ lý thông minh gợi ý và phản ánh mức độ phù hợp; quyết định cuối cùng về nội dung CV và ứng tuyển luôn thuộc về người dùng.
2. **Minh bạch và có cơ sở:** Tiêu chí đánh giá, độ match điểm và các đề xuất phải rõ ràng, dễ hiểu, giúp ứng viên hiểu được điểm mạnh và điểm cần cải thiện.
3. **Trải nghiệm song hành, không đánh đổi:** Tối ưu mượt mà cho trải nghiệm soạn thảo và tìm việc của Ứng viên, song song với việc giữ quy trình xét duyệt của Nhà tuyển dụng luôn tinh gọn và trực quan.
4. **Nhất quán và tập trung vào hiệu quả:** Tránh các hiệu ứng trang trí thừa thãi gây xao nhãng; mọi thành phần giao diện đều hướng đến tốc độ đọc hiểu và hoàn thành tác vụ.

## Accessibility & Inclusion

- Đảm bảo độ tương phản màu sắc đạt chuẩn, văn bản rõ ràng dễ đọc trên cả chế độ sáng/tối.
- Hệ thống nút bấm, trường nhập liệu và thao tác có kích thước thân thiện, hỗ trợ thao tác bàn phím và phản hồi trạng thái rõ ràng.
