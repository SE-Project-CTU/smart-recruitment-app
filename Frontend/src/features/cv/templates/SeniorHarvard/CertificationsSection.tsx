import React from "react";
import type {
  RichTextCVCertificationItem,
  RichTextCVItemSection,
} from "@/types/cv";
import ItemActions from "../../builder/components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../types";

export interface CertificationsSectionProps {
  section: RichTextCVItemSection<RichTextCVCertificationItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (section.visible === false) return null;
  const items = section.items || [];

  return (
    <section className="section-certifications group relative mb-3">
      <SectionTitle
        placeholder="CHỨNG CHỈ"
        fieldName="content.sections.certifications.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="group/item relative flex items-center justify-between gap-2 rounded-sm p-1 hover:bg-slate-50/60"
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
            <div className="font-medium text-slate-800">
              {renderField({
                name: `content.sections.certifications.items.${index}.name`,
                document: item.name,
                placeholder: "Tên chứng chỉ",
                isReadOnly,
              })}
            </div>
            <div className="text-slate-500">
              {renderField({
                name: `content.sections.certifications.items.${index}.issueDate`,
                document: item.issueDate,
                placeholder: "Thời gian",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có chứng chỉ.
          </p>
        )}
      </div>
    </section>
  );
};
