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

/**
 * Tiêu đề mục theo phong cách hộp chữ nhật nền đen/màu chủ đạo chữ trắng nổi bật
 */
export const SidebarSectionTitle: React.FC<SectionTitleProps> = ({
  title,
  fieldName,
  placeholder,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => (
  <div className="mb-3 mt-5">
    <div
      className="w-full py-1.5 px-3 text-center text-xs font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: primaryColor }}
    >
      {renderField({
        name: fieldName,
        document: title,
        placeholder,
        isReadOnly,
        className: "!text-white",
      })}
    </div>
  </div>
);

export const MainSectionTitle: React.FC<SectionTitleProps> = ({
  title,
  fieldName,
  placeholder,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => (
  <div className="mb-3 mt-5 first:mt-0">
    <div
      className="w-full py-1.5 px-3 text-left text-xs font-bold uppercase tracking-wider text-white"
      style={{ backgroundColor: primaryColor }}
    >
      {renderField({
        name: fieldName,
        document: title,
        placeholder,
        isReadOnly,
        className: "!text-white",
      })}
    </div>
  </div>
);
