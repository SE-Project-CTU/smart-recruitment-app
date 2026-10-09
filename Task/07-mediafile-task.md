# Media & File Upload API

## Group Summary

Nhóm API quản lý việc tải lên, đọc thông tin và xóa các tệp tin đa phương tiện và tài liệu dạng `multipart/form-data` (hình ảnh đại diện, logo doanh nghiệp, hình thu nhỏ template CV và tệp hồ sơ CV dạng PDF). Dữ liệu chính liên quan đến thực thể `MEDIA_FILE`. Sử dụng Cloudinary để quản lý ảnh, PDF (Cấu hình mẫu vào file .env.example ở thư mục gốc)

## API List

| #   | API                   | Method & Path                     | Resource     | Roles                       |
| --- | --------------------- | --------------------------------- | ------------ | --------------------------- |
| 1   | Tải lên hình ảnh      | `POST /api/v1/media/upload/image` | `MEDIA_FILE` | Candidate, Recruiter, Admin |
| 2   | Tải lên tệp PDF       | `POST /api/v1/media/upload/pdf`   | `MEDIA_FILE` | Candidate, Recruiter, Admin |
| 3   | Xem thông tin tệp tin | `GET /api/v1/media/{id}`          | `MEDIA_FILE` | Candidate, Recruiter, Admin |
| 4   | Xóa tệp tin           | `DELETE /api/v1/media/{id}`       | `MEDIA_FILE` | Owner, Admin                |

## Shared Rules

- Base URL: `/api/v1`.
- Bắt buộc `Authorization: Bearer <access-token>` và `X-Correlation-ID` là UUID cho tất cả các endpoint.
- Endpoint tải tệp dùng `Content-Type: multipart/form-data` với trường dữ liệu tệp tin là `file`.
- **Giới hạn dung lượng và định dạng:**
  - **Tải lên hình ảnh (`/image`):** Chấp nhận định dạng `.jpg`, `.jpeg`, `.png`, `.webp`. Dung lượng tối đa **5 MB**.
  - **Tải lên PDF (`/pdf`):** Chỉ chấp nhận định dạng `.pdf`. Dung lượng tối đa **10 MB**.
- File sau khi tải lên được lưu lên Cloud Storage (S3 / Google Cloud Storage), hệ thống sinh ra `fileUrl` duy nhất và ghi vết thông tin người sở hữu (`owner_id`) vào bảng `MEDIA_FILE`.
- Người dùng chỉ được phép xóa các tệp do chính mình làm chủ sở hữu (`owner_id = current_user_id`), trừ vai trò `Admin` có quyền xóa mọi tệp.
- Response dùng `data`, `meta`, `correlationId`; lỗi dùng `error`, `correlationId` theo [README.md](README.md).

## ERD Response Mapping

| API field   | ERD column   | Resource     |
| ----------- | ------------ | ------------ |
| `id`        | `id`         | `MEDIA_FILE` |
| `ownerId`   | `owner_id`   | `MEDIA_FILE` |
| `fileName`  | `file_name`  | `MEDIA_FILE` |
| `fileUrl`   | `file_url`   | `MEDIA_FILE` |
| `fileType`  | `file_type`  | `MEDIA_FILE` |
| `fileSize`  | `file_size`  | `MEDIA_FILE` |
| `createdAt` | `created_at` | `MEDIA_FILE` |

<details>
<summary><strong>API 1: Upload Image File</strong></summary>

### Title & Summary

**Tải lên hình ảnh (Avatar, Logo, Thumbnail)**

Cho phép người dùng đã xác thực tải lên tệp ảnh làm avatar cá nhân, logo doanh nghiệp hoặc thumbnail template.

### Method & Path

```http
POST /api/v1/media/upload/image
```

### Authentication & Authorization

Candidate, Recruiter hoặc Admin với Access Token hợp lệ.

### Headers

`Authorization`, `Content-Type: multipart/form-data` và `X-Correlation-ID` UUID là bắt buộc.

### Request Parameters / Body

Form Data parameters:

| Field  | Required | DataType    | Validation Rules                                                      |
| ------ | -------: | ----------- | --------------------------------------------------------------------- |
| `file` |      Yes | Binary File | Định dạng `image/jpeg`, `image/png`, `image/webp`. Dung lượng <= 5MB. |

### Response Status Codes

`201` Created thành công; `400` không có file hoặc sai mục đích; `401` token sai; `413` file vượt quá dung lượng (Payload Too Large); `415` định dạng file không hỗ trợ (Unsupported Media Type); `500` lỗi storage.

### Example Success Response

```json
{
  "data": {
    "id": "e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a",
    "fileName": "avatar_candidate_123.jpg",
    "fileUrl": "https://cdn.smarthire.example/images/avatars/e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1048576,
    "createdAt": "2026-09-29T16:00:00Z"
  },
  "meta": {},
  "correlationId": "5f1c0d68-9a3f-4c85-bf50-4a7c17c1e2af"
}
```

</details>

<details>
<summary><strong>API 2: Upload PDF Document</strong></summary>

### Title & Summary

**Tải lên tệp PDF (CV cá nhân, tài liệu xác minh)**

Cho phép Ứng viên tải lên file CV PDF cá nhân từ thiết bị để ứng tuyển, hoặc Nhà tuyển dụng tải tài liệu xác minh công ty.

### Method & Path

```http
POST /api/v1/media/upload/pdf
```

### Authentication & Authorization

Candidate, Recruiter hoặc Admin với Access Token hợp lệ.

### Headers

`Authorization`, `Content-Type: multipart/form-data` và `X-Correlation-ID` UUID là bắt buộc.

### Request Parameters / Body

Form Data parameters:

| Field  | Required | DataType    | Validation Rules                                 |
| ------ | -------: | ----------- | ------------------------------------------------ |
| `file` |      Yes | Binary File | Định dạng `application/pdf`. Dung lượng <= 10MB. |

### Response Status Codes

`201` Created thành công; `400` thiếu tệp tin; `401` token sai; `413` file quá 10MB; `415` không phải file PDF; `500` lỗi storage.

### Example Success Response

```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "fileName": "Nguyen_Van_A_Resume.pdf",
    "fileUrl": "https://cdn.smarthire.example/documents/cvs/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e.pdf",
    "fileType": "application/pdf",
    "fileSize": 2457600,
    "createdAt": "2026-09-29T16:05:00Z"
  },
  "meta": {},
  "correlationId": "5f1c0d68-9a3f-4c85-bf50-4a7c17c1e2af"
}
```

</details>

<details>
<summary><strong>API 3: Get File Metadata</strong></summary>

### Title & Summary

**Xem thông tin chi tiết tệp tin**

Lấy metadata chi tiết (tên tệp, URL công khai, kích thước, định dạng, thời điểm tải lên) của tệp tin.

### Method & Path

```http
GET /api/v1/media/{id}
```

### Authentication & Authorization

Access Token hợp lệ.

### Headers

`Authorization`, `Accept` và `X-Correlation-ID` UUID là bắt buộc.

### Request Parameters / Body

| Parameter | Required | DataType | Validation Rules      |
| --------- | -------: | -------- | --------------------- |
| `id`      |      Yes | UUID     | Tệp tin phải tồn tại. |

### Response Status Codes

`200` thành công; `401` token sai; `404` không tìm thấy tệp tin; `500` lỗi CSDL.

### Example Success Response

```json
{
  "data": {
    "id": "e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a",
    "ownerId": "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    "fileName": "avatar_candidate_123.jpg",
    "fileUrl": "https://cdn.smarthire.example/images/avatars/e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1048576,
    "createdAt": "2026-09-29T16:00:00Z"
  },
  "meta": {},
  "correlationId": "5f1c0d68-9a3f-4c85-bf50-4a7c17c1e2af"
}
```

</details>

<details>
<summary><strong>API 4: Delete File</strong></summary>

### Title & Summary

**Xóa tệp tin**

Xóa tệp tin khỏi hệ thống lưu trữ và xóa bản ghi `MEDIA_FILE` trong CSDL.

### Method & Path

```http
DELETE /api/v1/media/{id}
```

### Authentication & Authorization

Chủ sở hữu của tệp (`owner_id = current_user_id`) hoặc người dùng có role `Admin`.

### Headers

`Authorization` và `X-Correlation-ID` UUID là bắt buộc.

### Request Parameters / Body

| Parameter | Required | DataType | Validation Rules      |
| --------- | -------: | -------- | --------------------- |
| `id`      |      Yes | UUID     | Tệp tin phải tồn tại. |

### Response Status Codes

`200` xóa thành công; `401` token sai; `403` không có quyền xóa tệp của người khác; `404` tệp không tồn tại; `500` lỗi xóa storage/CSDL.

### Example Success Response

```json
{
  "data": {
    "id": "e4f8d9a2-1b3c-4d5e-8f9a-0b1c2d3e4f5a",
    "deleted": true
  },
  "meta": {},
  "correlationId": "5f1c0d68-9a3f-4c85-bf50-4a7c17c1e2af"
}
```

</details>

Mục tiêu
Triển khai cấu hình dịch vụ Cloudinary upload và quản lý tệp tin (Hình ảnh, Avatar, Logo công ty, CV PDF đính kèm).

APIs Triển khai
POST /api/v1/media/upload/image : Upload ảnh đại diện, logo doanh nghiệp
POST /api/v1/media/upload/pdf : Upload tệp CV dạng PDF từ thiết bị người dùng
GET /api/v1/media/{id} : Lấy thông tin metadata và đường dẫn tải tệp
DELETE /api/v1/media/{id} : Xóa tệp tin khỏi bộ lưu trữ
Yêu cầu kỹ thuật
Kiểm tra dung lượng tệp (tối đa 5MB cho ảnh/PDF) và định dạng MIME hợp lệ.
Phân quyền bảo mật: chỉ chủ sở hữu và nhà tuyển dụng có thẩm quyền mới được truy cập tệp CV riêng tư.
Kết quả
Có được APIs để upload ảnh, PDF (tất cả chức năng có upload ảnh, PDF)
Call API lấy được link để upload ảnh/PDF ở frontend, trả về dữ liệu DTO MediaFile Entity
