import React from "react";
import { History, TrendingUp } from "lucide-react";
import type { CvScoreHistoryItem } from "./types";

interface ScoreProgressBoxProps {
  history?: CvScoreHistoryItem[];
}

export const ScoreProgressBox: React.FC<ScoreProgressBoxProps> = ({ history }) => {
  // Chỉ so sánh trước và sau khi có ít nhất 2 lần đánh giá thực tế
  const hasHistoryComparison = Array.isArray(history) && history.length >= 2;
  const previousItem = hasHistoryComparison ? history[history.length - 2] : null;
  const currentItem = hasHistoryComparison ? history[history.length - 1] : null;
  const scoreDiff =
    previousItem && currentItem ? currentItem.score - previousItem.score : 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-xs shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-main">
          <History className="h-3.5 w-3.5 text-primary" />
          Tiến độ cải thiện
        </h4>
      </div>

      {hasHistoryComparison ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-bg p-2.5 text-xs">
            <div>
              <span className="text-[10px] text-text-muted block">Lần trước</span>
              <span className="font-bold text-text-main">{previousItem?.score}/100</span>
            </div>
            <div className="flex items-center gap-1">
              {scoreDiff > 0 ? (
                <span className="flex items-center gap-0.5 font-bold text-status-success text-xs">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{scoreDiff} điểm
                </span>
              ) : scoreDiff === 0 ? (
                <span className="text-xs text-text-muted">Không đổi</span>
              ) : (
                <span className="text-xs text-status-error">{scoreDiff} điểm</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-muted block">Hiện tại</span>
              <span className="font-bold text-primary">{currentItem?.score}/100</span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted italic text-center">
            Dữ liệu so sánh giữa 2 lần đánh giá thực tế gần nhất.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-bg/60 p-3 text-center text-text-muted">
          <p className="text-[11px] font-medium">Chưa đủ dữ liệu so sánh</p>
          <p className="mt-0.5 text-[10px]">
            Cần ít nhất 2 lần chấm điểm thực tế sau khi bạn chỉnh sửa CV để so sánh kết quả.
          </p>
        </div>
      )}
    </div>
  );
};
