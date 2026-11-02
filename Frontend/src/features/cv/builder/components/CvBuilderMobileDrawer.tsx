import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/primitives/base/tabs";
import {
  SIDEBAR_TABS,
  type SidebarTabId,
  type SidebarTabItem,
} from "./sidebarConfig";

interface CvBuilderMobileDrawerProps {
  isOpen: boolean;
  activeTab: SidebarTabId;
  currentTab: SidebarTabItem;
  onTabChange: (tabId: SidebarTabId) => void;
  onClose: () => void;
}

/**
 * CvBuilderMobileDrawer:
 * Slide-over Drawer trên giao diện mobile:
 * - Backdrop nền phủ mờ, hỗ trợ chạm ra ngoài để đóng.
 * - Drawer trượt mượt mà từ mép trái màn hình.
 * - Render động danh sách tab dọc và nội dung active tab.
 */
export const CvBuilderMobileDrawer: React.FC<CvBuilderMobileDrawerProps> = ({
  isOpen,
  activeTab,
  currentTab,
  onTabChange,
  onClose,
}) => {
  if (!isOpen) return null;

  const ActiveComponent = currentTab.component;

  return (
    <div className="no-print fixed inset-0 z-50 md:hidden">
      {/* Backdrop nền phủ */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer trượt từ mép trái */}
      <div className="animate-in slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-[90vw] max-w-96 bg-surface shadow-2xl transition-transform duration-250">
        <Tabs
          value={activeTab}
          onValueChange={(val) => onTabChange(val as SidebarTabId)}
          orientation="vertical"
          className="flex h-full w-full"
        >
          {/* Dải tab dọc trên mobile */}
          <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-bg/50 py-3">
            <TabsList className="flex w-full flex-col gap-1 px-1">
              {SIDEBAR_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <TabsTab
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-all",
                      isActive
                        ? "border border-border bg-surface font-semibold text-primary shadow-2xs"
                        : "text-text-muted hover:text-text-main",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="mt-1 text-[10px] leading-tight">
                      {tab.label}
                    </span>
                  </TabsTab>
                );
              })}
            </TabsList>
          </div>

          {/* Panel nội dung tab bên phải trên mobile */}
          <div className="flex min-w-0 flex-1 flex-col bg-surface">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="truncate text-xs font-bold tracking-wider text-text-main uppercase">
                {currentTab.title}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-bg hover:text-text-main"
                title="Đóng bảng tùy chỉnh"
                aria-label="Đóng bảng tùy chỉnh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <ActiveComponent />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
