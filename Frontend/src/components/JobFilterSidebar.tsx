import { useState, useMemo } from "react";
import { Checkbox } from "@animate-ui/react/primitives/base-ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { CheckIcon, ChevronDown, RotateCcw } from "lucide-react";
import { MOCK_INDUSTRY_HIERARCHY } from "@/constants/mockData";
import { useIndustryGroupsWithIndustries } from "@/hooks/queries/useCatalog";
import {
  JOB_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "@/utils/jobHelpers";

export const SALARY_MIN_LIMIT = 0;
export const SALARY_MAX_LIMIT = 100;
export const SALARY_STEP = 1;

export interface JobFilterState {
  industries: string[];
  jobTypes: string[];
  workModes: string[];
  jobLevels: string[];
  minSalary: string;
  maxSalary: string;
  negotiableOnly: boolean;
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
  { label: "Dưới 10 triệu", min: "", max: "10" },
  { label: "10 - 20 triệu", min: "10", max: "20" },
  { label: "Trên 25 triệu", min: "25", max: "" },
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
    <label
      title={label}
      className="group flex cursor-pointer items-center gap-1.5 py-0.5 text-[11px] select-none 3xl:text-xs"
    >
      <Checkbox.Root
        checked={checked}
        onCheckedChange={() => onChange()}
        className="flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface transition-colors group-hover:border-primary data-checked:border-primary data-checked:bg-primary 3xl:size-4"
      >
        <Checkbox.Indicator className="flex items-center justify-center text-white">
          <CheckIcon className="size-2 stroke-3 3xl:size-2.5" />
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
    if (raw !== "") {
      const num = Number(raw);
      if (isNaN(num) || num < 0 || num > SALARY_MAX_LIMIT) return;
    }
    if (field === "minSalary") {
      onSalaryRangeChange(raw, filters.maxSalary);
    } else {
      onSalaryRangeChange(filters.minSalary, raw);
    }
  };

  return (
    <aside className="flex w-full scrollbar-thin flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-surface p-3 sm:p-3.5 3xl:gap-4 3xl:rounded-3xl 3xl:p-4.5">
      <div className="flex items-center justify-between border-b border-border pb-2.5 3xl:pb-3">
        <h2 className="text-xs font-bold text-text-main sm:text-sm 3xl:text-base">Bộ lọc</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary-dark 3xl:text-xs"
        >
          <RotateCcw className="size-2.5 3xl:size-3" />
          Đặt lại
        </button>
      </div>

      <div className="flex flex-col gap-2 3xl:gap-2.5">
        <h3 className="text-[10px] font-semibold tracking-wider text-text-muted uppercase 3xl:text-[11px]">
          Lĩnh vực
        </h3>
        <div className="flex max-h-40 flex-col gap-1 overflow-x-hidden overflow-y-auto pr-0.5 3xl:max-h-50">
          {industryHierarchy.map((group) => {
            const isExpanded = expandedGroups[group.parent] ?? false;
            const isParentChecked =
              filters.industries.includes(group.parent) ||
              (group.children.length > 0 &&
                group.children.every((c) => filters.industries.includes(c)));

            return (
              <div key={group.parent} className="flex w-full flex-col gap-0.5">
                <div className="flex items-center justify-between rounded-lg py-0.5">
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
                    className="cursor-pointer p-0.5 text-text-muted hover:text-text-main"
                  >
                    {group.children.length !== 0 && (
                      <ChevronDown
                        className={`size-3 transition-transform duration-200 3xl:size-3.5 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>

                {isExpanded && group.children.length !== 0 && (
                  <div className="grid grid-cols-1 gap-0.5 pt-0.5 pl-2.5">
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

      <div className="flex flex-col gap-2.5 border-t border-border pt-2.5 3xl:gap-3 3xl:pt-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold tracking-wider text-text-muted uppercase 3xl:text-[11px]">
            Mức lương
          </h3>
          <span className="text-[10.5px] font-semibold text-primary 3xl:text-[11px]">
            {effectiveRange[0]} -{" "}
            {effectiveRange[1] >= SALARY_MAX_LIMIT
              ? `${SALARY_MAX_LIMIT}`
              : effectiveRange[1]}{" "}
            triệu
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {SALARY_PRESETS.map((preset) => {
            const isActive =
              filters.minSalary === preset.min &&
              filters.maxSalary === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSalaryRangeChange(preset.min, preset.max)}
                className={`cursor-pointer rounded-md border px-1 py-0.5 text-[10px] font-semibold transition-colors whitespace-nowrap text-center 3xl:px-1.5 3xl:py-1 3xl:text-[10.5px] ${
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

        <div className="flex flex-col gap-1.5 pt-0.5">
          <Slider
            min={SALARY_MIN_LIMIT}
            max={SALARY_MAX_LIMIT}
            step={SALARY_STEP}
            value={effectiveRange}
            onValueChange={handleSliderChange}
            onValueCommitted={handleSliderCommit}
            className="w-full cursor-pointer touch-none py-0.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
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
              placeholder="Tối thiểu 0"
              className="w-full rounded-lg border border-border bg-bg py-1 pr-1 pl-2 text-[11px] font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none 3xl:py-1.5 3xl:pl-2.5 3xl:text-xs"
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
              placeholder="Tối đa 100"
              className="w-full rounded-lg border border-border bg-bg py-1 pr-1 pl-2 text-[11px] font-semibold text-text-main focus:border-primary focus:bg-surface focus:outline-none 3xl:py-1.5 3xl:pl-2.5 3xl:text-xs"
            />
          </div>
        </div>

        <FilterCheckboxItem
          label="Chỉ gồm lương thỏa thuận"
          checked={filters.negotiableOnly}
          onChange={() => onToggleNegotiable(!filters.negotiableOnly)}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-2.5 3xl:pt-3">
        <h3 className="text-[10px] font-semibold tracking-wider text-text-muted uppercase 3xl:text-[11px]">
          Loại hình công việc
        </h3>
        <div className="grid grid-cols-2 gap-1">
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

      <div className="flex flex-col gap-1.5 border-t border-border pt-2.5 3xl:pt-3">
        <h3 className="text-[10px] font-semibold tracking-wider text-text-muted uppercase 3xl:text-[11px]">
          Môi trường làm việc
        </h3>
        <div className="grid grid-cols-3 gap-0.5">
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

      <div className="flex flex-col gap-1.5 border-t border-border pt-2.5 3xl:pt-3">
        <h3 className="text-[10px] font-semibold tracking-wider text-text-muted uppercase 3xl:text-[11px]">
          Cấp bậc
        </h3>
        <div className="grid max-h-24 grid-cols-2 gap-1 overflow-y-auto pr-0.5 3xl:max-h-28">
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
