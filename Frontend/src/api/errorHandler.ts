import { isAxiosError } from "axios";
import {
  API_ERROR_MESSAGES,
  FIELD_LABELS,
  HTTP_STATUS_MESSAGES,
} from "@/constants/apiErrorsMessage";
type UnknownRecord = Record<string, unknown>;

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
  const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
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
      if (normalizedField === "email")
        return "Email không được dài quá 254 ký tự.";
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
    const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
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
