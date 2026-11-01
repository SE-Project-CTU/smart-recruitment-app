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
  Eye,
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
import { useCompanyJobPostings, useRecruiterAllApplications } from "@/hooks/queries/useJob";
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

  const { data: membersData, isLoading: isLoadingMembers } =
    useCompanyMembers(activeCompanyId || undefined);

  const isLoadingData =
    isLoadingCompanies || isLoadingJobs || isLoadingApplications || isLoadingMembers;

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
      {/* 1. Header Chào mừng & Thẻ Workspace Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Xin chào, {user?.fullName || "Nhà tuyển dụng"}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tiến độ tuyển dụng, hồ sơ ứng tuyển mới và kết nối với ứng viên tiềm năng.
          </p>
        </div>

        {/* Nút tác vụ nhanh trên đầu trang */}
        {activeCompany && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              icon={Building2}
              onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}
              className="h-8! px-3! text-xs! font-semibold!"
              aria-label="Xem hồ sơ doanh nghiệp"
            >
              Hồ sơ công ty
            </Button>
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
              className="h-8! px-3.5! text-xs! font-semibold! shadow-sm"
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
          <h2 className="mt-3 text-base font-bold text-slate-900">
            Không thể tải thông tin không gian doanh nghiệp
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-600">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
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
            <div className="flex items-center gap-4 min-w-0">
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
                    className="truncate text-lg font-bold text-slate-900 max-w-full sm:max-w-md"
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
                    <span className="truncate max-w-[200px]" title={`MST: ${activeCompany.taxCode}`}>
                      MST:{" "}
                      <strong className="font-mono text-slate-700">
                        {activeCompany.taxCode}
                      </strong>
                    </span>
                  )}
                  {activeCompany.email && (
                    <span className="truncate max-w-[220px]" title={activeCompany.email}>
                      {activeCompany.email}
                    </span>
                  )}
                  {activeCompany.phone && (
                    <span className="truncate max-w-[150px]" title={activeCompany.phone}>
                      {activeCompany.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
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
                Hồ sơ doanh nghiệp đang trong quá trình kiểm duyệt. Bạn vẫn có thể thiết lập thông tin
                và quản lý thành viên; tính năng <strong>đăng tin tuyển dụng</strong> sẽ được mở khóa
                ngay sau khi hồ sơ được duyệt.
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. 4 Thẻ Số liệu Thống kê Chính (Metric Cards) */}
      {activeCompany && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric 1: Tin đang mở (Primary Oceanic Navy) */}
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
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Tin đang tuyển dụng
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Briefcase className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoadingData ? "..." : activeJobs.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{allJobs.length} tin tổng cộng</span>
                <span className="flex items-center text-primary group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all font-medium">
                  Quản lý tin <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 2: Hồ sơ mới nộp (Warm Amber Attention) */}
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
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Hồ sơ mới nộp
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <FileText className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoadingData ? "..." : newApplications.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Cần xem xét và đánh giá</span>
                <span className="flex items-center text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all font-medium">
                  Xem hồ sơ <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 3: Đang trong quy trình phỏng vấn (Indigo Pipeline) */}
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
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Đang trong quy trình
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <UserCheck className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoadingData ? "..." : inReviewApplications.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{allApplications.length} hồ sơ tổng cộng</span>
                <span className="flex items-center text-indigo-700 group-hover:text-indigo-800 group-hover:translate-x-0.5 transition-all font-medium">
                  Theo dõi quy trình <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 4: Đội ngũ nhân sự (Fresh Emerald Community) */}
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
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Đội ngũ nhân sự
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                {isLoadingData ? "..." : totalMembers}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Thành viên trong doanh nghiệp</span>
                <span className="flex items-center text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all font-medium">
                  Xem thành viên <ChevronRight className="size-3" />
                </span>
              </p>
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tin tuyển dụng gần đây
                  </h3>
                  <p className="text-xs text-slate-500 truncate" title={`5 vị trí việc làm cập nhật gần nhất của ${activeCompany.name}`}>
                    5 vị trí việc làm cập nhật gần nhất của {activeCompany.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.JOBS)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
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
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
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
                    Đăng tin tuyển dụng đầu tiên để tiếp cận và thu hút các ứng viên tiềm năng.
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
                        className="group flex flex-col gap-3 py-3.5 transition-colors first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  PATHS.RECRUITER.JOB_DETAIL.replace(
                                    ":id",
                                    job.id,
                                  ),
                                )
                              }
                              className="cursor-pointer truncate text-left text-sm font-semibold text-slate-900 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-xs"
                              title={job.title}
                              aria-label={`Xem chi tiết tin tuyển dụng: ${job.title}`}
                            >
                              {job.title}
                            </button>
                            {/* Status tag */}
                            {isPublished && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                                <CheckCircle2 className="size-3" /> Đang tuyển
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
                                <XCircle className="size-3" /> Đã đóng
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                            <span className="truncate max-w-[200px]" title={formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryNegotiable)}>
                              {formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-slate-500" />
                              Hạn nộp:{" "}
                              {deadlineFormatted || "Không giới hạn"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/15">
                              {applicantCount} ứng viên
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                PATHS.RECRUITER.JOB_DETAIL.replace(
                                  ":id",
                                  job.id,
                                ),
                              )
                            }
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            title={`Xem chi tiết tin tuyển dụng: ${job.title}`}
                            aria-label={`Xem chi tiết tin tuyển dụng: ${job.title}`}
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: 5 Ứng viên mới nộp gần đây (5 cols) */}
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
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
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
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
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
                    Khi có ứng viên nộp hồ sơ vào các vị trí tuyển dụng, thông tin sẽ được cập nhật tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentApplications.map((app) => {
                    const profile = resolveCandidateProfile(app);
                    const statusConfig =
                      APPLICATION_STATUS_CONFIG[app.status] || {
                        label: app.status,
                        badgeClass: "bg-slate-100 text-slate-700",
                      };
                    const appliedFormatted = safeFormatDate(app.appliedAt, "DD/MM/YYYY HH:mm");
                    const targetJobTitle = app.jobTitle || app.job?.title || "Ứng tuyển vị trí";

                    return (
                      <div
                        key={app.id}
                        className="group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Avatar với fallback tự động */}
                          <UserAvatar
                            src={profile.avatarUrl || ""}
                            name={profile.name}
                            alt={profile.name}
                            className="size-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                              className="cursor-pointer truncate text-left text-xs font-semibold text-slate-900 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-xs block max-w-[160px] sm:max-w-[200px]"
                              title={`Xem hồ sơ: ${profile.name}`}
                              aria-label={`Xem thông tin ứng viên ${profile.name}`}
                            >
                              {profile.name}
                            </button>
                            <p
                              className="truncate text-[11px] text-slate-500 max-w-[160px] sm:max-w-[200px]"
                              title={targetJobTitle}
                            >
                              {targetJobTitle}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              {appliedFormatted || "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${statusConfig.badgeClass}`}
                          >
                            {statusConfig.label}
                          </span>
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

      {/* 4. Quick Actions Banner phía dưới (SmartHire Deep Oceanic Signature) */}
      {activeCompany && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-r from-primary-dark via-primary to-[#18457d] p-6 text-white shadow-sm">
          {/* Subtle ambient Glacier Sky glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-secondary/10 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-300" />
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Tuyển dụng thông minh cùng trợ lý AI SmartHire
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-200 max-w-2xl leading-relaxed">
                Tận dụng AI để tự động phân tích CV, so khớp năng lực và gợi ý các ứng viên phù hợp nhất với tiêu chí tuyển dụng.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary shadow-xs transition-all duration-200 hover:bg-secondary-light hover:text-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Khám phá kho ứng viên với trợ lý AI"
              >
                Khám phá kho ứng viên
              </button>
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
