import React from "react";
import type { CvTiptapDocument } from "@/types/cv";
import type { CvFieldRenderer } from "../types";

interface SectionTitleProps {
  placeholder: string;
  fieldName: string;
  title?: CvTiptapDocument;
  variant?: "default" | "light";
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

/**
 * SectionTitle:
 * Tiêu đề section gạch chân ngang chuẩn phong cách Minimalist CV.
 * Hỗ trợ variant="light" cho khối nền tối (Học vấn).
 */
export const SectionTitle: React.FC<SectionTitleProps> = React.memo(
  ({
    placeholder,
    fieldName,
    title,
    variant = "default",
    isReadOnly = false,
    renderField,
  }) => {
    const isLight = variant === "light";

    return (
      <div
        className={`mb-3 break-after-avoid border-b-2 pb-1 ${
          isLight ? "border-white/75" : ""
        }`}
        style={
          isLight
            ? undefined
            : { borderColor: "var(--cv-primary-1, #1E293B)" }
        }
      >
        <h3
          className={`text-[14px] font-bold tracking-wide uppercase ${
            isLight ? "text-white" : ""
          }`}
          style={
            isLight
              ? undefined
              : { color: "var(--cv-primary-2, #0F172A)" }
          }
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
  },
);

SectionTitle.displayName = "SectionTitle";
