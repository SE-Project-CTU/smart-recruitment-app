const STORAGE_KEY_PREFIX = "sr_my_company_ids_";
const SCAN_TIMESTAMP_PREFIX = "sr_my_companies_scanned_";

export const getCurrentUserId = (): string => {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = localStorage.getItem("sh_auth_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {
    // Bỏ qua dữ liệu xác thực lỗi hoặc localStorage không khả dụng.
  }
  return "guest";
};

export const getStoredMyCompanyIds = (userId = getCurrentUserId()): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) && ids.every((id) => typeof id === "string")
      ? ids
      : [];
  } catch {
    return [];
  }
};

export const saveStoredMyCompanyIds = (userId: string, ids: string[]): void => {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(unique),
    );
  } catch {
    // Bỏ qua khi localStorage không khả dụng.
  }
};

export const getStoredScanTimestamp = (userId: string): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${SCAN_TIMESTAMP_PREFIX}${userId}`);
    if (!raw) return null;
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch {
    return null;
  }
};

export const saveStoredScanTimestamp = (userId: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${SCAN_TIMESTAMP_PREFIX}${userId}`,
      Date.now().toString(),
    );
  } catch {
    // Bỏ qua khi localStorage không khả dụng.
  }
};

export const addStoredMyCompanyId = (
  id: string,
  userId = getCurrentUserId(),
): void => {
  if (typeof window === "undefined" || !id) return;
  const current = getStoredMyCompanyIds(userId);
  if (!current.includes(id)) {
    saveStoredMyCompanyIds(userId, [...current, id]);
  }
};

export const clearStoredMyCompanyCache = (userId = getCurrentUserId()): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${userId}`);
    localStorage.removeItem(`${SCAN_TIMESTAMP_PREFIX}${userId}`);
    localStorage.removeItem("sr_my_company_ids");
  } catch {
    // Bỏ qua khi localStorage không khả dụng.
  }
};
