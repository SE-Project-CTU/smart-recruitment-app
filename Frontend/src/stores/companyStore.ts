import { create } from "zustand";
import type { CompanyItem } from "@/types/company";
import { STORAGE_KEYS } from "@/constants/storage";

interface CompanyStoreState {
  /** ID của công ty mà HR / Recruiter đang chọn làm việc hiện tại */
  activeCompanyId: string | null;
  /** Thông tin tóm tắt của công ty đang chọn để render UI tức thì mà không cần fetch lại */
  activeCompany: CompanyItem | null;
  /** Đặt công ty làm việc hiện tại (nhận cả object CompanyItem hoặc null) */
  setActiveCompany: (company: CompanyItem | null) => void;
  /** Đặt công ty làm việc hiện tại chỉ bằng ID (dùng khi chỉ có ID) */
  setActiveCompanyId: (id: string | null) => void;
  /** Xóa công ty đã chọn (ví dụ khi logout) */
  clearActiveCompany: () => void;
}

const STORAGE_KEY_ID = "sr_active_company_id";
const STORAGE_KEY_COMPANY = "sr_active_company";
const STORAGE_KEY_USER_ID = "sr_active_company_user_id";

/**
 * Lấy User ID hiện tại từ localStorage để đảm bảo active company
 * luôn gắn liền với đúng tài khoản đăng nhập.
 */
const getCurrentAuthUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
};

const getInitialCompany = (): CompanyItem | null => {
  if (typeof window === "undefined") return null;
  try {
    const currentUserId = getCurrentAuthUserId();
    const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);

    // Nếu không có user đăng nhập hoặc user lưu không khớp với user hiện tại -> dọn sạch và trả về null
    if (!currentUserId || storedUserId !== currentUserId) {
      localStorage.removeItem(STORAGE_KEY_ID);
      localStorage.removeItem(STORAGE_KEY_COMPANY);
      localStorage.removeItem(STORAGE_KEY_USER_ID);
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    return raw ? (JSON.parse(raw) as CompanyItem) : null;
  } catch {
    return null;
  }
};

const getInitialCompanyId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const currentUserId = getCurrentAuthUserId();
    const storedUserId = localStorage.getItem(STORAGE_KEY_USER_ID);

    if (!currentUserId || storedUserId !== currentUserId) {
      localStorage.removeItem(STORAGE_KEY_ID);
      localStorage.removeItem(STORAGE_KEY_COMPANY);
      localStorage.removeItem(STORAGE_KEY_USER_ID);
      return null;
    }

    return localStorage.getItem(STORAGE_KEY_ID);
  } catch {
    return null;
  }
};

export const useCompanyStore = create<CompanyStoreState>((set, get) => ({
  activeCompanyId: getInitialCompanyId(),
  activeCompany: getInitialCompany(),

  setActiveCompany: (company: CompanyItem | null) => {
    const currentId = get().activeCompanyId;
    const newId = company?.id ?? null;
    const currentUserId = getCurrentAuthUserId();

    const prev = get().activeCompany;

    // Chặn re-render nếu cùng instance hoặc các trường định danh & thông tin cốt lõi không thay đổi
    if (currentId === newId && prev === company) {
      return;
    }

    if (
      currentId === newId &&
      prev?.id === newId &&
      prev?.name === company?.name &&
      prev?.logoUrl === company?.logoUrl &&
      prev?.logoFileId === company?.logoFileId &&
      prev?.verificationStatus === company?.verificationStatus &&
      prev?.membership?.role === company?.membership?.role
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      if (company && newId && currentUserId) {
        localStorage.setItem(STORAGE_KEY_ID, newId);
        localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(company));
        localStorage.setItem(STORAGE_KEY_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ID);
        localStorage.removeItem(STORAGE_KEY_COMPANY);
        localStorage.removeItem(STORAGE_KEY_USER_ID);
      }
    }

    set({
      activeCompanyId: newId,
      activeCompany: company,
    });
  },

  setActiveCompanyId: (id: string | null) => {
    const currentId = get().activeCompanyId;
    if (currentId === id) return;
    const currentUserId = getCurrentAuthUserId();

    if (typeof window !== "undefined") {
      if (id && currentUserId) {
        localStorage.setItem(STORAGE_KEY_ID, id);
        localStorage.setItem(STORAGE_KEY_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ID);
        localStorage.removeItem(STORAGE_KEY_COMPANY);
        localStorage.removeItem(STORAGE_KEY_USER_ID);
      }
    }

    // Nếu chỉ set ID mà ID khác với công ty trong state thì reset activeCompany để hook đồng bộ lại
    const currentCompany = get().activeCompany;
    set({
      activeCompanyId: id,
      activeCompany: currentCompany?.id === id ? currentCompany : null,
    });
  },

  clearActiveCompany: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_ID);
      localStorage.removeItem(STORAGE_KEY_COMPANY);
      localStorage.removeItem(STORAGE_KEY_USER_ID);
      try {
        localStorage.removeItem("sr_my_company_ids");
      } catch {
        // ignore
      }
    }
    set({ activeCompanyId: null, activeCompany: null });
  },
}));
