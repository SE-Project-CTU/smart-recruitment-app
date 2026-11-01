import { create } from "zustand";
import type { CompanyItem } from "@/types/company";

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

const getInitialCompany = (): CompanyItem | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useCompanyStore = create<CompanyStoreState>((set, get) => ({
  activeCompanyId:
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY_ID)
      : null,
  activeCompany: getInitialCompany(),

  setActiveCompany: (company: CompanyItem | null) => {
    const currentId = get().activeCompanyId;
    const newId = company?.id ?? null;

    // Chặn re-render không cần thiết nếu ID không thay đổi và object đã có
    if (currentId === newId && get().activeCompany?.id === newId) {
      return;
    }

    if (typeof window !== "undefined") {
      if (company && newId) {
        localStorage.setItem(STORAGE_KEY_ID, newId);
        localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(company));
      } else {
        localStorage.removeItem(STORAGE_KEY_ID);
        localStorage.removeItem(STORAGE_KEY_COMPANY);
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

    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(STORAGE_KEY_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEY_ID);
        localStorage.removeItem(STORAGE_KEY_COMPANY);
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
    }
    set({ activeCompanyId: null, activeCompany: null });
  },
}));
