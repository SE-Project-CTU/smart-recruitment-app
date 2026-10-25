import React from "react";
import type { CVItemSection, CVEducationItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";

interface EducationSectionProps {
  section: CVItemSection<CVEducationItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0) return null;

  return (
    <div className="section-education mb-3">
      <SectionTitle
        title={section.title || "HỌC VẤN"}
        fieldKey="sections.education.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item.id} className="text-xs">
            {/* Hàng 1: Tên trường và Thời gian */}
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span
                style={getFieldStyle(fields, `${item.id}.school`, {
                  fontWeight: "bold",
                })}
              >
                {item.school}
              </span>
              {(item.start || item.end) && (
                <span
                  className="font-normal text-slate-600"
                  style={getFieldStyle(fields, `${item.id}.end`, {
                    color: "#64748B",
                  })}
                >
                  {item.start} - {item.end || "Hiện tại"}
                </span>
              )}
            </div>

            {/* Hàng 2: Chuyên ngành / bằng cấp */}
            {item.title && (
              <div
                className="mt-0.5 font-medium text-slate-800"
                style={getFieldStyle(fields, `${item.id}.title`, {
                  fontWeight: "500",
                })}
              >
                {item.title}
              </div>
            )}

            {/* Hàng 3: Xếp loại / chi tiết */}
            {item.details && (
              <div
                className="mt-0.5 text-slate-600"
                style={getFieldStyle(fields, `${item.id}.details`, {
                  color: "#475569",
                })}
              >
                {item.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
