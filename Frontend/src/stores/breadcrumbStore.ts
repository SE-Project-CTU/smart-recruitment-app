import { create } from "zustand";

export interface CustomBreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbState {
  customItems: CustomBreadcrumbItem[] | null;
  setBreadcrumbs: (items: CustomBreadcrumbItem[] | null) => void;
  resetBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  customItems: null,
  setBreadcrumbs: (items) => set({ customItems: items }),
  resetBreadcrumbs: () => set({ customItems: null }),
}));
