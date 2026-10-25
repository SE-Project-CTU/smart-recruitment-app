import React from "react";
import type { CVItemSection, CVExperienceItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";

interface ExperienceSectionProps {
  section: CVItemSection<CVExperienceItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0) return null;

  return (
    <div className="section-experience mb-3">
      <SectionTitle
        title={section.title || "KINH NGHIỆM LÀM VIỆC"}
        fieldKey="sections.experience.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div className="space-y-4">
        {section.items.map((item) => {
          // Phân tách description thành các dòng bullet nếu có
          const lines = item.description
            ? item.description.split("\n").filter((l) => l.trim().length > 0)
            : [];

          return (
            <div key={item.id} className="text-xs">
              {/* Tên công ty & Thời gian */}
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span
                  style={getFieldStyle(fields, `${item.id}.company`, {
                    fontWeight: "bold",
                  })}
                >
                  {item.company}
                </span>
                {(item.startDate || item.endDate) && (
                  <span
                    className="font-normal text-slate-600"
                    style={getFieldStyle(fields, `${item.id}.endDate`, {
                      color: "#64748B",
                    })}
                  >
                    {item.startDate} - {item.endDate || "Hiện tại"}
                  </span>
                )}
              </div>

              {/* Vị trí làm việc */}
              {item.position && (
                <div
                  className="mt-0.5 font-semibold text-slate-800"
                  style={getFieldStyle(fields, `${item.id}.position`, {
                    fontWeight: "600",
                    color: "#1E293B",
                  })}
                >
                  {item.position}
                </div>
              )}

              {/* Mô tả & thành tích */}
              {lines.length > 0 && (
                <div
                  className="mt-1.5 space-y-1 text-slate-700 leading-relaxed"
                  style={getFieldStyle(fields, `${item.id}.description`, {
                    color: "#334155",
                  })}
                >
                  {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-");
                    const text = isBullet ? trimmed.replace(/^[•\-]\s*/, "") : trimmed;

                    return (
                      <div key={idx} className="flex items-start gap-1.5 pl-0.5">
                        <span className="text-slate-500">•</span>
                        <span className="flex-1 text-justify">{text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
