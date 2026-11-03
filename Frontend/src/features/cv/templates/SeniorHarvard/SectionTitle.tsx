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
  primaryColor = "#0F172A",
  isReadOnly = false,
  renderField,
}) => (
  <div className="mb-2 mt-4">
    <h3
      className="cv-section-header cv-text-section-header font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5"
      style={{ borderColor: primaryColor, color: primaryColor }}
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
