import React from "react";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { SidebarTabItem } from "./sidebarConfig";

interface CvBuilderSidebarPanelProps {
  isOpen: boolean;
  currentTab: SidebarTabItem;
  onClose: () => void;
}

/**
 * CvBuilderSidebarPanel:
 * Panel nội dung chi tiết của active tab bên phải trên desktop:
 * - Animation width 320 -> 0 mượt mà với ease cubic-bezier.
 * - Header có tiêu đề tab động và nút ChevronLeft thu gọn.
 * - Thân panel cuộn nội dung độc lập, không nhảy chiều cao.
 * - Cho phép chọn văn bản (select-text) tự nhiên trên toàn bộ nội dung của panel.
 */
export const CvBuilderSidebarPanel: React.FC<CvBuilderSidebarPanelProps> = ({
  isOpen,
  currentTab,
  onClose,
}) => {
  const ActiveComponent = currentTab.component;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="sidebar-panel-wrapper"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="h-full shrink-0 overflow-hidden bg-surface"
        >
          {/* Khung nội dung con cố định chiều rộng 320px để tránh text wrap dồn dòng khi animate width */}
          <div className="flex h-full w-80 max-w-[320px] min-w-[320px] flex-col overflow-hidden select-text">
            {/* Header của Panel */}
            <div className="flex h-13 shrink-0 items-center justify-between border-b border-border/70 px-4 select-none">
              <span className="truncate text-xs font-bold tracking-wider text-text-main uppercase">
                {currentTab.title}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/70 text-text-muted transition-colors hover:bg-bg hover:text-text-main"
                title="Thu gọn panel"
                aria-label="Thu gọn panel"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Nội dung chi tiết active tab (Cuộn độc lập bên trong panel, không nhảy chiều cao) */}
            <div className="flex-1 overflow-y-auto p-4 select-text">
              <ActiveComponent />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
