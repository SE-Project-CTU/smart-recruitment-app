import { create } from "zustand";
import type { CompanyItem, CompanyInvitationItem } from "@/types/company";

export interface CompanyState {
  // Trạng thái mở Drawer xem chi tiết doanh nghiệp (dùng API 2 GET /companies/{id})
  isDrawerOpen: boolean;
  selectedCompanyId: string | null;
  activeCompany: CompanyItem | null;
  invitationContext: CompanyInvitationItem | null;

  // Actions điều khiển Drawer và đồng bộ thông tin doanh nghiệp
  openCompanyDrawer: (
    companyId: string,
    invitation?: CompanyInvitationItem | null,
  ) => void;
  closeCompanyDrawer: () => void;
  setActiveCompany: (company: CompanyItem | null) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  isDrawerOpen: false,
  selectedCompanyId: null,
  activeCompany: null,
  invitationContext: null,

  openCompanyDrawer: (companyId, invitation = null) => {
    set({
      isDrawerOpen: true,
      selectedCompanyId: companyId,
      invitationContext: invitation,
    });
  },

  closeCompanyDrawer: () => {
    set({
      isDrawerOpen: false,
      selectedCompanyId: null,
      invitationContext: null,
    });
  },

  setActiveCompany: (company) => {
    set({ activeCompany: company });
  },
}));
