import React from "react";
import { Sliders, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

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

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sliders className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main">
              Trọng số đánh giá ứng viên (AI Match Weights)
            </h3>
            <p className="text-[11px] text-text-muted">
              Doanh nghiệp chủ động phân bổ tỷ trọng đánh giá độ phù hợp của hồ sơ theo nhu cầu tuyển dụng.
            </p>
          </div>
        </div>

        {/* Live Total Indicator Badge */}
        <div className="mt-2 sm:mt-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
              isValid
                ? "border border-status-success/30 bg-status-success/10 text-status-success"
                : "border border-status-warning/30 bg-status-warning/10 text-status-warning"
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            Tổng trọng số: {total}% / 100%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-300 ${
            isValid
              ? "bg-status-success"
              : total > 100
                ? "bg-status-error"
                : "bg-status-warning"
          }`}
          style={{ width: `${Math.min(100, total)}%` }}
        />
      </div>

      {/* Preset Buttons */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-text-muted">
          <Sparkles className="size-3 text-primary" /> Mẫu thiết lập nhanh:
        </span>
        {PRESETS.map((p) => {
          const isSelected =
            weights.skill === p.weights.skill &&
            weights.experience === p.weights.experience &&
            weights.title === p.weights.title &&
            weights.other === p.weights.other;

          return (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.weights)}
              title={p.desc}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-border bg-bg text-text-main hover:border-primary/40 hover:bg-surface"
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* 4 Weight Criteria Controls */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 1. Kỹ năng chuyên môn */}
        <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-main">
              Kỹ năng chuyên môn
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={weights.skill}
                onChange={(e) =>
                  handleWeightChange("skill", parseInt(e.target.value, 10))
                }
                className="w-14 rounded-md border border-border bg-surface px-1.5 py-0.5 text-right text-xs font-bold text-text-main focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-text-muted">
            So khớp từ khóa kỹ năng trực tiếp từ mục Kỹ năng trong CV.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={weights.skill}
            onChange={(e) =>
              handleWeightChange("skill", parseInt(e.target.value, 10))
            }
            className="mt-2 w-full accent-primary"
          />
        </div>

        {/* 2. Kinh nghiệm làm việc */}
        <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-main">
              Kinh nghiệm làm việc
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={weights.experience}
                onChange={(e) =>
                  handleWeightChange("experience", parseInt(e.target.value, 10))
                }
                className="w-14 rounded-md border border-border bg-surface px-1.5 py-0.5 text-right text-xs font-bold text-text-main focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-text-muted">
            Tỷ lệ thời gian làm việc thực tế so với số năm yêu cầu của JD.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={weights.experience}
            onChange={(e) =>
              handleWeightChange("experience", parseInt(e.target.value, 10))
            }
            className="mt-2 w-full accent-primary"
          />
        </div>

        {/* 3. Chức danh & Cấp bậc */}
        <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-main">
              Chức danh & Cấp bậc
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={weights.title}
                onChange={(e) =>
                  handleWeightChange("title", parseInt(e.target.value, 10))
                }
                className="w-14 rounded-md border border-border bg-surface px-1.5 py-0.5 text-right text-xs font-bold text-text-main focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-text-muted">
            Độ tương đồng chức danh công việc và cấp bậc thâm niên mong muốn.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={weights.title}
            onChange={(e) =>
              handleWeightChange("title", parseInt(e.target.value, 10))
            }
            className="mt-2 w-full accent-primary"
          />
        </div>

        {/* 4. Học vấn & Vị trí */}
        <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-main">
              Học vấn & Vị trí làm việc
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={weights.other}
                onChange={(e) =>
                  handleWeightChange("other", parseInt(e.target.value, 10))
                }
                className="w-14 rounded-md border border-border bg-surface px-1.5 py-0.5 text-right text-xs font-bold text-text-main focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-text-muted">%</span>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-text-muted">
            Bằng cấp đạt yêu cầu (100% / 0%) và mức độ đáp ứng vị trí địa lý.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={weights.other}
            onChange={(e) =>
              handleWeightChange("other", parseInt(e.target.value, 10))
            }
            className="mt-2 w-full accent-primary"
          />
        </div>
      </div>

      {/* Error / Warning Alert */}
      {(!isValid || error) && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
            total > 100
              ? "border-status-error/40 bg-status-error/10 text-status-error"
              : "border-status-warning/40 bg-status-warning/10 text-status-warning"
          }`}
        >
          <AlertCircle className="size-4 shrink-0" />
          <span className="font-medium">
            {error ||
              (total > 100
                ? `Tổng trọng số hiện tại là ${total}% (vượt quá 100%). Nút tạo/lưu tin tuyển dụng sẽ bị vô hiệu hóa cho đến khi đạt chính xác 100%.`
                : `Tổng trọng số hiện tại là ${total}%. Vui lòng điều chỉnh để tổng các tiêu chí đạt chính xác 100% để có thể lưu/đăng tin.`)}
          </span>
        </div>
      )}
    </div>
  );
};
