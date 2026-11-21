import React from "react";
import { AlertCircle } from "lucide-react";

export interface MatchingWeightsValues {
  skill: number;
  experience: number;
  title: number;
  other: number;
}

interface JobMatchingWeightsCardProps {
  weights: MatchingWeightsValues;
  onChange: (weights: MatchingWeightsValues) => void;
  error?: string | null;
}

const PRESETS: Array<{
  name: string;
  desc: string;
  weights: MatchingWeightsValues;
}> = [
  {
    name: "Cân bằng tiêu chuẩn",
    desc: "40% Kỹ năng - 25% Kinh nghiệm - 25% Chức danh - 10% Khác",
    weights: { skill: 40, experience: 25, title: 25, other: 10 },
  },
  {
    name: "Ưu tiên kinh nghiệm",
    desc: "30% Kỹ năng - 45% Kinh nghiệm - 15% Chức danh - 10% Khác",
    weights: { skill: 30, experience: 45, title: 15, other: 10 },
  },
  {
    name: "Ưu tiên kỹ năng thực chiến",
    desc: "50% Kỹ năng - 20% Kinh nghiệm - 20% Chức danh - 10% Khác",
    weights: { skill: 50, experience: 20, title: 20, other: 10 },
  },
];

export const JobMatchingWeightsCard: React.FC<JobMatchingWeightsCardProps> = ({
  weights,
  onChange,
  error,
}) => {
  const total = weights.skill + weights.experience + weights.title + weights.other;
  const isValid = Math.abs(total - 100) < 0.1;

  const handleWeightChange = (key: keyof MatchingWeightsValues, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    onChange({
      ...weights,
      [key]: clamped,
    });
  };

  const applyPreset = (presetWeights: MatchingWeightsValues) => {
    onChange(presetWeights);
  };

  const criteria: Array<{ key: keyof MatchingWeightsValues; label: string; description: string }> = [
    { key: "skill", label: "Kỹ năng chuyên môn", description: "Mức độ phù hợp của các kỹ năng trong CV." },
    { key: "experience", label: "Kinh nghiệm làm việc", description: "Mức độ phù hợp của kinh nghiệm làm việc." },
    { key: "title", label: "Chức danh và cấp bậc", description: "Mức độ tương đồng về chức danh và cấp bậc." },
    { key: "other", label: "Học vấn và địa điểm", description: "Mức độ đáp ứng yêu cầu học vấn và địa điểm làm việc." },
  ];

  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-main">Trọng số đánh giá ứng viên</h3>
          <p className="mt-1 text-sm text-text-muted">Điều chỉnh mức độ quan trọng của từng tiêu chí khi đánh giá hồ sơ.</p>
        </div>
        <div className="text-sm" aria-live="polite">
          <span className="text-text-muted">Tổng trọng số: </span>
          <span className={isValid ? "font-semibold text-primary" : "font-semibold text-status-error"}>{total}%</span>
          <span className="text-text-muted"> / 100%</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-text-main">Thiết lập nhanh</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const selected = (Object.keys(preset.weights) as Array<keyof MatchingWeightsValues>)
              .every((key) => weights[key] === preset.weights[key]);
            return (
              <button key={preset.name} type="button" title={preset.desc} aria-pressed={selected}
                onClick={() => applyPreset(preset.weights)}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${selected ? "border-primary bg-primary text-white" : "border-border text-text-main hover:border-primary hover:text-primary"}`}>
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 divide-y divide-border border-t border-border">
        {criteria.map(({ key, label, description }) => (
          <div key={key} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)_80px] sm:items-center sm:gap-5">
            <div>
              <label htmlFor={`weight-${key}`} className="text-sm font-semibold text-text-main">{label}</label>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
            </div>
            <input type="range" min={0} max={100} step={5} value={weights[key]}
              aria-label={`Điều chỉnh ${label}`} onChange={(e) => handleWeightChange(key, Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex items-center gap-2">
              <input id={`weight-${key}`} type="number" min={0} max={100} step={5} value={weights[key]}
                onChange={(e) => handleWeightChange(key, parseInt(e.target.value, 10))}
                className="w-16 rounded-md border border-border bg-surface px-2 py-1.5 text-right text-sm text-text-main focus:border-primary focus:outline-none" />
              <span className="text-sm text-text-muted">%</span>
            </div>
          </div>
        ))}
      </div>

      {(!isValid || error) && (
        <div role="alert" className="mt-2 flex items-start gap-2 text-sm text-status-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error || "Vui lòng điều chỉnh để tổng trọng số bằng 100%."}</span>
        </div>
      )}
    </section>
  );
};
