import { useState, useEffect, useMemo, useCallback } from "react";
import { useMyBookmarkedJobs, useJobPostingDetail } from "@/hooks/queries/useJob";
import { getApiErrorMessage } from "@/api/errorHandler";
import { formatSalaryCompact, getWorkModeLabel } from "@/utils/jobHelpers";
import type { TargetJobOption } from "../components/assistant/types";
import type { BookmarkedJobResult } from "@/types/job";

interface UseTargetJobSelectionOptions {
  isOpen: boolean;
  initialSelectedJob?: TargetJobOption | null;
  pageSize?: number;
}

/**
 * Chuyển đổi một BookmarkedJobResult sang cấu trúc TargetJobOption
 */
function mapBookmarkToTargetJobOption(job: BookmarkedJobResult): TargetJobOption {
  const salaryInfo = formatSalaryCompact(
    job.salaryMin,
    job.salaryMax,
    job.salaryNegotiable,
  );

  return {
    id: job.id,
    title: job.title,
    companyName: job.company?.name || "Doanh nghiệp",
    location: job.province?.name || "Toàn quốc",
    salaryText: salaryInfo.fullText,
    experienceLevel: job.experienceYears
      ? `${job.experienceYears} năm kinh nghiệm`
      : undefined,
    workMode: getWorkModeLabel(job.workMode),
    skills: job.skillNames || [],
    description: `Vị trí tuyển dụng ${job.title} tại ${job.company?.name || "doanh nghiệp"}.`,
    requirements: job.skillNames?.length
      ? [`Yêu cầu kỹ năng: ${job.skillNames.join(", ")}`]
      : [],
  };
}

/**
 * Hook quản lý toàn bộ nghiệp vụ chọn Job mục tiêu:
 * - Gọi useMyBookmarkedJobs với tìm kiếm theo API và phân trang
 * - Debounce từ khóa tìm kiếm 300ms
 * - Tải chi tiết JD qua useJobPostingDetail
 * - Lưu giữ Job đã chọn theo ID ngay cả khi chuyển trang hoặc đổi từ khóa tìm kiếm
 * - Phân loại chi tiết các trạng thái loading/error/empty
 */
export function useTargetJobSelection({
  isOpen,
  initialSelectedJob = null,
  pageSize = 8,
}: UseTargetJobSelectionOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Job đang được chọn tạm thời trong modal
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialSelectedJob?.id || null,
  );
  const [selectedJobSummary, setSelectedJobSummary] =
    useState<TargetJobOption | null>(initialSelectedJob || null);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Trở về trang đầu khi từ khóa tìm kiếm thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Đồng bộ lại lựa chọn ban đầu mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSelectedJobId(initialSelectedJob?.id || null);
      setSelectedJobSummary(initialSelectedJob || null);
      setSearchQuery("");
      setDebouncedSearch("");
      setPage(1);
    }
  }, [isOpen, initialSelectedJob]);

  // 1. Query danh sách tin đã lưu phân trang từ API
  const bookmarkedQuery = useMyBookmarkedJobs(
    {
      search: debouncedSearch.trim() || undefined,
      page,
      pageSize,
    },
    { enabled: isOpen },
  );

  const rawItems = bookmarkedQuery.data?.items || [];
  const meta = bookmarkedQuery.data?.meta;
  const totalItems = meta?.totalItems || 0;
  const totalPages = meta?.totalPages || (totalItems > 0 ? 1 : 0);

  // Chuyển đổi danh sách tin đã lưu trang hiện tại sang TargetJobOption
  const jobs: TargetJobOption[] = useMemo(() => {
    return rawItems.map(mapBookmarkToTargetJobOption);
  }, [rawItems]);

  // Cập nhật selectedJobSummary nếu tìm thấy job trong trang hiện tại
  useEffect(() => {
    if (selectedJobId && jobs.length > 0) {
      const match = jobs.find((j) => j.id === selectedJobId);
      if (match) {
        setSelectedJobSummary((prev) => ({
          ...match,
          ...prev,
        }));
      }
    }
  }, [selectedJobId, jobs]);

  // 2. Query nạp chi tiết JD của Job đang chọn
  const detailQuery = useJobPostingDetail(
    isOpen && selectedJobId ? selectedJobId : undefined,
  );

  // 3. Hợp nhất thông tin tóm tắt và chi tiết JD từ API
  const selectedJobDetail: TargetJobOption | null = useMemo(() => {
    if (!selectedJobSummary && !selectedJobId) return null;

    const base =
      selectedJobSummary ||
      jobs.find((j) => j.id === selectedJobId) || {
        id: selectedJobId || "",
        title: "Tin tuyển dụng",
        companyName: "Doanh nghiệp",
      };

    const detail = detailQuery.data;
    if (!detail) return base;

    const parsedRequirements = detail.requirements
      ? detail.requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : base.requirements;

    const parsedBenefits = detail.benefits
      ? detail.benefits
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : base.benefits;

    const parsedSkills = detail.skills?.length
      ? detail.skills.map((sk) => sk.name)
      : base.skills;

    return {
      ...base,
      title: detail.title || base.title,
      companyName: detail.company?.name || base.companyName,
      location: detail.province?.name || base.location,
      workMode: getWorkModeLabel(detail.workMode) || base.workMode,
      experienceLevel: detail.experienceYears
        ? `${detail.experienceYears} năm kinh nghiệm`
        : base.experienceLevel,
      description: detail.description || base.description,
      requirements: parsedRequirements,
      benefits: parsedBenefits,
      skills: parsedSkills,
    };
  }, [selectedJobSummary, selectedJobId, jobs, detailQuery.data]);

  // Thao tác chọn hoặc bỏ chọn khi click lại (toggle) một job từ danh sách
  const handleSelectJob = useCallback((job: TargetJobOption) => {
    setSelectedJobId((prevId) => {
      if (prevId === job.id) {
        setSelectedJobSummary(null);
        return null;
      }
      setSelectedJobSummary(job);
      return job.id;
    });
  }, []);

  // Thao tác bỏ chọn
  const handleClearSelection = useCallback(() => {
    setSelectedJobId(null);
    setSelectedJobSummary(null);
  }, []);

  // Thông báo lỗi thân thiện
  const listErrorMessage = bookmarkedQuery.error
    ? getApiErrorMessage(
        bookmarkedQuery.error,
        "Không thể tải danh sách việc làm đã lưu. Vui lòng thử lại sau.",
      )
    : null;

  const detailErrorMessage = detailQuery.error
    ? getApiErrorMessage(
        detailQuery.error,
        "Không thể tải chi tiết mô tả công việc (JD). Vui lòng thử lại sau.",
      )
    : null;

  const isEmptyList =
    !bookmarkedQuery.isLoading &&
    !bookmarkedQuery.isError &&
    !debouncedSearch.trim() &&
    totalItems === 0;

  const isNoSearchResults =
    !bookmarkedQuery.isLoading &&
    !bookmarkedQuery.isError &&
    Boolean(debouncedSearch.trim()) &&
    totalItems === 0;

  return {
    // Search & pagination state
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalItems,
    // Data
    jobs,
    selectedJobId,
    selectedJobDetail,
    // Actions
    selectJob: handleSelectJob,
    clearSelection: handleClearSelection,
    // List status
    isLoadingList: bookmarkedQuery.isLoading,
    isErrorList: bookmarkedQuery.isError,
    listErrorMessage,
    refetchList: bookmarkedQuery.refetch,
    isEmptyList,
    isNoSearchResults,
    // Detail status
    isLoadingDetail: Boolean(selectedJobId) && detailQuery.isLoading,
    isErrorDetail: Boolean(selectedJobId) && detailQuery.isError,
    detailErrorMessage,
    refetchDetail: detailQuery.refetch,
  };
}
