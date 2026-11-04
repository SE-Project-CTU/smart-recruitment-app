import React from "react";
import type { CvTiptapDocument } from "@/types/cv";
import type { CvFieldRenderer } from "../types";

interface SectionTitleProps {
  title?: CvTiptapDocument;
  fieldName: string;
  placeholder: string;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  fieldName,
  placeholder,
  primaryColor: _primaryColor = "#0F172A",
  isReadOnly = false,
  renderField,
}) => (
  <div className="mt-4 mb-2">
    <h3 
      className="cv-section-header cv-text-section-header border-b pb-0.5 font-bold tracking-wider text-slate-900 uppercase"
      style={{ borderColor: _primaryColor, color: _primaryColor }}
    >
      {renderField({
        name: fieldName,
        document: title,
        placeholder,
        isReadOnly,
      })}
    </h3>
  </div>
);
