import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, PackageOpen, Search } from "lucide-react";
import { Button, JobCard } from "@/components/common";
import {
  Toggle,
  ToggleGroup,
} from "@/components/animate-ui/components/base/toggle-group";
import { ApplicationTrackingTable } from "@/components/ApplicationTrackingTable";
import { CandidateCVSection } from "@/components/CandidateCVSection";
import CandidateDashboardBanner from "./CandidateDashboardBanner";
import { useMyCvs } from "@/hooks/queries/useCv";
import { useJobPostings, useJobPostingDetail } from "@/hooks/queries/useJob";
import { useMyApplications } from "@/hooks/queries/useApplication";
import { JOB_LEVEL_OPTIONS, normalizeJobLevel } from "@/utils/jobHelpers";
import { PATHS } from "@/constants/paths";
import { JobDetailDrawer } from "@/components/job";
import type { JobPostingSearchItem } from "@/types/job";

function CandidateDashboard() {
  const navigate = useNavigate();

  // 1. Dữ liệu CV của ứng viên
  const { data: myCvsData } = useMyCvs();
  const cvList = myCvsData?.items ?? [];

  // 2. Dữ liệu Việc làm gợi ý từ Backend API
  const { data: jobPostingsData, isLoading: isLoadingJobs } = useJobPostings({
    pageSize: 20,
  });
  const jobList = jobPostingsData?.items ?? [];

  // 3. Dữ liệu Hồ sơ đã nộp từ Backend API
  const { data: appData, isLoading: isLoadingApps } = useMyApplications({
    page: 1,
    pageSize: 5,
  });
  const applications = appData?.items ?? [];

  // Quản lý Drawer xem chi tiết JD khi bấm vào JobCard
  const [selectedJob, setSelectedJob] = useState<JobPostingSearchItem | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: jobDetail } = useJobPostingDetail(
    isDrawerOpen && selectedJob ? selectedJob.id : undefined,
  );

  // Bộ lọc theo cấp bậc (Job Level)
  const [selectedLevel, setSelectedLevel] = useState<string[]>(["all"]);

  const handleLevelChange = (newValue: string[]) => {
    if (!newValue || newValue.length === 0) {
      setSelectedLevel(["all"]);
    } else {
      const latestSelected = newValue[newValue.length - 1];
      setSelectedLevel([latestSelected]);
    }
  };

  const activeFilter = selectedLevel[0] || "all";
  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") return jobList;
    return jobList.filter((job) => {
      const normalized = normalizeJobLevel(job.jobLevel).toLowerCase();
      return normalized === activeFilter.toLowerCase();
    });
  }, [jobList, activeFilter]);

  const handleOpenJobDetail = (job: JobPostingSearchItem) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-hidden">
      <CandidateDashboardBanner />

      {/* Việc làm gợi ý */}
      <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
        <div className="flex flex-col items-start gap-3">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-semibold text-text-main">
              Việc làm gợi ý
            </h2>

            <Button
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
              iconSize={14}
              onClick={() => navigate(PATHS.CANDIDATE.SEARCH_JOBS)}
              className="px-3! py-1.5! text-xs!"
            >
              Xem tất cả gợi ý
            </Button>
          </div>

          <div className="w-full scrollbar-none overflow-x-auto pb-1">
            <ToggleGroup
              value={selectedLevel}
              onValueChange={handleLevelChange}
              className="gap-1! bg-bg-white-blue p-1!"
            >
              <Toggle className="shrink-0 text-xs!" value="all">
                Tất cả
              </Toggle>
              {JOB_LEVEL_OPTIONS.map((item) => (
                <Toggle
                  key={item.value}
                  className="shrink-0 text-xs!"
                  value={item.value.toLowerCase()}
                >
                  {item.label}
                </Toggle>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="scrollbar-hide flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto pb-2">
          {isLoadingJobs ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-80.5 w-90 shrink-0 animate-pulse rounded-2xl border border-border bg-slate-100"
                />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((item) => (
              <div key={item.id} className="shrink-0">
                <JobCard
                  job={item}
                  isSelected={selectedJob?.id === item.id && isDrawerOpen}
                  onSelect={() => handleOpenJobDetail(item)}
                />
              </div>
            ))
          ) : (
            <div className="flex min-h-80.5 w-full max-w-85 min-w-70 flex-col items-center justify-between rounded-2xl border-2 border-dashed border-border bg-white/60 p-6 text-center">
              <PackageOpen
                className="mt-4 animate-bounce"
                size={32}
                strokeWidth={1}
              />

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-text-main">
                  Hiện tại chưa có gợi ý phù hợp
                </h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  Chưa tìm thấy công việc nào khớp với hồ sơ của bạn. Hãy bắt
                  đầu bằng cách tìm kiếm ngay!
                </p>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant="primary"
                  icon={Search}
                  iconSize={15}
                  onClick={() => navigate(PATHS.CANDIDATE.SEARCH_JOBS)}
                  className="w-full! py-2.5! text-xs!"
                >
                  Bắt đầu tìm kiếm
                </Button>

                {activeFilter !== "all" && (
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedLevel(["all"])}
                    className="w-full! text-xs!"
                  >
                    Xem tất cả cấp bậc
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theo dõi hồ sơ */}
      <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-main">
            Theo dõi hồ sơ
          </h2>
          <Button
            variant="secondary"
            icon={ArrowRight}
            iconPosition="right"
            iconSize={14}
            onClick={() => navigate(PATHS.CANDIDATE.APPLICATION_STATUS)}
            className="px-3! py-1.5! text-xs!"
          >
            Xem tất cả
          </Button>
        </div>
        <ApplicationTrackingTable
          data={applications}
          isLoading={isLoadingApps}
          onViewDetail={() => navigate(PATHS.CANDIDATE.APPLICATION_STATUS)}
        />
      </div>

      {/* Danh sách CV */}
      <CandidateCVSection cvList={cvList} />

      {/* Drawer xem chi tiết JD khi chọn việc làm gợi ý */}
      <JobDetailDrawer
        job={jobDetail || selectedJob}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

export default CandidateDashboard;
