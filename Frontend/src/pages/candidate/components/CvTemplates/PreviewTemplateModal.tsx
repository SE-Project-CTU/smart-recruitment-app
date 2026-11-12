import React, { useMemo, useRef } from "react";
import { Eye, AlertCircle, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCvTemplateDetail } from "@/hooks/queries/useCv";
import { CvPreviewWorkspace, normalizeCvContentFontSizes } from "@/features/cv";
import { useCvZoom } from "@/features/cv/builder/hooks/useCvZoom";
import { CvZoomControls } from "@/features/cv/builder/components/CvZoomControls";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";

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

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const { zoom, zoomIn, zoomOut, resetZoom, setZoom, canZoomIn, canZoomOut } =
    useCvZoom({ containerRef: previewScrollRef });

  const {
    data: templateDetail,
    isLoading,
    isError,
    refetch,
  } = useCvTemplateDetail(templateId);

  // Chuẩn hóa dữ liệu content từ defaultContent của template
  const templateContent = useMemo(() => {
    if (!templateDetail?.defaultContent) return null;
    const content = normalizeCvContentFontSizes(
      structuredClone(templateDetail.defaultContent),
    );
    return content;
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
        className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-2xl sm:w-full sm:max-w-4xl"
        showCloseButton={true}
      >
        {/* 1. Header Dialog */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-3.5 pr-12 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-9">
              <LayoutTemplate className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-sm font-bold text-text-main sm:text-base">
                {templateTitle}
              </DialogTitle>
              <DialogDescription className="truncate text-[11px] text-text-muted sm:text-xs">
                Xem trước bản in A4 của mẫu CV
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 2. Nội dung xem trước giữa màn hình */}
        <div
          ref={previewScrollRef}
          className="relative flex flex-1 justify-center overflow-auto bg-slate-100 p-2 sm:p-4 md:p-6"
        >
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
                Đã xảy ra lỗi trong quá trình lấy thông tin chi tiết mẫu giao
                diện.
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

          {!isLoading &&
            !isError &&
            templateContent &&
            templateDetail?.defaultLayout && (
              <div className="h-max">
                <div
                  className="bg-transparent"
                  style={{
                    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                    transformOrigin: "top center",
                    marginBottom:
                      zoom > 1
                        ? `calc((297mm + 4rem) * ${zoom - 1} + 2rem)`
                        : "2rem",
                  }}
                >
                  <CvPreviewWorkspace
                    content={templateContent}
                    layout={templateDetail.defaultLayout}
                    className="bg-transparent! p-0!"
                  />
                </div>
              </div>
            )}

          {!isLoading &&
            !isError &&
            (!templateContent || !templateDetail?.defaultLayout) && (
              <div className="my-auto flex flex-col items-center justify-center text-center text-sm text-text-muted">
                <Eye className="size-8 text-text-muted/60" />
                <p className="mt-2">
                  Không tìm thấy nội dung mẫu giao diện này.
                </p>
              </div>
            )}

          {!isLoading && !isError && templateContent && (
            <CvZoomControls
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
              onZoomChange={setZoom}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
              className="fixed! right-4! bottom-4! sm:right-6! sm:bottom-6!"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
