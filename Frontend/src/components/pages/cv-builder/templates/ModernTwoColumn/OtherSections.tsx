import React from "react";
import type {
  RichTextCVAwardItem,
  RichTextCVCertificationItem,
  RichTextCVItemSection,
  RichTextCVTextSection,
} from "@/types/cv";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";
import type {
  CvFieldRenderer,
  SectionItemEditorActions,
} from "../CvTemplateProps";

interface CertificationsSectionProps {
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
  if (!section.visible) return null;
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

interface AwardsSectionProps {
  section: RichTextCVItemSection<RichTextCVAwardItem>;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
  actions,
}) => {
  if (!section.visible) return null;
  const items = section.items || [];

  return (
    <section className="section-awards group relative mb-3">
      <SectionTitle
        placeholder="GIẢI THƯỞNG"
        fieldName="content.sections.awards.title"
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
            <div className="flex-1 font-medium text-slate-800">
              {renderField({
                name: `content.sections.awards.items.${index}.awardName`,
                document: item.awardName,
                placeholder: "Tên giải thưởng / thành tích",
                isReadOnly,
              })}
            </div>
            <div className="text-slate-500">
              {renderField({
                name: `content.sections.awards.items.${index}.date`,
                document: item.date,
                placeholder: "Thời gian",
                isReadOnly,
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="cv-text-meta py-1 text-center text-slate-400 italic">
            Chưa có giải thưởng.
          </p>
        )}
      </div>
    </section>
  );
};

interface TextSectionProps {
  section: RichTextCVTextSection;
  sectionKey: string;
  defaultTitle: string;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const TextSection: React.FC<TextSectionProps> = ({
  section,
  sectionKey,
  defaultTitle,
  primaryColor,
  isReadOnly = false,
  renderField,
}) => {
  if (!section.visible) return null;

  return (
    <section className={`section-${sectionKey} group relative mb-3`}>
      <SectionTitle
        placeholder={defaultTitle}
        fieldName={`content.sections.${sectionKey}.title`}
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="min-h-5 text-slate-700">
        {renderField({
          name: `content.sections.${sectionKey}.content`,
          document: section.content,
          placeholder: `Mô tả ${defaultTitle.toLowerCase()} của bạn...`,
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
};
