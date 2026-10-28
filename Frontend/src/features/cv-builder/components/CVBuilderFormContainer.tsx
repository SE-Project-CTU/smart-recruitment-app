import React, { useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactToPrint } from "react-to-print";
import {
  CheckCircle2,
  Download,
  Edit3,
  FileCheck,
  AlertCircle,
} from "lucide-react";

import { MOCK_CV_DETAIL_TIPTAP } from "@/constants/mockCvData";
import { richTextCvEditorSchema, type RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { buildRichTextCvInitialValues } from "@/features/cv-builder/utils/richTextInitialValues";
import { extractTiptapPlainText } from "@/features/cv-builder/utils/tiptapJson";
import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import CvBuilderWysiwygToolbar from "@/components/pages/cv-builder/cv-builder-wysiwyg-toolbar";

export const CVBuilderFormContainer: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const cvPrintRef = useRef<HTMLDivElement>(null);

  // Khởi tạo React Hook Form với zodResolver
  const methods = useForm<RichTextCvEditorValues>({
    resolver: zodResolver(richTextCvEditorSchema),
    defaultValues: buildRichTextCvInitialValues(MOCK_CV_DETAIL_TIPTAP),
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleDownloadPdf = useReactToPrint({
    contentRef: cvPrintRef,
    documentTitle: `SmartHire_CV_${extractTiptapPlainText(methods.getValues("content.profile.fullName")) || "Candidate"}`,
  });

  const onValidSubmit = (data: RichTextCvEditorValues) => {
    console.log("CV Data is valid:", data);
    setIsLocked(true);
  };

  const onInvalidSubmit = (fieldErrors: typeof errors) => {
    console.warn("Validation errors:", fieldErrors);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)} className="flex flex-col min-h-screen">
        {/* ================= 1. TOP NAVBAR ================= */}
        <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-6 py-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-secondary shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">SmartHire</span>
                <span className="rounded-full bg-secondary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                  WYSIWYG CV Studio
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {isLocked
                  ? "Chế độ Xem trước bản in (Đã khóa chỉnh sửa)"
                  : "Chỉnh sửa trực tiếp trên trang giấy A4 (WYSIWYG) - Kéo thả để đổi vị trí các mục"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isLocked ? (
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-md transition-all hover:bg-primary-dark"
              >
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Kiểm tra & Hoàn tất CV
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsLocked(false)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main transition-all hover:bg-bg"
                >
                  <Edit3 className="h-4 w-4 text-text-muted" />
                  Chỉnh sửa lại
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf()}
                  className="flex animate-pulse cursor-pointer items-center gap-2 rounded-full bg-status-success px-6 py-2.5 text-sm font-semibold text-surface shadow-md transition-all hover:animate-none hover:bg-green-600"
                >
                  <Download className="h-4 w-4" />
                  Xuất PDF (A4)
                </button>
              </>
            )}
          </div>
        </header>

        {/* ================= 2. WYSIWYG TOOLBAR: FONT, MÀU, CỠ CHỮ, DÃN DÒNG ================= */}
        <CvBuilderWysiwygToolbar isCompleted={isLocked} />

        {/* Banner thông báo khóa CV */}
        {isLocked && (
          <div className="no-print flex items-center justify-center gap-2 border-b border-secondary-dark bg-secondary-light px-6 py-2.5 text-sm font-medium text-primary-dark">
            <FileCheck className="h-4 w-4 text-primary" />
            <span>
              Hồ sơ CV đã được kiểm tra tính hợp lệ qua Zod và khóa chỉnh sửa! Bạn có thể xuất PDF ngay.
            </span>
          </div>
        )}

        {/* Banner hiển thị lỗi validation nếu có */}
        {Object.keys(errors).length > 0 && !isLocked && (
          <div className="no-print mx-auto mt-4 w-full max-w-[210mm] flex items-center gap-3 rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
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
        <main className="flex flex-1 justify-center overflow-x-auto px-4 py-8 bg-slate-100">
          <div ref={cvPrintRef} className="print-container">
            <ModernTwoColumnTemplate isReadOnly={isLocked} />
          </div>
        </main>
      </form>
    </FormProvider>
  );
};
