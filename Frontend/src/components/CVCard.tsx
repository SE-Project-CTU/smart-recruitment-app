import { Clock, Download, Edit3 } from "lucide-react";
import Button from "@/components/Button";
import { getTimeAgo } from "@/utils/helper";

export interface CVTemplateSummary {
  id: string;
  code: string;
  name: string;
}

export interface CVItem {
  id: string;
  title: string;
  templateId: string;
  template: CVTemplateSummary;
  language: "vi" | "en" | string;
  isPublic: boolean;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

interface CVCardProps {
  cv: CVItem;
  onEdit?: (cv: CVItem) => void;
  onDownload?: (cv: CVItem) => void;
}

export function CVCard({ cv, onEdit, onDownload }: CVCardProps) {
  const templateName = cv.template?.name || "ATS Standard";

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-white p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
      <div className="relative flex aspect-[4/4.3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-indigo-50/40 p-4">
        {cv.thumbnailUrl ? (
          <img
            src={cv.thumbnailUrl}
            alt={cv.title}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="my-auto flex w-full flex-col gap-3 px-1 pt-6 select-none">
            <div className="flex items-center gap-3">
              <div className="size-8 shrink-0 rounded-full bg-slate-400/70" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-2.5 w-3/5 rounded-full bg-slate-600/80" />
                <div className="h-2 w-2/5 rounded-full bg-slate-400/70" />
              </div>
            </div>

            <div className="h-px w-full bg-slate-200/90" />

            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full rounded-full bg-slate-300/90" />
              <div className="h-1.5 w-11/12 rounded-full bg-slate-300/90" />
              <div className="h-1.5 w-3/4 rounded-full bg-slate-300/90" />
            </div>

            <div className="mt-1 flex flex-col gap-1.5">
              <div className="h-1.5 w-2/5 rounded-full bg-primary/40" />
              <div className="h-1.5 w-full rounded-full bg-slate-300/90" />
              <div className="h-1.5 w-5/6 rounded-full bg-slate-300/90" />
              <div className="h-1.5 w-4/5 rounded-full bg-slate-300/90" />
            </div>

            <div className="mt-1 flex flex-col gap-1.5">
              <div className="h-1.5 w-1/3 rounded-full bg-teal-600/40" />
              <div className="h-1.5 w-full rounded-full bg-slate-300/90" />
              <div className="h-1.5 w-4/5 rounded-full bg-slate-300/90" />
            </div>
          </div>
        )}

        <div className="relative z-10 flex items-center justify-between">
          {cv.isPublic ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 shadow-2xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Công khai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-slate-500" />
              Riêng tư
            </span>
          )}

          {cv.language && (
            <span className="inline-flex items-center justify-center rounded-md bg-indigo-100/90 px-2 py-0.5 text-[11px] font-bold text-primary uppercase backdrop-blur-xs">
              {cv.language}
            </span>
          )}
        </div>

        <div className="relative z-10 flex items-center justify-between pt-2 text-[11px] font-medium text-slate-500">
          <span className="truncate">{templateName}</span>
          <span className="font-bold text-primary">PDF</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 px-1">
        <h3
          title={cv.title}
          className="line-clamp-1 text-base font-bold text-slate-800"
        >
          {cv.title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="truncate">Template: {templateName}</span>
          <span className="flex shrink-0 items-center gap-1 text-slate-400">
            <Clock className="size-3.5" />
            Cập nhật {getTimeAgo(cv.updatedAt)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 pt-2">
        <Button
          variant="outline"
          icon={Edit3}
          iconSize={14}
          onClick={() => onEdit?.(cv)}
          className="w-full! justify-center rounded-xl! border-slate-200! bg-slate-50/70! py-2.5! text-xs! text-slate-700! hover:bg-slate-100!"
        >
          Xem & Chỉnh sửa
        </Button>

        <Button
          variant="secondary"
          icon={Download}
          iconSize={14}
          onClick={() => onDownload?.(cv)}
          className="w-full! justify-center rounded-xl! bg-sky-200/70! py-2.5! text-xs! font-semibold! text-slate-800! hover:bg-sky-300/80!"
        >
          Tải xuống
        </Button>
      </div>
    </div>
  );
}
