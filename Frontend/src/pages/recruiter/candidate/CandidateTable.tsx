import { useMemo } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronDown,
  FileText,
  MessageSquare,
} from "lucide-react";
import dayjs from "dayjs";
import { DataTable, type DataTableFeatures } from "@/components/common";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { PATHS } from "@/constants/paths";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_CONFIG,
  getAllowedStatusTransitions,
  normalizeApplicationStatus,
  resolveCandidateProfile,
  type RecruiterCandidateApplicationItem,
  type UpdateJobApplicationStatus,
} from "@/types/application";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  RecruiterCandidateApplicationItem
>();

interface CandidateTableProps {
  data: RecruiterCandidateApplicationItem[];
  onReadCoverLetter: (app: RecruiterCandidateApplicationItem) => void;
  onRequestChangeStatus: (
    app: RecruiterCandidateApplicationItem,
    targetStatus: UpdateJobApplicationStatus,
  ) => void;
  onViewJobDetail: (jobId: string) => void;
  onPreviewCv?: (app: RecruiterCandidateApplicationItem) => void;
  isUpdatingStatus?: boolean;
  emptyMessage?: string;
  closedJobIds?: Set<string>;
}

export function CandidateTable({
  data,
  onReadCoverLetter,
  onRequestChangeStatus,
  onViewJobDetail: _onViewJobDetail,
  onPreviewCv,
  isUpdatingStatus,
  emptyMessage = "Chưa có ứng viên nào phù hợp.",
  closedJobIds,
}: CandidateTableProps) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        // Cột 1: Thông tin ứng viên (Avatar, Tên, Email)
        columnHelper.accessor(
          (row) => {
            const profile = resolveCandidateProfile(row);
            return profile.name;
          },
          {
            id: "candidateInfo",
            header: "Ứng viên",
            cell: ({ row }) => {
              const app = row.original;
              const profile = resolveCandidateProfile(app);

              return (
                <div className="flex max-w-64 min-w-44 items-center gap-3">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="size-9 shrink-0 rounded-full border border-border bg-bg object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                      {profile.initials}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold text-text-main sm:text-sm">
                      {profile.name}
                    </span>
                    <span className="truncate text-xs text-text-muted">
                      {profile.email}
                    </span>
                  </div>
                </div>
              );
            },
          },
        ),

        // Cột 2: Vị trí tuyển dụng & Doanh nghiệp
        columnHelper.accessor("jobTitle", {
          id: "jobInfo",
          header: "Vị trí & Công ty",
          cell: ({ row }) => {
            const app = row.original;
            const jobUrl = PATHS.RECRUITER.JOB_DETAIL.replace(":id", app.jobId);

            return (
              <div className="flex max-w-56 min-w-36 flex-col gap-0.5">
                <Link
                  to={jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs font-semibold text-text-main transition-colors hover:text-primary sm:text-sm"
                  title={app.jobTitle}
                >
                  {app.jobTitle}
                </Link>
                <span className="truncate text-xs text-text-muted">
                  {app.companyName || "Doanh nghiệp"}
                </span>
              </div>
            );
          },
        }),

        // Cột 3: Hồ sơ CV đính kèm
        columnHelper.display({
          id: "cvDocument",
          header: () => <div className="text-center">Hồ sơ CV</div>,
          cell: ({ row }) => {
            const app = row.original;

            return (
              <div className="flex justify-center">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mở file CV PDF đã tải lên"
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    <span>Xem CV</span>
                    <FileText className="size-3" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPreviewCv?.(app)}
                    disabled={
                      !onPreviewCv || (!app.cvSnapshot && !app.cvVersionId)
                    }
                    title="Xem trước CV hệ thống"
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Xem CV</span>
                    <FileText className="size-3" />
                  </button>
                )}
              </div>
            );
          },
        }),

        // Cột 4: Thư giới thiệu (Chỉ nút icon mở modal, không đoạn trích)
        columnHelper.display({
          id: "coverLetter",
          header: () => <div className="text-center">Thư giới thiệu</div>,
          cell: ({ row }) => {
            const app = row.original;
            const hasLetter = Boolean(
              app.coverLetter && app.coverLetter.trim(),
            );

            if (!hasLetter) {
              return (
                <div className="flex justify-center text-xs text-text-muted/60">
                  <span>—</span>
                </div>
              );
            }

            return (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => onReadCoverLetter(app)}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <MessageSquare className="size-3.5" />
                      </button>
                    }
                  />
                  <TooltipPanel>Đọc thư giới thiệu của ứng viên</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),

        // Cột 5: Thời gian (Ngày nộp + Lần cập nhật)
        columnHelper.accessor("appliedAt", {
          id: "timeline",
          header: "Thời gian",
          cell: ({ row }) => {
            const app = row.original;
            const appliedText = app.appliedAt
              ? dayjs(app.appliedAt).format("DD/MM/YYYY HH:mm")
              : "—";
            const updatedText = app.updatedAt
              ? dayjs(app.updatedAt).format("DD/MM/YYYY HH:mm")
              : appliedText;

            return (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-text-main">
                  {appliedText}
                </span>
                <span className="text-[11px] text-text-muted">
                  Cập nhật: {updatedText}
                </span>
              </div>
            );
          },
        }),

        // Cột 6: Trạng thái quy trình
        columnHelper.accessor("status", {
          header: "Trạng thái",
          cell: ({ row }) => {
            const normalizedStatus = normalizeApplicationStatus(row.original.status);
            const cfg = APPLICATION_STATUS_CONFIG[normalizedStatus] ||
              APPLICATION_STATUS_CONFIG[normalizedStatus.toUpperCase()] || {
              label: normalizedStatus,
              badgeClass: "bg-bg text-text-muted border-border",
            };

            return (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
            );
          },
        }),

        // Cột 7: Thao tác chuyển đổi trạng thái (Kích thước & căn lề đồng đều h-8 w-40)
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-center">Thao tác</div>,
          cell: ({ row }) => {
            const app = row.original;
            const isJobClosed =
              (app.jobStatus || app.job?.status || "").toUpperCase() === "CLOSED" ||
              (Boolean(app.jobId) && Boolean(closedJobIds?.has(app.jobId)));

            const nextAllowedOptions = getAllowedStatusTransitions(
              app.status,
              isJobClosed,
            );

            // Nếu trạng thái đã là Terminal (Hired, Rejected, Withdrawn)
            if (nextAllowedOptions.length === 0) {
              return (
                <div className="flex justify-center">
                  <div className="flex h-8 w-40 items-center justify-center rounded-xl border border-border bg-slate-50 text-xs font-medium text-text-muted select-none">
                    <span>Hoàn tất quy trình</span>
                  </div>
                </div>
              );
            }

            return (
              <div className="flex justify-center">
                <Select.Root
                  items={nextAllowedOptions}
                  onValueChange={(val) => {
                    if (val) {
                      onRequestChangeStatus(
                        app,
                        val as UpdateJobApplicationStatus,
                      );
                    }
                  }}
                  disabled={isUpdatingStatus}
                >
                  <Select.Trigger
                    aria-label="Cập nhật trạng thái ứng viên"
                    className="flex h-8 w-40 cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-3 text-xs font-semibold text-text-main transition-colors hover:border-primary hover:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="truncate">Chuyển trạng thái...</span>
                    <Select.Icon className="shrink-0 text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                      <ChevronDown className="size-3" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Positioner
                      alignItemWithTrigger={false}
                      sideOffset={4}
                    >
                      <Select.Popup className="z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                        <Select.List>
                          {nextAllowedOptions.map(
                            (opt: {
                              value: UpdateJobApplicationStatus;
                              label: string;
                            }) => (
                              <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 ${
                                  normalizeApplicationStatus(opt.value) ===
                                  APPLICATION_STATUS.REJECTED
                                    ? "text-status-error hover:bg-status-error/10"
                                    : "text-text-main hover:text-primary"
                                }`}
                              >
                                <Select.ItemText>{opt.label}</Select.ItemText>
                              </Select.Item>
                            ),
                          )}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </div>
            );
          },
        }),
      ]),
    [
      isUpdatingStatus,
      onPreviewCv,
      onReadCoverLetter,
      onRequestChangeStatus,
      closedJobIds,
    ],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      initialSorting={[{ id: "appliedAt", desc: true }]}
      emptyMessage={emptyMessage}
    />
  );
}
