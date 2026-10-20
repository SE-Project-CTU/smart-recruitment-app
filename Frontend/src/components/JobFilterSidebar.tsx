import { useState } from "react";
import { Checkbox } from "@animate-ui/react/primitives/base-ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, RotateCcw } from "lucide-react";

export const SALARY_MIN_LIMIT = 0;
export const SALARY_MAX_LIMIT = 5000;
export const SALARY_STEP = 100;

export interface JobFilterState {
  jobTypes: string[];
  workModes: string[];
  jobLevels: string[];
  provinces: string[];
  minSalary: string;
  maxSalary: string;
  negotiableOnly: boolean;
}

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface JobFilterSidebarProps {
  filters: JobFilterState;
  onToggleArrayFilter: (
    key: "jobTypes" | "workModes" | "jobLevels" | "provinces",
    value: string,
  ) => void;
  onSalaryRangeChange: (min: string, max: string) => void;
  onToggleNegotiable: (checked: boolean) => void;
  onReset: () => void;
  provinceOptions: FilterOption[];
}

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Internship", value: "Internship" },
  { label: "Contract / Freelance", value: "Contract" },
];

const WORK_MODE_OPTIONS: FilterOption[] = [
  { label: "Tại văn phòng (On-site)", value: "On-site" },
  { label: "Linh hoạt (Hybrid)", value: "Hybrid" },
  { label: "Từ xa (Remote)", value: "Remote" },
];

const JOB_LEVEL_OPTIONS: FilterOption[] = [
  { label: "Intern / Fresher", value: "Fresher" },
  { label: "Junior", value: "Junior" },
  { label: "Middle", value: "Middle" },
  { label: "Senior", value: "Senior" },
  { label: "Lead / Manager", value: "Lead" },
];

const HISTOGRAM_BARS = [
  30, 50, 75, 95, 100, 85, 65, 80, 55, 45, 70, 60, 40, 25,
];

interface FilterCheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckboxItem({
  label,
  checked,
  onChange,
}: FilterCheckboxItemProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-0.5 text-xs font-medium text-text-main select-none">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={() => onChange()}
        className="flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface transition-colors group-hover:border-primary data-checked:border-primary data-checked:bg-primary"
      >
        <Checkbox.Indicator className="flex items-center justify-center text-white">
          <CheckIcon className="size-3 stroke-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span className="truncate transition-colors group-hover:text-primary">
        {label}
      </span>
    </label>
  );
}

export function JobFilterSidebar({
  filters,
  onToggleArrayFilter,
  onSalaryRangeChange,
  onToggleNegotiable,
  onReset,
  provinceOptions,
}: JobFilterSidebarProps) {
  const parsedMin =
    filters.minSalary === ""
      ? SALARY_MIN_LIMIT
      : Math.max(
          SALARY_MIN_LIMIT,
          Math.min(Number(filters.minSalary), SALARY_MAX_LIMIT),
        );

  const parsedMax =
    filters.maxSalary === ""
      ? SALARY_MAX_LIMIT
      : Math.max(
          parsedMin,
          Math.min(Number(filters.maxSalary), SALARY_MAX_LIMIT),
        );

  const [localRange, setLocalRange] = useState<[number, number]>([
    parsedMin,
    parsedMax,
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const displayedRange: [number, number] = isDragging
    ? localRange
    : [parsedMin, parsedMax];

  const getSliderRange = (
    value: number | readonly number[],
  ): [number, number] =>
    typeof value === "number"
      ? [value, value]
      : [value[0] ?? SALARY_MIN_LIMIT, value[1] ?? SALARY_MAX_LIMIT];

  const commitSliderValues = ([min, max]: [number, number]) => {
    const nextMin = min <= SALARY_MIN_LIMIT ? "" : String(min);
    const nextMax = max >= SALARY_MAX_LIMIT ? "" : String(max);
    onSalaryRangeChange(nextMin, nextMax);
  };

  const handleSliderChange = (value: number | readonly number[]) => {
    setIsDragging(true);
    setLocalRange(getSliderRange(value));
  };

  const handleSliderCommit = (value: number | readonly number[]) => {
    setIsDragging(false);
    commitSliderValues(getSliderRange(value));
  };

  const handleInputChange = (field: "minSalary" | "maxSalary", raw: string) => {
    if (raw !== "" && Number(raw) < 0) return;
    if (field === "minSalary") {
      onSalaryRangeChange(raw, filters.maxSalary);
    } else {
      onSalaryRangeChange(filters.minSalary, raw);
    }
  };

  const displayMinInput = isDragging
    ? displayedRange[0] <= SALARY_MIN_LIMIT
      ? ""
      : String(displayedRange[0])
    : filters.minSalary;

  const displayMaxInput = isDragging
    ? displayedRange[1] >= SALARY_MAX_LIMIT
      ? ""
      : String(displayedRange[1])
    : filters.maxSalary;

  return (
    <aside className="flex w-full flex-col gap-6 rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <h2 className="text-base font-bold text-text-main">Bộ lọc</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          <RotateCcw className="size-3" />
          Đặt lại
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold tracking-wide text-text-main uppercase">
          Loại hình công việc
        </h3>
        <div className="flex flex-col gap-2">
          {JOB_TYPE_OPTIONS.map((item) => (
            <FilterCheckboxItem
              key={item.value}
              label={item.label}
              checked={filters.jobTypes.includes(item.value)}
              onChange={() => onToggleArrayFilter("jobTypes", item.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wide text-text-main uppercase">
            Mức lương
          </h3>
          <span className="text-[11px] font-semibold text-primary">
            ${displayedRange[0]} -$
            {displayedRange[1] >= SALARY_MAX_LIMIT
              ? `${SALARY_MAX_LIMIT}+`
              : displayedRange[1]}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex h-10 items-end justify-between gap-1 px-1 pt-2">
            {HISTOGRAM_BARS.map((height, idx) => {
              const barValue =
                ((idx + 0.5) / HISTOGRAM_BARS.length) * SALARY_MAX_LIMIT;
              const isInRange =
                barValue >= displayedRange[0] && barValue <= displayedRange[1];

              return (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-t-xs transition-colors duration-150 ${
                    isInRange ? "bg-primary/70" : "bg-border"
                  }`}
                />
              );
            })}
          </div>

          <Slider
            min={SALARY_MIN_LIMIT}
            max={SALARY_MAX_LIMIT}
            step={SALARY_STEP}
            value={displayedRange}
            onValueChange={handleSliderChange}
            onValueCommitted={handleSliderCommit}
            className="w-full cursor-pointer touch-none py-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="relative flex items-center">
            <input
              type="number"
              min={SALARY_MIN_LIMIT}
              max={SALARY_MAX_LIMIT}
              step={SALARY_STEP}
              value={displayMinInput}
              onChange={(e) => handleInputChange("minSalary", e.target.value)}
              placeholder="Từ 0"
              className="w-full rounded-xl border border-border bg-bg py-2 pr-6 pl-3 text-xs font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none"
            />
            <span className="pointer-events-none absolute right-2.5 text-xs font-semibold text-text-muted">
              $
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="number"
              min={SALARY_MIN_LIMIT}
              max={SALARY_MAX_LIMIT}
              step={SALARY_STEP}
              value={displayMaxInput}
              onChange={(e) => handleInputChange("maxSalary", e.target.value)}
              placeholder={`Đến ${SALARY_MAX_LIMIT}`}
              className="w-full rounded-xl border border-border bg-bg py-2 pr-6 pl-3 text-xs font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none"
            />
            <span className="pointer-events-none absolute right-2.5 text-xs font-semibold text-text-muted">
              $
            </span>
          </div>
        </div>

        <FilterCheckboxItem
          label="Bao gồm lương thỏa thuận"
          checked={filters.negotiableOnly}
          onChange={() => onToggleNegotiable(!filters.negotiableOnly)}
        />
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-5">
        <h3 className="text-xs font-bold tracking-wide text-text-main uppercase">
          Môi trường làm việc
        </h3>
        <div className="flex flex-col gap-2">
          {WORK_MODE_OPTIONS.map((item) => (
            <FilterCheckboxItem
              key={item.value}
              label={item.label}
              checked={filters.workModes.includes(item.value)}
              onChange={() => onToggleArrayFilter("workModes", item.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-5">
        <h3 className="text-xs font-bold tracking-wide text-text-main uppercase">
          Cấp bậc
        </h3>
        <div className="flex flex-col gap-2">
          {JOB_LEVEL_OPTIONS.map((item) => (
            <FilterCheckboxItem
              key={item.value}
              label={item.label}
              checked={filters.jobLevels.includes(item.value)}
              onChange={() => onToggleArrayFilter("jobLevels", item.value)}
            />
          ))}
        </div>
      </div>

      {provinceOptions.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-border pt-5">
          <h3 className="text-xs font-bold tracking-wide text-text-main uppercase">
            Khu vực
          </h3>
          <div className="flex flex-col gap-2">
            {provinceOptions.map((item) => (
              <FilterCheckboxItem
                key={item.value}
                label={item.label}
                checked={filters.provinces.includes(item.value)}
                onChange={() => onToggleArrayFilter("provinces", item.value)}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
