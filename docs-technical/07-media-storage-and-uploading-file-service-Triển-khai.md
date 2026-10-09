# Tài liệu Triển khai: Task 07 — Media Storage & Uploading File Service

> **Trạng thái:** Hoàn thành (Completed)  
> **Branch:** `features/63-media-storage-and-uploading-file-service`  
> **Ngày thực hiện:** 09/10/2026  
> **Kiến trúc áp dụng:** Clean Architecture, CQRS (MediatR), Repository & Unit of Work Pattern  

---

## 1. Tổng quan

Task 07 triển khai hệ thống quản trị và tải lên tệp tin (Media Storage & Upload Service) phục vụ toàn bộ nền tảng tuyển dụng SmartHire, bao gồm:
- **Tải lên hình ảnh:** Ảnh đại diện (Avatar), Logo công ty, Thumbnail tin tuyển dụng (`/api/v1/media/upload/image`).
- **Tải lên tài liệu PDF:** Hồ sơ ứng tuyển (CV cá nhân), giấy phép kinh doanh / tài liệu xác minh công ty (`/api/v1/media/upload/pdf`).
- **Lấy metadata tệp tin:** Tra cứu thông tin tệp tin theo ID (`/api/v1/media/{id}`).
- **Xóa tệp tin an toàn:** Xóa tệp tin trên cả Cloud Storage và CSDL CSDL (`/api/v1/media/{id}`), kiểm soát quyền sở hữu chặt chẽ (chỉ Chủ sở hữu hoặc Admin mới có quyền xóa).

Dịch vụ đám mây sử dụng: **Cloudinary** (lưu trữ phân tán, tối ưu hóa CDN và bảo mật URL).

---

## 2. Bối cảnh & Hiện trạng trước khi thay đổi

Trước khi thực hiện Task 07:
- Database schema đã có bảng `media_files` (được tạo ở migration `20261004154700_AddApplicationAiAndMediaEntities.cs`), nhưng chưa có trường `public_id` để định danh và tương tác với các API của bên thứ 3 (như Cloudinary).
- Domain entity `MediaFile` chỉ có các private properties và constructor rỗng, chưa có factory method để khởi tạo an toàn.
- `IMediaFileRepository` chỉ có phương thức đọc `GetByIdAsync(Guid fileId, CancellationToken cancellationToken)`, chưa có `AddAsync` hoặc `Delete`.
- Hệ thống hoàn toàn thiếu abstraction lưu trữ file (`IFileStorageService`) và chưa có các controller/use case xử lý upload và xóa file.
- Cấu trúc thư mục trong `Application/Features` trước đó chưa được chuẩn hóa theo mô hình `Commands` và `Queries`.

---

## 3. Giải pháp & Kiến trúc luồng xử lý

### 3.1. Phân chia Layer theo Clean Architecture
1. **Domain (`SmartHire.Domain`):**
   - Bổ sung trường `PublicId` vào `MediaFile` entity để theo dõi resource ID phía Cloudinary.
   - Bổ sung factory method `MediaFile.Create(...)` nhằm bảo toàn tính đóng gói (encapsulation).
2. **Application (`SmartHire.Application`):**
   - **Abstractions:** Định nghĩa `IFileStorageService` cùng `FileUploadResult` trong thư mục `Abstractions/Storage/`.
   - **Features/Media:** Tổ chức tách bạch thành `Commands/` và `Queries/`:
     - `Commands/UploadImage`: Tiếp nhận stream ảnh, validate MIME và kích thước (<= 5MB), gọi storage upload vào thư mục `images`, tạo entity `MediaFile`, ghi DB qua UnitOfWork.
     - `Commands/UploadPdf`: Tiếp nhận stream PDF, validate MIME `application/pdf` và kích thước (<= 10MB), upload vào thư mục `documents`, tạo entity `MediaFile`, ghi DB qua UnitOfWork.
     - `Commands/DeleteMediaFile`: Kiểm tra authentication, kiểm tra quyền sở hữu (Owner hoặc Admin), xóa tệp tin trên Cloudinary, xóa bản ghi trong DB.
     - `Queries/GetMediaFile`: Đọc metadata tệp theo ID, trả về `MediaFileResult`.
3. **Infrastructure (`SmartHire.Infrastructure`):**
   - Cài đặt `CloudinaryFileStorageService` triển khai `IFileStorageService` dùng thư viện `CloudinaryDotNet`.
   - Cấu hình options `CloudinaryOptions` đọc từ section `Cloudinary`.
   - Triển khai `AddAsync` và `Delete` trong `MediaFileRepository`.
   - Cấu hình Entity Framework Core `MediaFileConfiguration` và sinh Migration `20261009125905_AddPublicIdToMediaFile`.
4. **Presentation / API (`SmartHire.API`):**
   - `MediaController`: Cung cấp 4 RESTful endpoints, chuyển tiếp request sang MediatR, chuẩn hóa response qua `ApiResponseFactory`.
   - Phân quyền endpoint với `[Authorize(Roles = RoleNames.Candidate + "," + RoleNames.Recruiter + "," + RoleNames.Admin)]`.

### 3.2. Sơ đồ tuần tự Upload (Sequence Diagram)

```
[Client]                [MediaController]             [MediatR Handler]           [Cloudinary]          [PostgreSQL]
   |                           |                             |                         |                     |
   |-- POST /upload/image ---->|                             |                         |                     |
   |   (multipart/form-data)   |-- Send(UploadImageCommand)->|                         |                     |
   |                           |                             |-- Validate MIME & Size  |                     |
   |                           |                             |-- UploadAsync(stream) ->|                     |
   |                           |                             |<-- FileUrl & PublicId --|                     |
   |                           |                             |-- MediaFile.Create()    |                     |
   |                           |                             |-- Repo.AddAsync() --------------------------->|
   |                           |                             |-- UnitOfWork.SaveChanges() ------------------>|
   |                           |<-- MediaFileResult ---------|                         |                     |
   |<-- 201 Created (JSON) ----|                             |                         |                     |
```

---

## 4. Danh sách File thay đổi & Mục đích

| STT | Đường dẫn file | Thao tác | Mục đích / Trách nhiệm |
| :--- | :--- | :--- | :--- |
| 1 | `Backend/src/SmartHire.Domain/Entities/MediaFile.cs` | Sửa | Thêm `PublicId` property và factory method `Create(...)`. |
| 2 | `Backend/src/SmartHire.Infrastructure/Persistence/Configurations/MediaFileConfiguration.cs` | Sửa | Cấu hình cột `public_id` với độ dài tối đa 512 ký tự trong PostgreSQL. |
| 3 | `Backend/src/SmartHire.Infrastructure/Persistence/Migrations/20261009125905_AddPublicIdToMediaFile.cs` | Thêm | EF Core Migration tạo cột `public_id` trên bảng `media_files`. |
| 4 | `Backend/src/SmartHire.Application/Abstractions/Storage/IFileStorageService.cs` | Thêm | Interface abstraction cho dịch vụ lưu trữ file, decoupling Application khỏi Cloudinary SDK. |
| 5 | `Backend/src/SmartHire.Application/Abstractions/Persistence/IMediaFileRepository.cs` | Sửa | Thêm khai báo `AddAsync` và `Delete` cho repository. |
| 6 | `Backend/src/SmartHire.Infrastructure/Persistence/Repositories/MediaFileRepository.cs` | Sửa | Cài đặt `AddAsync` và `Delete` qua `DbSet<MediaFile>`. |
| 7 | `Backend/src/SmartHire.Application/Common/Errors/ErrorCodes/MediaErrorCodes.cs` | Thêm | Định nghĩa các hằng số mã lỗi chuẩn cho Media feature. |
| 8 | `Backend/src/SmartHire.Application/Features/Media/MediaFileResult.cs` | Thêm | Shared DTO đại diện kết quả tệp tin trả về cho client. |
| 9 | `Backend/src/SmartHire.Application/Features/Media/Commands/UploadImage/UploadImageCommand.cs` | Thêm | MediatR Command chứa dữ liệu stream ảnh và metadata upload. |
| 10 | `Backend/src/SmartHire.Application/Features/Media/Commands/UploadImage/UploadImageCommandHandler.cs` | Thêm | Handler xử lý logic xác thực ảnh, đẩy lên Cloudinary và lưu DB. |
| 11 | `Backend/src/SmartHire.Application/Features/Media/Commands/UploadPdf/UploadPdfCommand.cs` | Thêm | MediatR Command upload tài liệu PDF. |
| 12 | `Backend/src/SmartHire.Application/Features/Media/Commands/UploadPdf/UploadPdfCommandHandler.cs` | Thêm | Handler xử lý logic xác thực PDF, đẩy lên Cloudinary và lưu DB. |
| 13 | `Backend/src/SmartHire.Application/Features/Media/Commands/DeleteMediaFile/DeleteMediaFileCommand.cs` | Thêm | MediatR Command chứa Id tệp cần xóa và result DTO. |
| 14 | `Backend/src/SmartHire.Application/Features/Media/Commands/DeleteMediaFile/DeleteMediaFileCommandHandler.cs` | Thêm | Handler kiểm tra authentication/authorization, xóa trên Cloudinary và xóa trong DB. |
| 15 | `Backend/src/SmartHire.Application/Features/Media/Queries/GetMediaFile/GetMediaFileQuery.cs` | Thêm | MediatR Query tra cứu thông tin tệp theo Id. |
| 16 | `Backend/src/SmartHire.Application/Features/Media/Queries/GetMediaFile/GetMediaFileQueryHandler.cs` | Thêm | Handler đọc thông tin tệp qua repository. |
| 17 | `Backend/src/SmartHire.Infrastructure/Storage/CloudinaryOptions.cs` | Thêm | Strongly-typed class chứa cấu hình Cloudinary (`CloudName`, `ApiKey`, `ApiSecret`). |
| 18 | `Backend/src/SmartHire.Infrastructure/Storage/CloudinaryFileStorageService.cs` | Thêm | Triển khai `IFileStorageService` kết nối Cloudinary API. |
| 19 | `Backend/src/SmartHire.Infrastructure/DependencyInjection.cs` | Sửa | Đăng ký `CloudinaryOptions` và `IFileStorageService` vào DI Container. |
| 20 | `Backend/src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj` | Sửa | Nâng cấp package `CloudinaryDotNet` lên bản 1.27.0. |
| 21 | `Backend/src/SmartHire.Application/Abstractions/Security/ICurrentUser.cs` | Sửa | Thêm `Roles` property để hỗ trợ kiểm tra vai trò người dùng trong Handler. |
| 22 | `Backend/src/SmartHire.API/Services/HttpCurrentUser.cs` | Sửa | Cài đặt lấy danh sách roles từ ClaimsPrincipal hiện tại (`role` và `ClaimTypes.Role`). |
| 23 | `Backend/src/SmartHire.API/Controllers/MediaController.cs` | Thêm | Controller cung cấp 4 endpoints chuẩn RESTful. |
| 24 | `.env.example` | Sửa | Thêm mẫu cấu hình biến môi trường cho Cloudinary. |

---

## 5. Lý do tổ chức Code & Áp dụng CQRS

1. **Tuân thủ Clean Architecture:**
   - `SmartHire.Application` tuyệt đối không phụ thuộc vào `CloudinaryDotNet` hay bất kỳ thư viện cloud SDK nào. Tất cả tương tác với storage đều thông qua abstraction `IFileStorageService`. Khi nhóm muốn chuyển sang AWS S3, Google Cloud Storage hay MinIO, chỉ cần viết implementation mới trong `Infrastructure` mà không phải sửa bất kỳ dòng code nào trong `Application`.
2. **Chia tách `Commands` và `Queries`:**
   - Thay vì gom chung các use case vào một thư mục phẳng hoặc một file service khổng lồ, tính năng Media được chia tách thành:
     - `Commands/`: Chịu trách nhiệm cho các thao tác thay đổi trạng thái (Write operations) gồm `UploadImage`, `UploadPdf`, `DeleteMediaFile`.
     - `Queries/`: Chịu trách nhiệm cho thao tác đọc dữ liệu (Read operations) gồm `GetMediaFile`.
   - Mỗi use case có Command/Query riêng và Handler riêng, đảm bảo **Single Responsibility Principle (SRP)**, dễ viết Unit Test và tránh xung đột mã nguồn khi nhiều lập trình viên cùng làm việc.

---

## 6. Kỹ thuật áp dụng

- **Cloudinary SDK (`CloudinaryDotNet 1.27.0`):** Sử dụng `ImageUploadParams` cho hình ảnh và `RawUploadParams` cho tệp PDF để tối ưu định dạng phân phối và bảo toàn nguyên vẹn tệp binary.
- **EF Core 10 & PostgreSQL:** Quản lý bảng `media_files` với cơ chế migration tự động chạy khi khởi động ứng dụng.
- **MediatR:** Đóng gói request và phân luồng độc lập, tách rời tầng Controller khỏi Business Logic.
- **ASP.NET Core Authentication & Authorization:** Tích hợp kiểm tra JWT Bearer Token, kiểm tra quyền theo Role (`Candidate`, `Recruiter`, `Admin`).

---

## 7. Đánh giá Trade-off kỹ thuật

1. **Upload Cloudinary trước hay Ghi DB trước?**
   - *Lựa chọn:* Upload lên Cloudinary trước, nếu thành công mới insert bản ghi vào DB.
   - *Lý do:* Nếu insert DB trước mà upload lỗi, DB sẽ có bản ghi "rác" trỏ tới URL không tồn tại. Nếu upload xong mà insert DB lỗi, file nằm trên Cloudinary nhưng chưa ai biết tới.
   - *Trade-off:* Trong trường hợp hiếm hoi DB bị lỗi sau khi Cloudinary đã lưu file thành công, file đó sẽ trở thành "file mồ côi" (orphan file) trên Cloudinary. Để xử lý triệt để trong tương lai, nhóm có thể cài đặt Outbox Pattern hoặc một background cron job quét và xóa các file trên Cloudinary không có bản ghi tương ứng trong `media_files`.
2. **Backend Proxy Upload vs. Direct Client Upload (Presigned URL):**
   - *Lựa chọn:* Upload qua Backend (`IFormFile` stream -> Controller -> Handler -> Cloudinary).
   - *Lý do:* Kiểm soát 100% việc xác thực định dạng, kiểm tra dung lượng phía server, gắn chính xác `owner_id` từ JWT token mà không sợ client giả mạo metadata. Phù hợp tuyệt đối với giai đoạn hiện tại của hệ thống.
   - *Trade-off:* Tiêu tốn băng thông của máy chủ backend khi có lưu lượng upload lớn. Khi quy mô tăng trưởng vượt trội, hệ thống có thể nâng cấp sang mô hình Backend cấp Presigned Signature / URL để client upload trực tiếp lên Cloudinary.

---

## 8. Bảo mật (Security)

1. **Xác thực và Phân quyền:**
   - Toàn bộ endpoints trên `MediaController` yêu cầu Bearer JWT Token hợp lệ của các role: `Candidate`, `Recruiter`, `Admin`.
2. **Chống tấn công IDOR / BOLA (Insecure Direct Object Reference) khi xóa file:**
   - Trong `DeleteMediaFileCommandHandler`, hệ thống so sánh `mediaFile.OwnerId != userId`.
   - Chỉ người upload sở hữu file hoặc người có quyền `Admin` mới được phép xóa file. Bất kỳ người dùng nào cố tình truyền `id` của file người khác đều bị từ chối với mã lỗi `403 Forbidden` (`MEDIA_FILE_FORBIDDEN`).
3. **Server-side Validation:**
   - Client có thể giả mạo header, do đó server kiểm tra whitelist Content-Type:
     - Image: `image/jpeg`, `image/png`, `image/webp`.
     - PDF: `application/pdf`.
   - Giới hạn kích thước tối đa: 5 MB cho Image và 10 MB cho PDF để chống tấn công cạn kiệt tài nguyên (Denial of Service).
4. **Bảo mật Credentials:**
   - `Cloudinary__ApiKey` và `Cloudinary__ApiSecret` chỉ được cấu hình qua biến môi trường hoặc User Secrets, tuyệt đối không commit lên Git repository.

---

## 9. Khả năng mở rộng (Scalability)

- **Storage Provider Swapping:** Nhờ `IFileStorageService`, việc thay thế Cloudinary bằng AWS S3, Cloudflare R2 hoặc MinIO chỉ cần cài đặt một class mới kế thừa interface.
- **Async Streaming I/O:** Sử dụng `OpenReadStream()` từ `IFormFile` và truyền stream trực tiếp sang Cloudinary SDK, không nạp toàn bộ file vào RAM dưới dạng `byte[]`, giúp tiết kiệm bộ nhớ máy chủ khi nhiều người cùng upload.
- **CDN Caching:** Cloudinary tự động tối ưu hóa và phân phối file qua mạng lưới CDN toàn cầu với URL an toàn HTTPS.

---

## 10. Cấu hình Môi trường (.env)

Trong file `.env.example` ở root repository đã được bổ sung cấu hình mẫu:
```env
# --- Cloudinary Storage (Media & File Upload Service) ---
Cloudinary__CloudName=<your_cloudinary_cloud_name>
Cloudinary__ApiKey=<your_cloudinary_api_key>
Cloudinary__ApiSecret=<your_cloudinary_api_secret>
```

Cách lấy thông tin Cloudinary:
1. Đăng ký tài khoản miễn phí tại [Cloudinary Console](https://cloudinary.com/).
2. Tại mục **Dashboard / Product Environment Details**, sao chép:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Điền các giá trị trên vào file `.env` tại thư mục `Backend/.env` (hoặc biến môi trường hệ thống).

---

## 11. Hướng dẫn Kiểm thử Chi tiết (Testing Guide)

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ HEADER `X-Correlation-ID`:**
> Hệ thống áp dụng `CorrelationIdMiddleware` bắt buộc **tất cả request** gửi vào `/api` phải có Header:
> - **Header Name:** `X-Correlation-ID`
> - **Định dạng:** UUID v4 (ví dụ: `550e8400-e29b-41d4-a716-446655440000`)
> - Nếu thiếu header này: Nhận lỗi HTTP `400 Bad Request` (`CORRELATION_ID_REQUIRED`).
> - Nếu header không đúng định dạng UUID: Nhận lỗi HTTP `400 Bad Request` (`CORRELATION_ID_INVALID`).
> - *Trên Swagger UI:* Đã được cấu hình qua `AddOperationTransformer` trong `Program.cs`. Khi chạy ứng dụng, mỗi endpoint trong Swagger UI sẽ hiển thị ô nhập trường `X-Correlation-ID` bắt buộc.

---

### 11.1. Chuẩn bị Môi trường Kiểm thử

1. **Khởi động Backend:**
   ```powershell
   cd Backend
   dotnet run --project src/SmartHire.API
   ```
2. **Lấy Access Token để test:**
   Gửi request `POST http://localhost:5190/api/v1/auth/login`:
   - **Headers:** `Content-Type: application/json`, `X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000`
   - **Body:**
     ```json
     {
       "email": "candidate@example.com",
       "password": "Password123@"
     }
     ```
   - **Lưu lại:** `accessToken` từ trường `data.accessToken` trong response.

---

### 11.2. Hướng dẫn Thiết lập & Kiểm thử bằng POSTMAN

Để kiểm thử chuyên nghiệp và tái sử dụng, hãy tạo một **Postman Collection** tên `SmartHire - Media Service` và cấu hình **Environment**:

#### Bước A — Tạo Postman Environment Variables:
| Variable Name | Initial / Current Value | Ghi chú |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:5190` | Địa chỉ API host |
| `correlationId` | `550e8400-e29b-41d4-a716-446655440000` | UUID cố định để test |
| `accessToken` | `<paste_token_nhận_được_ở_đây>` | JWT Bearer Token |
| `fileId` | *(để trống, sẽ lưu từ response upload)* | ID của tệp tin vừa tạo |

---

#### Request 1: Tải lên hình ảnh (Upload Image)
* **Method & URL:** `POST {{baseUrl}}/api/v1/media/upload/image`
* **Tab Headers:**
  * `Authorization`: `Bearer {{accessToken}}`
  * `X-Correlation-ID`: `{{correlationId}}`
  * *(Lưu ý: Không tự điền `Content-Type`, Postman sẽ tự động sinh multipart boundary).*
* **Tab Body:**
  * Chọn kiểu: **form-data**
  * Thêm key:
    - **Key:** `file` (rê chuột vào bên phải ô Key, chọn kiểu dropdown là **File**)
    - **Value:** Chọn một file ảnh từ máy tính (`.jpg`, `.png`, hoặc `.webp`, dung lượng < 5MB).
* **Kết quả mong đợi:** HTTP `201 Created`
  ```json
  {
    "data": {
      "id": "e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a",
      "ownerId": "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
      "fileName": "avatar.png",
      "fileUrl": "https://res.cloudinary.com/sj8fpomh/image/upload/.../avatar.png",
      "fileType": "image/png",
      "fileSize": 204850,
      "createdAt": "2026-10-09T13:30:00Z"
    },
    "meta": {},
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
  *(Sao chép giá trị `id` vừa nhận được gán vào biến `fileId` trong Postman).*

---

#### Request 2: Tải lên tệp PDF CV (Upload PDF Document)
* **Method & URL:** `POST {{baseUrl}}/api/v1/media/upload/pdf`
* **Tab Headers:**
  * `Authorization`: `Bearer {{accessToken}}`
  * `X-Correlation-ID`: `{{correlationId}}`
* **Tab Body:**
  * Chọn kiểu: **form-data**
  * Thêm key:
    - **Key:** `file` (kiểu **File**)
    - **Value:** Chọn một file `.pdf` từ máy tính (dung lượng < 10MB).
* **Kết quả mong đợi:** HTTP `201 Created`
  ```json
  {
    "data": {
      "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "ownerId": "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
      "fileName": "Nguyen_Van_A_CV.pdf",
      "fileUrl": "https://res.cloudinary.com/sj8fpomh/raw/upload/.../Nguyen_Van_A_CV.pdf",
      "fileType": "application/pdf",
      "fileSize": 1048576,
      "createdAt": "2026-10-09T13:35:00Z"
    },
    "meta": {},
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

---

#### Request 3: Xem thông tin metadata của tệp (Get File Metadata)
* **Method & URL:** `GET {{baseUrl}}/api/v1/media/{{fileId}}`
* **Tab Headers:**
  * `Authorization`: `Bearer {{accessToken}}`
  * `X-Correlation-ID`: `{{correlationId}}`
* **Kết quả mong đợi:** HTTP `200 OK`
  ```json
  {
    "data": {
      "id": "{{fileId}}",
      "ownerId": "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
      "fileName": "avatar.png",
      "fileUrl": "https://res.cloudinary.com/sj8fpomh/image/upload/...",
      "fileType": "image/png",
      "fileSize": 204850,
      "createdAt": "2026-10-09T13:30:00Z"
    },
    "meta": {},
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

---

#### Request 4: Xóa tệp tin an toàn (Delete File) & Kiểm tra Phân quyền
* **Method & URL:** `DELETE {{baseUrl}}/api/v1/media/{{fileId}}`
* **Tab Headers:**
  * `Authorization`: `Bearer {{accessToken}}`
  * `X-Correlation-ID`: `{{correlationId}}`
* **Kiểm tra logic phân quyền (Security Enforcement):**
  1. **Trường hợp Owner xóa file của chính mình:**
     - Người gửi là user sở hữu file (`ownerId == userId`).
     - **Kết quả mong đợi:** HTTP `200 OK`
       ```json
       {
         "data": {
           "id": "{{fileId}}",
           "deleted": true
         },
         "meta": {},
         "correlationId": "550e8400-e29b-41d4-a716-446655440000"
       }
       ```
  2. **Trường hợp IDOR: User khác cố tình xóa file không phải của mình:**
     - Đăng nhập bằng tài khoản thứ hai (User B).
     - Gửi request `DELETE {{baseUrl}}/api/v1/media/{{fileId}}` với token của User B.
     - **Kết quả mong đợi:** HTTP `403 Forbidden`
       ```json
       {
         "error": {
           "code": "MEDIA_FILE_FORBIDDEN",
           "message": "You do not have permission to delete this file."
         },
         "correlationId": "550e8400-e29b-41d4-a716-446655440000"
       }
       ```
  3. **Trường hợp Admin xóa file của bất kỳ ai:**
     - Đăng nhập bằng tài khoản có role `Admin`.
     - Gửi request `DELETE {{baseUrl}}/api/v1/media/{{fileId}}`.
     - Hệ thống phát hiện role `Admin` và cho phép xóa ngay cả khi không phải owner.
     - **Kết quả mong đợi:** HTTP `200 OK`.

---

### 11.3. Ma trận Test Cases chi tiết trên Postman (Validation & Error Scenarios)

| Case ID | Endpoint | Tình huống kiểm thử | Thiết lập Request trong Postman | Kết quả mong đợi (HTTP Status & Response Code) |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Bất kỳ | **Thiếu Header X-Correlation-ID** | Bỏ chọn header `X-Correlation-ID` | `400 Bad Request` — `"code": "CORRELATION_ID_REQUIRED"` |
| **TC-02** | Bất kỳ | **Header X-Correlation-ID sai UUID** | `X-Correlation-ID: 12345-abc` | `400 Bad Request` — `"code": "CORRELATION_ID_INVALID"` |
| **TC-03** | Bất kỳ | **Không gửi Access Token** | Bỏ chọn header `Authorization` | `401 Unauthorized` |
| **TC-04** | `POST /upload/image` | **Upload ảnh thành công** | form-data key `file` là file `.png` 2MB | `201 Created` — URL Cloudinary an toàn |
| **TC-05** | `POST /upload/image` | **Không chọn file (file rỗng)** | form-data không có key `file` hoặc file 0 byte | `400 Bad Request` — `"code": "VALIDATION_ERROR"` |
| **TC-06** | `POST /upload/image` | **Upload file sai định dạng (PDF)** | form-data key `file` chọn file `.pdf` | `400 Bad Request` — `"code": "VALIDATION_ERROR"` (`INVALID_FORMAT`) |
| **TC-07** | `POST /upload/image` | **Ảnh vượt quá dung lượng (> 5MB)** | form-data key `file` chọn ảnh 6MB | `400 Bad Request` — `"code": "VALIDATION_ERROR"` (`MAX_LENGTH`) |
| **TC-08** | `POST /upload/pdf` | **Upload PDF CV thành công** | form-data key `file` chọn file `.pdf` 3MB | `201 Created` — URL Cloudinary raw file |
| **TC-09** | `POST /upload/pdf` | **Upload file sai định dạng (Word/Ảnh)** | form-data key `file` chọn file `.docx` hoặc `.jpg` | `400 Bad Request` — `"code": "VALIDATION_ERROR"` (`INVALID_FORMAT`) |
| **TC-10** | `POST /upload/pdf` | **PDF vượt quá dung lượng (> 10MB)** | form-data key `file` chọn PDF 12MB | `400 Bad Request` — `"code": "VALIDATION_ERROR"` (`MAX_LENGTH`) |
| **TC-11** | `GET /media/:id` | **Tra cứu tệp không tồn tại** | `:id` là UUID ngẫu nhiên chưa từng tạo | `404 Not Found` — `"code": "MEDIA_FILE_NOT_FOUND"` |
| **TC-12** | `DELETE /media/:id` | **Chặn IDOR (xóa file người khác)** | Token của User B gọi xóa file của User A | `403 Forbidden` — `"code": "MEDIA_FILE_FORBIDDEN"` |
| **TC-13** | `DELETE /media/:id` | **Chủ sở hữu xóa file thành công** | Token của User A xóa file của User A | `200 OK` — `"deleted": true` |
| **TC-14** | `DELETE /media/:id` | **Admin xóa file của bất kỳ ai** | Token của Admin xóa file của User A | `200 OK` — `"deleted": true` |

---

## 12. Kết quả Kiểm thử thực tế

- **Build solution:** `dotnet build Backend/SmartHire.slnx` thành công 100% với `0 Warning(s)`, `0 Error(s)`.
- **Database Migration:** Migration `20261009125905_AddPublicIdToMediaFile` đã được tạo và đồng bộ với `SmartHireDbContextModelSnapshot.cs`.

---

## 13. Giới hạn & Đề xuất Cải tiến

1. **Kiểm tra File Magic Bytes:** Hiện tại việc kiểm tra định dạng dựa trên MIME type và extension của `IFormFile`. Trong tương lai, có thể đọc một vài bytes đầu tiên (file signature / magic bytes) để ngăn chặn tuyệt đối việc đổi tên file nguy hại.
2. **Quét mã độc (Antivirus / Malware Scan):** Tích hợp ClamAV hoặc AWS GuardDuty để quét tệp tin đính kèm trước khi cho phép tải về.
3. **Background Cleaner Job:** Triển khai một Hangfire recurring job nhằm kiểm tra đối soát giữa bảng `media_files` và Cloudinary resources để dọn dẹp các tệp mồ côi nếu có sự cố mạng xảy ra.
