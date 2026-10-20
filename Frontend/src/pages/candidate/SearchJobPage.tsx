import { useMemo, useState } from "react";
import { Search, X, BriefcaseBusiness } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import Button from "@/components/Button";
import {
  JobFilterSidebar,
  type JobFilterState,
} from "@/components/JobFilterSidebar";
import { MOCK_JOB_POSTINGS, type MockJobPosting } from "@/constants/mockData";

const INITIAL_FILTERS: JobFilterState = {
  jobTypes: [],
  workModes: [],
  jobLevels: [],
  provinces: [],
  minSalary: "",
  maxSalary: "",
  negotiableOnly: false,
};

export default function SearchJobPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<JobFilterState>(INITIAL_FILTERS);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const provinceOptions = useMemo(() => {
    const provinces = Array.from(
      new Set(
        (MOCK_JOB_POSTINGS || [])
          .map((j) => j.location.provinceName)
          .filter(Boolean),
      ),
    );
    return provinces.map((p) => ({ label: p, value: p }));
  }, []);

  const handleToggleArrayFilter = (
    key: "jobTypes" | "workModes" | "jobLevels" | "provinces",
    value: string,
  ) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const handleSalaryRangeChange = (minSalary: string, maxSalary: string) => {
    setFilters((prev) => ({ ...prev, minSalary, maxSalary }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters(INITIAL_FILTERS);
  };

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minSal = filters.minSalary !== "" ? Number(filters.minSalary) : null;
    const maxSal = filters.maxSalary !== "" ? Number(filters.maxSalary) : null;

    return (MOCK_JOB_POSTINGS || []).filter((job: MockJobPosting) => {
      if (q) {
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.name.toLowerCase().includes(q);
        const matchSkill = job.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCompany && !matchSkill) return false;
      }

      if (
        filters.jobTypes.length > 0 &&
        !filters.jobTypes.includes(job.jobType)
      ) {
        return false;
      }

      if (
        filters.workModes.length > 0 &&
        !filters.workModes.includes(job.workMode)
      ) {
        return false;
      }

      if (
        filters.jobLevels.length > 0 &&
        !filters.jobLevels.includes(job.jobLevel)
      ) {
        return false;
      }

      if (
        filters.provinces.length > 0 &&
        !filters.provinces.includes(job.location.provinceName)
      ) {
        return false;
      }

      if (filters.negotiableOnly && !job.salaryNegotiable) {
        return false;
      }

      if (minSal !== null && !job.salaryNegotiable) {
        if ((job.salaryMax ?? 0) < minSal) return false;
      }

      if (maxSal !== null && !job.salaryNegotiable) {
        if ((job.salaryMin ?? 0) > maxSal) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="relative flex flex-1 items-center">
        <Search className="pointer-events-none absolute left-3.5 size-4.5 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo vị trí công việc hoặc tên công ty..."
          className="w-full rounded-2xl border border-border bg-bg py-2.5 pr-9 pl-10 text-sm font-medium text-text-main placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 cursor-pointer text-text-muted hover:text-text-main"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="hidden w-68 shrink-0 lg:block">
          <JobFilterSidebar
            filters={filters}
            onToggleArrayFilter={handleToggleArrayFilter}
            onSalaryRangeChange={handleSalaryRangeChange}
            onToggleNegotiable={(checked) =>
              setFilters((prev) => ({ ...prev, negotiableOnly: checked }))
            }
            onReset={handleResetFilters}
            provinceOptions={provinceOptions}
          />
        </div>

        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-surface p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-bold text-text-main">
                  Tùy chỉnh bộ lọc
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-full p-1 text-text-muted hover:bg-bg hover:text-text-main"
                >
                  <X className="size-5" />
                </button>
              </div>
              <JobFilterSidebar
                filters={filters}
                onToggleArrayFilter={handleToggleArrayFilter}
                onSalaryRangeChange={handleSalaryRangeChange}
                onToggleNegotiable={(checked) =>
                  setFilters((prev) => ({ ...prev, negotiableOnly: checked }))
                }
                onReset={handleResetFilters}
                provinceOptions={provinceOptions}
              />
            </div>
          </div>
        )}

        <div className="flex w-full flex-1 flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-text-muted">
              Tìm thấy{" "}
              <span className="font-bold text-text-main">
                {filteredJobs.length}
              </span>{" "}
              công việc phù hợp
            </p>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary-light text-primary">
                <BriefcaseBusiness className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-text-main">
                  Không tìm thấy công việc phù hợp
                </h3>
                <p className="max-w-md text-xs text-text-muted">
                  Thử thay đổi từ khóa tìm kiếm hoặc xóa bớt các điều kiện lọc
                  để xem thêm nhiều cơ hội việc làm khác.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetFilters}
                className="mt-2 rounded-full! px-4! py-2! text-xs!"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredJobs.slice(0, 1).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              {filteredJobs.slice(1).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
