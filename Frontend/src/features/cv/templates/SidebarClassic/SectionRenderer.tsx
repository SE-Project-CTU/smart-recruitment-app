import React from "react";
import type { RichTextCVSections } from "@/types/cv";
import type { CvFieldRenderer, CvSectionEditorsMap } from "../types";
import { ObjectiveSection } from "./ObjectiveSection";
import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { CertificationsSection } from "./CertificationsSection";
import { AwardsSection } from "./AwardsSection";
import { AdditionalInfoSection } from "./AdditionalInfoSection";
import { InterestsSection } from "./InterestsSection";

interface SectionRendererProps {
  sectionKey: string;
  sections: RichTextCVSections;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  sectionEditors?: Partial<CvSectionEditorsMap>;
}

/**
 * SectionRenderer:
 * Component thuần túy render nội dung của 1 section dựa vào sectionKey.
 * Được bọc React.memo để ngăn chặn việc render lại nội dung khi vỏ kéo thả Draggable thay đổi trạng thái.
 */
export const SectionRenderer = React.memo<SectionRendererProps>(
  ({
    sectionKey,
    sections,
    primaryColor,
    isReadOnly,
    renderField,
    sectionEditors,
  }) => {
    switch (sectionKey) {
      case "objective":
        return (
          <ObjectiveSection
            section={sections.objective}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      case "education":
        return (
          <EducationSection
            section={sections.education}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.education}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            section={sections.experience}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.experience}
          />
        );
      case "skills":
        return (
          <SkillsSection
            section={sections.skills}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.skills}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            section={sections.projects}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.projects}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            section={sections.certifications}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.certifications}
          />
        );
      case "awards":
        return (
          <AwardsSection
            section={sections.awards}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
            actions={sectionEditors?.awards}
          />
        );
      case "interests":
        return (
          <InterestsSection
            section={sections.interests}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      case "additionalInfo":
        return (
          <AdditionalInfoSection
            section={sections.additionalInfo}
            primaryColor={primaryColor}
            isReadOnly={isReadOnly}
            renderField={renderField}
          />
        );
      default:
        return null;
    }
  },
);

SectionRenderer.displayName = "SectionRenderer";
