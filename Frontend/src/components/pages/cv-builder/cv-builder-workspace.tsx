import type { ComponentType, Ref } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import type { CvTemplateProps } from "@/components/pages/cv-builder/templates/CvTemplateProps";
import type { CvTemplateCode } from "@/types";

const TEMPLATE_REGISTRY: Record<
  CvTemplateCode,
  ComponentType<CvTemplateProps>
> = {
  modern_two_column: ModernTwoColumnTemplate,
};

interface CvBuilderWorkspaceProps {
  contentRef?: Ref<HTMLDivElement>;
  className?: string;
  isReadOnly?: boolean;
}

export default function CvBuilderWorkspace({
  contentRef,
  className = "",
  isReadOnly = false,
}: CvBuilderWorkspaceProps) {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const templateCode = useWatch({
    control,
    name: "content.metadata.templateCode",
  });
  const Template =
    TEMPLATE_REGISTRY[templateCode as CvTemplateCode] ??
    TEMPLATE_REGISTRY.modern_two_column;

  return (
    <main
      className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
    >
      <div ref={contentRef} className="print-container">
        <Template isReadOnly={isReadOnly} />
      </div>
    </main>
  );
}
