import React from "react";
import type { CVItemSection, CVSkillItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";

interface SkillsSectionProps {
  section: CVItemSection<CVSkillItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0) return null;

  return (
    <div className="section-skills mb-3">
      <SectionTitle
        title={section.title || "KỸ NĂNG"}
        fieldKey="sections.skills.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      {/* Hiển thị dạng bảng / 2 cột giống hình mẫu: Cột trái Kỹ năng, Cột phải Mô tả */}
      <div className="space-y-2 text-xs">
        {section.items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-2">
            <div
              className="col-span-4 font-semibold text-slate-900"
              style={getFieldStyle(fields, `${item.id}.name`, {
                fontWeight: "600",
                color: "#0F172A",
              })}
            >
              {item.name}
            </div>
            <div
              className="col-span-8 text-slate-700 leading-relaxed text-justify"
              style={getFieldStyle(fields, `${item.id}.description`, {
                color: "#334155",
              })}
            >
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
