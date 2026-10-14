import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  candidateSidebarData,
  recruiterSidebarData,
  adminSidebarData,
} from "@/constants/SIdebarData";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function DashboardSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (title: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const userRole = user?.roles?.[0]?.toLowerCase();
  const pathname = location.pathname.toLowerCase();

  let role: "candidate" | "recruiter" | "admin" = "candidate";
  if (pathname.startsWith("/admin") || userRole === "admin") {
    role = "admin";
  } else if (pathname.startsWith("/recruiter") || userRole === "recruiter") {
    role = "recruiter";
  } else {
    role = "candidate";
  }

  const getRoleMenuGroups = (): {
    groups: NavGroup[];
    footerItems: NavItem[];
  } => {
    switch (role) {
      case "recruiter":
        return {
          groups: [
            {
              label: "TUYỂN DỤNG",
              items: recruiterSidebarData.recruitment as NavItem[],
            },
            {
              label: "THIẾT LẬP",
              items: recruiterSidebarData.setting as NavItem[],
            },
          ],
          footerItems: recruiterSidebarData.footer as NavItem[],
        };
      case "admin":
        return {
          groups: [
            {
              label: "QUẢN TRỊ HỆ THỐNG",
              items: adminSidebarData.mainNav as NavItem[],
            },
            {
              label: "THIẾT LẬP",
              items: adminSidebarData.setting as NavItem[],
            },
          ],
          footerItems: adminSidebarData.footer as NavItem[],
        };
      case "candidate":
      default:
        return {
          groups: [
            {
              label: "TỔNG QUAN",
              items: candidateSidebarData.mainNav as NavItem[],
            },
            {
              label: "HỒ SƠ CỦA TÔI",
              items: candidateSidebarData.myProfile as NavItem[],
            },
            {
              label: "CÁ NHÂN",
              items: candidateSidebarData.personal as NavItem[],
            },
          ],
          footerItems: candidateSidebarData.footer as NavItem[],
        };
    }
  };

  const { groups, footerItems } = getRoleMenuGroups();

  const isItemActive = (item: NavItem) => {
    if (item.url && item.url !== "#") {
      if (location.pathname === item.url) return true;
      if (item.url !== "/" && location.pathname.startsWith(item.url))
        return true;
    }
    return Boolean(item.isActive && location.pathname === item.url);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="top-16 h-[calc(100svh-4rem)] border-r border-border bg-bg"
    >
      <SidebarContent className="gap-2 px-2 py-4">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider text-text-muted/70 uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  const hasSubItems = Boolean(
                    item.items && item.items.length > 0,
                  );
                  const isSubOpen = Boolean(openSubMenus[item.title]);

                  if (hasSubItems) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          onClick={() => toggleSubMenu(item.title)}
                          tooltip={item.title}
                          className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary!"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && (
                              <item.icon className="size-5 shrink-0" />
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>
                          {!isCollapsed && (
                            <span className="text-slate-400">
                              {isSubOpen ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </span>
                          )}
                        </SidebarMenuButton>

                        {/* Submenu items */}
                        {isSubOpen && !isCollapsed && (
                          <SidebarMenuSub className="my-1 ml-4 border-l border-slate-200 pl-2">
                            {item.items?.map((subItem) => {
                              const subActive =
                                location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    render={<Link to={subItem.url} />}
                                    isActive={subActive}
                                    className={`rounded-lg px-2 py-1.5 text-xs transition-colors ${
                                      subActive
                                        ? "bg-status-active font-semibold text-primary!"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-primary!"
                                    }`}
                                  >
                                    {subItem.title}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link to={item.url} />}
                        isActive={active}
                        tooltip={item.title}
                        className={`flex items-center gap-3 rounded-xl px-3 py-5 text-sm transition-colors ${
                          active
                            ? "bg-status-active! font-semibold text-primary! hover:bg-[#b7e2fd]"
                            : "font-medium text-slate-600 hover:bg-slate-100 hover:text-primary!"
                        }`}
                      >
                        {item.icon && (
                          <item.icon
                            className={`size-5 shrink-0 ${
                              active ? "text-slate-800" : "text-slate-500"
                            }`}
                          />
                        )}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      {footerItems.length > 0 && (
        <SidebarFooter className="border-t border-border/30 p-2">
          <SidebarMenu className="gap-1">
            {footerItems.map((item) => {
              const active = isItemActive(item);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link to={item.url} />}
                    isActive={active}
                    tooltip={item.title}
                    className={`flex items-center gap-3 rounded-xl px-3 py-5 text-sm transition-colors ${
                      active
                        ? "bg-status-active font-semibold text-primary!"
                        : "font-medium text-slate-600 hover:bg-slate-100 hover:text-primary!"
                    }`}
                  >
                    {item.icon && (
                      <item.icon
                        className={`size-5 shrink-0 ${
                          active ? "text-slate-800" : "text-slate-500"
                        }`}
                      />
                    )}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export default DashboardSidebar;
