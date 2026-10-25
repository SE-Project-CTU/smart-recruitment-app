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
        className="rounded-sm p-1 text-justify text-xs leading-relaxed text-slate-700 group-hover:outline-2 group-hover:outline-dashed focus-visible:outline-2 outline-slate-400"
        style={getFieldStyle(fields, "sections.objective.content", {
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#334155",
        })}
        contentEditable={true}
      >
        <p>{section.content}</p>
      </div>
    </div>
  );
};
