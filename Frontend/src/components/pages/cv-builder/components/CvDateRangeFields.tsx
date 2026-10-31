import React from "react";
import type { CvTiptapDocument } from "@/types/cv";
import type { CvFieldRenderer } from "../templates/CvTemplateProps";

interface CvDateRangeFieldsProps {
  startName: string;
  endName: string;
  startDate?: CvTiptapDocument;
  endDate?: CvTiptapDocument;
  renderField: CvFieldRenderer;
  startPlaceholder?: string;
  endPlaceholder?: string;
  yearOnly?: boolean;
  isReadOnly?: boolean;
}

export const CvDateRangeFields: React.FC<CvDateRangeFieldsProps> = ({
  startName,
  endName,
  startDate,
  endDate,
  renderField,
  startPlaceholder = "Bắt đầu",
  endPlaceholder = "Kết thúc",
  yearOnly = false,
  isReadOnly = false,
}) => {
  const dateWidth = yearOnly ? "w-12" : "w-max min-w-[3.5rem]";

  return (
    <div className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-normal text-slate-600">
      {renderField({
        name: startName,
        document: startDate,
        placeholder: startPlaceholder,
        isReadOnly,
        className: `${dateWidth} text-center`,
      })}
      <span aria-hidden="true" className="text-slate-400">–</span>
      {renderField({
        name: endName,
        document: endDate,
        placeholder: endPlaceholder,
        isReadOnly,
        className: `${dateWidth} text-center`,
      })}
    </div>
  );
};
