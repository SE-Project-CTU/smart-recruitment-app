import React from "react";
import type {
  CVItemSection,
  CVCertificationItem,
  CVAwardItem,
  CVTextSection,
  CVFieldStyle,
} from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import { getFieldStyle } from "./utils";

// 1. Certifications
interface CertificationsSectionProps {
  section: CVItemSection<CVCertificationItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0) return null;

  return (
    <div className="section-certifications mb-3">
      <SectionTitle
        title={section.title || "CHỨNG CHỈ"}
        fieldKey="sections.certifications.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div className="space-y-1.5 text-xs">
        {section.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span
              className="font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.name`, {
                fontWeight: "500",
              })}
            >
              {item.name}
            </span>
            {item.issueDate && (
              <span
                className="text-slate-500"
                style={getFieldStyle(fields, `${item.id}.issueDate`, {
                  color: "#64748B",
                })}
              >
                {item.issueDate}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Awards
interface AwardsSectionProps {
  section: CVItemSection<CVAwardItem>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  section,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.items || section.items.length === 0) return null;

  return (
    <div className="section-awards mb-3">
      <SectionTitle
        title={section.title || "GIẢI THƯỞNG"}
        fieldKey="sections.awards.title"
        fields={fields}
        primaryColor={primaryColor}
      />
      <div className="space-y-1.5 text-xs">
        {section.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span
              className="font-medium text-slate-800"
              style={getFieldStyle(fields, `${item.id}.awardName`, {
                fontWeight: "500",
              })}
            >
              {item.awardName}
            </span>
            {item.date && (
              <span
                className="text-slate-500"
                style={getFieldStyle(fields, `${item.id}.date`, {
                  color: "#64748B",
                })}
              >
                {item.date}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Generic Text Section (Interests, Additional Info, v.v.)
interface TextSectionProps {
  section: CVTextSection;
  sectionKey: "interests" | "additionalInfo" | string;
  defaultTitle: string;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const TextSection: React.FC<TextSectionProps> = ({
  section,
  sectionKey,
  defaultTitle,
  fields,
  primaryColor,
}) => {
  if (!section.visible || !section.content) return null;

  return (
    <div className={`section-${sectionKey} mb-3`}>
      <SectionTitle
        title={section.title || defaultTitle}
        fieldKey={`sections.${sectionKey}.title`}
        fields={fields}
        primaryColor={primaryColor}
      />
      <div
        className="text-xs leading-relaxed text-slate-700 text-justify"
        style={getFieldStyle(fields, `sections.${sectionKey}.content`, {
          fontSize: "12px",
          color: "#334155",
        })}
      >
        {section.content}
      </div>
    </div>
  );
};
