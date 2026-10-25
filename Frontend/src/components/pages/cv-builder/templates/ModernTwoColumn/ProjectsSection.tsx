import React from "react";
import type { CVItemSection, CVProjectItem, CVFieldStyle } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";
import StartEndDate from "../../components/start-end-date";

interface ProjectsSectionProps {
  section: CVItemSection<CVProjectItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

interface ProjectItemProps {
  item: CVProjectItem;
  fields?: Record<string, CVFieldStyle>;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ item, fields }) => {
  const lines = item.description
    ? item.description.split("\n").filter((l) => l.trim().length > 0)
    : [];

  return (
    <div className="text-xs">
      {/* Tên dự án & Thời gian */}
      <div className="flex items-center justify-between font-bold text-slate-900">
        <span
          style={getFieldStyle(fields, `${item.id}.projectName`, {
            fontWeight: "bold",
          })}
        >
          {item.projectName}
        </span>
        <StartEndDate
          itemId={item.id}
          start={item.start}
          end={item.end}
        />
      </div>

      {/* Vai trò */}
      {item.role && (
        <div
          className="mt-0.5 font-medium text-slate-800"
          style={getFieldStyle(fields, `${item.id}.role`, {
            fontWeight: "500",
          })}
        >
          {item.role}
        </div>
      )}

      {/* Mô tả */}
      {lines.length > 0 && (
        <div
          className="mt-1 space-y-1 leading-relaxed text-slate-700"
          style={getFieldStyle(fields, `${item.id}.description`, {
            color: "#334155",
          })}
        >
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            const isBullet =
              trimmed.startsWith("•") || trimmed.startsWith("-");
            const text = isBullet
              ? trimmed.replace(/^[•\-]\s*/, "")
              : trimmed;

            return (
              <div
                key={idx}
                className="flex items-start gap-1.5 pl-0.5"
              >
                <span className="text-slate-500">•</span>
                <span className="flex-1 text-justify">{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0)
    return null;

  return (
    <div className="section-projects mb-3">
      <SectionTitle
        title={section.title || "DỰ ÁN NỔI BẬT"}
        fieldKey="sections.projects.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div className="space-y-3">
        {section.items.map((item) => (
          <ProjectItem key={item.id} item={item} fields={fields} />
        ))}
      </div>
    </div>
  );
};
