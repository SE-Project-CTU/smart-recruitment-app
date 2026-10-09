# Câu hỏi Phỏng vấn & Hướng dẫn trả lời: Task 07 — Media Storage & Uploading File Service

> **Dành cho ứng viên:** Intern / Junior .NET Developer  
> **Chủ đề chính:** File Upload, Cloud Storage Integration, Clean Architecture, CQRS (MediatR), Bảo mật File & Authorization  

---

## 1. Kiến trúc & Thiết kế hệ thống

### Câu 1: Bạn đã thiết kế tính năng tải lên tệp tin (File Upload) trong dự án này như thế nào?
**Gợi ý trả lời trong 1–2 phút:**
- "Trong dự án SmartHire, tính năng upload file được xây dựng theo **Clean Architecture** kết hợp mô hình **CQRS** sử dụng thư viện **MediatR**.
- Khi một yêu cầu upload gửi đến:
  1. `MediaController` tiếp nhận HTTP request dạng `multipart/form-data` và truyền file stream vào `UploadImageCommand` hoặc `UploadPdfCommand`.
  2. Tại tầng Application, Handler thực hiện xác thực server-side: kiểm tra định dạng MIME type (ví dụ chỉ cho phép PNG, JPEG, WEBP với ảnh và PDF với tài liệu) cùng giới hạn dung lượng (5MB cho ảnh, 10MB cho tài liệu).
  3. Handler tương tác với dịch vụ lưu trữ thông qua interface trừu tượng `IFileStorageService` (Dependency Inversion), tách rời hoàn toàn tầng Application khỏi SDK bên ngoài.
  4. Phía Infrastructure, `CloudinaryFileStorageService` kết nối với **Cloudinary API** để đẩy file lên đám mây, nhận về URL an toàn và `PublicId`.
  5. Cuối cùng, Handler tạo entity `MediaFile` trong Domain và lưu metadata vào PostgreSQL thông qua `IMediaFileRepository` và `IUnitOfWork`."

*Code minh họa:*
- Interface: [IFileStorageService.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Application/Abstractions/Storage/IFileStorageService.cs)
- Handler: [UploadImageCommandHandler.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Application/Features/Media/Commands/UploadImage/UploadImageCommandHandler.cs)
- Implementation: [CloudinaryFileStorageService.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Infrastructure/Storage/CloudinaryFileStorageService.cs)

---

### Câu 2: Tại sao bạn lại tách thư mục và xử lý thành `Commands` và `Queries` thay vì viết chung trong một `MediaService`?
**Gợi ý trả lời:**
- "Đây là việc áp dụng nguyên lý **CQRS (Command Query Responsibility Segregation)**:
  - **Commands:** Đại diện cho các tác vụ thay đổi trạng thái hệ thống (Ghi/Xóa như `UploadImage`, `UploadPdf`, `DeleteMediaFile`). Các tác vụ này có tính logic nghiệp vụ cao, cần kiểm tra quyền sở hữu, validate chặt chẽ và ghi log/transaction.
  - **Queries:** Đại diện cho các tác vụ truy vấn dữ liệu (Đọc như `GetMediaFile`). Chúng chỉ cần đọc metadata và trả về DTO nhanh chóng mà không thay đổi bất kỳ trạng thái nào.
- Lợi ích lớn nhất khi tách theo từng handler nhỏ là tuân thủ **Single Responsibility Principle (SRP)**: mỗi file chỉ giải quyết đúng một use case duy nhất, code ngắn gọn, rõ ràng, giảm thiểu conflict khi nhiều thành viên trong nhóm 3 người cùng làm việc, và rất dễ viết Unit Test độc lập."

---

### Câu 3: Giả sử sau này dự án muốn chuyển từ Cloudinary sang AWS S3 hoặc MinIO, bạn sẽ phải sửa những gì?
**Gợi ý trả lời:**
- "Nhờ áp dụng nguyên lý **Dependency Inversion** của Clean Architecture, tầng Application hoàn toàn không biết Cloudinary là gì mà chỉ phụ thuộc vào `IFileStorageService`.
- Do đó, khi cần chuyển sang AWS S3:
  1. Tôi chỉ cần tạo một class mới `S3FileStorageService` trong tầng `Infrastructure` implement `IFileStorageService`.
  2. Bổ sung cấu hình AWS S3 trong `appsettings.json`.
  3. Trong `DependencyInjection.cs` của Infrastructure, chỉ cần thay đổi một dòng đăng ký: đổi `services.AddScoped<IFileStorageService, CloudinaryFileStorageService>()` thành `services.AddScoped<IFileStorageService, S3FileStorageService>()`.
  4. Tầng Application, Domain và API Controller hoàn toàn **không cần sửa một dòng code nào**."

---

## 2. Bảo mật & Xử lý lỗi (Security & Error Handling)

### Câu 4: Làm thế nào bạn bảo vệ hệ thống trước lỗ hổng IDOR/BOLA khi người dùng yêu cầu xóa tệp tin?
**Gợi ý trả lời:**
- "**IDOR (Insecure Direct Object Reference)** xảy ra khi client truyền ID của một tài nguyên và server xóa luôn tài nguyên đó mà không kiểm tra xem người dùng đó có thực sự sở hữu nó hay không.
- Để phòng tránh điều này, trong `DeleteMediaFileCommandHandler`:
  1. Tôi lấy `userId` an toàn từ JWT Token đã được xác thực qua `ICurrentUser` (được đọc từ ClaimsPrincipal trong HttpContext, client không thể can thiệp).
  2. Tra cứu `MediaFile` từ database theo `request.FileId`.
  3. Kiểm tra logic phân quyền: Nếu người dùng không phải là `Admin` VÀ `mediaFile.OwnerId != userId`, hệ thống lập tức ngắt luồng và quăng ngoại lệ `AppException` với mã lỗi `403 Forbidden` (`MEDIA_FILE_FORBIDDEN`).
  4. Chỉ khi người gọi đúng là chủ sở hữu hoặc là Admin thì hệ thống mới tiến hành xóa file trên Cloudinary và xóa bản ghi trong database."

*Code minh họa:* [DeleteMediaFileCommandHandler.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Application/Features/Media/Commands/DeleteMediaFile/DeleteMediaFileCommandHandler.cs#L50-L60)

---

### Câu 5: Bạn xử lý bài toán toàn vẹn dữ liệu (Consistency) như thế nào giữa việc upload file lên bên thứ ba (Cloudinary) và lưu bản ghi vào Database?
**Gợi ý trả lời:**
- "Vì Cloudinary và PostgreSQL là hai hệ thống độc lập không nằm trong cùng một Distributed Transaction, nên có bài toán phân tán giữa hai bên:
  - Nếu ta lưu DB trước rồi mới upload Cloudinary: Khi upload Cloudinary thất bại do rớt mạng, trong database sẽ có bản ghi rác trỏ tới URL không tồn tại.
  - Vì vậy, giải pháp của tôi là: **Upload lên Cloudinary trước**, khi có kết quả URL và `PublicId` thành công thì mới bắt đầu ghi vào DB qua Unit of Work.
  - Tuy nhiên, phương án này có một trade-off: Nếu Cloudinary upload thành công nhưng DB bị crash/lỗi kết nối thì sẽ tạo ra 'file mồ côi' (orphan file) trên Cloudinary.
  - Để giải quyết triệt để rủi ro này khi hệ thống lớn lên, giải pháp tối ưu là chạy một **Background Job (ví dụ qua Hangfire)** định kỳ đối soát tài nguyên trên Cloudinary và bảng `media_files` để tự động dọn dẹp các tệp mồ côi."

---

### Câu 6: Làm thế nào bạn ngăn chặn việc người dùng upload mã độc hoặc tệp tin quá lớn làm cạn kiệt tài nguyên máy chủ?
**Gợi ý trả lời:**
- "Hệ thống áp dụng cơ chế phòng vệ nhiều lớp:
  1. **Validation ở API Controller:** Kiểm tra file không được rỗng (`file is null || file.Length == 0`).
  2. **Validation ở Application Handler:**
     - Whitelist loại tệp: Chỉ chấp nhận các MIME type được định nghĩa rõ ràng (`image/jpeg`, `image/png`, `image/webp` đối với hình ảnh; `application/pdf` đối với tài liệu CV). Bất kỳ định dạng nào khác (như `.exe`, `.sh`, `.php`, `.js`) đều bị từ chối với lỗi `400 Bad Request`.
     - Giới hạn kích thước tối đa: Ảnh không quá 5 MB, PDF không quá 10 MB để ngăn chặn tấn công DoS tràn bộ nhớ.
  3. **Truyền Stream trực tiếp:** Đọc stream qua `file.OpenReadStream()` và chuyển tiếp trực tiếp sang Cloudinary SDK, không lưu tạm file vào ổ cứng máy chủ và không nạp toàn bộ mảng byte vào bộ nhớ RAM, giúp giải phóng tài nguyên ngay lập tức."

---

## 3. Câu hỏi về C#, .NET & Entity Framework Core

### Câu 7: Tại sao bạn tạo Entity `MediaFile` với các setter là `private` và cung cấp static factory method `Create(...)`?
**Gợi ý trả lời:**
- "Đây là nguyên tắc **Encapsulation (Đóng gói)** trong thiết kế Domain-Driven Design (DDD):
  - Nếu để các setter là `public`, bất kỳ đoạn code nào ở bên ngoài cũng có thể tự do sửa đổi trạng thái của Entity (ví dụ gán bừa URL hoặc sửa FileSize), khiến Entity rơi vào trạng thái không hợp lệ.
  - Bằng cách để private setter và cung cấp phương thức `MediaFile.Create(...)`, ta kiểm soát được việc khởi tạo một thực thể luôn đầy đủ các thông tin hợp lệ (Id, OwnerId, FileName, FileUrl, FileType, FileSize, PublicId, CreatedAt). Tầng Application chỉ có thể tạo Entity theo đúng hợp đồng nghiệp vụ mà Domain quy định."

---

### Câu 8: `PublicId` của Cloudinary được lưu vào database để làm gì?
**Gợi ý trả lời:**
- "Khi upload một file lên Cloudinary, Cloudinary sẽ định danh tệp tin đó bằng một `public_id` duy nhất (ví dụ: `images/avatar_abc123`).
- URL của ảnh có thể thay đổi hoặc có thể qua biến đổi (transformation), nhưng khi muốn **xóa tệp tin** khỏi Cloudinary thông qua API `DestroyAsync`, Cloudinary SDK bắt buộc phải nhận vào chính xác `public_id` này.
- Do đó, việc lưu `PublicId` vào bảng `media_files` là điều kiện tiên quyết để hệ thống có thể thực hiện thao tác xóa tệp tin an toàn từ máy chủ."
