import { useState, useMemo } from "react";
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
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/common/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
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
  const { data: companiesData, isLoading: isLoadingCompanies } = useMyCompanies();
  const companies = companiesData || [];

  const { data: jobResponse, isLoading: isLoadingJobs } = useCompanyJobPostings(
    activeCompanyId,
    { page: 1, pageSize: 100 },
  );
  const { data: applications, isLoading: isLoadingApplications } =
    useRecruiterAllApplications(activeCompanyId);
  const { data: membersData, isLoading: isLoadingMembers } =
    useCompanyMembers(activeCompanyId || undefined);

  const isLoadingData =
    isLoadingCompanies || isLoadingJobs || isLoadingApplications || isLoadingMembers;

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

  // 5 tin tuyển dụng gần đây nhất
  const recentJobs = useMemo(() => {
    return [...allJobs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [allJobs]);

  // 5 hồ sơ ứng viên nộp gần đây nhất
  const recentApplications = useMemo(() => {
    return [...allApplications]
      .sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      )
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

      {/* Trạng thái 0 công ty (Onboarding) */}
      {!isLoadingCompanies && companies.length === 0 && (
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 shadow-xs">
                <CompanyLogo
                  name={activeCompany.name}
                  logoUrl={activeCompany.logoUrl}
                  size="md"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900">
                    {activeCompany.name}
                  </h2>
                  {/* Trạng thái xác thực */}
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      Đã xác thực
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      <Clock className="size-3.5 text-amber-600" />
                      Chờ kiểm duyệt
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                      <AlertCircle className="size-3.5 text-rose-600" />
                      Chưa được phê duyệt
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {activeCompany.taxCode && (
                    <span>
                      MST:{" "}
                      <strong className="font-mono text-slate-700">
                        {activeCompany.taxCode}
                      </strong>
                    </span>
                  )}
                  {activeCompany.email && <span>{activeCompany.email}</span>}
                  {activeCompany.phone && <span>{activeCompany.phone}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
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
          {/* Metric 1: Tin đang mở */}
          <div
            onClick={() => navigate(PATHS.RECRUITER.JOBS)}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Tin đang tuyển dụng
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Briefcase className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900">
                {isLoadingData ? "..." : activeJobs.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{allJobs.length} tin tổng cộng</span>
                <span className="flex items-center text-blue-600 group-hover:translate-x-0.5 transition-transform font-medium">
                  Quản lý tin <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 2: Hồ sơ mới nộp */}
          <div
            onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-amber-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Hồ sơ mới nộp
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <FileText className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900">
                {isLoadingData ? "..." : newApplications.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Cần xem xét và đánh giá</span>
                <span className="flex items-center text-amber-600 group-hover:translate-x-0.5 transition-transform font-medium">
                  Xem hồ sơ <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 3: Đang trong quy trình phỏng vấn */}
          <div
            onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Đang trong quy trình
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <UserCheck className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900">
                {isLoadingData ? "..." : inReviewApplications.length}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{allApplications.length} hồ sơ tổng cộng</span>
                <span className="flex items-center text-purple-600 group-hover:translate-x-0.5 transition-transform font-medium">
                  Theo dõi quy trình <ChevronRight className="size-3" />
                </span>
              </p>
            </div>
          </div>

          {/* Metric 4: Đội ngũ nhân sự */}
          <div
            onClick={() =>
              navigate(
                PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                  ":companyId",
                  activeCompany.id,
                ),
              )
            }
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Đội ngũ nhân sự
              </span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900">
                {isLoadingData ? "..." : totalMembers}
              </div>
              <p className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Thành viên trong doanh nghiệp</span>
                <span className="flex items-center text-emerald-600 group-hover:translate-x-0.5 transition-transform font-medium">
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
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tin tuyển dụng gần đây
                  </h3>
                  <p className="text-xs text-slate-500">
                    5 vị trí việc làm cập nhật gần nhất của {activeCompany.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.JOBS)}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
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

                    return (
                      <div
                        key={job.id}
                        className="group flex flex-col gap-3 py-3.5 transition-colors first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() =>
                                navigate(
                                  PATHS.RECRUITER.JOB_DETAIL.replace(
                                    ":id",
                                    job.id,
                                  ),
                                )
                              }
                              className="cursor-pointer truncate text-sm font-semibold text-slate-900 transition-colors hover:text-primary"
                              title={job.title}
                            >
                              {job.title}
                            </span>
                            {/* Status tag */}
                            {isPublished && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3" /> Đang tuyển
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                <XCircle className="size-3" /> Đã đóng
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                            <span>
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
                              {job.deadline
                                ? dayjs(job.deadline).format("DD/MM/YYYY")
                                : "Không giới hạn"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-lg bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700">
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
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-primary hover:text-primary"
                            title="Xem chi tiết tin"
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
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hồ sơ ứng tuyển gần đây
                  </h3>
                  <p className="text-xs text-slate-500">5 hồ sơ nộp gần nhất</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
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

                    return (
                      <div
                        key={app.id}
                        className="group flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {/* Avatar */}
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt={profile.name}
                              className="size-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4
                              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                              className="cursor-pointer truncate text-xs font-bold text-slate-900 hover:text-primary transition-colors"
                            >
                              {profile.name}
                            </h4>
                            <p className="truncate text-[11px] text-slate-500">
                              {app.jobTitle || app.job?.title || "Ứng tuyển vị trí"}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              {dayjs(app.appliedAt).format("DD/MM/YYYY HH:mm")}
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

      {/* 4. Quick Actions Banner phía dưới */}
      {activeCompany && (
        <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                <h3 className="text-base font-bold">
                  Tuyển dụng thông minh cùng trợ lý AI SmartHire
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Tận dụng AI để tự động phân tích CV, so khớp năng lực và gợi ý các ứng viên phù hợp nhất với tiêu chí tuyển dụng.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="h-9! px-4! text-xs! font-semibold!"
                aria-label="Khám phá kho ứng viên với trợ lý AI"
              >
                Khám phá kho ứng viên
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
