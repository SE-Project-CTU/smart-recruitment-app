import React, { useMemo } from "react";
import { Eye, AlertCircle, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCvTemplateDetail } from "@/hooks/queries/useCv";
import { CvPreviewWorkspace } from "@/components/pages/cv-builder/CvPreviewWorkspace";
import { normalizeCvContentFontSizes } from "@/features/cv-builder/utils/tiptapJson";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";
import type { CvRenderData } from "@/components/pages/cv-builder/templates/CvTemplateProps";

export interface PreviewTemplateModalProps {
  template?: CVTemplateItemData | null;
  previewItem?: {
    id?: string;
    title?: string;
    imageUrl?: string;
  } | null;
  onClose: () => void;
  onUseTemplate?: (template: CVTemplateItemData) => void;
}

export const PreviewTemplateModal: React.FC<PreviewTemplateModalProps> = ({
  template,
  previewItem,
  onClose,
  onUseTemplate,
}) => {
  const activeTemplate = useMemo(() => {
    if (template) return template;
    if (previewItem?.id) {
      return {
        id: previewItem.id,
        name: previewItem.title || "Mẫu CV",
        thumbnailUrl: previewItem.imageUrl,
      } as CVTemplateItemData;
    }
    return null;
  }, [template, previewItem]);

  const isOpen = Boolean(activeTemplate || previewItem);
  const templateId = activeTemplate?.id;
  const templateTitle = activeTemplate?.name || previewItem?.title || "Mẫu CV";

  const {
    data: templateDetail,
    isLoading,
    isError,
    refetch,
  } = useCvTemplateDetail(templateId);

  // Chuẩn hóa dữ liệu render từ defaultContent của template
  const renderData: CvRenderData | null = useMemo(() => {
    if (!templateDetail) return null;

    const content = templateDetail.defaultContent;
    if (content) {
      normalizeCvContentFontSizes(content);
    }

    return {
      content,
      layout: templateDetail.defaultLayout,
    };
  }, [templateDetail]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-2xl sm:max-w-4xl"
        showCloseButton={true}
      >
        {/* 1. Header Dialog */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutTemplate className="size-5" />
            </div>
            <div>
              <DialogTitle className="line-clamp-1 text-base font-bold text-text-main">
                {templateTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Xem trước bản in A4 của mẫu CV
              </DialogDescription>
            </div>
          </div>

          {onUseTemplate && activeTemplate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onUseTemplate(activeTemplate);
              }}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-surface shadow-xs transition-colors hover:bg-primary-dark"
            >
              Dùng mẫu này
            </button>
          )}
        </DialogHeader>

        {/* 2. Nội dung xem trước giữa màn hình */}
        <div className="flex flex-1 justify-center overflow-y-auto bg-slate-100 p-4 md:p-6">
          {isLoading && (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
              <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-text-muted">
                Đang tải chi tiết mẫu CV...
              </p>
            </div>
          )}

          {isError && (
            <div className="my-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-status-error/10 text-status-error">
                <AlertCircle className="size-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-text-main">
                Không thể tải mẫu CV
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                Đã xảy ra lỗi trong quá trình lấy thông tin chi tiết mẫu giao diện.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-surface transition-colors hover:bg-primary-dark"
                >
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text-main transition-colors hover:bg-bg"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && renderData && (
            <div className="h-max">
              <CvPreviewWorkspace data={renderData} className="bg-transparent! p-0!" />
            </div>
          )}

          {!isLoading && !isError && !renderData && (
            <div className="my-auto flex flex-col items-center justify-center text-center text-sm text-text-muted">
              <Eye className="size-8 text-text-muted/60" />
              <p className="mt-2">Không tìm thấy nội dung mẫu giao diện này.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
