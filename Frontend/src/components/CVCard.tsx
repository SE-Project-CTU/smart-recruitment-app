import { Clock, Download, Edit3, Trash } from "lucide-react";
import Button from "@/components/Button";
import { getTimeAgo } from "@/utils/helper";
import type { CVItem } from "@/types/cv";

interface CVCardProps {
  cv: CVItem;
  onEdit?: (cv: CVItem) => void;
  onDownload?: (cv: CVItem) => void;
  onDelete?: (cv: CVItem) => void;
}

export function CVCard({ cv, onEdit, onDownload, onDelete }: CVCardProps) {
  const templateName = cv.template?.name || "ATS Standard";

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:border-secondary hover:shadow-md">
      <div className="group/image relative flex aspect-3/4 w-full flex-col justify-between overflow-hidden rounded-t-2xl">
        {cv.thumbnailUrl ? (
          <img
            src={cv.thumbnailUrl}
            alt={cv.title}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500"
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

        <div className="absolute inset-0 z-10 flex items-start gap-2 bg-linear-to-b from-black/70 via-black/20 to-transparent p-3 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover/image:opacity-100">
          {cv.isPublic ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
              <span className="size-1.5 rounded-full bg-status-success" />
              Công khai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
              <span className="size-1.5 rounded-full bg-slate-500" />
              Riêng tư
            </span>
          )}

          {cv.language && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 uppercase shadow-sm">
              {cv.language}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3
          title={cv.title}
          className="line-clamp-1 text-base font-bold text-slate-800"
        >
          {cv.title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <span className="truncate">{templateName}</span>
          <span className="flex shrink-0 items-center gap-1 text-text-muted">
            <Clock className="size-3.5" />
            Cập nhật {getTimeAgo(cv.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-2.5 p-4">
        <Button
          variant="primary"
          icon={Download}
          iconSize={14}
          onClick={() => onDownload?.(cv)}
          className="w-full! justify-center rounded-lg! p-2! text-xs! md:text-sm!"
        >
          Tải xuống
        </Button>
        <Button
          variant="secondary"
          icon={Edit3}
          iconSize={14}
          onClick={() => onEdit?.(cv)}
          className="aspect-square! w-fit justify-center rounded-lg! p-2! text-xs! md:text-sm!"
        ></Button>
        <Button
          variant="secondary"
          icon={Trash}
          iconSize={14}
          onClick={() => onDelete?.(cv)}
          className="aspect-square! w-fit justify-center rounded-lg! p-2! text-xs! text-status-error! ring-status-error! md:text-sm!"
        ></Button>
      </div>
    </div>
  );
}
