import type { Ref } from "react";
import type { CvRenderData } from "./types";
import type { CvTemplateCode, RichTextCVContentDocument } from "@/types/cv";
import { TEMPLATE_REGISTRY } from "./registry";

export interface CvPreviewWorkspaceProps {
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
    (content?.metadata?.templateCode as CvTemplateCode) ||
    ("code" in data && typeof data.code === "string"
      ? (data.code as CvTemplateCode)
      : undefined) ||
    "modern_two_column";
  const Template =
    TEMPLATE_REGISTRY[templateCode] ??
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
