import React, { useState } from "react";
import { Award, CheckCircle2, XCircle, Sparkles, RefreshCw } from "lucide-react";
import { MOCK_CV_SCORE } from "./mockData";
import { ScoreProgressBox } from "./ScoreProgressBox";
import type { CvScoreData } from "./types";

/**
 * CvScoringTab:
 * Tab Chấm điểm CV trong Sidebar:
 * - Điểm số tổng quan và phân tích ngắn gọn.
 * - Độ phủ kỹ năng phù hợp và còn thiếu.
 * - Tiến độ so sánh chỉ hiển thị khi có dữ liệu thực tế.
 */
export const CvScoringTab: React.FC = () => {
  const [scoreData, setScoreData] = useState<CvScoreData | null>(MOCK_CV_SCORE);
  const [isLoading, setIsLoading] = useState(false);

  const handleReScore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (scoreData) {
        const nextScore = Math.min(100, scoreData.currentScore + 4);
        setScoreData({
          ...scoreData,
          currentScore: nextScore,
          history: [
            ...(scoreData.history || []),
            {
              id: `score-h-${Date.now()}`,
              score: nextScore,
              assessedAt: "Vừa xong",
              summary: "Đã cập nhật sau khi bạn áp dụng các đề xuất viết lại.",
            },
          ],
        });
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 p-4 text-center">
        <Sparkles className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs font-medium text-text-muted">
          AI đang phân tích và chấm điểm hồ sơ CV...
        </p>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 p-4 text-center">
        <Award className="h-8 w-8 text-text-muted/60" />
        <p className="text-xs font-bold text-text-main">Chưa có kết quả chấm điểm</p>
        <p className="text-[11px] text-text-muted max-w-xs">
          Nhấn nút bên dưới để hệ thống đối chiếu CV với tiêu chuẩn thị trường và cho điểm chi tiết.
        </p>
        <button
          type="button"
          onClick={handleReScore}
          className="mt-1 flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Chấm điểm CV ngay
        </button>
      </div>
    );
  }

  const { currentScore, summaryExplanation, matchedSkills, missingSkills, history } =
    scoreData;

  return (
    <div className="space-y-4">
      {/* 1. Điểm tổng quan */}
      <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-surface p-4 text-center shadow-xs">
        <div className="relative mb-2 flex size-18 items-center justify-center rounded-full border-4 border-primary/20 bg-surface shadow-inner">
          <span className="text-2xl font-black text-primary">{currentScore}</span>
          <span className="absolute -bottom-1 rounded-full bg-primary px-1.5 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider">
            /100
          </span>
        </div>

        <h3 className="text-xs font-bold text-text-main">
          {currentScore >= 80
            ? "Hồ sơ CV ấn tượng"
            : currentScore >= 65
              ? "Hồ sơ CV tiềm năng"
              : "Cần cải thiện thêm"}
        </h3>

        <p className="mt-1.5 text-[11px] text-text-muted leading-relaxed">
          {summaryExplanation}
        </p>
      </div>

      {/* 2. Kỹ năng phù hợp & Kỹ năng còn thiếu - Render động */}
      <div className="space-y-3 rounded-xl border border-border bg-surface p-3 text-xs shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
          Độ phủ kỹ năng
        </h4>

        {/* Kỹ năng phù hợp */}
        {matchedSkills && matchedSkills.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-status-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Kỹ năng phù hợp ({matchedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchedSkills.map((sk) => (
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
        {missingSkills && missingSkills.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <XCircle className="h-3.5 w-3.5 text-text-muted/80" />
              <span>Kỹ năng còn thiếu ({missingSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missingSkills.map((sk) => (
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

      {/* 3. Khối so sánh tiến độ */}
      <ScoreProgressBox history={history} />

      {/* 4. Footer hành động */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-text-muted">
        <span>
          Điểm hiện tại: <strong className="text-text-main">{currentScore}/100</strong>
        </span>
        <button
          type="button"
          onClick={handleReScore}
          className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Chấm điểm lại
        </button>
      </div>
    </div>
  );
};
