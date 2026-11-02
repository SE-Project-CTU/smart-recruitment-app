import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  MapPin,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import type { MockApplication } from "@/constants/mockData";
import {
  APPLICATION_STATUS_CONFIG,
  type CandidateMyApplicationItem,
} from "@/types/application";
import {
  Button,
  DataTable,
  TableSkeleton,
  type DataTableFeatures,
} from "@/components/common";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "./animate-ui/components/base/tooltip";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { formatSalaryCompact, getWorkModeLabel } from "@/utils/jobHelpers";

export type ApplicationTrackingItem =
  | CandidateMyApplicationItem
  | MockApplication;

const columnHelper =
  createColumnHelper<DataTableFeatures, ApplicationTrackingItem>();

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "Submitted", label: "Đã nộp" },
  { value: "Reviewing", label: "Đang xem xét" },
  { value: "Shortlisted", label: "Đã chọn lọc" },
  { value: "Interviewing", label: "Phỏng vấn" },
  { value: "Offered", label: "Mời nhận việc" },
  { value: "Hired", label: "Đã tuyển dụng" },
  { value: "Rejected", label: "Từ chối" },
];

function getStatusBadge(status?: string) {
  if (!status) {
    return {
      label: "Chưa xác định",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  if (APPLICATION_STATUS_CONFIG[status]) {
    return APPLICATION_STATUS_CONFIG[status];
  }

  // Tìm kiếm case-insensitive
  const foundKey = Object.keys(APPLICATION_STATUS_CONFIG).find(
    (k) => k.toLowerCase() === status.toLowerCase(),
  );
  if (foundKey) {
    return APPLICATION_STATUS_CONFIG[foundKey];
  }

  return {
    label: status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

function extractAppRow(app: ApplicationTrackingItem) {
  const isCandidateItem = "jobTitle" in app;
  const job = "job" in app ? app.job : undefined;

  const title =
    (isCandidateItem
      ? (app as CandidateMyApplicationItem).jobTitle
      : undefined) ||
    job?.title ||
    "Vị trí tuyển dụng";

  const companyName =
    (isCandidateItem
      ? (app as CandidateMyApplicationItem).companyName
      : undefined) ||
    job?.company?.name ||
    "Doanh nghiệp";

  const companyLogo =
    (isCandidateItem
      ? (app as CandidateMyApplicationItem).companyLogoUrl
      : undefined) ||
    job?.company?.logoUrl ||
    ("logoFileUrl" in (job?.company || {})
      ? (job?.company as { logoFileUrl?: string | null })?.logoFileUrl
      : null) ||
    null;

  const workMode = job?.workMode
    ? getWorkModeLabel(job.workMode)
    : "Onsite";

  const location =
    (isCandidateItem
      ? (app as CandidateMyApplicationItem).locationName
      : undefined) ||
    ("province" in (job || {})
      ? (job as unknown as { province?: { name?: string } }).province?.name
      : undefined) ||
    ("location" in (job || {})
      ? (job as unknown as { location?: { provinceName?: string } })?.location
          ?.provinceName
      : "") ||
    "Toàn quốc";

  let salaryText =
    (isCandidateItem
      ? (app as CandidateMyApplicationItem).salaryRange
      : undefined) || "";

  if (!salaryText && job) {
    salaryText = formatSalaryCompact(
      job.salaryMin,
      job.salaryMax,
      job.salaryNegotiable,
    ).text;
  }
  if (!salaryText) salaryText = "Thỏa thuận";

  const aiScore =
    job &&
    "aiMatchScore" in job &&
    typeof (job as { aiMatchScore?: unknown }).aiMatchScore === "number"
      ? (job as { aiMatchScore: number }).aiMatchScore
      : null;

  return {
    title,
    companyName,
    companyLogo,
    workMode,
    location,
    salaryText,
    aiScore,
  };
}

function CompanyLogoCell({
  logoUrl,
  name,
}: {
  logoUrl: string | null;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="size-10 shrink-0 rounded-xl border border-slate-100 object-cover"
      />
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-primary">
      <Building2 className="size-5" />
    </div>
  );
}

export interface ApplicationTrackingTableProps {
  data?: ApplicationTrackingItem[];
  isLoading?: boolean;
  onViewDetail?: (application: ApplicationTrackingItem) => void;
}

export function ApplicationTrackingTable({
  data = [],
  isLoading = false,
  onViewDetail,
}: ApplicationTrackingTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "jobInfo",
          header: "Vị trí",
          cell: ({ row }) => {
            const app = row.original;
            const { title, companyName, companyLogo, workMode, location } =
              extractAppRow(app);

            return (
              <div className="flex max-w-72 min-w-48 items-center gap-3">
                <CompanyLogoCell logoUrl={companyLogo} name={companyName} />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="truncate text-sm font-bold text-slate-800">
                          {title}
                        </span>
                      }
                    />
                    <TooltipPanel>{title}</TooltipPanel>
                  </Tooltip>
                  <span className="truncate text-xs text-slate-500">
                    {companyName}
                  </span>
                  {/* Trên mobile: Hiển thị gộp luôn Hình thức & Tỉnh thành nhỏ ở dưới */}
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
                    <MapPin className="size-3" />
                    {workMode} • {location}
                  </span>
                </div>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "locationAndMode",
          header: "Địa điểm & Hình thức",
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }) => {
            const { workMode, location } = extractAppRow(row.original);
            return (
              <div className="flex flex-col gap-1 text-xs">
                <span className="w-fit rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {workMode}
                </span>
                <span className="text-slate-500">{location}</span>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "salary",
          header: "Mức lương",
          meta: { className: "hidden lg:table-cell" },
          cell: ({ row }) => {
            const { salaryText } = extractAppRow(row.original);
            return (
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-slate-800">
                  {salaryText}
                </span>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "aiMatchScore",
          header: "Độ phù hợp",
          meta: { className: "hidden xl:table-cell" },
          cell: ({ row }) => {
            const { aiScore } = extractAppRow(row.original);
            if (!aiScore) {
              return <span className="text-xs text-slate-400">—</span>;
            }

            return (
              <div className="flex w-fit flex-col gap-1">
                <span className="text-left! text-xs font-bold text-primary">
                  {aiScore}%
                </span>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "documents",
          header: "Hồ sơ đã nộp",
          meta: { className: "hidden lg:table-cell" },
          cell: ({ row }) => {
            const app = row.original;
            return (
              <div className="flex items-center gap-1.5">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Mở file CV PDF đã tải lên"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    <FileText className="size-3.5" />
                    <span>PDF</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                ) : (
                  <span
                    title={
                      app.cvVersionId
                        ? `Phiên bản CV hệ thống: ${app.cvVersionId}`
                        : "Hồ sơ ứng tuyển trực tuyến"
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Sparkles className="size-3.5" />
                    <span>CV Online</span>
                  </span>
                )}
              </div>
            );
          },
        }),

        columnHelper.accessor("appliedAt", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
            >
              <span>Ngày nộp</span>
              <ArrowUpDown className="size-3.5" />
            </button>
          ),
          cell: ({ row }) => {
            const iso = row.original.appliedAt;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-medium text-slate-700">
                  {iso ? dayjs(iso).format("DD/MM/YYYY") : "—"}
                </span>
              </div>
            );
          },
        }),

        columnHelper.accessor("status", {
          header: "Trạng thái",
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue === "ALL") return true;
            const rowStatus = String(row.getValue(columnId) || "").toLowerCase();
            const target = String(filterValue).toLowerCase();
            return rowStatus === target;
          },
          cell: ({ row }) => {
            const status = row.original.status;
            const cfg = getStatusBadge(status);
            return (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
            );
          },
        }),

        columnHelper.display({
          id: "actions",
          header: () => <div className="text-center">Thao tác</div>,
          cell: ({ row }) => {
            const app = row.original;
            return (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        icon={Eye}
                        iconSize={16}
                        onClick={() => onViewDetail?.(app)}
                        className="p-1! text-xs! ring-0!"
                      />
                    }
                  />
                  <TooltipPanel>Xem chi tiết</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),
      ]),
    [onViewDetail],
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      initialSorting={[{ id: "appliedAt", desc: true }]}
      emptyMessage="Bạn chưa nộp đơn ứng tuyển nào. Hãy khám phá các cơ hội việc làm mới!"
      toolbar={(table) => {
        const currentStatus =
          (table.getColumn("status")?.getFilterValue() as string) ?? "ALL";

        return (
          <div className="flex w-full items-center justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
              <Filter className="size-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Trạng thái:</span>

              <Select.Root
                items={STATUS_FILTER_OPTIONS}
                value={currentStatus}
                onValueChange={(val) => {
                  const nextValue = val === "ALL" ? undefined : val;
                  table.getColumn("status")?.setFilterValue(nextValue);
                }}
              >
                <Select.Trigger
                  aria-label="Lọc theo trạng thái"
                  className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <Select.Value />
                  <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Positioner
                    alignItemWithTrigger={false}
                    sideOffset={4}
                  >
                    <Select.Popup className="z-50 min-w-36 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                      <Select.List>
                        {STATUS_FILTER_OPTIONS.map((status) => (
                          <Select.Item
                            key={status.value}
                            value={status.value}
                            className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100 data-highlighted:bg-slate-100 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                          >
                            <Select.ItemText>{status.label}</Select.ItemText>
                            <Select.ItemIndicator
                              animation="pop"
                              className="ml-2 text-xs text-primary"
                            >
                              ✓
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
        );
      }}
    />
  );
}

export default ApplicationTrackingTable;
