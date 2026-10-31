import { useMemo } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  Sparkles,
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
import type {
  RecruiterCandidateApplicationItem,
  UpdateJobApplicationStatus,
} from "@/types/job";
import {
  ALLOWED_STATUS_TRANSITIONS,
  APPLICATION_STATUS_CONFIG,
  resolveCandidateProfile,
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
  isUpdatingStatus?: boolean;
  emptyMessage?: string;
}

export function CandidateTable({
  data,
  onReadCoverLetter,
  onRequestChangeStatus,
  onViewJobDetail,
  isUpdatingStatus,
  emptyMessage = "Chưa có ứng viên nào phù hợp.",
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
                      className="size-10 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                      {profile.initials}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-bold text-slate-800">
                      {profile.name}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <Mail className="size-3 shrink-0 text-slate-400" />
                      <span className="truncate">{profile.email}</span>
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
                  className="group inline-flex items-center gap-1 truncate text-xs font-bold text-slate-800 transition-colors hover:text-primary sm:text-sm"
                  title={app.jobTitle}
                >
                  <span className="truncate">{app.jobTitle}</span>
                  <ExternalLink className="size-3 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
                <span className="truncate text-xs text-slate-500">
                  {app.companyName || "Doanh nghiệp"}
                </span>
              </div>
            );
          },
        }),

        // Cột 3: Hồ sơ CV đính kèm
        columnHelper.display({
          id: "cvDocument",
          header: "Hồ sơ CV",
          cell: ({ row }) => {
            const app = row.original;

            return (
              <div className="flex items-center gap-2">
                {app.uploadedCvUrl ? (
                  <a
                    href={app.uploadedCvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <FileText className="size-3.5 text-rose-500" />
                    <span>File CV PDF</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>CV Hệ thống</span>
                  </span>
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
                <div className="flex justify-center text-xs text-slate-400">
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
                        className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        <MessageSquare className="size-4" />
                      </button>
                    }
                  />
                  <TooltipPanel>Đọc thư giới thiệu của ứng viên</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),

        // Cột 5: Thời gian (Phương án 1 - Gộp dòng: Ngày nộp + Lần cập nhật)
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
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Calendar className="size-3 text-slate-400" />
                  <span>{appliedText}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="size-2.5" />
                  <span>Cập nhật: {updatedText}</span>
                </span>
              </div>
            );
          },
        }),

        // Cột 6: Trạng thái quy trình
        columnHelper.accessor("status", {
          header: "Trạng thái",
          cell: ({ row }) => {
            const rawStatus = (
              row.original.status || "SUBMITTED"
            ).toUpperCase();
            const cfg = APPLICATION_STATUS_CONFIG[rawStatus] || {
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

        // Cột 7: Thao tác chuyển đổi trạng thái
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-center">Thao tác</div>,
          cell: ({ row }) => {
            const app = row.original;
            const currentStatus = (app.status || "SUBMITTED").toUpperCase();
            const nextAllowedOptions =
              ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

            // Nếu trạng thái đã là Terminal (HIRED, REJECTED, WITHDRAWN)
            if (nextAllowedOptions.length === 0) {
              const isHired =
                currentStatus === "HIRED" || currentStatus === "ACCEPTED";
              const isRejected = currentStatus === "REJECTED";

              return (
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                      isHired
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isRejected
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Hoàn tất quy trình</span>
                  </span>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => onViewJobDetail(app.jobId)}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Eye className="size-3.5" />
                        </button>
                      }
                    />
                    <TooltipPanel>Xem chi tiết tin tuyển dụng</TooltipPanel>
                  </Tooltip>
                </div>
              );
            }

            return (
              <div className="flex items-center justify-center gap-1.5">
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
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-primary hover:text-primary focus:outline-none"
                  >
                    <span>Chuyển trạng thái...</span>
                    <Select.Icon className="text-slate-400 transition-transform duration-200 group-data-popup-open:rotate-180">
                      <ChevronDown className="size-3" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Positioner
                      alignItemWithTrigger={false}
                      sideOffset={4}
                    >
                      <Select.Popup className="z-50 min-w-48 overflow-hidden rounded-xl border border-border bg-white p-1 shadow-md">
                        <Select.List>
                          {nextAllowedOptions.map(
                            (opt: {
                              value: UpdateJobApplicationStatus;
                              label: string;
                            }) => (
                              <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-slate-100 ${
                                  opt.value === "REJECTED"
                                    ? "text-rose-600 hover:bg-rose-50"
                                    : "text-slate-700 hover:text-primary"
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

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => onViewJobDetail(app.jobId)}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition-colors hover:border-primary hover:text-primary"
                      >
                        <Eye className="size-3.5" />
                      </button>
                    }
                  />
                  <TooltipPanel>Xem chi tiết tin tuyển dụng</TooltipPanel>
                </Tooltip>
              </div>
            );
          },
        }),
      ]),
    [
      isUpdatingStatus,
      onReadCoverLetter,
      onRequestChangeStatus,
      onViewJobDetail,
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
