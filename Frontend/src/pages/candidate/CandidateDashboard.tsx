import { useRef, useState } from "react";
import { ArrowRight, PackageOpen, Search } from "lucide-react";
import { Button, JobCard } from "@/components/common";
import { MOCK_CVS, MOCK_JOB_POSTINGS } from "@/constants/mockData";
import {
  Toggle,
  ToggleGroup,
} from "@/components/animate-ui/components/base/toggle-group";
import { ApplicationTrackingTable } from "@/components/ApplicationTrackingTable";
import { CandidateCVSection } from "@/components/CandidateCVSection";
import CandidateDashboardBanner from "./CandidateDashboardBanner";
import { useMyCvs } from "@/hooks/queries/useCv";

const level = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Executive"];

function CandidateDashboard() {
  const { data: myCvsData } = useMyCvs();
  const cvList = myCvsData?.items ?? MOCK_CVS;
  const [selectedLevel, setSelectedLevel] = useState<string[]>(["all"]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLevelChange = (newValue: string[]) => {
    if (!newValue || newValue.length === 0) {
      setSelectedLevel(["all"]);
    } else {
      const latestSelected = newValue[newValue.length - 1];
      setSelectedLevel([latestSelected]);
    }
  };

  const activeFilter = selectedLevel[0] || "all";
  const filteredJobs = MOCK_JOB_POSTINGS.filter((job) => {
    if (activeFilter === "all") return true;
    return job.jobLevel.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-hidden">
      <CandidateDashboardBanner />

      {/* jobbbbssss */}
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
              className="px-3! py-1.5! text-xs!"
            >
              Xem tất cả gợi ý
            </Button>
          </div>

          <ToggleGroup
            value={selectedLevel}
            onValueChange={handleLevelChange}
            className="gap-1! bg-bg-white-blue p-1!"
          >
            <Toggle className="text-xs!" value="all">
              Tất cả
            </Toggle>
            {level.map((level, index) => (
              <Toggle
                key={index}
                className="text-xs!"
                value={level.toLocaleLowerCase()}
              >
                {level}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>

        <div className="scrollbar-hide flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto pb-2">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((item) => (
              <div key={item.id} className="shrink-0">
                <JobCard job={item} />
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
                  onClick={handleFocusSearch}
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

      {/* theo doi hồ sơ */}
      <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-main">
            Theo dõi hồ sơ
          </h2>
        </div>
        <ApplicationTrackingTable />
      </div>

      {/* danh sach cv */}
      <CandidateCVSection cvList={cvList} />
    </div>
  );
}

export default CandidateDashboard;
