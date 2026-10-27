import React from "react";
import type { CVTextSection, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";

interface ObjectiveSectionProps {
  section: CVTextSection;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({
  section,
  fields,
  primaryColor,
  isReadOnly = false,
}) => {
  if (!section.visible) return null;

  return (
    <div className="section-objective mb-3 group relative">
      <SectionTitle
        title={section.title || "MỤC TIÊU NGHỀ NGHIỆP"}
        fieldKey="sections.objective.title"
        formFieldName="content.sections.objective.title"
        fields={fields}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
      />
      <div
        className="text-xs leading-relaxed text-slate-700 text-justify block min-h-[20px]"
        style={getFieldStyle(fields, "sections.objective.content", {
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#334155",
        })}
      >
        <EditableField
          name="content.sections.objective.content"
          placeholder="Mô tả mục tiêu nghề nghiệp của bạn..."
          multiline
          isReadOnly={isReadOnly}
          className="w-full block"
        />
      </div>
    </div>
  );
};
