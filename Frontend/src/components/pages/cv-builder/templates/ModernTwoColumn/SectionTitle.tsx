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
    <div className="mt-4 mb-2">
      <h3
        className="border-b border-slate-900 pb-0.5 text-xs font-bold tracking-wider text-slate-900 uppercase"
        style={{
          ...getFieldStyle(fields, fieldKey || "", {
            color: primaryColor,
            fontWeight: "bold",
          }),
        }}
      >
        <p className="hover-field ">{title}</p>
      </h3>
    </div>
  );
};
