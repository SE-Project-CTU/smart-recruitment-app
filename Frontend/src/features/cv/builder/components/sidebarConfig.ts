import type React from "react";
import { Palette, LayoutGrid } from "lucide-react";
import { CvBuilderDesignTab } from "./CvBuilderDesignTab";
import { CvBuilderLayoutTab } from "./CvBuilderLayoutTab";

export type SidebarTabId = "design" | "layout";

export interface SidebarTabItem {
  id: SidebarTabId;
  label: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export const SIDEBAR_TABS: SidebarTabItem[] = [
  {
    id: "design",
    label: "Thiết kế",
    title: "Thiết kế giao diện",
    icon: Palette,
    component: CvBuilderDesignTab,
  },
  {
    id: "layout",
    label: "Bố cục",
    title: "Bố cục mục CV",
    icon: LayoutGrid,
    component: CvBuilderLayoutTab,
  },
];
