import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type {
  CVItemSection,
  CVCertificationItem,
  CVAwardItem,
  CVTextSection,
  CVFieldStyle,
} from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import ItemActions from "../../components/item-actions";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import { useCvMutations } from "@/features/cv-builder/hooks/useCvMutations";

// 1. Certifications
interface CertificationsSectionProps {
  section: CVItemSection<CVCertificationItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  section,
  fields,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<CvEditorValues>();
  const {
    fields: formItems,
    insert,
    move,
    remove,
  } = useFieldArray({
    control,
    name: "content.sections.certifications.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `cert_${Date.now()}`,
      name: "Tên chứng chỉ mới",
      issueDate: "2025",
    });
  };

  return (
    <div className="section-certifications mb-3 group relative">
      <SectionTitle
        title={section.title || "CHỨNG CHỈ"}
        fieldKey="sections.certifications.title"
        formFieldName="content.sections.certifications.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />

      <div className="space-y-1.5 text-xs">
        {formItems.map((item, index) => (
          <div key={item._fieldKey} className="group/item relative flex items-center justify-between rounded-sm p-1 transition-all hover:bg-slate-50/60">
            {/* Item Actions bên phải */}
            {!isReadOnly && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === formItems.length - 1}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onAddAfter={() => handleAddAfter(index)}
                onDelete={() => {
                  cleanupItemStyles(item.id);
                  remove(index);
                }}
              />
            )}

            <span
              className="font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.name`, {
                fontWeight: "500",
              })}
            >
              <EditableField
                name={`content.sections.certifications.items.${index}.name`}
                placeholder="Tên chứng chỉ"
                isReadOnly={isReadOnly}
              />
            </span>

            <div className="flex items-center gap-1 text-slate-500">
              <EditableField
                name={`content.sections.certifications.items.${index}.issueDate`}
                placeholder="Thời gian"
                isReadOnly={isReadOnly}
                style={getFieldStyle(fields, `${item.id}.issueDate`, {
                  color: "#64748B",
                })}
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có chứng chỉ.
          </p>
        )}
      </div>
    </div>
  );
};

// 2. Awards
interface AwardsSectionProps {
  section: CVItemSection<CVAwardItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  section,
  fields,
  primaryColor,
  isReadOnly = false,
}) => {
  const { control } = useFormContext<CvEditorValues>();
  const {
    fields: formItems,
    insert,
    move,
    remove,
  } = useFieldArray({
    control,
    name: "content.sections.awards.items",
    keyName: "_fieldKey",
  });

  const { cleanupItemStyles } = useCvMutations();

  if (!section.visible) return null;

  const handleAddAfter = (index: number) => {
    insert(index + 1, {
      id: `award_${Date.now()}`,
      awardName: "Tên giải thưởng mới",
      date: "2025",
    });
  };

  return (
    <div className="section-awards mb-3 group relative">
      <SectionTitle
        title={section.title || "GIẢI THƯỞNG"}
        fieldKey="sections.awards.title"
        formFieldName="content.sections.awards.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />

      <div className="space-y-1.5 text-xs">
        {formItems.map((item, index) => (
          <div key={item._fieldKey} className="group/item relative flex items-center justify-between rounded-sm p-1 transition-all hover:bg-slate-50/60">
            {/* Item Actions bên phải */}
            {!isReadOnly && (
              <ItemActions
                isFirst={index === 0}
                isLast={index === formItems.length - 1}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onAddAfter={() => handleAddAfter(index)}
                onDelete={() => {
                  cleanupItemStyles(item.id);
                  remove(index);
                }}
              />
            )}

            <span
              className="font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.awardName`, {
                fontWeight: "500",
              })}
            >
              <EditableField
                name={`content.sections.awards.items.${index}.awardName`}
                placeholder="Tên giải thưởng"
                isReadOnly={isReadOnly}
              />
            </span>

            <div className="flex items-center gap-1 text-slate-500">
              <EditableField
                name={`content.sections.awards.items.${index}.date`}
                placeholder="Thời gian"
                isReadOnly={isReadOnly}
                style={getFieldStyle(fields, `${item.id}.date`, {
                  color: "#64748B",
                })}
              />
            </div>
          </div>
        ))}

        {formItems.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-1 italic">
            Chưa có giải thưởng.
          </p>
        )}
      </div>
    </div>
  );
};

// 3. Generic Text Section (Interests, Additional Info, v.v.)
interface TextSectionProps {
  section: CVTextSection;
  sectionKey: "interests" | "additionalInfo" | "objective";
  defaultTitle: string;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const TextSection: React.FC<TextSectionProps> = ({
  section,
  sectionKey,
  defaultTitle,
  fields,
  primaryColor,
  isReadOnly = false,
}) => {
  if (!section.visible) return null;

  return (
    <div className={`section-${sectionKey} mb-3 group relative`}>
      <SectionTitle
        title={section.title || defaultTitle}
        fieldKey={`sections.${sectionKey}.title`}
        formFieldName={`content.sections.${sectionKey}.title`}
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />
      <div
        className="text-xs leading-relaxed text-slate-700 text-justify block min-h-[20px]"
        style={getFieldStyle(fields, `sections.${sectionKey}.content`, {
          fontSize: "12px",
          color: "#334155",
        })}
      >
        <EditableField
          name={`content.sections.${sectionKey}.content`}
          placeholder={`Nhập nội dung cho mục ${defaultTitle}...`}
          multiline
          isReadOnly={isReadOnly}
          className="w-full block"
        />
      </div>
    </div>
  );
};
