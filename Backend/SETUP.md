# SmartHire Backend Setup

Hướng dẫn này dành cho thành viên mới clone repository và chạy backend local. Các lệnh chạy từ thư mục `Backend` (Git Bash hoặc PowerShell, trừ khi có ghi chú).

## 1. Công cụ cần cài

- Git
- .NET 10 SDK
- Docker Desktop đang chạy (luôn mở và hiện chữ engine running góc trái, có Docker Compose plugin)
- Tuỳ chọn: PostgreSQL local `psql` để kết nối từ host

Kiểm tra .NET:

```bash
dotnet --info
dotnet --list-sdks
```

**Đạt khi:** danh sách SDK có phiên bản `10.x`.

Kiểm tra Docker:

```bash
docker version
docker compose version
```

**Đạt khi:** cả hai lệnh in ra phiên bản client/server. Nếu báo không kết nối được Docker daemon, mở Docker Desktop và đợi Engine chạy.

## 2. Khôi phục .NET tools

Từ repository root:

```bash
cd Backend
dotnet tool restore --tool-manifest ./dotnet-tools.json
dotnet ef --version
```

Manifest ghim `dotnet-ef` phiên bản `10.0.12`, đồng bộ với EF Core trong project.

**Đạt khi:** restore thành công và phiên bản hiển thị `Entity Framework Core .NET Command-line Tools 10.0.12`.

## 3. Tạo cấu hình local cho PostgreSQL

Compose hiện dùng PostgreSQL 16 kèm `pgvector`; phiên bản 16 đáp ứng yêu cầu PostgreSQL 16 trở lên. PostgreSQL 18.4 cài trực tiếp trên máy bạn là instance riêng, không được dùng ở cấu hình Compose này.

Tạo `.env` và `appsettings.json` cá nhân từ file mẫu.

Git Bash:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Git Bash:

```
cd ../Backend/src/SmartHire.API
cp appsettings.Development.json appsettings.json
```

Powershell:

```
Copy-Item appsettings.Development.json appsettings.json

```

Mở `.env` và thay `POSTGRES_PASSWORD=your_password` bằng mật khẩu riêng postgres ở local vừa tạo. Giữ các giá trị sau như mẫu nếu chưa có lý do đổi:

```dotenv
POSTGRES_DB=smarthire_dev
POSTGRES_USER=smarthire_app
POSTGRES_PASSWORD=<mat-khau-rieng-cua-ban>
POSTGRES_PORT=5433
```

**Không commit `.env`**. Commit `.env.example` để ba thành viên dùng chung tên biến/cấu trúc cấu hình; mỗi người tự tạo `.env` trên máy mình. `.gitignore` ở repository root đã ignore `.env` và cho phép theo dõi `.env.example`.

Kiểm tra Compose config:

```bash
docker compose config --quiet
```

**Đạt khi:** lệnh kết thúc không có lỗi. Nếu báo thiếu biến, kiểm tra `.env` nằm ngay trong `Backend` và có đủ biến.

## 4. Khởi động PostgreSQL và xác nhận database

```bash
docker compose up -d db
docker compose ps
```

Đợi healthcheck hoàn tất. **Đạt khi:** service `db` có trạng thái `Up` và `healthy`.

Kiểm tra phiên bản PostgreSQL và extension trong container:

```bash
docker compose exec db psql -U smarthire_app -d smarthire_dev -c "SELECT version();"
docker compose exec db psql -U smarthire_app -d smarthire_dev -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"
```

**Đạt khi:** câu đầu trả về PostgreSQL 16.x; câu thứ hai trả về extension `vector`. Database ban đầu có thể chưa có bảng nghiệp vụ; migrations sẽ tạo bảng ở bước 7.

Kiểm tra port host:

```bash
docker compose port db 5432
```

**Đạt khi:** kết quả có `127.0.0.1:5433` (hoặc port host khác nếu bạn đã đổi `POSTGRES_PORT`). Cổng container luôn là `5432`; cổng host mặc định `5433` để tránh đụng PostgreSQL cài trực tiếp trên máy thường dùng `5432`.

## 5. Cấu hình secrets cho API (mỗi máy một lần)

`UserSecretsId` trong `src/SmartHire.API/SmartHire.Api.csproj` là định danh không bí mật và cần commit cùng project. Giá trị secrets thật được lưu local bởi .NET User Secrets, không commit.

Đặt connection strings dùng cùng mật khẩu đã nhập trong `.env`:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=smarthire_dev;Username=smarthire_app;Password=<mat-khau-rieng-cua-ban-trong-env>" --project src/SmartHire.API/SmartHire.Api.csproj
dotnet user-secrets set "ConnectionStrings:HangfireConnection" "Host=localhost;Port=5433;Database=smarthire_dev;Username=smarthire_app;Password=<mat-khau-rieng-cua-ban-trong-env>" --project src/SmartHire.API/SmartHire.Api.csproj
```

Thay placeholder bằng đúng mật khẩu, bỏ dấu `< >`. Mỗi thành viên tự chạy lệnh trên máy riêng; không gửi giá trị secrets trong chat hoặc commit.

Kiểm tra tên keys mà không in ra giá trị bí mật:

```bash
dotnet user-secrets list --project src/SmartHire.API/SmartHire.Api.csproj
```

**Đạt khi:** danh sách có `ConnectionStrings:DefaultConnection` và `ConnectionStrings:HangfireConnection`.

> ASP.NET Core không tự đọc file `.env`. Compose đọc `.env` để tạo database; API đọc connection strings từ User Secrets trong Development.

## 6. Restore packages và build solution

```bash
dotnet restore SmartHire.slnx
dotnet build SmartHire.slnx --no-restore
```

**Đạt khi:** restore và build thành công, không có lỗi compile. API cần package `Microsoft.EntityFrameworkCore.Design` để chạy EF CLI; package hiện khai báo `PrivateAssets=all`.

## 7. Áp dụng migrations vào database

Migration `InitialCreate` đã được tạo và cần được commit cùng source. Thành viên mới chỉ áp dụng migrations hiện có, không tạo migration mới:

```bash
dotnet ef migrations list --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj --startup-project src/SmartHire.API/SmartHire.Api.csproj
dotnet ef database update --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj --startup-project src/SmartHire.API/SmartHire.Api.csproj
```

**Đạt khi:** danh sách có `20260923121932_InitialCreate`; cập nhật kết thúc `Done.`. Xác nhận migration được ghi nhận:

```bash
docker compose exec db psql -U smarthire_app -d smarthire_dev -c 'SELECT "MigrationId", "ProductVersion" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";'
```

Kết quả cần có `20260923121932_InitialCreate`. Nếu model chưa khai báo bảng nghiệp vụ, có thể chỉ thấy các bảng hệ thống/EF; điều đó không có nghĩa kết nối database bị lỗi.

### Tạo migration khi thay đổi schema sau này

Thành viên làm thay đổi model tạo migration, review và commit cả file migration lẫn `SmartHireDbContextModelSnapshot.cs`:

```bash
dotnet ef migrations add <TenMigration> --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj --startup-project src/SmartHire.API/SmartHire.Api.csproj --output-dir Persistence/Migrations
dotnet ef database update --project src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj --startup-project src/SmartHire.API/SmartHire.Api.csproj
```

Các thành viên còn lại pull migration đã commit rồi chạy `dotnet ef database update` với hai tham số project như trên. Không sửa migration đã áp dụng lên môi trường dùng chung; tạo migration mới để sửa schema.

## 8. Chạy API và kiểm tra Swagger UI

Git Bash:

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/SmartHire.API/SmartHire.Api.csproj
```

PowerShell:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project src/SmartHire.API/SmartHire.Api.csproj
```

Mở URL được in ra bởi `dotnet run`, thêm `/swagger` (ví dụ `https://localhost:<port>/swagger`). OpenAPI JSON ở `/openapi/v1.json`.

**Đạt khi:** Swagger UI tải được, hiển thị endpoint hiện có và gọi thử một endpoint nhận phản hồi HTTP. Nếu HTTPS yêu cầu tin cậy development certificate:

```bash
dotnet dev-certs https --trust
```

Swagger và Hangfire Dashboard hiện chỉ bật trong môi trường `Development`.

## 9. Hangfire cho background jobs

Hangfire đã đăng ký trong `src/SmartHire.API/Program.cs`, dùng PostgreSQL qua `HangfireConnection` và chạy worker bằng `AddHangfireServer()`. Dashboard local là `/hangfire`.

Khi thêm job:

1. Tạo class job có dependency được đăng ký trong DI; để job gọi Application service thực hiện nghiệp vụ.
2. Nhận đối số nhỏ, ổn định như ID bản ghi. Không truyền `DbContext`, entity lớn, `HttpContext`, file bytes hay secrets.
3. Thiết kế thao tác để retry an toàn và idempotent vì Hangfire có thể chạy lại job.
4. Queue job từ API bằng `IBackgroundJobClient` sau khi dữ liệu nghiệp vụ đã được lưu.

Ví dụ hình dạng code (đổi service theo nghiệp vụ thực tế):

```csharp
public sealed class ProcessResumeJob(IResumeProcessingService service)
{
    public Task ExecuteAsync(Guid resumeId, CancellationToken cancellationToken)
        => service.ProcessAsync(resumeId, cancellationToken);
}

// Trong controller/service đã inject IBackgroundJobClient:
backgroundJobs.Enqueue<ProcessResumeJob>(
    job => job.ExecuteAsync(resumeId, CancellationToken.None));
```

Trong job thực tế, log trạng thái bằng `ILogger<ProcessResumeJob>`, xử lý retry/failure có chủ đích, và lưu trạng thái nghiệp vụ nếu người dùng cần theo dõi. Chỉ mở dashboard cho người dùng đã được xác thực/ủy quyền khi triển khai ngoài local.

Đạt khi: Mở URL được in ra bởi dotnet run, thêm /hangfire (ví dụ `https://localhost:<port>/hangfire`).

## 10. NLog cho logging

NLog đã được nối vào host trong `Program.cs` bằng `builder.Logging.ClearProviders()` và `builder.Host.UseNLog()`. Dùng `ILogger<T>` qua DI và log có cấu trúc:

```csharp
logger.LogInformation("Queued resume processing for {ResumeId}", resumeId);
logger.LogWarning("Resume {ResumeId} could not be processed", resumeId);
logger.LogError(exception, "Resume processing failed for {ResumeId}", resumeId);
```

Không ghi password, connection string, token, CV đầy đủ, thông tin cá nhân nhạy cảm hoặc dữ liệu xác thực. Tránh nội suy chuỗi nếu muốn truy vấn log theo field; dùng placeholder có tên.

Khi cần cấu hình NLog rõ ràng cho console/file, tạo `src/SmartHire.API/NLog.config`, đặt targets/rules theo môi trường và giữ log local khỏi Git. Ví dụ tối thiểu cho console:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <targets>
    <target xsi:type="Console" name="console"
            layout="${longdate}|${level:uppercase=true}|${logger}|${message} ${exception:format=tostring}" />
  </targets>
  <rules>
    <logger name="Microsoft.*" minlevel="Warn" writeTo="console" />
    <logger name="*" minlevel="Info" writeTo="console" />
  </rules>
</nlog>
```

Sau khi thêm file, xác nhận nó được copy vào `bin/Debug/net10.0/NLog.config`; nếu chưa, thêm `CopyToOutputDirectory` và `CopyToPublishDirectory` metadata trong `.csproj`. Kiểm tra log xuất hiện khi chạy API và không chứa secrets/dữ liệu nhạy cảm.

## 11. Dừng môi trường local

Dừng container nhưng giữ dữ liệu:

```bash
docker compose down
```

Khởi động lại lần sau:

```bash
docker compose up -d db
```

Chỉ khi muốn xoá toàn bộ dữ liệu local mới dùng `docker compose down -v`; lệnh này xoá volume database trên máy đó.

## Quy ước nhóm

- Commit source, migrations, `compose.yaml`, `dotnet-tools.json`, `SETUP.md` và `.env.example`.
- Không commit `.env`, User Secrets, log, build output hoặc thông tin xác thực.
- Dùng chung tên database/user/port để giảm khác biệt giữa ba máy; mỗi thành viên giữ mật khẩu local riêng.
- Khi đổi thiết lập chung, cập nhật `.env.example` và tài liệu cùng pull request; không thêm secret thật vào ví dụ.
