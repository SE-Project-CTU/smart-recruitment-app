import React, { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import type { CVDetail, CVSectionKey } from "@/types/cv";
import DroppableContainer from "../../components/droppable-container";
import DraggableSection from "../../components/draggable-section";
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
  const [profileState, setProfileState] = useState(content.profile);
  const [sectionState, setSectionState] = useState(content.sections);
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
            section={sectionState.objective}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "education":
        return (
          <EducationSection
            key={key}
            section={sectionState.education}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            key={key}
            section={sectionState.experience}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "skills":
        return (
          <SkillsSection
            key={key}
            section={sectionState.skills}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            key={key}
            section={sectionState.projects}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "certifications":
        return (
          <CertificationsSection
            key={key}
            section={sectionState.certifications}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "awards":
        return (
          <AwardsSection
            key={key}
            section={sectionState.awards}
            fields={fields}
            primaryColor={primaryColor}
          />
        );
      case "interests":
        return (
          <TextSection
            key={key}
            section={sectionState.interests}
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
            section={sectionState.additionalInfo}
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

  // Thứ tự hiển thị các sections từ layout
  const initialSectionOrder =
    layout.areas[0]?.sections || DEFAULT_SECTION_ORDER;
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    ...initialSectionOrder,
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const destinationIndex = result.destination.index;

    setSectionOrder((currentOrder) => {
      const nextOrder = [...currentOrder];
      const [movedSection] = nextOrder.splice(result.source.index, 1);

      if (!movedSection) return currentOrder;

      nextOrder.splice(destinationIndex, 0, movedSection);
      return nextOrder;
    });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setSectionOrder((currentOrder) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= currentOrder.length) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      [nextOrder[index], nextOrder[targetIndex]] = [
        nextOrder[targetIndex],
        nextOrder[index],
      ];
      return nextOrder;
    });
  };

  const handleDeleteSection = (key: CVSectionKey) => {
    setSectionState((prevSections) => {
      const updatedSections = { ...prevSections };
      updatedSections[key].visible = false;

      return updatedSections;
    });
  };

  return (
    <div
      className={`mx-auto w-full max-w-[800px] bg-white p-8 text-slate-900 shadow-md sm:p-6 print:m-0 print:p-8 print:shadow-none ${className}`}
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
        profile={profileState}
        fields={fields}
        primaryColor={primaryColor}
      />

      {/* 2. Sections Flow */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <DroppableContainer droppableId="cv-sections" className="mt-3">
          {() =>
            sectionOrder.map(
              (sectionKey, index) =>
                sectionState[sectionKey as CVSectionKey]?.visible && (
                  <DraggableSection
                    key={sectionKey}
                    draggableId={sectionKey}
                    index={index}
                    className="group relative"
                    isFirst={index === 0}
                    isLast={index === sectionOrder.length - 1}
                    onMoveUp={() => moveSection(index, -1)}
                    onMoveDown={() => moveSection(index, 1)}
                    onDelete={handleDeleteSection}
                  >
                    {() => renderSection(sectionKey)}
                  </DraggableSection>
                ),
            )
          }
        </DroppableContainer>
      </DragDropContext>
    </div>
  );
};
