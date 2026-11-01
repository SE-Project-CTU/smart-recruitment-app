import type { Ref } from "react";
import type {
  CvTemplateCode,
  RichTextCVContentDocument,
  CVLayoutDocument,
} from "@/types/cv";
import { TEMPLATE_REGISTRY, validateCvLayout } from "./registry";

export interface CvPreviewWorkspaceProps {
  content: RichTextCVContentDocument;
  layout: CVLayoutDocument;
  contentRef?: Ref<HTMLDivElement>;
  className?: string;
}

/**
 * CvPreviewWorkspace:
 * Hiển thị CV ở chế độ chỉ đọc (Read-only) cho ứng viên xem trước, nhà tuyển dụng,
 * hoặc màn hình in ấn mà KHÔNG CẦN FormProvider hay React Hook Form.
 * Nhận content và layout tường minh rồi truyền vào Template.
 */
export function CvPreviewWorkspace({
  content,
  layout,
  contentRef,
  className = "",
}: CvPreviewWorkspaceProps) {
  const templateCode =
    (content?.metadata?.templateCode as CvTemplateCode) || "senior_harvard";

  const Template =
    TEMPLATE_REGISTRY[templateCode] ?? TEMPLATE_REGISTRY.senior_harvard;

  // Validate layout theo template
  const layoutValidation = validateCvLayout(layout, templateCode);
  if (!layoutValidation.isValid) {
    return (
      <main
        className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
      >
        <div ref={contentRef} className="print-container">
          <div className="mx-auto min-h-[200px] w-[210mm] rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/80 p-8 text-rose-900 shadow-md">
            <h3 className="text-lg font-bold text-rose-700">
              Lỗi cấu trúc Layout CV không hợp lệ
            </h3>
            <p className="mt-1 text-sm text-rose-600">
              Dữ liệu layout không tương thích với mẫu hiển thị &ldquo;
              {templateCode}&rdquo;:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-medium text-rose-800">
              {layoutValidation.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
    >
      <div ref={contentRef} className="print-container">
        <Template content={content} layout={layout} isReadOnly={true} />
      </div>
    </main>
  );
}

export default CvPreviewWorkspace;
