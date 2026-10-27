import React from "react";
import type { CVFieldStyle } from "@/types/cv";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";
import type { FieldPath } from "react-hook-form";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";

interface SectionTitleProps {
  title: string;
  fieldKey?: string;
  formFieldName?: FieldPath<CvEditorValues>;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  fieldKey,
  formFieldName,
  fields,
  primaryColor = "#0F172A",
  isReadOnly = false,
}) => {
  return (
    <div className="mb-2 mt-4">
      <h3
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5"
        style={{
          borderColor: primaryColor,
          ...getFieldStyle(fields, fieldKey || "", {
            color: primaryColor,
            fontWeight: "bold",
          }),
        }}
      >
        {formFieldName ? (
          <EditableField
            name={formFieldName}
            placeholder={title}
            isReadOnly={isReadOnly}
            className=""
          />
        ) : (
          title
        )}
      </h3>
    </div>
  );
};
