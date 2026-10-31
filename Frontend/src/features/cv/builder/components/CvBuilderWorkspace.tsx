import { useMemo, type Ref } from "react";
import { useFormContext, useWatch, type FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { TiptapField } from "./TiptapField";
import { useCvMutations } from "../hooks/useCvMutations";
import { useCvSectionEditors } from "../hooks/useSectionEditors";
import type { CvFieldRenderer } from "../../templates/types";
import type { CvTemplateCode } from "@/types/cv";
import { TEMPLATE_REGISTRY } from "../../templates/registry";

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
  const formData = useWatch({ control }) as RichTextCvEditorValues;

  const { reorderSections, toggleSectionVisibility } = useCvMutations();
  const sectionEditors = useCvSectionEditors();

  const builderFieldRenderer: CvFieldRenderer = useMemo(() => {
    return ({
      name,
      placeholder,
      multiline,
      className: fieldClassName,
      isReadOnly: fieldReadOnly,
    }) => (
      <TiptapField
        name={name as FieldPath<RichTextCvEditorValues>}
        placeholder={placeholder}
        multiline={multiline}
        className={fieldClassName}
        isReadOnly={fieldReadOnly}
      />
    );
  }, []);

  const templateCode =
    (formData?.content?.metadata?.templateCode as CvTemplateCode) ||
    "modern_two_column";
  const Template =
    TEMPLATE_REGISTRY[templateCode] ??
    TEMPLATE_REGISTRY.modern_two_column;

  return (
    <main
      className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
    >
      <div ref={contentRef} className="print-container">
        <Template
          data={formData}
          renderField={builderFieldRenderer}
          isReadOnly={isReadOnly}
          sectionEditors={!isReadOnly ? sectionEditors : undefined}
          onReorderSections={!isReadOnly ? reorderSections : undefined}
          onToggleSectionVisibility={
            !isReadOnly ? toggleSectionVisibility : undefined
          }
        />
      </div>
    </main>
  );
}
