import React from "react";
import type { CVDetail, CVSectionKey } from "@/types/cv";
import { ProfileHeader } from "./ProfileHeader";
import { ObjectiveSection } from "./ObjectiveSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import {
  CertificationsSection,
  AwardsSection,
  TextSection,
} from "./OtherSections";

interface ModernTwoColumnTemplateProps {
  data: CVDetail;
  className?: string;
}

const DEFAULT_SECTION_ORDER: CVSectionKey[] = [
  "objective",
  "education",
  "experience",
  "skills",
  "projects",
  "certifications",
  "awards",
  "interests",
  "additionalInfo",
];

export const ModernTwoColumnTemplate: React.FC<
  ModernTwoColumnTemplateProps
> = ({ data, className = "" }) => {
  const { content, presentation, layout } = data;
  const { profile, sections } = content;
  const fields = presentation?.styles?.fields;
  const globalStyles = presentation?.styles?.global;

  const primaryColor = globalStyles?.primaryColor?.[0] || "#0F172A";
  const fontFamily = globalStyles?.fontFamily || "inherit";
  const lineHeight = globalStyles?.lineHeight || 1.5;

  // Hàm render section dựa theo sectionKey
  const renderSection = (key: CVSectionKey | string) => {
    switch (key) {
      case "objective":
        return (
          <ObjectiveSection
            key={key}
            section={sections.objective}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "education":
        return (
          <EducationSection
            key={key}
            section={sections.education}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            key={key}
            section={sections.experience}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "skills":
        return (
          <SkillsSection
            key={key}
            section={sections.skills}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            key={key}
            section={sections.projects}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            key={key}
            section={sections.certifications}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "awards":
        return (
          <AwardsSection
            key={key}
            section={sections.awards}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "interests":
        return (
          <TextSection
            key={key}
            section={sections.interests}
            sectionKey="interests"
            defaultTitle="SỞ THÍCH"
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "additionalInfo":
        return (
          <TextSection
            key={key}
            section={sections.additionalInfo}
            sectionKey="additionalInfo"
            defaultTitle="THÔNG TIN BỔ SUNG"
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      default:
        return null;
    }
  };

  // Thứ tự hiển thị các sections từ sections.order
  const sectionOrder = layout.areas[0].sections || DEFAULT_SECTION_ORDER;

  return (
    <div
      className={`mx-auto w-full max-w-[800px] bg-white p-8 text-slate-900 shadow-md sm:p-12 print:m-0 print:p-8 print:shadow-none ${className}`}
      style={{
        fontSize: globalStyles?.baseFontSize,
        fontFamily: fontFamily.includes("sans")
          ? fontFamily
          : `'${fontFamily}', sans-serif`,
        lineHeight,
      }}
    >
      {/* 1. Header: Profile Info */}
      <ProfileHeader
        profile={profile}
        fields={fields}
        primaryColor={primaryColor}
      />

      {/* 2. Sections Flow */}
      <div className="mt-3">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </div>
    </div>
  );
};
