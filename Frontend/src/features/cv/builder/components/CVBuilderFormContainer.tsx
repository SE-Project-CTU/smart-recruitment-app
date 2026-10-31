import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  FileCheck,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { mediaService } from "@/services/mediaService";
import { captureCvPreviewFile } from "../../utils/captureCvPreview";

import {
  richTextCvEditorSchema,
  type RichTextCvEditorValues,
} from "../schema/richTextCvSchema";
import { buildRichTextCvInitialValues } from "../utils/richTextInitialValues";
import { extractTiptapPlainText } from "../utils/tiptapJson";
import CvBuilderWysiwygToolbar from "./CvBuilderWysiwygToolbar";
import CvBuilderWorkspace from "./CvBuilderWorkspace";
import { CvPreviewModal } from "./CvPreviewModal";
import { CvTitleInput } from "./CvTitleInput";
import { useUpdateCv } from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import type {
  RichTextCVDetail,
  RichTextCVContentDocument,
  CVLayoutDocument,
} from "@/types/cv";

interface CVBuilderFormContainerProps {
  initialData: RichTextCVDetail;
  cvId?: string;
}

export const CVBuilderFormContainer: React.FC<CVBuilderFormContainerProps> = ({
  initialData,
  cvId,
}) => {
  const [currentCvTitle, setCurrentCvTitle] = useState(initialData.title);
  const [prevInitialTitle, setPrevInitialTitle] = useState(initialData.title);
  if (prevInitialTitle !== initialData.title) {
    setPrevInitialTitle(initialData.title);
    setCurrentCvTitle(initialData.title);
  }

  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<RichTextCvEditorValues | null>(null);
  const cvPrintRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { mutateAsync: updateCv, isPending: isUpdatingCv } = useUpdateCv();

  useEffect(() => {
    console.log("[CVBuilder] isLocked state changed:", isLocked);
  }, [isLocked]);

  // Khởi tạo React Hook Form từ initialData nhận được
  const methods = useForm<RichTextCvEditorValues>({
    resolver: zodResolver(richTextCvEditorSchema),
    defaultValues: buildRichTextCvInitialValues(initialData),
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const handleTitleSaved = (newTitle: string) => {
    setCurrentCvTitle(newTitle);
    methods.setValue("title", newTitle, { shouldDirty: false, shouldValidate: true });
  };

  const isBusy = isUpdatingCv || isSaving || isSubmitting;
  const canSave = isDirty && !isBusy;

  const handleDownloadPdf = useReactToPrint({
    contentRef: cvPrintRef,
    documentTitle:
      currentCvTitle ||
      methods.getValues("title") ||
      `SmartHire_CV_${extractTiptapPlainText(methods.getValues("content.profile.fullName")) || "Candidate"}`,
  });

  const handleCompleteCv = () => {
    void handleSubmit(
      async (data) => {
        if (!cvId) return;

        setIsSaving(true);
        try {
          const printElement = cvPrintRef.current;
          if (!printElement) {
            throw new Error("Không tìm thấy khung hiển thị CV để tạo ảnh xem trước.");
          }

          // 1. Chụp ảnh CV thành File PNG
          let previewImageFile: File;
          try {
            previewImageFile = await captureCvPreviewFile(printElement, cvId);
          } catch (captureErr) {
            console.error("[CVBuilder] Lỗi chụp ảnh CV:", captureErr);
            throw new Error("Không thể tạo ảnh xem trước của CV. Vui lòng thử lại!", {
              cause: captureErr,
            });
          }

          // 2. Tải ảnh lên qua Media API
          let uploadedFileId: string;
          try {
            const uploadRes = await mediaService.uploadImage(previewImageFile);
            if (!uploadRes?.data?.id) {
              throw new Error("Tải lên ảnh xem trước thất bại.");
            }
            uploadedFileId = uploadRes.data.id;
          } catch (uploadErr) {
            console.error("[CVBuilder] Lỗi upload ảnh CV:", uploadErr);
            throw new Error(
              "Tải lên ảnh xem trước thất bại. Vui lòng kiểm tra kết nối mạng và thử lại!",
              { cause: uploadErr },
            );
          }

          // 3. Cập nhật CV với previewFileId
          await updateCv({
            id: cvId,
            payload: {
              title: currentCvTitle.trim() || data.title?.trim() || initialData.title,
              content: data.content as unknown as RichTextCVContentDocument,
              layout: data.layout as unknown as CVLayoutDocument,
              language: data.language,
              isPublic: data.isPublic,
              previewFileId: uploadedFileId,
            },
          });

          // 4. Đồng bộ lại form để isDirty trở về false
          reset(data);

          // 5. Điều hướng tới trang lưu thành công
          navigate(`${PATHS.CANDIDATE.SAVE_CV_SUCCESS}?id=${cvId}`);
        } catch (err: unknown) {
          console.error("[CVBuilder] Lỗi quá trình lưu CV:", err);
          const message =
            err instanceof Error
              ? err.message
              : "Lưu CV thất bại. Vui lòng thử lại sau!";
          toast.add({
            type: "error",
            description: message,
          });
        } finally {
          setIsSaving(false);
        }
      },
      (fieldErrors) => {
        console.warn("[CVBuilder] Form validation errors:", fieldErrors);
        toast.add({
          type: "error",
          description: "Vui lòng kiểm tra lại các trường thông tin bắt buộc trước khi lưu.",
        });
      },
    )();
  };

  const handleOpenPreview = () => {
    setPreviewData(methods.getValues());
    setIsPreviewOpen(true);
  };

  const handleEditAgain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[CVBuilder] Edit again clicked -> unlocking CV");
    setIsLocked(false);
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-col">
        {/* ================= 1. TOP NAVBAR ================= */}
        <header className="no-print sticky top-0 z-100 flex items-center justify-between border-b border-border bg-surface px-6 py-3 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-bg hover:text-text-main"
              title="Quay lại danh sách CV"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-col">
              <CvTitleInput
                cvId={cvId}
                initialTitle={currentCvTitle}
                isLocked={isLocked}
                onTitleSaved={handleTitleSaved}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isLocked ? (
              <>
                <button
                  key="btn-preview-cv"
                  type="button"
                  onClick={handleOpenPreview}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-main shadow-xs transition-all hover:border-primary/40 hover:bg-bg md:text-sm"
                  title="Xem trước định dạng in A4"
                >
                  <Eye className="h-4 w-4 text-primary" />
                  Xem trước
                </button>

                <button
                  key="btn-complete-cv"
                  type="button"
                  onClick={handleCompleteCv}
                  disabled={!canSave}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium text-surface shadow-md transition-all md:text-sm",
                    canSave
                      ? "cursor-pointer bg-primary hover:bg-primary-dark"
                      : "cursor-not-allowed bg-primary/50 opacity-60 shadow-none",
                  )}
                  title={!isDirty ? "Chưa có thay đổi nào để lưu" : "Lưu thay đổi và cập nhật ảnh xem trước"}
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  )}
                  {isBusy ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <>
                <button
                  key="btn-edit-again"
                  type="button"
                  onClick={handleEditAgain}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main transition-all hover:bg-bg"
                >
                  <Edit3 className="h-4 w-4 text-text-muted" />
                  Chỉnh sửa lại
                </button>

                <button
                  key="btn-download-pdf"
                  type="button"
                  onClick={() => handleDownloadPdf()}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-status-success px-6 py-2.5 text-sm font-semibold text-surface shadow-md transition-all hover:bg-green-600"
                >
                  <Download className="h-4 w-4" />
                  Xuất PDF (A4)
                </button>
              </>
            )}
          </div>
        </header>

        <form
          id="cv-builder-form"
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-1 flex-col"
        >
          {/* ================= 2. WYSIWYG TOOLBAR ================= */}
          <CvBuilderWysiwygToolbar isCompleted={isLocked} />

          {/* Banner thông báo khóa CV */}
          {isLocked && (
            <div className="no-print flex items-center justify-center gap-2 border-b border-secondary-dark bg-secondary-light px-6 py-2.5 text-sm font-medium text-primary-dark">
              <FileCheck className="h-4 w-4 text-primary" />
              <span>
                Hồ sơ CV đã được kiểm tra tính hợp lệ và khóa chỉnh sửa! Bạn có thể xuất PDF ngay.
              </span>
            </div>
          )}

          {/* Banner hiển thị lỗi validation nếu có */}
          {Object.keys(errors).length > 0 && !isLocked && (
            <div className="no-print mx-auto mt-4 flex w-full max-w-[210mm] items-center gap-3 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div>
                <span className="font-semibold">Vui lòng kiểm tra lại: </span>
                {errors.title?.message ||
                  errors.content?.profile?.fullName?.message ||
                  errors.content?.profile?.email?.message ||
                  errors.content?.profile?.phone?.message ||
                  "Một số trường thông tin bắt buộc chưa hợp lệ hoặc đang để trống."}
              </div>
            </div>
          )}

          {/* ================= 3. TRANG GIẤY A4 WYSIWYG WORKSPACE ================= */}
          <CvBuilderWorkspace contentRef={cvPrintRef} isReadOnly={isLocked} />
        </form>

        {/* ================= 4. MODAL XEM TRƯỚC CV ================= */}
        {isPreviewOpen && previewData && (
          <CvPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            data={previewData}
            title={previewData.title}
          />
        )}
      </div>
    </FormProvider>
  );
};
