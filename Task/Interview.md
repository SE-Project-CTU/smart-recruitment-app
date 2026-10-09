# Interview.md — Bộ câu hỏi phỏng vấn dự án (Intern Developer)

> **Mục tiêu:** Giúp thành viên giải thích được dự án bằng lời của mình, hiểu lý do thiết kế và biết chỉ ra code minh họa khi phỏng vấn Intern Backend / Fullstack.
>
> **Cách sử dụng:** Cập nhật file sau mỗi task đáng kể. Câu trả lời dưới đây là khung ôn tập, không phải kịch bản học thuộc. Trước buổi phỏng vấn, kiểm tra code hiện tại và thay mọi ví dụ bằng đúng implementation trong repository. Không nhận là đã triển khai tính năng chưa hoàn thành.

---

## 1. Giới thiệu dự án và phần đóng góp

### 1.1. Bạn hãy giới thiệu dự án trong 1–2 phút.

**Khung trả lời:**

- Dự án giải quyết vấn đề gì và nhóm người dùng chính là ai?
- Các chức năng quan trọng đã hoàn thành là gì? Phân biệt rõ chức năng đã hoàn thành và đang phát triển.
- Công nghệ chính đang dùng là gì và vì sao phù hợp với phạm vi dự án?
- Bạn phụ trách phần nào, đã đưa ra quyết định kỹ thuật nào và kết quả kiểm chứng ra sao?

**Câu hỏi đào sâu:** Nếu chỉ có 30 giây, bạn sẽ nêu điểm nổi bật nào? Chức năng nào là khó nhất và vì sao?

### 1.2. Bạn trực tiếp làm phần nào trong nhóm 3 người?

**Khung trả lời:** Nêu task, trách nhiệm cụ thể, file/layer liên quan, phần phối hợp với thành viên khác và cách tránh sửa trùng code. Chuẩn bị một ví dụ thực tế về review, xử lý conflict hoặc thống nhất API contract.

**Câu hỏi đào sâu:** Khi frontend và backend không thống nhất request/response, bạn phối hợp giải quyết như thế nào?

### 1.3. Một lỗi khó bạn từng gặp là gì? Bạn tìm nguyên nhân thế nào?

**Khung trả lời:** Mô tả triệu chứng → tái hiện lỗi → đọc log/stack trace → thu hẹp phạm vi → xác định nguyên nhân gốc → sửa → thêm test hoặc bước xác minh để tránh tái diễn.

**Câu hỏi đào sâu:** Bạn làm gì nếu không tái hiện được lỗi trên máy local?

---

## 2. Kiến trúc và cách tổ chức code

### 2.1. Hãy giải thích cấu trúc thư mục backend hiện tại.

**Khung trả lời:** Dùng đúng tên project/thư mục trong repository. Nêu trách nhiệm của từng phần và minh họa bằng một request cụ thể đi qua các thành phần nào. Tránh chỉ đọc tên folder mà không hiểu luồng xử lý.

**Chuẩn bị file minh họa:** README/architecture docs, API endpoint, use case/handler/service, entity, repository hoặc DbContext tương ứng.

### 2.2. Clean Architecture là gì? Dự án có áp dụng nó không?

**Gợi ý trả lời:** Clean Architecture hướng tới tách business rule khỏi chi tiết triển khai như database, framework và giao tiếp bên ngoài. Dependency nên hướng vào các quy tắc cốt lõi. Khi nói về dự án, chỉ nêu các layer thực tế đang có và giải thích mức độ áp dụng; không khẳng định dự án “thuần Clean Architecture” nếu còn coupling hoặc ngoại lệ.

**Câu hỏi đào sâu:** Lợi ích và chi phí của việc chia nhiều project/layer là gì? Với một ứng dụng nhỏ có cần chia nhiều layer không?

### 2.3. Vì sao không đặt toàn bộ logic vào Controller?

**Gợi ý trả lời:** Controller nên chịu trách nhiệm giao tiếp HTTP và điều phối request ở mức phù hợp. Nếu business logic nằm hết trong controller, việc test, tái sử dụng và bảo trì khó hơn. Logic nghiệp vụ nên đặt tại thành phần chịu trách nhiệm phù hợp theo kiến trúc hiện có.

**Câu hỏi đào sâu:** Controller có thể làm những việc gì? Khi nào một service/handler mới là cần thiết?

### 2.4. Domain, Application, Infrastructure và API khác nhau thế nào?

**Gợi ý trả lời nếu repository đang dùng các layer này:**

- **Domain:** mô hình và quy tắc nghiệp vụ cốt lõi.
- **Application:** các use case, luồng xử lý ứng dụng và abstraction cần thiết.
- **Infrastructure:** implementation cho database hoặc dịch vụ ngoài.
- **API:** nhận HTTP request, gọi luồng ứng dụng và trả HTTP response.

Đưa một class thực tế trong dự án làm ví dụ cho từng layer. Nếu cấu trúc thực tế khác, giải thích theo cấu trúc hiện tại thay vì ép theo định nghĩa mẫu.

### 2.5. Tại sao mỗi layer có thể có một lớp `DependencyInjection` riêng?

**Gợi ý trả lời:** Extension method như `AddApplication` hoặc `AddInfrastructure` giúp đóng gói việc đăng ký dependency trong chính project sở hữu chúng. Composition root (thường là API/entry point) có thể gọi các phương thức đó thay vì biết chi tiết từng service bên trong. Cách này giúp tổ chức cấu hình dễ đọc hơn, nhưng phải tránh đăng ký trùng và không dùng nó để che giấu dependency sai hướng.

**Câu hỏi đào sâu:** `IServiceCollection` là gì? `AddScoped`, `AddSingleton` và `AddTransient` khác nhau như thế nào?

### 2.6. Dependency Injection (DI) là gì? Tại sao nên dùng?

**Gợi ý trả lời:** DI cung cấp dependency từ bên ngoài thay vì class tự tạo implementation cụ thể. Nó giúp giảm coupling và làm cho việc thay thế implementation hoặc viết unit test dễ hơn.

**Câu hỏi đào sâu:** Nếu đăng ký một service có trạng thái dùng chung thành Singleton không đúng cách thì có thể gặp vấn đề gì? Vì sao `DbContext` thường không được chia sẻ tùy ý giữa nhiều request đồng thời?

### 2.7. MediatR là gì? Có đồng nghĩa với CQRS không?

**Gợi ý trả lời:** MediatR là thư viện hỗ trợ gửi request/notification tới handler, giúp caller không cần gọi trực tiếp handler cụ thể. CQRS là cách tách mô hình/thao tác đọc và ghi khi điều đó có lợi cho hệ thống. Dùng MediatR không tự động có nghĩa là đã áp dụng CQRS đầy đủ; phải giải thích cách dự án tổ chức query/command thực tế và lợi ích so với gọi service trực tiếp.

**Câu hỏi đào sâu:** MediatR có làm hệ thống phức tạp hơn không? Khi nào gọi service trực tiếp sẽ đơn giản hơn?

---

## 3. C# và .NET cơ bản

### 3.1. Interface khác abstract class như thế nào?

**Gợi ý trả lời:** Interface mô tả contract mà các implementation phải đáp ứng; một class có thể implement nhiều interface. Abstract class có thể chia sẻ state và implementation chung, nhưng class chỉ kế thừa một base class trực tiếp. Chọn dựa trên mối quan hệ và trách nhiệm thực tế, không chọn theo thói quen.

### 3.2. `async` / `await` dùng để làm gì?

**Gợi ý trả lời:** Hỗ trợ viết luồng bất đồng bộ dễ đọc, đặc biệt với I/O như truy vấn database hoặc gọi HTTP. Nó không tự động làm CPU-bound code chạy nhanh hơn và không có nghĩa là mỗi `async` method tạo một thread mới.

**Câu hỏi đào sâu:** Vì sao không nên gọi `.Result` hoặc `.Wait()` tùy tiện trong luồng async? `CancellationToken` có ích gì?

### 3.3. `IEnumerable<T>` và `IQueryable<T>` khác nhau thế nào?

**Gợi ý trả lời:** `IEnumerable<T>` thường biểu diễn việc duyệt dữ liệu trong bộ nhớ; `IQueryable<T>` biểu diễn query có thể được provider (ví dụ EF Core) chuyển thành câu truy vấn phù hợp. Cần chú ý thời điểm query được thực thi và tránh gọi `ToList()` quá sớm khiến dữ liệu lớn bị tải về trước khi lọc/phân trang.

### 3.4. Exception handling nên đặt ở đâu?

**Gợi ý trả lời:** Bắt lỗi tại nơi có thể xử lý hoặc bổ sung ngữ cảnh có ích. Với API, một exception-handling middleware/filter tập trung có thể chuẩn hóa lỗi; không nên bắt mọi exception rồi trả `200 OK` hoặc che mất nguyên nhân. Câu trả lời phải khớp cơ chế error handling thực tế của dự án.

### 3.5. DTO là gì? Tại sao không luôn trả entity trực tiếp?

**Gợi ý trả lời:** DTO định nghĩa dữ liệu trao đổi qua API hoặc giữa các ranh giới. DTO giúp kiểm soát field công khai, tránh lộ dữ liệu không cần thiết và giảm coupling giữa API với schema persistence. Không phải mọi tình huống đều cần nhiều DTO giống nhau; nên chọn theo mục đích và contract.

---

## 4. API, HTTP và validation

### 4.1. REST API là gì? GET, POST, PUT, PATCH và DELETE dùng khi nào?

**Gợi ý trả lời:** Nêu ý nghĩa của từng method theo contract API hiện tại. GET đọc dữ liệu; POST thường tạo tài nguyên hoặc khởi chạy xử lý; PUT thường thay thế trạng thái tài nguyên; PATCH cập nhật một phần; DELETE yêu cầu xóa tài nguyên. Cần xét tính idempotent và convention thực tế của endpoint.

### 4.2. Các HTTP status code thường dùng là gì?

**Gợi ý trả lời:**

- `200 OK`: request thành công và có response.
- `201 Created`: tạo tài nguyên thành công.
- `204 No Content`: thành công nhưng không trả body.
- `400 Bad Request`: request không hợp lệ theo contract.
- `401 Unauthorized`: chưa xác thực hoặc thông tin xác thực không hợp lệ.
- `403 Forbidden`: đã xác thực nhưng không có quyền.
- `404 Not Found`: không tìm thấy tài nguyên.
- `409 Conflict`: xung đột với trạng thái hiện tại, nếu phù hợp contract.
- `500 Internal Server Error`: lỗi không mong đợi phía server.

Không ép mọi lỗi vào các status trên; chọn status nhất quán với API contract và cách xử lý lỗi hiện có.

### 4.3. Validation nên được thực hiện ở đâu?

**Gợi ý trả lời:** Kiểm tra cấu trúc/dữ liệu request tại boundary API hoặc Application theo convention; business invariant phải được bảo vệ tại nơi thực sự sở hữu quy tắc đó. Frontend validation tốt cho trải nghiệm người dùng nhưng không thay thế server-side validation.

### 4.4. Vì sao cần phân biệt authentication và authorization?

**Gợi ý trả lời:** Authentication xác minh người dùng là ai; authorization xác định người dùng đó được phép làm gì. Một endpoint yêu cầu đăng nhập vẫn cần kiểm tra quyền thực hiện hành động hoặc quyền sở hữu tài nguyên khi nghiệp vụ yêu cầu.

### 4.5. Làm thế nào để test API?

**Gợi ý trả lời:** Dùng Swagger để khám phá endpoint và thử request nhanh trong môi trường phù hợp; dùng Postman để tổ chức request, biến môi trường, token và collection có thể chạy lại. Test cần có trường hợp thành công, validation lỗi, không tồn tại, sai quyền và side effect trong database. Test thủ công không thay thế unit/integration test tự động.

**Câu hỏi đào sâu:** Bạn kiểm tra ở đâu để biết một request POST đã lưu thành công, ngoài việc chỉ nhìn thấy status `200` hoặc `201`?

---

## 5. Database và EF Core

### 5.1. ORM là gì? EF Core giải quyết vấn đề gì?

**Gợi ý trả lời:** ORM ánh xạ giữa object trong code và dữ liệu quan hệ. EF Core hỗ trợ query, tracking, lưu thay đổi, mapping quan hệ và migration. Vẫn cần hiểu SQL, transaction, index và query được sinh ra; ORM không tự động làm mọi truy vấn tối ưu.

### 5.2. Migration là gì? Tại sao cần migration?

**Gợi ý trả lời:** Migration lưu lại các bước thay đổi schema theo thời gian, giúp đồng bộ database giữa môi trường và thành viên. Cần review migration trước khi áp dụng, đặc biệt với thao tác xóa/đổi cột hoặc chuyển dữ liệu.

### 5.3. `DbContext` là gì?

**Gợi ý trả lời:** `DbContext` đại diện cho một phiên làm việc với database, quản lý entity tracking và lưu thay đổi. Thường được dùng với lifetime ngắn theo unit of work/request trong web app; không nên dùng chung một instance tùy tiện giữa các request đồng thời.

### 5.4. Vì sao query có thể chậm dù code trông ngắn?

**Gợi ý trả lời:** Có thể do thiếu index, tải quá nhiều cột/bản ghi, N+1 query, phân trang không đúng, query plan kém hoặc gọi database quá nhiều lần. Cần đo đạc/log SQL và xem dữ liệu thực tế trước khi tối ưu.

### 5.5. Khi nào cần transaction?

**Gợi ý trả lời:** Khi nhiều thao tác cần thành công hoặc thất bại cùng nhau để duy trì tính nhất quán. Khi có cả database và dịch vụ ngoài, transaction database không tự rollback được thao tác bên ngoài; cần thiết kế xử lý lỗi, bù trừ hoặc retry an toàn.

---

## 6. Tích hợp dịch vụ bên thứ ba và cấu hình môi trường

### 6.1. Dự án tích hợp dịch vụ ngoài theo luồng nào?

**Khung trả lời:** Nêu request/luồng nào sử dụng dịch vụ, abstraction nằm ở đâu, implementation nằm ở đâu, cấu hình được đọc như thế nào và lỗi provider được xử lý ra sao. Chỉ kể các provider thực sự có trong code hiện tại.

### 6.2. Vì sao không hard-code API key hoặc password?

**Gợi ý trả lời:** Secret trong source có thể bị lộ qua Git, log, package hoặc bản build. Dùng cơ chế cấu hình theo môi trường/secret store phù hợp với hosting; repository chỉ giữ tên biến và placeholder. Nếu secret đã bị commit, chỉ xóa khỏi file là chưa đủ: cần rotate/revoke secret và xử lý lịch sử theo quy trình của nhóm.

### 6.3. `.env` và `.env.example` khác nhau thế nào?

**Gợi ý trả lời:** `.env` thường chứa giá trị thực ở môi trường local và không nên commit nếu chứa secret. `.env.example` là danh sách biến mẫu với placeholder để người khác biết cần cấu hình gì; không được chứa credential thật. Cần xác nhận ứng dụng thực sự đọc `.env` bằng cơ chế nào; với .NET, environment variables/appsettings/User Secrets có thể được sử dụng mà không cần package dotenv.

### 6.4. Nếu dịch vụ ngoài bị timeout hoặc ngừng hoạt động thì sao?

**Gợi ý trả lời:** Đặt timeout hợp lý, xử lý lỗi có chủ đích, log correlation/context nhưng không log secret, giới hạn retry và chỉ retry thao tác có thể lặp an toàn. Cân nhắc circuit breaker hoặc queue khi có nhu cầu và bằng chứng về tải/độ tin cậy; không tự thêm chúng chỉ vì muốn có kiến trúc phức tạp.

### 6.5. Nếu dự án có upload file qua Cloudinary hoặc nhà cung cấp tương tự, cần lưu ý gì?

**Gợi ý trả lời:** Xác thực quyền upload, giới hạn dung lượng, kiểm tra loại file ở server, không lộ API secret, xác định file public/private và lưu metadata cần thiết vào database. Cần nghĩ đến trường hợp upload thành công nhưng ghi database thất bại, hoặc xóa bản ghi nhưng file bên ngoài vẫn còn.

---

## 7. Testing, review và Git

### 7.1. Unit test khác integration test như thế nào?

**Gợi ý trả lời:** Unit test kiểm tra một đơn vị logic trong phạm vi cô lập; integration test kiểm tra sự phối hợp giữa các thành phần như database, API hoặc provider. Chọn loại test theo rủi ro và mục đích; mock không phải lúc nào cũng cần thiết.

### 7.2. Bạn review code của chính mình theo những bước nào?

**Gợi ý trả lời:** Đối chiếu acceptance criteria, đọc lại diff, kiểm tra trường hợp lỗi/biên, dependency direction, bảo mật, hiệu năng, test và tài liệu. Không chỉ kiểm tra happy path hoặc dựa hoàn toàn vào việc build thành công.

### 7.3. Bạn sử dụng Git branch, commit và Pull Request thế nào?

**Khung trả lời:** Giải thích workflow thực tế của nhóm: tách task theo branch nếu được áp dụng, commit có ý nghĩa, mở PR với mô tả và test evidence, review trước khi merge. Không mô tả một quy trình mà nhóm thực tế không sử dụng.

### 7.4. Nếu build/test fail sau khi thay đổi thì làm gì?

**Gợi ý trả lời:** Đọc lỗi đầu tiên và xác định lỗi có phát sinh từ thay đổi hay môi trường; tái hiện bằng lệnh nhỏ nhất; sửa nguyên nhân gốc; chạy lại test liên quan rồi chạy bộ test phù hợp. Ghi lại test nào chưa thể chạy và lý do thay vì báo thành công.

---

## 8. Bảo mật và khả năng mở rộng

### 8.1. Làm thế nào để hạn chế truy cập tài nguyên của người dùng khác?

**Gợi ý trả lời:** Không chỉ kiểm tra ID có tồn tại. Server phải xác minh danh tính, quyền và quan hệ sở hữu/tenant theo nghiệp vụ. Chuẩn bị ví dụ endpoint trong dự án nếu có.

### 8.2. Làm sao giảm nguy cơ SQL injection?

**Gợi ý trả lời:** Dùng parameterized query hoặc API truy vấn an toàn của ORM, tránh nối chuỗi input người dùng vào SQL. Với dynamic sort/filter, whitelist các field/operator được phép.

### 8.3. Khi nào nên dùng pagination?

**Gợi ý trả lời:** Khi danh sách có thể lớn hoặc endpoint có thể bị gọi với dữ liệu nhiều. Pagination giới hạn payload và chi phí truy vấn; cần chọn page size tối đa và thứ tự ổn định. Với dữ liệu lớn hoặc thay đổi liên tục, cân nhắc keyset/cursor pagination khi phù hợp.

### 8.4. Bạn sẽ mở rộng hệ thống khi số người dùng tăng như thế nào?

**Khung trả lời:** Bắt đầu bằng đo lường bottleneck. Kiểm tra query/index, pagination, payload, connection pool, giới hạn dịch vụ ngoài và logging/metrics. Chỉ sau khi có bằng chứng mới chọn cache, background job, queue, read replica hoặc scale-out. Nêu trade-off của từng lựa chọn.

### 8.5. Vì sao không nên thêm Redis hoặc message queue ngay từ đầu cho mọi dự án?

**Gợi ý trả lời:** Chúng có thể giải quyết bài toán cụ thể nhưng làm tăng hạ tầng, vận hành, đồng bộ dữ liệu và xử lý lỗi. Chỉ nên thêm khi có yêu cầu rõ ràng như nhu cầu cache đã đo được, công việc xử lý nền, tải lớn hoặc giao tiếp bất đồng bộ giữa dịch vụ.

---

## 9. Câu hỏi đào sâu từ từng task

### Task: `Task 07 — Media Storage & Uploading File Service`

**Bối cảnh và code cần nhớ**

- Vấn đề cần giải quyết: Cung cấp 4 API quản trị tập tin (upload ảnh avatar/logo/thumbnail, upload tài liệu PDF CV, xem thông tin file, xóa file) kết nối dịch vụ lưu trữ đám mây Cloudinary.
- File/class/endpoint liên quan:
  - Controller: `POST /api/v1/media/upload/image`, `POST /api/v1/media/upload/pdf`, `GET /api/v1/media/{id}`, `DELETE /api/v1/media/{id}` trong [MediaController.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.API/Controllers/MediaController.cs).
  - Use cases (CQRS): `UploadImageCommandHandler`, `UploadPdfCommandHandler`, `DeleteMediaFileCommandHandler`, `GetMediaFileQueryHandler` trong `SmartHire.Application/Features/Media/`.
  - Abstraction: [IFileStorageService.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Application/Abstractions/Storage/IFileStorageService.cs).
  - Implementation: [CloudinaryFileStorageService.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Infrastructure/Storage/CloudinaryFileStorageService.cs).
  - Entity & Schema: [MediaFile.cs](file:///d:/SE-Project-CTU/smart-recruitment-app/Backend/src/SmartHire.Domain/Entities/MediaFile.cs) (bổ sung cột `public_id`).
- Quyết định kỹ thuật quan trọng:
  - Tách bạch cấu trúc `Commands/` và `Queries/` theo mô hình CQRS qua MediatR.
  - Áp dụng nguyên lý Dependency Inversion: Application chỉ phụ thuộc abstraction `IFileStorageService`, tách rời hoàn toàn Cloudinary SDK vào Infrastructure.
  - Kiểm tra quyền sở hữu chống tấn công IDOR khi xóa file (chỉ owner hoặc Admin mới có quyền xóa).
  - Upload lên Cloudinary trước, lưu DB sau để tránh tạo bản ghi rác trỏ tới URL không tồn tại.

**Câu hỏi có thể được hỏi**

1. **Vì sao bạn chọn cách triển khai này?**  
   Gợi ý trả lời: Việc tách thành các Command/Query riêng giúp tuân thủ Single Responsibility Principle, dễ kiểm thử và độc lập giữa các use case. Việc tạo abstraction `IFileStorageService` giúp hệ thống dễ dàng thay thế nhà cung cấp lưu trữ (như AWS S3, MinIO) mà không sửa đổi tầng Application.

2. **Nếu yêu cầu chuyển từ Cloudinary sang AWS S3, phần nào cần thay đổi theo?**  
   Gợi ý trả lời: Chỉ cần viết thêm một class `S3FileStorageService` trong tầng `Infrastructure` implement `IFileStorageService` và đổi đăng ký trong `DependencyInjection.cs`. Toàn bộ `Application`, `Domain` và `API Controller` không bị ảnh hưởng.

3. **Bạn kiểm chứng giải pháp bằng cách nào?**  
   Gợi ý trả lời: Chạy `dotnet build` xác thực không có lỗi cú pháp hay cảnh báo; kiểm thử qua Swagger UI và Postman với các test case: upload hợp lệ, file rỗng, sai định dạng MIME, file vượt quá dung lượng, và test IDOR (cố tình xóa file của người khác nhận mã lỗi 403 Forbidden).

4. **Rủi ro hoặc giới hạn hiện tại là gì?**  
   Gợi ý trả lời: Nếu upload Cloudinary thành công nhưng lưu database thất bại sẽ phát sinh tệp mồ côi (orphan file) trên Cloudinary. Ngoài ra, việc xác thực file hiện dựa vào MIME type và extension, chưa đọc Magic Bytes của file.

5. **Nếu làm lại hoặc có thêm thời gian, bạn sẽ cải thiện điều gì?**  
   Gợi ý trả lời: Bổ sung background job bằng Hangfire định kỳ quét dọn tệp mồ côi trên Cloudinary; bổ sung đọc file signature (magic bytes) để chống bypass MIME type; và xem xét cơ chế Presigned URL nếu lưu lượng upload trở nên rất lớn nhằm giảm tải băng thông cho server backend.

---


## 10. Checklist trước buổi phỏng vấn

- [ ] Có thể giới thiệu dự án trong 30 giây và 2 phút.
- [ ] Phân biệt rõ phần mình làm với phần của thành viên khác.
- [ ] Có thể mở code và giải thích một luồng request đầu-cuối.
- [ ] Giải thích được vì sao tổ chức code theo các layer hiện có.
- [ ] Hiểu DI, interface, async/await, DTO và exception handling ở mức cơ bản.
- [ ] Giải thích được endpoint mình làm, status code, validation và error cases.
- [ ] Hiểu entity, quan hệ database và migration mình đã thay đổi (nếu có).
- [ ] Biết cách test lại bằng Swagger/Postman và mô tả kết quả mong đợi.
- [ ] Biết cấu hình secret an toàn và giải thích `.env.example`.
- [ ] Có thể nêu một trade-off, một lỗi đã xử lý và một hướng cải thiện thực tế.
- [ ] Không khẳng định đã triển khai hoặc kiểm thử điều mà repository chưa chứng minh.

---

## 11. Quy tắc cập nhật tài liệu

Mỗi khi hoàn thành một task có giá trị học tập hoặc thay đổi kiến trúc:

1. Thêm 2–5 câu hỏi gắn trực tiếp với task vào mục **Câu hỏi đào sâu từ từng task**.
2. Viết câu trả lời bằng lời của thành viên, sau khi kiểm tra lại implementation thực tế.
3. Thêm đường dẫn file/endpoint để có thể mở code giải thích khi phỏng vấn.
4. Đánh dấu rõ phần chưa hoàn thành hoặc chưa kiểm thử.
5. Loại bỏ hoặc sửa các câu trả lời đã lỗi thời khi kiến trúc thay đổi.
