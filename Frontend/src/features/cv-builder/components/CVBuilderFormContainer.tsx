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
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  richTextCvEditorSchema,
  type RichTextCvEditorValues,
} from "@/features/cv-builder/schema/richTextCvSchema";
import { buildRichTextCvInitialValues } from "@/features/cv-builder/utils/richTextInitialValues";
import { extractTiptapPlainText } from "@/features/cv-builder/utils/tiptapJson";
import CvBuilderWysiwygToolbar from "@/components/pages/cv-builder/CvBuilderWysiwygToolbar";
import CvBuilderWorkspace from "@/components/pages/cv-builder/CvBuilderWorkspace";
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
  const [isLocked, setIsLocked] = useState(false);
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
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleDownloadPdf = useReactToPrint({
    contentRef: cvPrintRef,
    documentTitle:
      methods.getValues("title") ||
      `SmartHire_CV_${extractTiptapPlainText(methods.getValues("content.profile.fullName")) || "Candidate"}`,
  });

  // Lưu bản nháp lên server mà không khóa chế độ chỉnh sửa
  const handleSaveDraft = async () => {
    if (!cvId) return;
    const values = methods.getValues();
    try {
      await updateCv({
        id: cvId,
        payload: {
          title: values.title?.trim() || initialData.title,
          content: values.content as unknown as RichTextCVContentDocument,
          layout: values.layout as unknown as CVLayoutDocument,
          language: values.language,
          isPublic: values.isPublic,
        },
      });
    } catch {
      // Lỗi đã được toast trong hook useUpdateCv
    }
  };

  // Xác nhận hoàn tất: vừa validate qua Zod, vừa lưu data lên server, vừa chuyển sang preview
  const handleCompleteCv = handleSubmit(
    async (data) => {
      if (cvId) {
        try {
          await updateCv({
            id: cvId,
            payload: {
              title: data.title?.trim() || initialData.title,
              content: data.content as unknown as RichTextCVContentDocument,
              layout: data.layout as unknown as CVLayoutDocument,
              language: data.language,
              isPublic: data.isPublic,
            },
          });
        } catch {
          return;
        }
      }
      setIsLocked(true);
    },
    (fieldErrors) => {
      console.warn("[CVBuilder] Form validation errors:", fieldErrors);
    },
  );

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
              <div className="group flex items-center gap-1.5">
                <input
                  {...register("title")}
                  disabled={isLocked}
                  title="Nhấp để đổi tên CV"
                  placeholder="Nhập tiêu đề CV..."
                  className={cn(
                    "h-8 w-max min-w-[300px] md:min-w-[440px] rounded-md px-2 text-base font-semibold text-text-main transition-all",
                    "border border-transparent hover:border-border hover:bg-bg",
                    "focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary focus:outline-none",
                    errors.title &&
                      "border-status-error focus:border-status-error focus:ring-status-error",
                    isLocked &&
                      "cursor-default bg-transparent hover:border-transparent hover:bg-transparent",
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                />
                {!isLocked && (
                  <Edit3 className="pointer-events-none h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isLocked ? (
              <>
                {cvId && (
                  <button
                    key="btn-save-draft"
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isUpdatingCv}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-main transition-all hover:bg-bg disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5 text-primary" />
                    {isUpdatingCv ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                )}

                <button
                  key="btn-complete-cv"
                  type="button"
                  onClick={handleCompleteCv}
                  disabled={isUpdatingCv}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-surface shadow-md transition-all hover:bg-primary-dark disabled:opacity-50 md:text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  {isUpdatingCv ? "Đang xử lý..." : "Kiểm tra & Hoàn tất CV"}
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
      </div>
    </FormProvider>
  );
};
