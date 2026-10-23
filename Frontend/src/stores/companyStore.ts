import { create } from "zustand";
import type { CompanyItem } from "@/types/company";

export interface CompanyState {
  // Doanh nghiệp hiện tại đang được chọn làm việc / quản lý bởi Recruiter
  activeCompany: CompanyItem | null;
  setActiveCompany: (company: CompanyItem | null) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  activeCompany: null,
  setActiveCompany: (company) => set({ activeCompany: company }),
}));
