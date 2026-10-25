import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Building2,
  Eye,
  MapPin,
  Pencil,
  PowerOff,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import { DataTable, type DataTableFeatures } from "@/components/DataTable";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import type { JobPostingItem } from "@/types/job";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { formatSalaryRange, getWorkModeLabel } from "@/utils/jobHelpers";

const columnHelper = createColumnHelper<DataTableFeatures, JobPostingItem>();

export const JOB_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  OPEN: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Published: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PUBLISHED: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAUSED: {
    label: "Tạm dừng",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Closed: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  Expired: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  PendingReview: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Draft: {
    label: "Bản nháp",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

interface JobPostingsTableProps {
  data: JobPostingItem[];
  provinceMap: Map<string, string>;
  companyLogoMap?: Map<string, string | null>;
  onCloseJob: (job: JobPostingItem) => void;
  onEditJob: (job: JobPostingItem) => void;
  onViewDetail: (job: JobPostingItem) => void;
  emptyMessage?: string;
}

export function JobPostingsTable({
  data,
  provinceMap,
  companyLogoMap,
  onCloseJob,
  onEditJob,
  onViewDetail,
  emptyMessage = "Chưa có tin tuyển dụng nào phù hợp.",
}: JobPostingsTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Cột 1: Vị trí & Doanh nghiệp
        columnHelper.accessor((row) => row.title, {
          id: "jobInfo",
          header: "Vị trí & Doanh nghiệp",
          cell: ({ row }) => {
            const job = row.original;
            const companyId = job.companyId || job.company?.id || "";
            const logo =
              job.companyLogoUrl ||
              job.company?.logoUrl ||
              (companyLogoMap ? companyLogoMap.get(companyId) : null);
            const provinceName =
              (job.provinceId ? provinceMap.get(job.provinceId) : null) ||
              job.province?.name ||
              "Toàn quốc";

            return (
              <div className="flex max-w-72 min-w-48 items-center gap-3">
                <CompanyLogo
                  logoUrl={logo || null}
                  name={job.companyName || "Doanh nghiệp"}
                  size="sm"
                />

                <div className="flex min-w-0 flex-col gap-0.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => onViewDetail(job)}
                          className="truncate text-left text-sm font-bold text-slate-800 transition-colors hover:text-primary cursor-pointer"
                        >
                          {job.title}
                        </button>
                      }
                    />
                    <TooltipPanel>{job.title}</TooltipPanel>
                  </Tooltip>

                  <span className="truncate text-xs text-slate-500">
                    {job.companyName || "Doanh nghiệp"}
                  </span>

                  {/* Trên mobile: Hiển thị gộp Hình thức & Tỉnh thành */}
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 md:hidden">
                    <MapPin className="size-3" />
                    {getWorkModeLabel(job.workMode)} • {provinceName}
                  </span>
                </div>
              </div>
            );
          },
        }),

        // Cột 2: Địa điểm & Hình thức
        columnHelper.display({
          id: "locationAndMode",
          header: "Địa điểm & Hình thức",
          meta: { className: "hidden md:table-cell" },
          cell: ({ row }) => {
            const job = row.original;
            const provinceName =
              provinceMap.get(job.provinceId) ||
              job.province?.name ||
              "Toàn quốc";

            return (
              <div className="flex flex-col gap-1 text-xs">
                <span className="w-fit rounded-md bg-secondary-light px-2 py-0.5 font-medium text-primary">
                  {getWorkModeLabel(job.workMode)}
                </span>
                <span className="text-slate-500">{provinceName}</span>
              </div>
            );
          },
        }),

        // Cột 3: Mức lương
        columnHelper.display({
          id: "salary",
          header: "Mức lương",
          meta: { className: "hidden lg:table-cell" },
          cell: ({ row }) => {
            const { salaryMin, salaryMax, salaryNegotiable } = row.original;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-slate-800">
                  {salaryNegotiable
                    ? "Thỏa thuận"
                    : formatSalaryRange(salaryMin, salaryMax, false)}
                </span>
              </div>
            );
          },
        }),

        // Cột 4: Ngày tạo (sortable)
        columnHelper.accessor("createdAt", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-600 transition-colors hover:text-primary"
            >
              <span>Ngày tạo</span>
              <ArrowUpDown className="size-3.5" />
            </button>
          ),
          cell: ({ row }) => {
            const iso = row.original.createdAt;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-medium text-slate-700">
                  {iso ? dayjs(iso).format("DD/MM/YYYY") : "—"}
                </span>
              </div>
            );
          },
        }),

        // Cột 5: Hạn nộp
        columnHelper.accessor("deadline", {
          header: "Hạn nhận hồ sơ",
          meta: { className: "hidden sm:table-cell" },
          cell: ({ row }) => {
            const iso = row.original.deadline;
            return (
              <div className="flex flex-col text-xs">
                <span className="font-medium text-slate-700">
                  {iso ? dayjs(iso).format("DD/MM/YYYY") : "—"}
                </span>
              </div>
            );
          },
        }),

        // Cột 6: Trạng thái
        columnHelper.accessor("status", {
          header: "Trạng thái",
          filterFn: "includesString",
          cell: ({ row }) => {
            const rawStatus = row.original.status || "Draft";
            const cfg = JOB_STATUS_CONFIG[rawStatus] || {
              label: rawStatus,
              badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            };

            return (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
            );
          },
        }),

        // Cột 7: Thao tác (3 nút hành động)
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-center">Thao tác</div>,
          cell: ({ row }) => {
            const job = row.original;
            const isClosed =
              job.status?.toUpperCase() === "CLOSED" ||
              job.status?.toUpperCase() === "EXPIRED";

            return (
              <div className="flex items-center justify-center gap-1.5">
                {/* Nút 1: Tắt / Đóng tin */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        icon={PowerOff}
                        iconSize={15}
                        disabled={isClosed}
                        onClick={() => onCloseJob(job)}
                        className={`p-1.5! text-xs! ring-0! transition-colors ${
                          isClosed
                            ? "cursor-not-allowed opacity-30 text-slate-400"
                            : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        }`}
                      />
                    }
                  />
                  <TooltipPanel>
                    {isClosed
                      ? "Tin đã kết thúc hoặc hết hạn"
                      : "Tắt / Đóng tin tuyển dụng"}
                  </TooltipPanel>
                </Tooltip>

                {/* Nút 2: Chỉnh sửa */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        icon={Pencil}
                        iconSize={15}
                        onClick={() => onEditJob(job)}
                        className="p-1.5! text-xs! ring-0! text-slate-600 hover:bg-primary/5 hover:text-primary"
                      />
                    }
                  />
                  <TooltipPanel>Chỉnh sửa tin tuyển dụng</TooltipPanel>
                </Tooltip>

                {/* Nút 3: Xem chi tiết */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="secondary"
                        icon={Eye}
                        iconSize={15}
                        onClick={() => onViewDetail(job)}
                        className="p-1.5! text-xs! ring-0! text-primary hover:bg-primary/10"
                      />
                    }
                  />
                  <TooltipPanel>Xem chi tiết & đơn ứng tuyển</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),
      ]),
    [companyLogoMap, provinceMap, onCloseJob, onEditJob, onViewDetail],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      initialSorting={[{ id: "createdAt", desc: true }]}
      emptyMessage={emptyMessage}
    />
  );
}
