import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProvinces, useWards } from "@/hooks/queries/useCatalog";
import { useApplyJobModalStore, type AnyJob } from "@/stores/applyJobModalStore";
import { useAuthStore } from "@/stores/authStore";
import {
  useJobPostings,
  useMyAllBookmarkedJobIds,
  useBookmarkJob,
  useUnbookmarkJob,
} from "@/hooks/queries/useJob";
import { useMyAppliedJobIds } from "@/hooks/queries/useApplication";
import { toast } from "@/hooks/use-toast";
import type {
  JobPostingSearchItem,
  JobLevel,
  JobType,
  WorkMode,
  SearchJobPostingsRequest,
} from "@/types/job";
import type { JobFilterState } from "@/components/JobFilterSidebar";
import type { SelectedLocation } from "@/components/LocationCombobox";

type SortKey = "NEWEST" | "SALARY_DESC" | "SALARY_ASC";
const PAGE_SIZE = 30;
const INITIAL_FILTERS: JobFilterState = {
  industries: [],
  experienceRanges: [],
  jobType: "",
  workMode: "",
  jobLevel: "",
  minSalary: "",
  maxSalary: "",
  negotiableOnly: false,
};

export function useSearchJobPage() {
  const [urlParams, setUrlParams] = useSearchParams();
  const currentPage = Math.max(1, Number(urlParams.get("page")) || 1);
  const setCurrentPage = (page: number) =>
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page <= 1) next.delete("page");
      else next.set("page", String(page));
      return next;
    });
  const jobListTopRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(
    urlParams.get("keyword") ?? "",
  );
  const provinceId = urlParams.get("provinceId");
  const wardId = urlParams.get("wardId");
  const { data: provinces = [] } = useProvinces();
  const { data: wards = [] } = useWards(provinceId ?? undefined);
  const selectedLocation: SelectedLocation = {
    province: provinces.find((item) => item.id === provinceId)?.name ?? null,
    ward: wards.find((item) => item.id === wardId)?.name ?? null,
    provinceId,
    wardId,
  };
  const sortBy = (urlParams.get("sortBy") as SortKey) || "NEWEST";
  const filters: JobFilterState = useMemo(
    () => ({
      ...INITIAL_FILTERS,
      industries: urlParams.getAll("industryIds"),
      experienceRanges: urlParams.getAll("experienceRanges"),
      jobType: urlParams.get("jobType") ?? "",
      workMode: urlParams.get("workMode") ?? "",
      jobLevel: urlParams.get("jobLevel") ?? "",
      minSalary: urlParams.get("minSalary") ?? "",
      maxSalary: urlParams.get("maxSalary") ?? "",
      negotiableOnly: urlParams.get("negotiableOnly") === "true",
    }),
    [urlParams],
  );
  const updateFilters = (nextFilters: JobFilterState) =>
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      [
        "industryIds",
        "experienceRanges",
        "jobType",
        "workMode",
        "jobLevel",
        "minSalary",
        "maxSalary",
        "negotiableOnly",
        "page",
      ].forEach((key) => next.delete(key));
      nextFilters.industries.forEach((id) => next.append("industryIds", id));
      nextFilters.experienceRanges.forEach((range) =>
        next.append("experienceRanges", range),
      );
      if (nextFilters.jobType) next.set("jobType", nextFilters.jobType);
      if (nextFilters.workMode) next.set("workMode", nextFilters.workMode);
      if (nextFilters.jobLevel) next.set("jobLevel", nextFilters.jobLevel);
      if (nextFilters.minSalary) next.set("minSalary", nextFilters.minSalary);
      if (nextFilters.maxSalary) next.set("maxSalary", nextFilters.maxSalary);
      if (nextFilters.negotiableOnly) next.set("negotiableOnly", "true");
      return next;
    });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [clickedJob, setClickedJob] = useState<JobPostingSearchItem | null>(null);

  const urlJobId = urlParams.get("jobId");
  const isDetailDrawerOpen = Boolean(urlJobId);

  const { user } = useAuthStore();
  const isCandidate = Boolean(user?.roles?.includes("Candidate"));

  const { data: allBookmarkedIds } = useMyAllBookmarkedJobIds({
    enabled: Boolean(isCandidate),
  });
  const { data: allAppliedIds } = useMyAppliedJobIds({
    enabled: Boolean(isCandidate),
  });
  const bookmarkMutation = useBookmarkJob();
  const unbookmarkMutation = useUnbookmarkJob();

  const bookmarkedJobIds = useMemo(() => {
    return allBookmarkedIds || new Set<string>();
  }, [allBookmarkedIds]);

  const appliedJobIds = useMemo(() => {
    return allAppliedIds || new Set<string>();
  }, [allAppliedIds]);

  const { openApplyModal } = useApplyJobModalStore();

  const searchParams = useMemo<SearchJobPostingsRequest>(() => {
    const minSal = urlParams.get("minSalary");
    const maxSal = urlParams.get("maxSalary");
    const industries = urlParams.getAll("industryIds");
    const experienceRanges = urlParams.getAll("experienceRanges");

    return {
      keyword: urlParams.get("keyword") || undefined,
      provinceId: urlParams.get("provinceId") || undefined,
      wardId: urlParams.get("wardId") || undefined,
      industryIds: industries.length ? industries : undefined,
      experienceRanges: experienceRanges.length ? experienceRanges : undefined,
      jobType: (urlParams.get("jobType") || undefined) as JobType | undefined,
      workMode: (urlParams.get("workMode") || undefined) as WorkMode | undefined,
      jobLevel: (urlParams.get("jobLevel") || undefined) as JobLevel | undefined,
      salaryMin: minSal ? Number(minSal) * 1_000_000 : undefined,
      salaryMax: maxSal ? Number(maxSal) * 1_000_000 : undefined,
      salaryNegotiableOnly:
        urlParams.get("negotiableOnly") === "true" || undefined,
      sort: sortBy === "NEWEST" ? "createdAt" : "salaryMax",
      direction: sortBy === "SALARY_ASC" ? "asc" : "desc",
      page: currentPage,
      pageSize: PAGE_SIZE,
    };
  }, [urlParams, sortBy, currentPage]);

  const {
    data: pagedData,
    isFetching: isFetchingJobs,
    isError: isJobsError,
  } = useJobPostings(searchParams);
  const jobList = useMemo(() => pagedData?.items ?? [], [pagedData?.items]);
  const totalPages = pagedData?.meta.totalPages ?? 1;
  const totalItems = pagedData?.meta.totalItems ?? 0;

  // Job được click trực tiếp trên danh sách hiện tại (nếu có)
  const selectedJob = useMemo(() => {
    if (!urlJobId) return null;
    if (clickedJob?.id === urlJobId) return clickedJob;
    return null;
  }, [urlJobId, clickedJob]);

  const handleToggleArrayFilter = (
    key: "industries" | "experienceRanges",
    value: string,
  ) => {
    const exists = filters[key].includes(value);
    updateFilters({
      ...filters,
      [key]: exists
        ? filters[key].filter((item) => item !== value)
        : [...filters[key], value],
    });
  };

  const handleToggleSingleFilter = (
    key: "jobType" | "workMode" | "jobLevel",
    value: string,
  ) => {
    updateFilters({ ...filters, [key]: filters[key] === value ? "" : value });
  };

  const handleToggleIndustryGroup = (children: string[]) => {
    const allSelected = children.every((id) => filters.industries.includes(id));
    updateFilters({
      ...filters,
      industries: allSelected
        ? filters.industries.filter((id) => !children.includes(id))
        : Array.from(new Set([...filters.industries, ...children])),
    });
  };

  const handleSalaryRangeChange = (minSalary: string, maxSalary: string) => {
    updateFilters({ ...filters, minSalary, maxSalary, negotiableOnly: false });
  };

  const handleToggleNegotiable = (checked: boolean) => {
    updateFilters({
      ...filters,
      negotiableOnly: checked,
      minSalary: "",
      maxSalary: "",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setUrlParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      if (searchQuery.trim()) next.set("keyword", searchQuery.trim());
      else next.delete("keyword");
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    jobListTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSelectJob = (job: JobPostingSearchItem) => {
    setClickedJob(job);
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("jobId", job.id);
      return next;
    });
  };

  const handleCloseDrawer = () => {
    setClickedJob(null);
    setUrlParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("jobId");
      return next;
    }, { replace: true });
  };

  const setIsDetailDrawerOpen = (open: boolean) => {
    if (!open) {
      handleCloseDrawer();
    }
  };

  const handleToggleBookmark = (jobId: string) => {
    if (!isCandidate) {
      toast.warning({
        description: "Bạn không có quyền thực hiện thao tác này!",
      });
      return;
    }
    const isCurrentlyBookmarked = bookmarkedJobIds.has(jobId);

    if (isCurrentlyBookmarked) {
      unbookmarkMutation.mutate(jobId);
    } else {
      bookmarkMutation.mutate(jobId);
    }
  };

  const handleApply = (jobId: string, jobData?: AnyJob) => {
    const targetJob =
      jobData ||
      (selectedJob?.id === jobId ? selectedJob : null) ||
      jobList.find((j) => j.id === jobId) ||
      ({ id: jobId } as JobPostingSearchItem);
    if (targetJob) {
      openApplyModal(targetJob);
    }
  };

  return {
    urlJobId, urlParams, setUrlParams, currentPage, setCurrentPage, jobListTopRef,
    searchQuery, setSearchQuery, selectedLocation, sortBy, filters,
    isMobileFilterOpen, setIsMobileFilterOpen, selectedJob, isDetailDrawerOpen,
    setIsDetailDrawerOpen, isCandidate, bookmarkedJobIds, appliedJobIds, jobList, totalPages,
    totalItems, isFetchingJobs, isJobsError,
    handleToggleArrayFilter, handleToggleSingleFilter, handleToggleIndustryGroup,
    handleSalaryRangeChange, handleToggleNegotiable, handleResetFilters,
    handleSearchSubmit, handlePageChange, handleSelectJob, handleCloseDrawer, handleToggleBookmark,
    handleApply,
  };
}
