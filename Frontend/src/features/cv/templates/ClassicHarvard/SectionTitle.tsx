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
  <div className="mt-4 mb-3 break-after-avoid">
    <div className="bg-slate-100/90 px-3 py-1.5 text-center rounded-sm">
      <h3 className="cv-section-header cv-text-section-header font-bold tracking-widest text-slate-800 uppercase text-center">
        {renderField({
          name: fieldName,
          document: title,
          placeholder,
          isReadOnly,
        })}
      </h3>
    </div>
  </div>
);
