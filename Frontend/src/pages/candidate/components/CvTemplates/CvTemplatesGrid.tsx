import React from "react";
import { LayoutTemplate } from "lucide-react";
import { Button, CVTemplateCard } from "@/components/common";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";

interface CvTemplatesGridProps {
  templates: CVTemplateItemData[];
  isLoading: boolean;
  searchKeyword?: string;
  onClearSearch?: () => void;
  onUseTemplate: (template: CVTemplateItemData) => void;
  onPreview: (template: CVTemplateItemData) => void;
}

export const CvTemplatesGrid: React.FC<CvTemplatesGridProps> = ({
  templates,
  isLoading,
  searchKeyword,
  onClearSearch,
  onUseTemplate,
  onPreview,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="aspect-3/4 animate-pulse rounded-2xl border border-border bg-surface/50"
          />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface p-8 text-center">
        <LayoutTemplate className="size-10 text-text-muted/60" />
        <h3 className="mt-3 text-sm font-semibold text-text-main">
          {searchKeyword
            ? `Không tìm thấy mẫu CV phù hợp với "${searchKeyword}"`
            : "Hiện chưa có mẫu CV nào khả dụng"}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {searchKeyword
            ? "Vui lòng thử tìm kiếm với từ khóa khác."
            : "Hệ thống đang cập nhật thêm các mẫu CV mới."}
        </p>
        {searchKeyword && onClearSearch && (
          <Button
            variant="secondary"
            onClick={onClearSearch}
            className="mt-4 rounded-xl! px-4! py-2! text-xs!"
          >
            Xóa tìm kiếm
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((tpl) => (
        <CVTemplateCard
          key={tpl.id}
          template={tpl}
          onUseTemplate={onUseTemplate}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};
