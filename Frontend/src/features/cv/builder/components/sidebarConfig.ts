import type React from "react";
import { Palette, LayoutGrid, Sparkles, Award, Compass } from "lucide-react";
import { CvBuilderDesignTab } from "./CvBuilderDesignTab";
import { CvBuilderLayoutTab } from "./CvBuilderLayoutTab";
import {
  RewriteTab,
  CvScoringTab,
  SuggestedJobsTab,
} from "./assistant";

export type SidebarTabId = "design" | "layout" | "rewrite" | "scoring" | "jobs";

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
  {
    id: "rewrite",
    label: "Viết lại",
    title: "Gợi ý viết lại CV",
    icon: Sparkles,
    component: RewriteTab,
  },
  {
    id: "scoring",
    label: "Chấm điểm",
    title: "Chấm điểm hồ sơ CV",
    icon: Award,
    component: CvScoringTab,
  },
  {
    id: "jobs",
    label: "Việc làm",
    title: "Việc làm gợi ý cho bạn",
    icon: Compass,
    component: SuggestedJobsTab,
  },
];
