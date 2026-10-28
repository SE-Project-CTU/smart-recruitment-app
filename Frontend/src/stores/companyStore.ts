import { create } from "zustand";

interface CompanyStoreState {
  /** ID của công ty mà HR / Recruiter đang chọn làm việc hiện tại */
  activeCompanyId: string | null;
  /** Đặt công ty làm việc hiện tại */
  setActiveCompanyId: (id: string | null) => void;
  /** Xóa công ty đã chọn (ví dụ khi logout) */
  clearActiveCompany: () => void;
}

const STORAGE_KEY = "sr_active_company_id";

export const useCompanyStore = create<CompanyStoreState>((set) => ({
  activeCompanyId:
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null,

  setActiveCompanyId: (id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    set({ activeCompanyId: id });
  },

  clearActiveCompany: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ activeCompanyId: null });
  },
}));
