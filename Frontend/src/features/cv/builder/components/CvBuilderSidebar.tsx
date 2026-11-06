import React, { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTab,
} from "@/components/animate-ui/primitives/base/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPanel,
} from "@/components/animate-ui/components/base/tooltip";
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
 * - Danh sách tab icon dọc gọn gàng, hiển thị Tooltip mượt mà khi hover thay vì title text cố định.
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
      <aside className="flex overflow-hidden rounded-2xl border border-border/80 bg-surface/95 shadow-xl backdrop-blur-md transition-shadow">
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
          {/* 1. DẢI TAB DỌC BÊN TRÁI (Icon gọn gàng, hiển thị Tooltip khi hover) */}
          <div className="z-20 flex w-13 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-bg/60 px-1.5 py-4 transition-all duration-300 select-none">
            <div className="flex w-full flex-col items-center gap-2">
              <TabsList className="flex w-full flex-col gap-2">
                {SIDEBAR_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger
                        render={
                          <TabsTab
                            value={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={cn(
                              "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl p-0 transition-all",
                              isActive && isPanelOpen
                                ? "bg-surface font-semibold text-primary shadow-xs"
                                : "text-text-muted hover:bg-surface/60 hover:text-text-main",
                            )}
                            aria-label={tab.title}
                          >
                            <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                            {isActive && isPanelOpen && (
                              <span className="absolute top-1/2 -left-1.5 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                            )}
                          </TabsTab>
                        }
                      />
                      <TooltipPanel side="right" sideOffset={10} className="">
                        {tab.title}
                      </TooltipPanel>
                    </Tooltip>
                  );
                })}
              </TabsList>
            </div>

            {/* Nút mở rộng / thu gọn sidebar ở dưới cùng */}
            <div className="flex w-full flex-col items-center pt-2 border-t border-border/50">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen((prev) => !prev)}
                      className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-text-muted transition-all hover:bg-surface hover:text-text-main hover:shadow-xs"
                      aria-label={isPanelOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                    >
                      {isPanelOpen ? (
                        <PanelLeftClose className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110" />
                      ) : (
                        <PanelLeftOpen className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 text-primary" />
                      )}
                    </button>
                  }
                />
                <TooltipPanel side="right" sideOffset={10}>
                  {isPanelOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
                </TooltipPanel>
              </Tooltip>
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
