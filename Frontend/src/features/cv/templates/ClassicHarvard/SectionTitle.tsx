import React from "react";
import type { CvTiptapDocument } from "@/types/cv";
import type { CvFieldRenderer } from "../types";

interface SectionTitleProps {
  title?: CvTiptapDocument;
  fieldName: string;
  placeholder: string;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const SectionTitle: React.FC<SectionTitleProps> = React.memo(({
  title,
  fieldName,
  placeholder,
  primaryColor = "#0F172A",
  bannerBgColor = "#F1F5F9",
  isReadOnly = false,
  renderField,
}) => (
  <div className="mt-4 mb-3 break-after-avoid">
    <div
      className="px-3 py-1.5 text-center rounded-sm transition-colors duration-150"
      style={{
        backgroundColor: `var(--cv-primary-2, ${bannerBgColor})`,
      }}
    >
      <h3
        className="cv-section-header cv-text-section-header font-bold tracking-widest uppercase text-center"
        style={{
          color: `var(--cv-primary-1, ${primaryColor})`,
        }}
      >
        {renderField({
          name: fieldName,
          document: title,
          placeholder,
          isReadOnly,
        })}
      </h3>
    </div>
  </div>
));

SectionTitle.displayName = "SectionTitle";
