import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/common";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { useCvScoringContext } from "../../context/CvScoringContext";
import { TargetJobSelectorCard } from "./TargetJobSelectorCard";

/**
 * CvScoringTab:
 * Tab Chấm điểm CV theo Job mục tiêu dựa trên API thật: POST /api/v1/ai/match-analysis
 * - Người dùng chọn Job mục tiêu độc lập qua TargetJobSelectorCard.
 * - Khi chấm, FE gửi nội dung CV mới nhất từ form (kể cả thay đổi chưa lưu) và jobId.
 * - Hiển thị:
 *   + Điểm số tổng quan & tóm tắt đánh giá
 *   + Kỹ năng phù hợp & kỹ năng còn thiếu
 *   + Điểm mạnh nổi bật của hồ sơ (Strengths)
 *   + Đề xuất cải thiện cụ thể từ AI (Recommendations)
 * - Tách bạch nghiệp vụ qua CvScoringContext.
 */
export const CvScoringTab: React.FC = () => {
  const { getValues } = useFormContext<RichTextCvEditorValues>();
  const [validationHint, setValidationHint] = useState<string | null>(null);

  const {
    selectedTargetJob,
    matchResult,
    isScoring,
    hasScored,
    isError,
    errorMessage,
    setSelectedTargetJob,
    scoreCv,
    clearScore,
  } = useCvScoringContext();

  const handleScoreClick = async () => {
    setValidationHint(null);
    const formValues = getValues();
    const result = await scoreCv(formValues);

    if (!result.success) {
      if (result.reason === "NO_JOB") {
        setValidationHint(
          "Vui lòng chọn một công việc mục tiêu để AI có căn cứ đối chiếu và chấm điểm hồ sơ.",
        );
      } else if (result.reason === "EMPTY_CV") {
        setValidationHint(
          "CV của bạn chưa có nội dung. Vui lòng nhập thông tin (Chức danh, Kinh nghiệm, Kỹ năng...) vào CV trước khi chấm điểm.",
        );
      }
    }
  };

  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        badgeBg: "bg-status-success/15",
        badgeText: "text-status-success",
        badgeLabel: "Hồ sơ CV rất ấn tượng",
        scoreColor: "text-status-success",
        circleBorder: "border-status-success/30",
        circleBg: "from-status-success/5",
      };
    }
    if (score >= 65) {
      return {
        badgeBg: "bg-primary/15",
        badgeText: "text-primary",
        badgeLabel: "Hồ sơ CV tiềm năng",
        scoreColor: "text-primary",
        circleBorder: "border-primary/30",
        circleBg: "from-primary/5",
      };
    }
    return {
      badgeBg: "bg-status-warning/15",
      badgeText: "text-status-warning",
      badgeLabel: "Cần tối ưu hóa thêm",
      scoreColor: "text-status-warning",
      circleBorder: "border-status-warning/30",
      circleBg: "from-status-warning/5",
    };
  };

  return (
    <div className="space-y-4">
      {/* ================= 1. KHỐI CHỌN JOB MỤC TIÊU ================= */}
      <TargetJobSelectorCard
        selectedJob={selectedTargetJob}
        onSelectJob={(job) => {
          setSelectedTargetJob(job);
          setValidationHint(null);
        }}
        onClear={() => {
          clearScore();
        }}
        emptyDescription="Chọn vị trí mong muốn để AI đối chiếu CV với bản mô tả công việc"
        buttonText="Chọn Job đối chiếu"
        changeTooltip="Thay đổi vị trí đối chiếu"
        clearTooltip="Bỏ chọn vị trí này"
        modalTitle="Chọn vị trí công việc đối chiếu chấm điểm"
        modalDescription="Đối chiếu hồ sơ CV với bản mô tả công việc (JD) thực tế để phân tích và chấm điểm độ phù hợp"
        modalConfirmText="Xác nhận chọn công việc đối chiếu"
      >
        {/* Nút Chấm điểm CV */}
        <div className="pt-1">
          <Button
            variant="primary"
            icon={Sparkles}
            iconSize={14}
            isLoading={isScoring}
            onClick={handleScoreClick}
            className="w-full! rounded-md! py-2! text-xs! font-semibold!"
          >
            {hasScored ? "Chấm điểm lại CV" : "Chấm điểm độ phù hợp"}
          </Button>
        </div>

        {/* Banner kiểm tra dữ liệu */}
        {validationHint && (
          <div className="flex items-start gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2.5 text-[11px] text-text-main">
            <AlertCircle className="size-3.5 shrink-0 text-status-warning mt-0.5" />
            <p className="leading-relaxed">{validationHint}</p>
          </div>
        )}

        {/* Banner lỗi từ API */}
        {isError && errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-status-error/40 bg-status-error/10 p-2.5 text-[11px] text-text-main">
            <AlertCircle className="size-3.5 shrink-0 text-status-error mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="leading-relaxed font-medium text-status-error">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={handleScoreClick}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Thử lại ngay →
              </button>
            </div>
          </div>
        )}
      </TargetJobSelectorCard>

      {/* ================= 2. TRẠNG THÁI ĐANG CHẤM ================= */}
      {isScoring && (
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4 text-center shadow-xs">
          <Sparkles className="size-7 animate-spin text-primary" />
          <p className="text-xs font-semibold text-text-main">
            AI đang phân tích và chấm điểm hồ sơ CV...
          </p>
          <p className="text-[11px] text-text-muted max-w-[220px]">
            Đang so khớp kỹ năng và kinh nghiệm theo vị trí{" "}
            <span className="font-semibold text-text-main">
              {selectedTargetJob?.title}
            </span>
          </p>
        </div>
      )}

      {/* ================= 3. KẾT QUẢ CHẤM ĐIỂM THẬT TỪ API ================= */}
      {!isScoring && hasScored && matchResult && (
        <div className="space-y-3.5">
          {(() => {
            const roundedScore = Math.round(matchResult.score);
            const theme = getScoreTheme(roundedScore);

            return (
              <>
                {/* 3.1 Điểm tổng quan */}
                <div
                  className={`flex flex-col items-center rounded-2xl border border-border bg-gradient-to-b ${theme.circleBg} to-surface p-4 text-center shadow-xs`}
                >
                  <div
                    className={`relative mb-2 flex size-18 items-center justify-center rounded-full border-4 ${theme.circleBorder} bg-surface shadow-inner`}
                  >
                    <span className={`text-2xl font-black ${theme.scoreColor}`}>
                      {roundedScore}
                    </span>
                    <span className="absolute -bottom-1 rounded-full bg-text-main px-1.5 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider">
                      /100
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}
                  >
                    {theme.badgeLabel}
                  </span>

                  {matchResult.summary && (
                    <p className="mt-2.5 text-[11px] text-text-muted leading-relaxed text-left border-t border-border/50 pt-2 w-full">
                      {matchResult.summary}
                    </p>
                  )}
                </div>

                {/* 3.2 Độ phủ kỹ năng (Phù hợp & Còn thiếu) */}
                <div className="space-y-3 rounded-xl border border-border bg-surface p-3.5 text-xs shadow-xs">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Độ phủ kỹ năng chuyên môn
                  </h4>

                  {/* Kỹ năng phù hợp */}
                  {matchResult.matchingSkills &&
                    matchResult.matchingSkills.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-status-success">
                          <CheckCircle2 className="size-3.5" />
                          <span>
                            Kỹ năng phù hợp ({matchResult.matchingSkills.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {matchResult.matchingSkills.map((sk) => (
                            <span
                              key={sk}
                              className="rounded-md border border-status-success/30 bg-status-success/10 px-2 py-0.5 text-[11px] font-medium text-status-success"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Kỹ năng còn thiếu */}
                  {matchResult.missingSkills &&
                    matchResult.missingSkills.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                          <XCircle className="size-3.5 text-status-error/80" />
                          <span>
                            Kỹ năng còn thiếu ({matchResult.missingSkills.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {matchResult.missingSkills.map((sk) => (
                            <span
                              key={sk}
                              className="rounded-md border border-border bg-bg px-2 py-0.5 text-[11px] font-medium text-text-muted"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* 3.3 Điểm mạnh của hồ sơ (Strengths) */}
                {matchResult.strengths && matchResult.strengths.length > 0 && (
                  <div className="rounded-xl border border-border bg-surface p-3.5 text-xs shadow-xs space-y-2">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      <ThumbsUp className="size-3.5 text-primary" />
                      Điểm mạnh nổi bật ({matchResult.strengths.length})
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-text-main leading-relaxed pl-1">
                      {matchResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3.4 Khuyến nghị cải thiện (Recommendations) */}
                {matchResult.recommendations &&
                  matchResult.recommendations.length > 0 && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs shadow-xs space-y-2">
                      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                        <Lightbulb className="size-3.5" />
                        Đề xuất tối ưu hồ sơ ({matchResult.recommendations.length})
                      </h4>
                      <ul className="space-y-1.5 text-[11px] text-text-main leading-relaxed pl-1">
                        {matchResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-primary font-bold mt-0.5">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* 3.5 Footer hành động */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-text-muted">
                  <span>
                    Điểm số:{" "}
                    <strong className="text-text-main">{roundedScore}/100</strong>
                  </span>
                  <Button
                    variant="secondary"
                    icon={RefreshCw}
                    iconSize={12}
                    isLoading={isScoring}
                    onClick={handleScoreClick}
                    className="h-6.5! rounded-md! px-2.5! py-1! text-[11px]! font-medium!"
                    title="Chấm điểm lại với nội dung mới nhất"
                  >
                    Chấm lại
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ================= 4. TRẠNG THÁI CHƯA CHẤM ĐIỂM ================= */}
      {!isScoring && !hasScored && (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-center">
          <Award className="size-8 text-text-muted/60" />
          <p className="text-xs font-bold text-text-main">
            Chưa có kết quả chấm điểm
          </p>
          <p className="text-[11px] text-text-muted max-w-[220px]">
            Chọn công việc mục tiêu và nhấn &ldquo;Chấm điểm độ phù hợp&rdquo; để AI
            phân tích độ tương thích giữa CV và JD.
          </p>
        </div>
      )}
    </div>
  );
};
