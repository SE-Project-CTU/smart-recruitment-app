import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { TiptapField } from "../../components/TiptapField";
import { SectionTitle } from "./SectionTitle";

interface ObjectiveSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({ section, primaryColor, isReadOnly = false }) => {
  if (!section.visible) return null;
  return (
    <div className="section-objective mb-3 group relative">
      <SectionTitle placeholder="MỤC TIÊU NGHỀ NGHIỆP" formFieldName="content.sections.objective.title" primaryColor={primaryColor} isReadOnly={isReadOnly} />
      <div className="min-h-5 text-xs leading-relaxed text-slate-700">
        <TiptapField name="content.sections.objective.content" placeholder="Mô tả mục tiêu nghề nghiệp của bạn..." multiline isReadOnly={isReadOnly} />
      </div>
    </div>
  );
};
