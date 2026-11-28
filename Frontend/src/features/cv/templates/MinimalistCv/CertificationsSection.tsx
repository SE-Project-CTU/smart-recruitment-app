import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import { ItemActions } from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type { MinimalistCvSectionProps } from "./types";

/**
 * CertificationsSection:
 * Năm đạt chứng chỉ in đậm ở trên, tên chứng chỉ ở dòng dưới theo mockup Minimalist CV.
 */
export const CertificationsSection: React.FC<
  MinimalistCvSectionProps<RichTextCVSections["certifications"]>
> = React.memo(({ section, isReadOnly = false, renderField, actions }) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-certifications">
      <SectionTitle
        placeholder="CHỨNG CHỈ"
        fieldName="content.sections.certifications.title"
        title={section.title}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative break-inside-avoid rounded-sm p-1 hover:bg-slate-50/70"
          >
            {!isReadOnly && actions && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === items.length - 1}
                canDelete={items.length > 1}
                onMoveUp={() => actions.onMoveUp(index)}
                onMoveDown={() => actions.onMoveDown(index)}
                onAddAfter={() => actions.onAddAfter(index)}
                onDelete={() => actions.onDelete(index)}
              />
            )}

            <div className="text-[12.5px] font-semibold text-slate-900">
              {renderField({
                name: `content.sections.certifications.items.${index}.issueDate`,
                document: item.issueDate,
                placeholder: "Năm",
                isReadOnly,
              })}
            </div>

            <div className="mt-0.5 text-[12px] text-slate-700">
              {renderField({
                name: `content.sections.certifications.items.${index}.name`,
                document: item.name,
                placeholder: "Tên chứng chỉ",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

CertificationsSection.displayName = "CertificationsSection";
