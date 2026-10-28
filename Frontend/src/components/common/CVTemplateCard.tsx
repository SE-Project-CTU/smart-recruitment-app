import { Eye } from "lucide-react";
import Button from "./Button";

export interface CVTemplateItemData {
  id: string;
  code?: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string;
  badge?: string;
}

interface CVTemplateCardProps {
  template: CVTemplateItemData;
  onUseTemplate: (template: CVTemplateItemData) => void;
  onPreview?: (template: CVTemplateItemData) => void;
}

export function CVTemplateCard({
  template,
  onUseTemplate,
  onPreview,
}: CVTemplateCardProps) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:border-secondary hover:shadow-md">
      <div className="group/image relative flex aspect-3/4 w-full flex-col justify-between overflow-hidden rounded-t-2xl bg-slate-50">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
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
        {template.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              {template.badge}
            </span>
          </div>
        )}

        {/* Overlay hover làm mờ ảnh và hiện nút Dùng mẫu */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/50 p-4 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="primary"
            onClick={() => onUseTemplate(template)}
            className="w-full max-w-44 justify-center shadow-lg"
          >
            Dùng mẫu này
          </Button>
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
        </div>
      </div>

      {/* Thông tin mẫu CV */}
      <div className="flex flex-col gap-1 p-4">
        <h3
          title={template.name}
          className="line-clamp-1 text-base font-bold text-slate-800"
        >
          {template.name}
        </h3>
        <p className="line-clamp-1 text-xs text-text-muted">
          {template.description || "Mẫu CV chuẩn ATS tối ưu tỷ lệ trúng tuyển"}
        </p>
      </div>

      {/* Chân card cho mobile & desktop */}
      <div className="p-4 pt-0">
        <Button
          variant="secondary"
          onClick={() => onUseTemplate(template)}
          className="hidden! w-full justify-center rounded-lg! py-2! text-xs font-semibold! text-primary! hover:bg-primary/10 hover:text-primary md:hidden! md:text-sm!"
        >
          Dùng mẫu này
        </Button>
      </div>
    </div>
  );
}

export default CVTemplateCard;
