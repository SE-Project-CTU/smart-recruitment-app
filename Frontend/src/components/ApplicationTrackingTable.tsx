import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  FileText,
  Filter,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import dayjs from "dayjs";
import {
  MOCK_APPLICATIONS,
  type ApplicationStatus,
  type MockApplication,
} from "@/constants/mockData";
import {
  Button,
  DataTable,
  type DataTableFeatures,
} from "@/components/common";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "./animate-ui/components/base/tooltip";
import { Select } from "@animate-ui/react/primitives/base-ui/select";

const columnHelper = createColumnHelper<DataTableFeatures, MockApplication>();

const STATUS_OPTIONS = [
  { value: "ALL", label: `Tất cả` },
  { value: "APPLIED", label: "Đã nộp" },
  { value: "REVIEWING", label: "Đang xem xét" },
  { value: "INTERVIEW", label: "Phỏng vấn" },
  { value: "OFFERED", label: "Mời nhận việc" },
  { value: "ACCEPTED", label: "Đã trúng tuyển" },
  { value: "REJECTED", label: "Từ chối" },
];

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badgeClass: string }
> = {
  APPLIED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  REVIEWING: {
    label: "Đang xem xét",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  INTERVIEW: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  OFFERED: {
    label: "Mời nhận việc",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  ACCEPTED: {
    label: "Đã trúng tuyển",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

interface ApplicationTrackingTableProps {
  data?: MockApplication[];
  onViewDetail?: (application: MockApplication) => void;
}

export function ApplicationTrackingTable({
  data = MOCK_APPLICATIONS,
  onViewDetail,
}: ApplicationTrackingTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((row) => row.job.title, {
          id: "jobInfo",
          header: "Vị trí",
          cell: ({ row }) => {
            const { job } = row.original;
            return (
              <div className="flex max-w-72 min-w-48 items-center gap-3">
                <img
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  className="size-10 shrink-0 rounded-xl border border-slate-100 object-cover"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="truncate text-sm font-bold text-slate-800">
                          {job.title}
                        </span>
                      }
                    />
                    <TooltipPanel>{job.title}</TooltipPanel>
                  </Tooltip>
                  <span className="truncate text-xs text-slate-500">
                    {job.company.name}
                  </span>
                  {/* Trên mobile: Hiển thị gộp luôn Hình thức & Tỉnh thành nhỏ ở dưới */}
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
                    <MapPin className="size-3" />
                    {job.workMode} • {job.location.provinceName}
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
            const { workMode, location } = row.original.job;
            return (
              <div className="flex flex-col gap-1 text-xs">
                <span className="w-fit rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {workMode}
                </span>
                <span className="text-slate-500">{location.provinceName}</span>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "salary",
          header: "Mức lương",
          meta: { className: "hidden lg:table-cell" },
          cell: ({ row }) => {
            const { salaryMin, salaryMax, salaryNegotiable } = row.original.job;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-slate-800">
                  {salaryNegotiable
                    ? "Thỏa thuận"
                    : "$" +
                      `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`}
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
            const score = row.original.job.aiMatchScore;
            if (!score)
              return <span className="text-xs text-slate-400">—</span>;

            return (
              <div className="flex w-fit flex-col gap-1">
                <span className="text-left! text-xs font-bold text-primary">
                  {score}%
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
                {/* Nút xem nhanh CV */}
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
                    title={`Phiên bản CV hệ thống: ${app.cvVersionId}`}
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
                  {dayjs(iso).format("DD/MM/YYYY")}
                </span>
              </div>
            );
          },
        }),

        columnHelper.accessor("status", {
          header: "Trạng thái",
          filterFn: "includesString",
          cell: ({ row }) => {
            const status = row.original.status;
            const cfg = STATUS_CONFIG[status];
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
                        onClick={() =>
                          onViewDetail
                            ? onViewDetail(app)
                            : console.log("Xem chi tiết application:", app.id)
                        }
                        className="p-1! text-xs! ring-0!"
                      ></Button>
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

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        initialSorting={[{ id: "appliedAt", desc: true }]}
        toolbar={(table) => {
          const currentStatus =
            (table.getColumn("status")?.getFilterValue() as string) ?? "ALL";

          return (
            <div className="flex w-full items-center justify-end">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 shadow-2xs">
                <Filter className="size-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Trạng thái:</span>

                <Select.Root
                  items={STATUS_OPTIONS}
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
                          {STATUS_OPTIONS.map((status) => (
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
    </>
  );
}
