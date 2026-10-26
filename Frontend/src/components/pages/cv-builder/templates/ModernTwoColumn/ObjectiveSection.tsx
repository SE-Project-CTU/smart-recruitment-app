import React from "react";
import type { CVTextSection, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";

interface ObjectiveSectionProps {
  section: CVTextSection;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible) return null;

  return (
    <div className="section-objective group">
      <SectionTitle
        title={section.title || "MỤC TIÊU NGHỀ NGHIỆP"}
        fieldKey="sections.objective.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div
        className="hover-field text-justify text-xs leading-relaxed text-slate-700 "
        style={getFieldStyle(fields, "sections.objective.content", {
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#334155",
        })}
      >
        <p>{section.content}</p>
      </div>
    </div>
  );
};
