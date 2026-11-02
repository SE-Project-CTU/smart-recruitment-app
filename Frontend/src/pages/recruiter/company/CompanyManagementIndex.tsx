import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, MailCheck } from "lucide-react";
import Button from "@/components/common/Button";
import { useCompanyStore } from "@/stores/companyStore";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import { CreateCompanyModal } from "./CreateCompanyModal";
import { PATHS } from "@/constants/paths";
import { EmptyState } from "@/assets/images/decoration";
import type { CompanyItem } from "@/types/company";

/**
 * Component điều hướng thông minh khi vào route `/recruiter/company-management`:
 * - Nếu Recruiter đã có công ty: Tự động chuyển thẳng vào trang quản trị của công ty đang hoạt động.
 * - Nếu Recruiter chưa có công ty nào: Hiển thị màn hình Onboarding hướng dẫn tạo hoặc tham gia công ty.
 */
export function CompanyManagementIndex() {
  const navigate = useNavigate();
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const { data: companies = [], isLoading } = useMyCompanies();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCompanyCreated = (newCompany: CompanyItem) => {
    setActiveCompany(newCompany);
    setIsCreateModalOpen(false);
    navigate(PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(":companyId", newCompany.id), {
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-3xl border border-border bg-surface/50" />
        <div className="h-96 animate-pulse rounded-3xl border border-border bg-surface/50" />
      </div>
    );
  }

  // Recruiter có ít nhất 1 công ty -> chuyển thẳng vào công ty active (hoặc công ty đầu tiên)
  if (companies.length > 0) {
    const targetId =
      activeCompanyId && companies.some((c) => c.id === activeCompanyId)
        ? activeCompanyId
        : companies[0].id;

    return (
      <Navigate
        to={PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(":companyId", targetId)}
        replace
      />
    );
  }

  // Trường hợp Recruiter chưa thuộc doanh nghiệp nào: Onboarding
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
      <div className="mb-4 flex size-56 items-center justify-center md:size-80">
        <img
          src={EmptyState}
          alt="Chưa có doanh nghiệp"
          className="object-cover"
        />
      </div>
      <h2 className="text-lg font-bold text-text-main sm:text-xl">
        Bạn chưa thuộc doanh nghiệp nào
      </h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
        Để bắt đầu quản trị tuyển dụng và tìm kiếm ứng viên, bạn có thể tạo hồ sơ
        doanh nghiệp mới hoặc kiểm tra lời mời tham gia từ đồng nghiệp.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo công ty mới
        </Button>
        <Button
          variant="secondary"
          icon={MailCheck}
          onClick={() => navigate(PATHS.RECRUITER.COMPANY_INVITATION)}
        >
          Xem lời mời tham gia
        </Button>
      </div>

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </div>
  );
}

export default CompanyManagementIndex;

