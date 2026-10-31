import type { ComponentType, Ref } from "react";
import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import type {
  CvTemplateProps,
  CvRenderData,
} from "@/components/pages/cv-builder/templates/CvTemplateProps";
import type { CvTemplateCode, RichTextCVContentDocument } from "@/types/cv";

const TEMPLATE_REGISTRY: Record<
  CvTemplateCode,
  ComponentType<CvTemplateProps>
> = {
  modern_two_column: ModernTwoColumnTemplate,
};

interface CvPreviewWorkspaceProps {
  data: CvRenderData;
  contentRef?: Ref<HTMLDivElement>;
  className?: string;
}

/**
 * CvPreviewWorkspace:
 * Hiển thị CV ở chế độ chỉ đọc (Read-only) cho ứng viên xem trước, nhà tuyển dụng,
 * hoặc màn hình in ấn mà KHÔNG CẦN FormProvider hay React Hook Form.
 */
export function CvPreviewWorkspace({
  data,
  contentRef,
  className = "",
}: CvPreviewWorkspaceProps) {
  const content: RichTextCVContentDocument =
    "content" in data && data.content && typeof data.content === "object"
      ? (data.content as RichTextCVContentDocument)
      : "defaultContent" in data &&
          data.defaultContent &&
          typeof data.defaultContent === "object"
        ? (data.defaultContent as RichTextCVContentDocument)
        : (data as RichTextCVContentDocument);

  const templateCode =
    content?.metadata?.templateCode ||
    ("code" in data && typeof data.code === "string" ? data.code : undefined) ||
    "modern_two_column";
  const Template =
    TEMPLATE_REGISTRY[templateCode as CvTemplateCode] ??
    TEMPLATE_REGISTRY.modern_two_column;

  return (
    <main
      className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
    >
      <div ref={contentRef} className="print-container">
        <Template data={data} isReadOnly={true} />
      </div>
    </main>
  );
}

export default CvPreviewWorkspace;
