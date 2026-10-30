import { useState, useMemo } from "react";
import { Checkbox } from "@animate-ui/react/primitives/base-ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, ChevronDown, RotateCcw } from "lucide-react";
import { MOCK_INDUSTRY_HIERARCHY } from "@/constants/mockData";
import { useIndustryGroupsWithIndustries } from "@/hooks/queries/useCatalog";

export const SALARY_MIN_LIMIT = 0;
export const SALARY_MAX_LIMIT = 5000;
export const SALARY_STEP = 100;

export interface JobFilterState {
  industries: string[];
  jobTypes: string[];
  workModes: string[];
  jobLevels: string[];
  minSalary: string;
  maxSalary: string;
  negotiableOnly: boolean;
}

interface FilterOption {
  label: string;
  value: string;
}

interface JobFilterSidebarProps {
  filters: JobFilterState;
  onToggleArrayFilter: (
    key: "industries" | "jobTypes" | "workModes" | "jobLevels",
    value: string,
  ) => void;
  onToggleIndustryGroup: (parent: string, children: string[]) => void;
  onSalaryRangeChange: (min: string, max: string) => void;
  onToggleNegotiable: (checked: boolean) => void;
  onReset: () => void;
}

const SALARY_PRESETS = [
  { label: "Dưới $1,000", min: "", max: "1000" },
  { label: "$1,000 - $2,000", min: "1000", max: "2000" },
  { label: "Trên $2,000", min: "2000", max: "" },
];

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
];

const WORK_MODE_OPTIONS: FilterOption[] = [
  { label: "On-site", value: "On-site" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Remote", value: "Remote" },
];

const JOB_LEVEL_OPTIONS: FilterOption[] = [
  { label: "Intern", value: "Intern" },
  { label: "Fresher", value: "Fresher" },
  { label: "Junior", value: "Junior" },
  { label: "Middle", value: "Middle" },
  { label: "Senior", value: "Senior" },
  { label: "Lead", value: "Lead" },
];

const HISTOGRAM_BARS = [
  30, 50, 75, 95, 100, 85, 65, 80, 55, 45, 70, 60, 40, 25,
];

interface FilterCheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  isParent?: boolean;
}

function FilterCheckboxItem({
  label,
  checked,
  onChange,
  isParent = false,
}: FilterCheckboxItemProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-1.5 py-0.5 text-xs text-text-main select-none">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={() => onChange()}
        className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface transition-colors group-hover:border-primary data-checked:border-primary data-checked:bg-primary"
      >
        <Checkbox.Indicator className="flex items-center justify-center text-white">
          <CheckIcon className="size-2.5 stroke-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <span
        className={`truncate transition-colors group-hover:text-primary ${
          isParent ? "font-medium text-text-main" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export function JobFilterSidebar({
  filters,
  onToggleArrayFilter,
  onToggleIndustryGroup,
  onSalaryRangeChange,
  onToggleNegotiable,
  onReset,
}: JobFilterSidebarProps) {
  // Lấy dữ liệu 8 nhóm ngành nghề thực tế từ Backend Catalog API
  const { data: realIndustryGroups = [] } = useIndustryGroupsWithIndustries();

  const industryHierarchy = useMemo(() => {
    if (realIndustryGroups.length === 0) return MOCK_INDUSTRY_HIERARCHY;
    return realIndustryGroups.map((group) => ({
      parent: group.name,
      children: (group.items || group.industries || []).map((i) => i.name),
    }));
  }, [realIndustryGroups]);

  // Mặc định các nhóm lĩnh vực đều thu gọn (false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

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

  // Đồng bộ state hiển thị với props từ ngoài khi không dragging
  const effectiveRange: [number, number] = isDragging
    ? localRange
    : [parsedMin, parsedMax];

  const handleSliderChange = (val: number | readonly number[]) => {
    setIsDragging(true);
    const arr = Array.isArray(val) ? val : [val];
    setLocalRange([arr[0] ?? SALARY_MIN_LIMIT, arr[1] ?? SALARY_MAX_LIMIT]);
  };

  const handleSliderCommit = (val: number | readonly number[]) => {
    setIsDragging(false);
    const arr = Array.isArray(val) ? val : [val];
    const min = arr[0] ?? SALARY_MIN_LIMIT;
    const max = arr[1] ?? SALARY_MAX_LIMIT;

    const nextMin = min <= SALARY_MIN_LIMIT ? "" : String(min);
    const nextMax = max >= SALARY_MAX_LIMIT ? "" : String(max);
    onSalaryRangeChange(nextMin, nextMax);
  };

  const handleInputChange = (field: "minSalary" | "maxSalary", raw: string) => {
    if (raw !== "" && Number(raw) < 0) return;
    if (field === "minSalary") {
      onSalaryRangeChange(raw, filters.maxSalary);
    } else {
      onSalaryRangeChange(filters.minSalary, raw);
    }
  };

  return (
    <aside className="flex w-full scrollbar-thin flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-surface px-5 py-5">
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

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-text-main uppercase">
          Lĩnh vực
        </h3>
        <div className="flex max-h-50 flex-col gap-2 overflow-x-hidden overflow-y-scroll">
          {industryHierarchy.map((group) => {
            const isExpanded = expandedGroups[group.parent] ?? false;
            const isParentChecked =
              filters.industries.includes(group.parent) ||
              group.children.every((c) => filters.industries.includes(c));

            return (
              <div key={group.parent} className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between rounded-xl py-1.5">
                  <FilterCheckboxItem
                    label={group.parent}
                    isParent
                    checked={isParentChecked}
                    onChange={() =>
                      onToggleIndustryGroup(group.parent, group.children)
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [group.parent]: !isExpanded,
                      }))
                    }
                    className="cursor-pointer p-1 text-text-muted hover:text-text-main"
                  >
                    {group.children.length !== 0 && (
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>

                {isExpanded && group.children.length !== 0 && (
                  <div className="grid grid-cols-1 gap-1.5 pt-1 pl-3">
                    {group.children.map((child) => (
                      <FilterCheckboxItem
                        key={child}
                        label={child}
                        checked={filters.industries.includes(child)}
                        onChange={() =>
                          onToggleArrayFilter("industries", child)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold tracking-wide text-text-main uppercase">
            Mức lương
          </h3>
          <span className="text-[11px] font-semibold text-primary">
            {effectiveRange[0]} -{" "}
            {effectiveRange[1] >= SALARY_MAX_LIMIT
              ? `${SALARY_MAX_LIMIT}`
              : effectiveRange[1]}{" "}
            triệu
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {SALARY_PRESETS.map((preset) => {
            const isActive =
              filters.minSalary === preset.min &&
              filters.maxSalary === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSalaryRangeChange(preset.min, preset.max)}
                className={`cursor-pointer rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-bg text-text-muted hover:border-text-muted hover:text-text-main"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex h-8 items-end justify-between gap-1 px-1">
            {HISTOGRAM_BARS.map((height, idx) => {
              const barValue =
                ((idx + 0.5) / HISTOGRAM_BARS.length) * SALARY_MAX_LIMIT;
              const isInRange =
                barValue >= effectiveRange[0] && barValue <= effectiveRange[1];

              return (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-t-xs transition-colors duration-150 ${
                    isInRange ? "bg-secondary-dark" : "bg-border"
                  }`}
                />
              );
            })}
          </div>

          <Slider
            min={SALARY_MIN_LIMIT}
            max={SALARY_MAX_LIMIT}
            step={SALARY_STEP}
            value={effectiveRange}
            onValueChange={handleSliderChange}
            onValueCommitted={handleSliderCommit}
            className="w-full cursor-pointer touch-none py-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative flex items-center">
            <input
              type="number"
              min={SALARY_MIN_LIMIT}
              max={SALARY_MAX_LIMIT}
              step={SALARY_STEP}
              value={
                isDragging
                  ? localRange[0] <= SALARY_MIN_LIMIT
                    ? ""
                    : String(localRange[0])
                  : filters.minSalary
              }
              onChange={(e) => handleInputChange("minSalary", e.target.value)}
              placeholder="Từ 0"
              className="w-full rounded-xl border border-border bg-bg py-1.5 pr-1 pl-3 text-xs font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="relative flex items-center">
            <input
              type="number"
              min={SALARY_MIN_LIMIT}
              max={SALARY_MAX_LIMIT}
              step={SALARY_STEP}
              value={
                isDragging
                  ? localRange[1] >= SALARY_MAX_LIMIT
                    ? ""
                    : String(localRange[1])
                  : filters.maxSalary
              }
              onChange={(e) => handleInputChange("maxSalary", e.target.value)}
              placeholder={`Đến ${SALARY_MAX_LIMIT}`}
              className="w-full rounded-xl border border-border bg-bg py-1.5 pr-1 pl-3 text-xs font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none"
            />
          </div>
        </div>

        <FilterCheckboxItem
          label="Bao gồm lương thỏa thuận"
          checked={filters.negotiableOnly}
          onChange={() => onToggleNegotiable(!filters.negotiableOnly)}
        />
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <h3 className="text-xs font-semibold tracking-wide text-text-main uppercase">
          Loại hình công việc
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
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

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <h3 className="text-xs font-semibold tracking-wide text-text-main uppercase">
          Môi trường làm việc
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
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

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <h3 className="text-xs font-semibold tracking-wide text-text-main uppercase">
          Cấp bậc
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
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
    </aside>
  );
}
