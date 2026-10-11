import { isAxiosError } from "axios";

type UnknownRecord = Record<string, unknown>;

const API_ERROR_MESSAGES: Record<string, string> = {
  CORRELATION_ID_REQUIRED: "Thiếu mã định danh yêu cầu. Vui lòng thử lại.",
  CORRELATION_ID_INVALID: "Mã định danh yêu cầu không hợp lệ. Vui lòng thử lại.",
  INTERNAL_SERVER_ERROR: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  INVALID_PAGE_NUMBER: "Số trang không hợp lệ.",
  INVALID_PAGE_SIZE: "Kích thước trang không hợp lệ.",
  VALIDATION_ERROR: "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_REQUEST_BODY: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  AUTH_EMAIL_ALREADY_EXISTS: "Email này đã được sử dụng.",
  AUTH_PHONE_ALREADY_EXISTS: "Số điện thoại này đã được sử dụng.",
  AUTH_CANDIDATE_ROLE_NOT_FOUND:
    "Hệ thống chưa cấu hình vai trò ứng viên. Vui lòng liên hệ hỗ trợ.",
  AUTH_RECRUITER_ROLE_NOT_FOUND:
    "Hệ thống chưa cấu hình vai trò nhà tuyển dụng. Vui lòng liên hệ hỗ trợ.",
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  CURRENT_PASSWORD_INVALID: "Mật khẩu hiện tại không chính xác.",
  AUTH_ACCOUNT_NOTALLOWED: "Tài khoản hiện không được phép đăng nhập.",
  AUTH_INVALID_REFRESH_TOKEN:
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  AUTH_REFRESH_TOKEN_NOT_FOUND:
    "Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.",
  AUTH_REFRESH_TOKEN_NOT_OWNED:
    "Phiên đăng nhập không thuộc tài khoản hiện tại.",
  AUTH_LOGOUT_TARGET_REQUIRED: "Không tìm thấy phiên đăng xuất.",
  AUTH_INVALID_ACCESS_TOKEN:
    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  AUTH_CURRENT_ACCOUNT_NOT_FOUND: "Không tìm thấy tài khoản hiện tại.",
  AUTH_AVATAR_FILE_NOT_FOUND: "Không tìm thấy ảnh đại diện.",
  AUTH_AVATAR_FILE_NOT_OWNED: "Ảnh đại diện không thuộc tài khoản hiện tại.",
  MEDIA_FILE_NOT_FOUND: "Không tìm thấy tệp.",
  MEDIA_FILE_FORBIDDEN: "Bạn không có quyền truy cập tệp này.",
  MEDIA_FILE_STORAGE_ERROR: "Không thể lưu tệp. Vui lòng thử lại.",
  MEDIA_FILE_DELETE_STORAGE_ERROR: "Không thể xóa tệp. Vui lòng thử lại.",
};

const FIELD_LABELS: Record<string, string> = {
  email: "email",
  phone: "số điện thoại",
  password: "mật khẩu",
  fullName: "họ và tên",
  currentPassword: "mật khẩu hiện tại",
  newPassword: "mật khẩu mới",
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
  401: "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Thông tin bị trùng hoặc xung đột với dữ liệu hiện có.",
  422: "Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.",
  500: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  502: "Máy chủ tạm thời không phản hồi. Vui lòng thử lại sau.",
  503: "Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.",
  504: "Máy chủ phản hồi quá thời gian. Vui lòng thử lại sau.",
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const getString = (record: UnknownRecord, ...keys: string[]): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const getValidationMessages = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const field = getString(item, "field", "Field");
    const reason = getString(item, "reason", "Reason");
    if (!field) {
      return ["Thông tin nhập vào chưa hợp lệ. Vui lòng kiểm tra lại."];
    }

    return [getValidationMessage(field, reason)];
  });
};

const getValidationMessage = (field: string, reason: string | null): string => {
  const normalizedField =
    field.charAt(0).toLowerCase() + field.slice(1);
  const label = FIELD_LABELS[normalizedField] ?? "thông tin";

  switch (reason) {
    case "REQUIRED":
      return `Vui lòng nhập ${label}.`;
    case "INVALID_FORMAT":
      if (normalizedField === "email") return "Email không đúng định dạng.";
      if (normalizedField === "phone") {
        return "Số điện thoại không đúng định dạng. Hãy nhập số Việt Nam hợp lệ.";
      }
      return `${label[0].toUpperCase()}${label.slice(1)} không đúng định dạng.`;
    case "MIN_LENGTH":
      if (normalizedField === "password" || normalizedField === "newPassword") {
        return "Mật khẩu phải có ít nhất 8 ký tự.";
      }
      if (normalizedField === "fullName") {
        return "Họ và tên phải có ít nhất 2 ký tự.";
      }
      return `${label[0].toUpperCase()}${label.slice(1)} chưa đủ độ dài tối thiểu.`;
    case "MAX_LENGTH":
      if (normalizedField === "email") return "Email không được dài quá 254 ký tự.";
      if (normalizedField === "fullName") {
        return "Họ và tên không được dài quá 100 ký tự.";
      }
      return `${label[0].toUpperCase()}${label.slice(1)} vượt quá độ dài cho phép.`;
    case "NOT_ALLOWED":
      return `${label[0].toUpperCase()}${label.slice(1)} không được phép sử dụng.`;
    case "MUST_DIFFER":
      return `${label[0].toUpperCase()}${label.slice(1)} phải khác giá trị hiện tại.`;
    default:
      return `Thông tin ${label} chưa hợp lệ. Vui lòng kiểm tra lại.`;
  }
};

const getProblemValidationMessages = (value: unknown): string[] => {
  if (!isRecord(value)) {
    return [];
  }

  return Object.keys(value).map((field) => {
    const normalizedField =
      field.charAt(0).toLowerCase() + field.slice(1);
    const label = FIELD_LABELS[normalizedField] ?? "thông tin";
    return `Vui lòng kiểm tra lại ${label}.`;
  });
};

const getErrorPayload = (error: unknown): unknown =>
  isAxiosError(error) ? error.response?.data : error;

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (isAxiosError(error) && !error.response && error.request) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  }

  const payload = getErrorPayload(error);
  if (isRecord(payload)) {
    const nestedError = payload.error ?? payload.Error;
    const errorBody = isRecord(nestedError) ? nestedError : payload;
    const code = getString(errorBody, "code", "Code");
    const validationMessages = getValidationMessages(
      errorBody.details ?? errorBody.Details,
    );

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }

    const problemValidationMessages = getProblemValidationMessages(
      errorBody.errors ?? errorBody.Errors ?? payload.errors ?? payload.Errors,
    );
    if (problemValidationMessages.length > 0) {
      return problemValidationMessages.join(" ");
    }

    if (code && API_ERROR_MESSAGES[code]) {
      return API_ERROR_MESSAGES[code];
    }
  }

  if (isAxiosError(error) && error.response) {
    return (
      HTTP_STATUS_MESSAGES[error.response.status] ??
      (error.response.status >= 500
        ? "Hệ thống đang gặp sự cố. Vui lòng thử lại sau."
        : fallbackMessage)
    );
  }

  return fallbackMessage;
};

export const handleApiError = (error: unknown): void => {
  if (isAxiosError(error)) {
    if (error.response) {
      console.error(`API request failed with HTTP ${error.response.status}.`);
    } else if (error.request) {
      console.error("API request failed: no response received.");
    } else {
      console.error("API request could not be initialized:", error.message);
    }
    return;
  }

  console.error(
    "API request failed:",
    error instanceof Error ? error.message : error,
  );
};
