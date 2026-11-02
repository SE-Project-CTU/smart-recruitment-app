import React, { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/primitives/base/tabs";
import {
  SIDEBAR_TABS,
  type SidebarTabId,
} from "./sidebarConfig";
import { CvBuilderSidebarPanel } from "./CvBuilderSidebarPanel";
import { CvBuilderMobileDrawer } from "./CvBuilderMobileDrawer";

interface CvBuilderSidebarProps {
  isLocked: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

/**
 * CvBuilderSidebar:
 * Floating Sidebar tùy chỉnh và bố cục cho CV Builder:
 * - Floating dock bo góc tròn mềm mại, nổi bên góc trái của workspace.
 * - Danh sách tab dọc sử dụng component Tabs primitive của animate-ui với animation highlight mượt mà.
 * - Render động danh sách các tab theo cấu hình SIDEBAR_TABS.
 * - Tách bạch module: CvBuilderSidebarPanel (desktop panel) và CvBuilderMobileDrawer (mobile drawer).
 * - Ẩn khi CV bị khóa (isLocked) hoặc khi in ấn (no-print).
 */
export const CvBuilderSidebar: React.FC<CvBuilderSidebarProps> = ({
  isLocked,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTabId>("design");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const currentTab =
    SIDEBAR_TABS.find((tab) => tab.id === activeTab) || SIDEBAR_TABS[0];

  // Lắng nghe phím Escape để đóng mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpenMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  // Click vào một tab ở danh sách tab dọc:
  // - Nếu đang collapse: chọn bất kỳ tab nào cũng mở sidebar ra
  // - Nếu đang mở và bấm lại chính tab active: thu gọn sidebar
  // - Nếu đang mở và bấm tab khác: chuyển sang tab đó
  const handleTabClick = (selected: SidebarTabId) => {
    if (!isPanelOpen) {
      setActiveTab(selected);
      setIsPanelOpen(true);
    } else if (activeTab === selected) {
      setIsPanelOpen(false);
    } else {
      setActiveTab(selected);
    }
  };

  // Không hiển thị sidebar nếu CV đã bị khóa
  if (isLocked) return null;

  return (
    <>
      {/* ================= A. DESKTOP FLOATING SIDEBAR ================= */}
      <aside className="flex overflow-hidden rounded-2xl border border-border/80 bg-surface/95 shadow-xl backdrop-blur-md transition-shadow select-none">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (val) {
              setActiveTab(val as SidebarTabId);
              if (!isPanelOpen) setIsPanelOpen(true);
            }
          }}
          orientation="vertical"
          className="flex"
        >
          {/* 1. DẢI TAB DỌC BÊN TRÁI (Thu hẹp & ẩn title khi collapse) */}
          <div
            className={cn(
              "z-20 flex shrink-0 flex-col items-center justify-between border-r border-border/60 bg-bg/60 px-1.5 py-4 transition-all duration-300",
              isPanelOpen ? "w-16" : "w-13",
            )}
          >
            <div className="flex w-full flex-col items-center gap-2">
              <TabsList className="flex w-full flex-col gap-2">
                {SIDEBAR_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <TabsTab
                      key={tab.id}
                      value={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={cn(
                        "group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl px-1 py-2 text-center transition-all",
                        isActive && isPanelOpen
                          ? "bg-surface font-semibold text-primary shadow-xs"
                          : "text-text-muted hover:bg-surface/60 hover:text-text-main",
                        !isPanelOpen && "mx-auto h-10 w-10 p-0",
                      )}
                      title={tab.title}
                    >
                      <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                      <AnimatePresence>
                        {isPanelOpen && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 overflow-hidden text-[11px] leading-tight whitespace-nowrap"
                          >
                            {tab.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && isPanelOpen && (
                        <span className="absolute top-1/2 -left-1.5 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                    </TabsTab>
                  );
                })}
              </TabsList>
            </div>

            {/* Nút mở rộng / thu gọn sidebar ở dưới cùng */}
            <div className="flex w-full flex-col items-center pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setIsPanelOpen((prev) => !prev)}
                className={cn(
                  "group relative flex cursor-pointer items-center justify-center rounded-xl text-text-muted transition-all hover:bg-surface hover:text-text-main hover:shadow-xs",
                  isPanelOpen ? "h-9 w-full px-2" : "h-9 w-9",
                )}
                title={isPanelOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                aria-label={isPanelOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
              >
                {isPanelOpen ? (
                  <PanelLeftClose className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110" />
                ) : (
                  <PanelLeftOpen className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* 2. PANEL NỘI DUNG DESKTOP */}
          <CvBuilderSidebarPanel
            isOpen={isPanelOpen}
            currentTab={currentTab}
            onClose={() => setIsPanelOpen(false)}
          />
        </Tabs>
      </aside>

      {/* ================= B. MOBILE SLIDE-OVER DRAWER ================= */}
      <CvBuilderMobileDrawer
        isOpen={isOpenMobile}
        activeTab={activeTab}
        currentTab={currentTab}
        onTabChange={setActiveTab}
        onClose={onCloseMobile}
      />
    </>
  );
};
