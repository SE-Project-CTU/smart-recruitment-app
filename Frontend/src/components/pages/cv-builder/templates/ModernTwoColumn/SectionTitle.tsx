import React from "react";
import type { FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { TiptapField } from "../../components/TiptapField";

interface SectionTitleProps {
  placeholder: string;
  formFieldName: FieldPath<RichTextCvEditorValues>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  placeholder,
  formFieldName,
  primaryColor = "#0F172A",
  isReadOnly = false,
}) => (
  <div className="mb-2 mt-4">
    <h3
      className="cv-section-header cv-text-section-header font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5"
      style={{ borderColor: primaryColor, color: primaryColor }}
    >
      <TiptapField name={formFieldName} placeholder={placeholder} isReadOnly={isReadOnly} />
    </h3>
  </div>
);
