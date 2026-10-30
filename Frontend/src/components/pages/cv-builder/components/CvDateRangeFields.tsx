import React from "react";
import type { FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { TiptapField } from "./TiptapField";

interface CvDateRangeFieldsProps {
  startName: FieldPath<RichTextCvEditorValues>;
  endName: FieldPath<RichTextCvEditorValues>;
  startPlaceholder?: string;
  endPlaceholder?: string;
  yearOnly?: boolean;
  isReadOnly?: boolean;
}

export const CvDateRangeFields: React.FC<CvDateRangeFieldsProps> = ({
  startName,
  endName,
  startPlaceholder = "Bắt đầu",
  endPlaceholder = "Kết thúc",
  yearOnly = false,
  isReadOnly = false,
}) => {
  const dateWidth = yearOnly ? "w-12" : "w-max min-w-[3.5rem]";

  return (
    <div className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-normal text-slate-600">
      <TiptapField
        name={startName}
        placeholder={startPlaceholder}
        isReadOnly={isReadOnly}
        className={`${dateWidth} text-center`}
      />
      <span aria-hidden="true" className="text-slate-400">–</span>
      <TiptapField
        name={endName}
        placeholder={endPlaceholder}
        isReadOnly={isReadOnly}
        className={`${dateWidth} text-center`}
      />
    </div>
  );
};
