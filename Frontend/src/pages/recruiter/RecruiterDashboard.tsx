import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  FileText,
  UserCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/common/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { CreateCompanyModal } from "./company/CreateCompanyModal";
import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";
import { useMyCompanies, useCompanyMembers } from "@/hooks/queries/useCompany";
import {
  useCompanyJobPostings,
  useRecruiterAllApplications,
} from "@/hooks/queries/useJob";
import { PATHS } from "@/constants/paths";
import { formatSalaryRange } from "@/utils/jobHelpers";
import {
  APPLICATION_STATUS_CONFIG,
  resolveCandidateProfile,
  type RecruiterCandidateApplicationItem,
} from "@/types/application";
import type { CompanyItem, JobPostingItem } from "@/types";

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);

  // Modal tạo công ty mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
    refetch: refetchCompanies,
  } = useMyCompanies();
  const companies = companiesData || [];

  const {
    data: jobResponse,
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    refetch: refetchJobs,
  } = useCompanyJobPostings(activeCompanyId, { page: 1, pageSize: 100 });

  const {
    data: applications,
    isLoading: isLoadingApplications,
    isError: isErrorApplications,
    refetch: refetchApplications,
  } = useRecruiterAllApplications(activeCompanyId);

  const { data: membersData, isLoading: isLoadingMembers } = useCompanyMembers(
    activeCompanyId || undefined,
  );

  const isLoadingData =
    isLoadingCompanies ||
    isLoadingJobs ||
    isLoadingApplications ||
    isLoadingMembers;

  // Tự động đồng bộ và chọn doanh nghiệp hoạt động nếu chưa có hoặc dữ liệu server thay đổi
  useEffect(() => {
    if (companies.length > 0) {
      const found = companies.find((c) => c.id === activeCompany?.id);
      if (found) {
        if (
          found.verificationStatus !== activeCompany?.verificationStatus ||
          found.name !== activeCompany?.name ||
          found.logoUrl !== activeCompany?.logoUrl
        ) {
          setActiveCompany(found);
        }
      } else {
        setActiveCompany(companies[0]);
      }
    }
  }, [companies, activeCompany, setActiveCompany]);

  // Lọc danh sách công việc & số liệu thống kê
  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  const activeJobs = useMemo(
    () => allJobs.filter((j) => j.status === "Published"),
    [allJobs],
  );

  const allApplications: RecruiterCandidateApplicationItem[] = useMemo(() => {
    return applications || [];
  }, [applications]);

  const newApplications = useMemo(
    () =>
      allApplications.filter(
        (a) => a.status === "Submitted" || a.status === "Received",
      ),
    [allApplications],
  );

  const inReviewApplications = useMemo(
    () =>
      allApplications.filter((a) =>
        ["Approved", "Reviewing", "Shortlisted", "Interviewing"].includes(
          a.status,
        ),
      ),
    [allApplications],
  );

  const totalMembers = membersData?.totalCount ?? 1;

  // 5 tin tuyển dụng gần đây nhất (an toàn với dữ liệu ngày tháng không hợp lệ)
  const recentJobs = useMemo(() => {
    return [...allJobs]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [allJobs]);

  // 5 hồ sơ ứng viên nộp gần đây nhất
  const recentApplications = useMemo(() => {
    return [...allApplications]
      .sort((a, b) => {
        const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [allApplications]);

  // Map số lượng ứng viên theo JobId
  const jobApplicationCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allApplications.forEach((app) => {
      const jobId = app.jobId || app.job?.id;
      if (jobId) {
        map.set(jobId, (map.get(jobId) || 0) + 1);
      }
    });
    return map;
  }, [allApplications]);

  // Trạng thái công ty active
  const isVerified = activeCompany?.verificationStatus === "Verified";
  const isPending = activeCompany?.verificationStatus === "Pending";
  const isRejected = activeCompany?.verificationStatus === "Rejected";

  const handleCreateCompanySuccess = (newCompany: CompanyItem) => {
    setActiveCompany(newCompany);
    setIsCreateModalOpen(false);
  };

  // Helper định dạng ngày an toàn
  const safeFormatDate = (dateStr?: string | null, format = "DD/MM/YYYY") => {
    if (!dateStr) return null;
    const d = dayjs(dateStr);
    return d.isValid() ? d.format(format) : null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Chào mừng & Nút Đăng tin chính */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Xin chào, {user?.fullName || "Nhà tuyển dụng"}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tiến độ tuyển dụng, hồ sơ ứng tuyển mới và kết nối với ứng
            viên tiềm năng.
          </p>
        </div>

        {/* Hành động chính duy nhất trên đầu trang (Primary CTA) */}
        {activeCompany && (
          <div className="flex items-center">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
              disabled={!isVerified}
              title={
                !isVerified
                  ? "Doanh nghiệp cần được xác thực trước khi tạo tin tuyển dụng"
                  : undefined
              }
              className="h-9! px-4! text-xs! font-semibold! shadow-sm"
              aria-label="Đăng tin tuyển dụng mới"
            >
              Đăng tin tuyển dụng
            </Button>
          </div>
        )}
      </div>

      {/* Lỗi khi tải danh sách công ty */}
      {isErrorCompanies && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            Không thể tải thông tin không gian doanh nghiệp
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-600">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối
            mạng và thử lại.
          </p>
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={() => refetchCompanies()}
            className="mt-4 h-8! px-4! text-xs! font-semibold!"
            aria-label="Thử tải lại thông tin doanh nghiệp"
          >
            Tải lại dữ liệu
          </Button>
        </div>
      )}

      {/* Trạng thái 0 công ty (Onboarding) - chỉ hiển thị khi đã nạp xong và không có lỗi */}
      {!isLoadingCompanies && !isErrorCompanies && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Chưa có không gian làm việc doanh nghiệp
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Tạo hồ sơ doanh nghiệp mới hoặc tham gia doanh nghiệp để bắt đầu
            đăng tin tuyển dụng và quản lý hồ sơ ứng viên.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="font-semibold shadow-sm"
              aria-label="Tạo hồ sơ doanh nghiệp mới"
            >
              Tạo hồ sơ doanh nghiệp
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.RECRUITER.COMPANY_INVITATION)}
              className="font-semibold"
              aria-label="Kiểm tra các lời mời tham gia doanh nghiệp"
            >
              Kiểm tra lời mời tham gia
            </Button>
          </div>
        </div>
      )}

      {/* Thẻ Doanh nghiệp Workspace Banner đang hoạt động */}
      {activeCompany && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-r from-white via-white to-sky-50/30 p-5 shadow-xs transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 shadow-xs">
                <CompanyLogo
                  name={activeCompany.name}
                  logoUrl={activeCompany.logoUrl}
                  size="md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="max-w-full truncate text-lg font-bold text-slate-900 sm:max-w-md"
                    title={activeCompany.name}
                  >
                    {activeCompany.name}
                  </h2>
                  {/* Trạng thái xác thực */}
                  {isVerified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      Đã xác thực
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      <Clock className="size-3.5 text-amber-600" />
                      Chờ kiểm duyệt
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                      <AlertCircle className="size-3.5 text-rose-600" />
                      Chưa được phê duyệt
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {activeCompany.taxCode && (
                    <span
                      className="max-w-[200px] truncate"
                      title={`MST: ${activeCompany.taxCode}`}
                    >
                      MST:{" "}
                      <span className="font-mono font-medium text-slate-700">
                        {activeCompany.taxCode}
                      </span>
                    </span>
                  )}
                  {activeCompany.email && (
                    <span
                      className="max-w-[220px] truncate"
                      title={activeCompany.email}
                    >
                      {activeCompany.email}
                    </span>
                  )}
                  {activeCompany.phone && (
                    <span
                      className="max-w-[150px] truncate"
                      title={activeCompany.phone}
                    >
                      {activeCompany.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <Button
                variant="secondary"
                icon={ExternalLink}
                iconSize={13}
                onClick={() =>
                  navigate(
                    PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                      ":companyId",
                      activeCompany.id,
                    ),
                  )
                }
                className="h-8! px-3! text-xs! font-medium!"
                aria-label={`Xem chi tiết hồ sơ công ty ${activeCompany.name}`}
              >
                Chi tiết công ty
              </Button>
            </div>
          </div>

          {/* Cảnh báo nếu công ty đang chờ duyệt */}
          {isPending && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800">
              <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>
                Hồ sơ doanh nghiệp đang trong quá trình kiểm duyệt (thường xử lý
                trong 24h làm việc). Tính năng{" "}
                <span className="font-semibold text-amber-900">
                  đăng tin tuyển dụng
                </span>{" "}
                sẽ tự động kích hoạt ngay sau khi hồ sơ được duyệt.
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Quy trình Tuyển dụng Liền mạch (Unified Recruitment Funnel) - Thay thế 4 thẻ generic rời rạc */}
      {activeCompany && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {/* Stage 1: Tin đang mở */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.JOBS)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.JOBS);
                }
              }}
              aria-label="Xem danh sách tin đang tuyển dụng"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  1. Tin đang tuyển
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Briefcase className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {activeJobs.length}
                  </div>
                )}
                <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{allJobs.length} tin tổng cộng</span>
                  <span className="flex items-center font-medium text-primary transition-transform group-hover:translate-x-0.5">
                    Quản lý tin <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </p>
              </div>
            </div>

            {/* Stage 2: Hồ sơ mới nộp */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.CANDIDATES);
                }
              }}
              aria-label="Xem danh sách hồ sơ mới nộp"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  2. Hồ sơ mới nộp
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <FileText className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {newApplications.length}
                  </div>
                )}
                <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Cần xem xét</span>
                  <span className="flex items-center font-medium text-amber-700 transition-transform group-hover:translate-x-0.5">
                    Xem hồ sơ <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </p>
              </div>
            </div>

            {/* Stage 3: Đang trong quy trình phỏng vấn */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.CANDIDATES);
                }
              }}
              aria-label="Xem danh sách hồ sơ đang trong quy trình"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  3. Đang xử lý / Phỏng vấn
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <UserCheck className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {inReviewApplications.length}
                  </div>
                )}
                <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{allApplications.length} hồ sơ tổng cộng</span>
                  <span className="flex items-center font-medium text-indigo-700 transition-transform group-hover:translate-x-0.5">
                    Quy trình <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </p>
              </div>
            </div>

            {/* Stage 4: Đội ngũ nhân sự */}
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                    ":companyId",
                    activeCompany.id,
                  ),
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(
                    PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                      ":companyId",
                      activeCompany.id,
                    ),
                  );
                }
              }}
              aria-label="Xem danh sách đội ngũ nhân sự trong doanh nghiệp"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  4. Đội ngũ nhân sự
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {totalMembers}
                  </div>
                )}
                <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Thành viên doanh nghiệp</span>
                  <span className="flex items-center font-medium text-emerald-700 transition-transform group-hover:translate-x-0.5">
                    Thành viên <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dữ liệu chi tiết: Tin gần đây & Ứng viên mới nhất (Grid 2 cột) */}
      {activeCompany && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Cột trái: 5 Tin tuyển dụng gần đây (7 cols) */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tin tuyển dụng gần đây
                  </h3>
                  <p
                    className="truncate text-xs text-slate-500"
                    title={`5 vị trí cập nhật gần nhất của ${activeCompany.name}`}
                  >
                    5 vị trí cập nhật gần nhất
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.JOBS)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xs text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={`Xem tất cả ${allJobs.length} tin tuyển dụng`}
              >
                <span>Xem tất cả ({allJobs.length})</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 p-5">
              {isLoadingJobs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : isErrorJobs ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <AlertCircle className="size-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Không thể tải danh sách tin tuyển dụng
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchJobs()}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    aria-label="Thử tải lại danh sách tin tuyển dụng"
                  >
                    <RotateCcw className="size-3" />
                    Thử lại
                  </button>
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Briefcase className="size-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Chưa có tin tuyển dụng nào
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Đăng tin tuyển dụng đầu tiên để tiếp cận và thu hút các ứng
                    viên tiềm năng.
                  </p>
                  {isVerified && (
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
                      className="mt-4 h-8! px-3! text-xs! font-semibold!"
                      aria-label="Tạo tin tuyển dụng mới"
                    >
                      Tạo tin tuyển dụng
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentJobs.map((job) => {
                    const applicantCount =
                      jobApplicationCountMap.get(job.id) || 0;
                    const isPublished = job.status === "Published";
                    const isClosed = job.status === "Closed";
                    const deadlineFormatted = safeFormatDate(job.deadline);

                    return (
                      <div
                        key={job.id}
                        onClick={() =>
                          navigate(
                            PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id),
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(
                              PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id),
                            );
                          }
                        }}
                        aria-label={`Xem chi tiết tin tuyển dụng: ${job.title}`}
                        className="group -mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                              {job.title}
                            </span>
                            {/* Status tag */}
                            {isPublished && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3" /> Đang tuyển
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                <XCircle className="size-3" /> Đã đóng
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                            <span
                              className="max-w-[200px] truncate"
                              title={formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            >
                              {formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-slate-500" />
                              Hạn: {deadlineFormatted || "Không giới hạn"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="inline-flex items-center rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                            {applicantCount} ứng viên
                          </span>
                          <ChevronRight className="size-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: 5 Ứng viên mới nộp gần đây (5 cols) với AI Match Score */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Hồ sơ ứng tuyển gần đây
                  </h3>
                  <p className="text-xs text-slate-500">5 hồ sơ nộp gần nhất</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xs text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={`Xem tất cả ${allApplications.length} hồ sơ ứng tuyển`}
              >
                <span>Xem tất cả ({allApplications.length})</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 p-5">
              {isLoadingApplications ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : isErrorApplications ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <AlertCircle className="size-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Không thể tải danh sách hồ sơ ứng tuyển
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchApplications()}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    aria-label="Thử tải lại danh sách hồ sơ ứng tuyển"
                  >
                    <RotateCcw className="size-3" />
                    Thử lại
                  </button>
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <UserCheck className="size-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Chưa có hồ sơ ứng tuyển nào
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Khi có ứng viên nộp hồ sơ vào các vị trí tuyển dụng, thông
                    tin sẽ được cập nhật tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((app) => {
                    const profile = resolveCandidateProfile(app);
                    const statusConfig = APPLICATION_STATUS_CONFIG[
                      app.status
                    ] || {
                      label: app.status,
                      badgeClass: "bg-slate-100 text-slate-700",
                    };
                    const appliedFormatted = safeFormatDate(
                      app.appliedAt,
                      "DD/MM/YYYY HH:mm",
                    );
                    const targetJobTitle =
                      app.jobTitle || app.job?.title || "Ứng tuyển vị trí";

                    // Trích xuất AI Match Score nếu có từ backend hoặc data adapter
                    const rawScore =
                      "aiMatchScore" in app &&
                      typeof (app as Record<string, unknown>).aiMatchScore ===
                        "number"
                        ? ((app as Record<string, unknown>)
                            .aiMatchScore as number)
                        : "matchScore" in app &&
                            typeof (app as Record<string, unknown>)
                              .matchScore === "number"
                          ? ((app as Record<string, unknown>)
                              .matchScore as number)
                          : null;

                    // Deep-link trực tiếp đến màn hình ứng viên với bộ lọc vị trí
                    const candidateDeepLink = app.jobId
                      ? `${PATHS.RECRUITER.CANDIDATES}?jobId=${app.jobId}&search=${encodeURIComponent(profile.name)}`
                      : PATHS.RECRUITER.CANDIDATES;

                    return (
                      <div
                        key={app.id}
                        onClick={() => navigate(candidateDeepLink)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(candidateDeepLink);
                          }
                        }}
                        aria-label={`Xem hồ sơ ứng viên: ${profile.name}`}
                        className="group -mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Avatar với fallback tự động */}
                          <UserAvatar
                            src={profile.avatarUrl || ""}
                            name={profile.name}
                            alt={profile.name}
                            className="size-9.5 shrink-0 rounded-full border border-slate-200 object-cover"
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="max-w-[130px] truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-primary sm:max-w-[160px]">
                                {profile.name}
                              </span>
                              {rawScore !== null ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  <Sparkles className="size-2.5 text-emerald-600" />
                                  {rawScore}%
                                </span>
                              ) : app.uploadedCvUrl ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                                  <FileText className="size-2.5 text-slate-500" />
                                  PDF
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md border border-primary/15 bg-primary/5 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  <Sparkles className="size-2.5 text-primary" />
                                  SmartHire
                                </span>
                              )}
                            </div>
                            <p
                              className="mt-0.5 max-w-[160px] truncate text-xs text-slate-500 sm:max-w-[200px]"
                              title={targetJobTitle}
                            >
                              {targetJobTitle}
                            </p>
                            <span className="text-xs text-slate-400">
                              {appliedFormatted || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                          >
                            {statusConfig.label}
                          </span>
                          <ChevronRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Trung tâm Đề xuất & Thông tin Tối ưu Tuyển dụng AI (SmartHire Copilot Center) */}
      {activeCompany && (
        <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary-dark via-primary to-primary-light/90 p-5 text-white shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-300" />
                <h3 className="text-base font-semibold tracking-tight text-white">
                  Trung tâm Trợ lý Tuyển dụng AI SmartHire
                </h3>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-200">
                {newApplications.length > 0
                  ? `Hệ thống AI đã tiếp nhận ${newApplications.length} hồ sơ mới cần đánh giá và đối soát năng lực với tiêu chí của doanh nghiệp.`
                  : activeJobs.length === 0
                    ? "Doanh nghiệp hiện chưa có vị trí đăng tuyển nào đang mở. Hãy tạo tin tuyển dụng mới để kích hoạt khả năng so khớp ứng viên tự động."
                    : `Đang theo dõi tự động mức độ phù hợp của ${allApplications.length} hồ sơ ứng tuyển trên ${activeJobs.length} vị trí việc làm đang mở.`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="h-9! rounded-full! bg-white! px-4! text-xs! font-semibold! text-primary! hover:bg-secondary-light! hover:text-primary-dark!"
                aria-label="Sàng lọc hồ sơ ứng viên với trợ lý AI"
              >
                {newApplications.length > 0
                  ? "Sàng lọc hồ sơ ngay"
                  : "Quản lý kho ứng viên"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo doanh nghiệp mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  );
}
