import React from "react";
import { AlertTriangle } from "lucide-react";
import type { SkillGapAnalysis } from "./types";

interface SkillComparisonBoxProps {
  skillAnalysis: SkillGapAnalysis;
}

export const SkillComparisonBox: React.FC<SkillComparisonBoxProps> = ({
  skillAnalysis,
}) => {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3 text-xs space-y-2.5">
      <div className="flex items-center gap-1.5 font-semibold text-text-main">
        <span>Kỹ năng đối chiếu với thị trường</span>
      </div>

      {/* Kỹ năng phù hợp trong CV - Render động */}
      <div>
        <p className="mb-1 text-[10px] text-text-muted">Kỹ năng phù hợp trong CV:</p>
        <div className="flex flex-wrap gap-1.5">
          {skillAnalysis.matchedSkills.map((sk) => (
            <span
              key={sk}
              className="rounded-md border border-status-success/30 bg-status-success/10 px-2 py-0.5 text-[11px] font-medium text-status-success"
            >
              ✓ {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Kỹ năng thị trường thường yêu cầu - Render động */}
      <div>
        <p className="mb-1 text-[10px] text-text-muted">Kỹ năng thị trường thường yêu cầu:</p>
        <div className="flex flex-wrap gap-1.5">
          {skillAnalysis.missingSkills.map((sk) => (
            <span
              key={sk}
              className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted"
            >
              + {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Cảnh báo an toàn dữ liệu */}
      {skillAnalysis.systemWarning && (
        <div className="flex items-start gap-1.5 rounded-lg border border-status-warning/20 bg-status-warning/10 p-2 text-[11px] text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-status-warning mt-0.5" />
          <span>{skillAnalysis.systemWarning}</span>
        </div>
      )}
    </div>
  );
};
