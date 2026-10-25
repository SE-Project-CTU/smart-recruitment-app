import React from "react";
import type { CVFieldStyle } from "@/types/cv";
import { getFieldStyle } from "./utils";

interface SectionTitleProps {
  title: string;
  fieldKey?: string;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  fieldKey,
  fields,
  primaryColor = "#0F172A",
}) => {
  return (
    <div className="mb-2 mt-4">
      <h3
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5"
        style={{
          ...getFieldStyle(fields, fieldKey || "", {
            color: primaryColor,
            fontWeight: "bold",
          }),
        }}
      >
        {title}
      </h3>
    </div>
  );
};
