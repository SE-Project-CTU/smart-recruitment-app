# 📘 QUY TẮC PHÁT TRIỂN BACKEND SMARTHIRE (.NET C#)

> **Mục đích**: Hướng dẫn tiêu chuẩn cho AI Agent và lập trình viên khi đọc, thiết kế hoặc code mở rộng tính năng trên Backend SmartHire (.NET 8/9, EF Core, PostgreSQL).

---

## 🏗️ 1. MÔ HÌNH KIẾN TRÚC TỔNG THỂ

Hệ thống tuân thủ **Clean Architecture 4 tầng** kết hợp **CQRS (MediatR)** và **Vertical Feature Slices**:

```
📁 Backend/src/
├── 🏛️ SmartHire.Domain          # Entities, Value Objects, Enums (Thuần C#, độc lập 100%)
├── 💼 SmartHire.Application     # CQRS Commands/Queries, Validators, DTOs, Interfaces
├── ⚙️ SmartHire.Infrastructure  # EF Core DbContext, Configurations, Repositories, Migrations
└── 🌐 SmartHire.API             # Controllers, Request Contracts, Middleware, Response Factory
```

### Dependency Rule (Bắt buộc)

- **Domain** không phụ thuộc bất kỳ layer nào.
- **Application** chỉ tham chiếu **Domain**.
- **Infrastructure** tham chiếu **Application** và **Domain**.
- **API** tham chiếu **Application** và **Infrastructure**.

---

## 📂 2. CẤU TRÚC THƯ MỤC CỐT LÕI

```
Backend/src/
├── SmartHire.Domain/
│   ├── Entities/                 # Domain Entities (JobPosting.cs, User.cs...)
│   └── Enums/                    # Domain Enums (JobPostingStatus.cs, JobLevel.cs...)
├── SmartHire.Application/
│   ├── Abstractions/             # Interfaces: Persistence (IRepository, IUnitOfWork), Security...
│   ├── Common/                   # Errors (AppErrorKind), Exceptions (AppException), Pagination
│   └── Features/{FeatureName}/   # Vertical Feature Slice:
│       ├── Commands/{Action}/    # Command, CommandHandler, CommandValidator
│       ├── Queries/{Action}/     # Query, QueryHandler
│       ├── DTOs/                 # Result models trả về
│       ├── Exceptions/           # {Feature}Exceptions.cs, {Feature}ErrorCodes.cs
│       └── Mapping/              # Mapper Entity -> Result DTO
├── SmartHire.Infrastructure/
│   └── Persistence/              # SmartHireDbContext, Configurations/, Repositories/, Migrations/
└── SmartHire.API/
    ├── Controllers/              # API Controllers
    ├── Contracts/Requests/       # Input DTOs từ Client
    └── Factories/                # ApiResponseFactory.cs
```

---

## 🧩 3. CÁC PATTERN & QUY TẮC CỐT LÕI

### 1. Envelope Response Chuẩn ([`ApiResponseFactory`](smart-recruitment-app/Backend/src/SmartHire.API/Factories/ApiResponseFactory.cs))

Mọi Controller action **bắt buộc** trả về qua `_responseFactory`:

- **Đơn lẻ**: `return Ok(_responseFactory.Success(result));` (hoặc `StatusCode(201, ...)`)
- **Phân trang (1-based)**: `return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalItems));`

### 2. Xử lý Lỗi: Exception-Driven (`AppException`)

Không dùng `Result<T>` trong Handler. Ném trực tiếp `AppException` với [`AppErrorKind`](smart-recruitment-app/Backend/src/SmartHire.Application/Common/Errors/AppErrorKind.cs):

- **Mapping HTTP**: `Validation` $\rightarrow$ 422, `NotFound` $\rightarrow$ 404, `BadRequest` $\rightarrow$ 400, `Forbidden` $\rightarrow$ 403, `Conflict` $\rightarrow$ 409.
- Mỗi Feature tạo static class `{Feature}Exceptions.cs` đóng vai trò factory ném lỗi:
  ```csharp
  internal static class JobPostingExceptions {
      public static AppException NotFound(Guid id) => new(
          AppErrorKind.NotFound, JobPostingErrorCodes.NotFound, "Job posting not found.");
      public static AppException Validation(IEnumerable<AppErrorDetail> details) => new(
          AppErrorKind.Validation, JobPostingErrorCodes.Invalid, "Validation failed.", details.ToArray());
  }
  ```
- `ApiExceptionHandler` middleware sẽ tự động bắt và trả về envelope `{ error: { code, message, details }, correlationId }`.

### 3. Validation: Static Explicit Validator + Validated Record

Không dùng FluentValidation qua pipeline ngầm. Sử dụng **Explicit Validated Record Pattern**:

```csharp
// 1. Validator tích lũy lỗi và trả về Validated Record sạch
internal static class CreateJobCommandValidator {
    public static ValidatedCreateJob Validate(CreateJobCommand cmd) {
        var errors = new List<AppErrorDetail>();
        if (string.IsNullOrWhiteSpace(cmd.Title))
            errors.Add(new("title", ValidationReasons.Required, "Title is required."));
        if (errors.Count > 0) throw JobExceptions.Validation(errors);
        return new ValidatedCreateJob(cmd.Title.Trim());
    }
}

// 2. Handler gọi ngay dòng đầu tiên
public async Task<JobResult> Handle(CreateJobCommand req, CancellationToken ct) {
    var valid = CreateJobCommandValidator.Validate(req);
    // Sử dụng valid.* an toàn, không cần check null/trim lại
}
```

### 4. Rich Domain Entity

- Constructor rỗng `private Job() { }` cho EF Core.
- Tạo mới qua static factory: `public static Job Create(...)`.
- Mọi property dùng `private set;`. Nghiệp vụ thay đổi trạng thái viết thành method: `.Close()`, `.Update(...)`.

### 5. Quản lý Giao dịch (`IUnitOfWork`)

Nghiệp vụ ghi nhiều bảng **bắt buộc** bọc trong `ExecuteInTransactionAsync`:

```csharp
return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
    await _repo.AddAsync(entity, ct);
    await _unitOfWork.SaveChangesAsync(ct);
    return Mapper.ToResult(entity);
}, cancellationToken);
```

---

## 🚀 4. QUY TRÌNH 7 BƯỚC MỞ RỘNG TÍNH NĂNG MỚI

Khi phát triển thêm 1 tính năng mới (Ví dụ: `BookmarkJob`), thực hiện đúng thứ tự:

| Bước                      | Tầng                       | Thư mục & Thao tác chính                                                                                                                                     |
| :------------------------ | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Domain**             | `SmartHire.Domain`         | Tạo Entity trong `Entities/` (private setter, static factory `Create`).                                                                                      |
| **2. Config & Migration** | `SmartHire.Infrastructure` | Tạo `Persistence/Configurations/{Entity}Configuration.cs` $\rightarrow$ Thêm `DbSet` vào `SmartHireDbContext` $\rightarrow$ Chạy `dotnet ef migrations add`. |
| **3. Abstraction**        | `SmartHire.Application`    | Khai báo `I{Entity}Repository.cs` trong `Abstractions/Persistence/`.                                                                                         |
| **4. Repository Impl**    | `SmartHire.Infrastructure` | Viết implementation trong `Persistence/Repositories/` $\rightarrow$ Đăng ký DI Scoped.                                                                       |
| **5. Feature Logic**      | `SmartHire.Application`    | Trong `Features/{FeatureName}/` tạo: DTOs, Exceptions/Codes, Command/Query + Validator + Handler.                                                            |
| **6. API Endpoint**       | `SmartHire.API`            | Tạo Request Contract (nếu cần) $\rightarrow$ Action trong Controller với `[Authorize]` và `_responseFactory`.                                                |
| **7. Viết tài liệu**      | `Docs/` hoặc báo cáo       | Mô tả API (endpoint, method, permission, request/response schema).                                                                                           |

---

## 📋 5. CHECKLIST TRƯỚC KHI HOÀN THÀNH

- [ ] **Biên dịch**: `dotnet build` đạt 0 warnings, 0 errors.
- [ ] **Phụ thuộc**: Domain và Application không tham chiếu Infrastructure.
- [ ] **Transaction**: Nghiệp vụ ghi nhiều bảng đã bọc trong `ExecuteInTransactionAsync`.
- [ ] **Lỗi**: Ném đúng `AppErrorKind` (422, 404, 403, 409) qua class `{Feature}Exceptions`.
- [ ] **Response Envelope**: Bọc qua `_responseFactory.Success` hoặc `_responseFactory.PagedOneBased`.
- [ ] **Phân quyền**: Có đầy đủ `[Authorize(Roles = ...)]` hoặc `[AllowAnonymous]`.
- [ ] **Migration**: Đã tạo migration cho bảng/cột mới trong database.
