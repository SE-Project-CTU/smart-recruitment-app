import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronsUpDown,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getLoremAvt } from "@/utils/helper";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyStore } from "@/stores/companyStore";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import { CreateCompanyModal } from "@/pages/recruiter/company/CreateCompanyModal";
import { PATHS } from "@/constants/paths";
import type { CompanyItem } from "@/types/company";

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Atomic selectors từ Zustand
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const clearActiveCompany = useCompanyStore((s) => s.clearActiveCompany);

  // Lấy danh sách các công ty mà recruiter tham gia
  const { data: companies = [], isLoading } = useMyCompanies();

  // Khởi tạo & đồng bộ an toàn: tự chọn công ty đầu tiên nếu chưa chọn hoặc id cũ không còn hợp lệ
  useEffect(() => {
    if (isLoading) return;

    if (companies.length === 0) {
      if (activeCompanyId !== null || activeCompany !== null) {
        clearActiveCompany();
      }
      return;
    }

    const matched = companies.find((c) => c.id === activeCompanyId);
    if (!matched) {
      // Nếu chưa có hoặc id lưu không khớp công ty nào trong danh sách, chọn công ty đầu tiên
      setActiveCompany(companies[0]);
    } else if (
      !activeCompany ||
      activeCompany.id !== matched.id ||
      activeCompany.name !== matched.name ||
      activeCompany.logoUrl !== matched.logoUrl ||
      activeCompany.logoFileId !== matched.logoFileId ||
      activeCompany.verificationStatus !== matched.verificationStatus
    ) {
      // Giữ thông tin tóm tắt luôn đồng bộ mới nhất
      setActiveCompany(matched);
    }
  }, [companies, activeCompanyId, activeCompany, isLoading, setActiveCompany, clearActiveCompany]);

  // Tìm công ty đang hiển thị
  const currentCompany: CompanyItem | null = useMemo(() => {
    if (companies.length === 0) return null;
    const matched = companies.find((c) => c.id === activeCompanyId);
    if (matched) {
      if (activeCompany && activeCompany.id === matched.id) {
        return activeCompany;
      }
      return matched;
    }
    if (activeCompany && companies.some((c) => c.id === activeCompany.id)) {
      return activeCompany;
    }
    return companies[0] || null;
  }, [activeCompany, activeCompanyId, companies]);

  const handleSelectCompany = (company: CompanyItem) => {
    if (company.id === activeCompanyId) return;

    setActiveCompany(company);

    // Nếu đang ở trang quản trị chi tiết công ty, tự động đổi URL sang ID công ty mới
    if (location.pathname.includes(PATHS.RECRUITER.COMPANY_MANAGEMENT)) {
      navigate(PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(":companyId", company.id), {
        replace: true,
      });
    }
  };

  const handleCompanyCreated = (newCompany: CompanyItem) => {
    setActiveCompany(newCompany);
    setIsCreateModalOpen(false);
    if (location.pathname.includes(PATHS.RECRUITER.COMPANY_MANAGEMENT)) {
      navigate(PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(":companyId", newCompany.id), {
        replace: true,
      });
    }
  };

  // Helper hiển thị vai trò ngắn gọn
  const getRoleLabel = (company: CompanyItem) => {
    if (company.membership?.role === "Owner") return "Chủ sở hữu";
    return "Thành viên";
  };

  if (isLoading && !currentCompany) {
    return (
      <div className="flex h-12 w-full animate-pulse items-center gap-3 rounded-xl bg-slate-100 p-2">
        <div className="size-8 rounded-lg bg-slate-200" />
        {!isCollapsed && (
          <div className="flex-1 space-y-1">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-2 w-16 rounded bg-slate-200" />
          </div>
        )}
      </div>
    );
  }

  // Trường hợp Recruiter chưa thuộc công ty nào
  if (companies.length === 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex w-full items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          title="Tạo hồ sơ công ty để bắt đầu"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="size-4" />
          </div>
          {!isCollapsed && <span>Tạo hồ sơ công ty</span>}
        </button>

        <CreateCompanyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCompanyCreated}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`group flex w-full cursor-pointer items-center rounded-xl p-1.5 transition-all outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20 ${
            isCollapsed ? "justify-center" : "justify-between gap-2.5"
          }`}
        >
          {/* Logo & Info */}
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
              <img
                key={currentCompany?.logoUrl || "current-logo"}
                src={
                  currentCompany?.logoUrl ||
                  getLoremAvt(currentCompany?.name || "Doanh nghiệp")
                }
                alt={currentCompany?.name || "Doanh nghiệp"}
                className="size-full object-contain p-0.5"
                onError={(e) => {
                  const fallback = getLoremAvt(
                    currentCompany?.name || "Doanh nghiệp",
                  );
                  const img = e.currentTarget;
                  if (img.src !== new URL(fallback, img.baseURI).href) {
                    img.onerror = null;
                    img.src = fallback;
                  }
                }}
              />
            </div>

            {!isCollapsed && (
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-text-main">
                    {currentCompany?.name || "Chọn doanh nghiệp"}
                  </span>
                  {currentCompany?.verificationStatus?.toUpperCase() === "VERIFIED" && (
                    <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" />
                  )}
                </div>
                <span className="truncate text-[10px] text-text-muted">
                  {currentCompany ? getRoleLabel(currentCompany) : "Workspace"}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <ChevronsUpDown className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-main" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={8}
          className="w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-1.5 shadow-lg"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-text-muted uppercase">
              Chuyển đổi doanh nghiệp ({companies.length})
            </DropdownMenuLabel>

            {companies.map((comp) => {
              const isSelected = comp.id === currentCompany?.id;
              const displayComp =
                isSelected && activeCompany?.id === comp.id
                  ? activeCompany
                  : comp;
              return (
                <DropdownMenuItem
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-xs transition-colors ${
                    isSelected
                      ? "bg-secondary-light font-semibold text-primary"
                      : "text-text-main hover:bg-bg-white-blue!"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                      <img
                        key={displayComp.logoUrl || comp.id}
                        src={displayComp.logoUrl || getLoremAvt(displayComp.name)}
                        alt={displayComp.name}
                        className="size-full object-contain p-0.5"
                        onError={(e) => {
                          const fallback = getLoremAvt(displayComp.name);
                          const img = e.currentTarget;
                          if (img.src !== new URL(fallback, img.baseURI).href) {
                            img.onerror = null;
                            img.src = fallback;
                          }
                        }}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs">{displayComp.name}</span>
                      <span className="text-[10px] text-text-muted">
                        {getRoleLabel(comp)}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 border-t border-border" />

          <DropdownMenuItem
            onClick={() => setIsCreateModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-primary hover:bg-bg-white-blue!"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Plus className="size-3.5" />
            </div>
            <span>Tạo doanh nghiệp mới</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Tạo công ty mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </>
  );
}
export default WorkspaceSwitcher;
