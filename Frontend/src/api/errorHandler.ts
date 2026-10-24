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
    const serverMessage =
      getString(errorBody, "message", "Message") ??
      getString(payload, "message", "Message");

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

    if (serverMessage) {
      return serverMessage;
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

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  const result: Record<string, string> = {};
  const payload = getErrorPayload(error);
  if (!isRecord(payload)) return result;

  const nestedError = payload.error ?? payload.Error;
  const errorBody = isRecord(nestedError) ? nestedError : payload;
  const code = getString(errorBody, "code", "Code");

  // 1. Process details array: [{ field, reason, message }]
  const details = errorBody.details ?? errorBody.Details;
  if (Array.isArray(details)) {
    for (const item of details) {
      if (isRecord(item)) {
        const field = getString(item, "field", "Field");
        const reason = getString(item, "reason", "Reason");
        const message = getString(item, "message", "Message");
        if (field) {
          const normalizedField =
            field.charAt(0).toLowerCase() + field.slice(1);
          result[normalizedField] =
            getValidationMessage(field, reason) ||
            message ||
            "Giá trị không hợp lệ.";
        }
      }
    }
  }

  // 2. Process ProblemDetails errors object: { field: string[] | string }
  const errors =
    errorBody.errors ?? errorBody.Errors ?? payload.errors ?? payload.Errors;
  if (isRecord(errors)) {
    for (const [field, val] of Object.entries(errors)) {
      const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
      if (!result[normalizedField]) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
          result[normalizedField] = val[0];
        } else if (typeof val === "string") {
          result[normalizedField] = val;
        }
      }
    }
  }

  // 3. Fallback mappings for specific known error codes if field wasn't populated yet
  if (code) {
    if (code === "COMPANY_TAX_CODE_ALREADY_EXISTS" && !result.taxCode) {
      result.taxCode = API_ERROR_MESSAGES.COMPANY_TAX_CODE_ALREADY_EXISTS;
    } else if (code === "AUTH_EMAIL_ALREADY_EXISTS" && !result.email) {
      result.email = API_ERROR_MESSAGES.AUTH_EMAIL_ALREADY_EXISTS;
    } else if (code === "USER_NOT_FOUND" && !result.email) {
      result.email = API_ERROR_MESSAGES.USER_NOT_FOUND;
    } else if (code === "INVITEE_ROLE_REQUIRED" && !result.email) {
      result.email = API_ERROR_MESSAGES.INVITEE_ROLE_REQUIRED;
    } else if (code === "COMPANY_MEMBERSHIP_ALREADY_EXISTS" && !result.email) {
      result.email = API_ERROR_MESSAGES.COMPANY_MEMBERSHIP_ALREADY_EXISTS;
    } else if (code === "COMPANY_INVITATION_ALREADY_EXISTS" && !result.email) {
      result.email = API_ERROR_MESSAGES.COMPANY_INVITATION_ALREADY_EXISTS;
    } else if (code === "COMPANY_FORBIDDEN" && !result.companyId) {
      result.companyId = API_ERROR_MESSAGES.COMPANY_FORBIDDEN;
    } else if (code === "PROVINCE_NOT_FOUND" && !result.provinceId) {
      result.provinceId = API_ERROR_MESSAGES.PROVINCE_NOT_FOUND;
    } else if (code === "WARD_NOT_FOUND" && !result.wardId) {
      result.wardId = API_ERROR_MESSAGES.WARD_NOT_FOUND;
    } else if (code === "INDUSTRY_NOT_FOUND" && !result.industryIds) {
      result.industryIds = API_ERROR_MESSAGES.INDUSTRY_NOT_FOUND;
    } else if (code === "SKILL_NOT_FOUND" && !result.skillIds) {
      result.skillIds = API_ERROR_MESSAGES.SKILL_NOT_FOUND;
    }
  }

  return result;
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
