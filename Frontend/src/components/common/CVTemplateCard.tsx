import React from "react";
import { Eye, Pencil } from "lucide-react";
import Button from "./Button";

export interface CVTemplateItemData {
  id: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  badge?: string;
  version?: number | string;
  isActive?: boolean;
  language?: string;
}

export interface CVTemplateCardProps {
  template: CVTemplateItemData;
  onUseTemplate?: (template: CVTemplateItemData) => void;
  onPreview?: (template: CVTemplateItemData) => void;
  onEdit?: (template: CVTemplateItemData) => void;
  footerExtra?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  className?: string;
}

export function CVTemplateCard({
  template,
  onUseTemplate,
  onPreview,
  onEdit,
  footerExtra,
  topRightBadge,
  className = "",
}: CVTemplateCardProps) {
  const isHidden = template.isActive === false;

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border transition-all duration-300 ${
        isHidden
          ? "border-border/70 bg-slate-50/70 opacity-80"
          : "border-border bg-surface hover:border-primary/40 hover:shadow-xs"
      } ${className}`}
    >
      <div className="group/image relative flex aspect-3/4 w-full flex-col justify-between overflow-hidden rounded-t-2xl bg-slate-50">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback khi ảnh lỗi
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="my-auto flex w-full flex-col gap-3 px-4 pt-6 select-none">
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
          </div>
        )}

        {/* Badge góc trên bên trái */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
          {isHidden ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-slate-400" />
              Đã ẩn
            </span>
          ) : template.badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-text-main shadow-xs backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              {template.badge}
            </span>
          ) : null}
        </div>

        {/* Badge góc trên bên phải */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {topRightBadge ? (
            topRightBadge
          ) : template.version !== undefined ? (
            <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-text-muted shadow-xs backdrop-blur-xs">
              v{template.version}
            </span>
          ) : null}
        </div>

        {/* Overlay hover làm mờ ảnh và hiện các nút thao tác */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/50 p-4 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          {onUseTemplate && (
            <Button
              variant="primary"
              onClick={() => onUseTemplate(template)}
              className="w-full max-w-44 justify-center shadow-lg"
            >
              Dùng mẫu này
            </Button>
          )}
          {onPreview && (
            <Button
              variant="secondary"
              icon={Eye}
              onClick={() => onPreview(template)}
              className="w-full max-w-44 justify-center bg-white/90 text-slate-800 hover:bg-white"
            >
              Xem trước
            </Button>
          )}
          {onEdit && (
            <Button
              variant="primary"
              icon={Pencil}
              onClick={() => onEdit(template)}
              className="w-full max-w-44 justify-center rounded-xl! text-xs! font-semibold!"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Thông tin mẫu CV */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3
          title={template.name}
          className="line-clamp-1 text-sm font-semibold text-text-main sm:text-base"
        >
          {template.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">
          {template.description || "Mẫu CV chuẩn ATS tối ưu tỷ lệ trúng tuyển"}
        </p>
      </div>

      {/* Chân card: Custom footer cho Admin hoặc Cụm nút bấm cảm ứng trên mobile cho Candidate */}
      {footerExtra ? (
        <div className="border-t border-border bg-slate-50/50 p-3">
          {footerExtra}
        </div>
      ) : onUseTemplate || onPreview || onEdit ? (
        <div className="flex items-center gap-2 border-t border-border/60 bg-slate-50/50 p-3 md:hidden">
          {onPreview && (
            <Button
              variant="secondary"
              icon={Eye}
              onClick={() => onPreview(template)}
              className="flex-1 justify-center rounded-xl! py-2! text-xs! font-medium! bg-white shadow-2xs"
            >
              Xem trước
            </Button>
          )}
          {onUseTemplate && (
            <Button
              variant="primary"
              onClick={() => onUseTemplate(template)}
              className="flex-1 justify-center rounded-xl! py-2! text-xs! font-semibold!"
            >
              Dùng mẫu
            </Button>
          )}
          {onEdit && (
            <Button
              variant="primary"
              icon={Pencil}
              onClick={() => onEdit(template)}
              className="flex-1 justify-center rounded-xl! py-2! text-xs! font-semibold!"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CVTemplateCard;
