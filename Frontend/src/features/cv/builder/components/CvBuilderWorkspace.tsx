import { useMemo, type Ref } from "react";
import { useFormContext, useWatch, type FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { TiptapField } from "./TiptapField";
import { useCvMutations } from "../hooks/useCvMutations";
import { useCvSectionEditors } from "../hooks/useSectionEditors";
import type { CvFieldRenderer } from "../../templates/types";
import type { CvTemplateCode, RichTextCVContentDocument } from "@/types/cv";
import { TEMPLATE_REGISTRY, validateCvLayout } from "../../templates/registry";
import { ensureValidLayout } from "../utils/richTextInitialValues";

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

  const {
    reorderAreaSections,
    reorderSections,
    toggleSectionVisibility,
    moveSectionToArea,
    moveSectionBetweenAreas,
  } = useCvMutations();
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
    "senior_harvard";
  const Template =
    TEMPLATE_REGISTRY[templateCode] ?? TEMPLATE_REGISTRY.senior_harvard;

  const layoutValidation = useMemo(() => {
    return validateCvLayout(formData?.layout, templateCode);
  }, [formData?.layout, templateCode]);

  const normalizedLayout = useMemo(() => {
    return ensureValidLayout(formData?.layout, templateCode);
  }, [formData?.layout, templateCode]);

  return (
    <main
      className={`flex flex-1 justify-center overflow-x-auto bg-slate-100 px-4 py-8 ${className}`}
    >
      <div ref={contentRef} className="print-container">
        {!layoutValidation.isValid ? (
          <div className="mx-auto min-h-[200px] w-[210mm] rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/80 p-8 text-rose-900 shadow-md">
            <h3 className="text-lg font-bold text-rose-700">
              Lỗi cấu trúc Layout CV không hợp lệ
            </h3>
            <p className="mt-1 text-sm text-rose-600">
              Dữ liệu layout hiện tại không tương thích với template &ldquo;{templateCode}&rdquo;:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-medium text-rose-800">
              {layoutValidation.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          formData?.content && (
            <Template
              content={formData.content as unknown as RichTextCVContentDocument}
              layout={normalizedLayout}
              renderField={builderFieldRenderer}
              isReadOnly={isReadOnly}
              sectionEditors={!isReadOnly ? sectionEditors : undefined}
              onReorderAreaSections={
                !isReadOnly ? reorderAreaSections : undefined
              }
              onMoveSectionToArea={!isReadOnly ? moveSectionToArea : undefined}
              onMoveSectionBetweenAreas={
                !isReadOnly ? moveSectionBetweenAreas : undefined
              }
              onReorderSections={!isReadOnly ? reorderSections : undefined}
              onToggleSectionVisibility={
                !isReadOnly ? toggleSectionVisibility : undefined
              }
            />
          )
        )}
      </div>
    </main>
  );
}
