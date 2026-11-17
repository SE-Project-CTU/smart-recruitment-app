import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  FileText,
  Briefcase,
  Info,
} from "lucide-react";
import { useCvRewriteContext } from "../../context/CvRewriteContext";
import { scrollCvSectionIntoView } from "../../utils/cvAssistantHelpers";
import { cn } from "@/lib/utils";

interface SectionTabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  aliasKeys?: string[];
}

const SECTION_TABS: SectionTabItem[] = [
  { key: "objective", label: "Objective" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "certifications", label: "Certificates" },
  {
    key: "others",
    label: "Others",
    aliasKeys: ["awards", "interests", "additionalInfo"],
  },
];

/**
 * CvComparisonSidePanel:
 * Bảng so sánh gợi ý viết lại CV phẳng, tối giản (flat UI), không lồng ghép nhiều tầng thẻ/border.
 * - Header: Tiêu đề "So sánh gợi ý", chỉ số đếm (ví dụ: 2/7), nút Đóng.
 * - Danh mục pills nằm ngang cho phép chuyển nhanh giữa các mục.
 * - Accordion "Công việc mục tiêu • Chỉnh yêu cầu".
 * - Khối "Nội dung hiện tại" (1 layer).
 * - Khối "AI đề xuất" (1 layer).
 * - Khối "Đã thay đổi: ..." xanh lá mạ nhẹ (1 layer).
 * - Accordion "Cần bổ sung thông tin".
 * - Thanh nút cố định dưới đáy: "Bỏ qua" và "Áp dụng vào CV".
 */
export const CvComparisonSidePanel: React.FC = () => {
  const {
    activeSuggestionSectionKey,
    getSuggestionForSection,
    openSuggestionForSection,
    closeFloatingSuggestion,
    selectedTargetJob,
  } = useCvRewriteContext();

  const [isJobAccordionOpen, setIsJobAccordionOpen] = useState(false);
  const [isAdditionalAccordionOpen, setIsAdditionalAccordionOpen] =
    useState(false);

  const suggestion = activeSuggestionSectionKey
    ? getSuggestionForSection(activeSuggestionSectionKey)
    : undefined;

  // Lắng nghe phím Escape để đóng panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFloatingSuggestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeFloatingSuggestion]);

  if (!activeSuggestionSectionKey || !suggestion) {
    return null;
  }

  const improvementsList = suggestion.reason
    ? suggestion.reason
        .split(" • ")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const mainImprovementText =
    improvementsList[0] ||
    "Làm rõ và tối ưu hóa nội dung theo chuẩn Google XYZ";

  const additionalList = suggestion.additionalSuggestions || [];

  // Chuyển tab danh mục
  const handleTabClick = (tab: SectionTabItem) => {
    let matchedKey = tab.key;

    if (!document.querySelector(`.section-${tab.key}`) && tab.aliasKeys) {
      for (const alias of tab.aliasKeys) {
        if (document.querySelector(`.section-${alias}`)) {
          matchedKey = alias;
          break;
        }
      }
    }

    scrollCvSectionIntoView(matchedKey);

    const targetSug = getSuggestionForSection(matchedKey);
    if (targetSug) {
      openSuggestionForSection(matchedKey);
    }
  };

  return (
    <aside
      aria-label="So sánh gợi ý viết lại CV"
      className={cn(
        "no-print z-40 flex flex-col border-l border-slate-200/90 bg-slate-50/60 shadow-lg transition-all duration-150",
        // Desktop: cột bên phải cố định chiều rộng phẳng, thanh thoát
        "h-full w-full shrink-0 lg:w-[440px] xl:w-[480px]",
        // Mobile / Tablet hẹp: overlay phủ toàn màn hình
        "fixed inset-0 lg:static lg:inset-auto",
      )}
    >
      {/* ================= 1. HEADER PANEL ================= */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Nút quay lại trên mobile */}
          <button
            type="button"
            onClick={closeFloatingSuggestion}
            className="flex cursor-pointer items-center justify-center rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Quay lại CV"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Gợi ý cải thiện nội dung
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeFloatingSuggestion}
            className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title="Đóng bảng so sánh (Esc)"
          >
            <X className="size-3.5" />
            <span>Đóng</span>
          </button>
        </div>
      </div>

      {/* ================= 2. THANH TAB DANH MỤC PILLS NẰM NGANG ================= */}
      <div className="no-scrollbar flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 select-none">
        {SECTION_TABS.map((tab) => {
          const isSelected =
            activeSuggestionSectionKey === tab.key ||
            Boolean(
              tab.aliasKeys &&
              activeSuggestionSectionKey &&
              tab.aliasKeys.includes(activeSuggestionSectionKey),
            );

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs whitespace-nowrap transition-all",
                isSelected
                  ? "border border-blue-600 bg-blue-50/50 font-semibold text-blue-700 shadow-2xs"
                  : "border border-transparent font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 3. THÂN PANEL (CUỘN ĐỘC LẬP) ================= */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
        {/* Accordion: Công việc mục tiêu • Chỉnh yêu cầu */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setIsJobAccordionOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:text-slate-900"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <Briefcase className="size-3.5 shrink-0 text-slate-500" />
              <span className="truncate">
                {selectedTargetJob
                  ? `Công việc mục tiêu: ${selectedTargetJob.title}`
                  : "Công việc mục tiêu • Chỉnh yêu cầu"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                isJobAccordionOpen && "rotate-180",
              )}
            />
          </button>

          {isJobAccordionOpen && selectedTargetJob && (
            <div className="space-y-1.5 border-t border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                {selectedTargetJob.companyName}
              </p>
              {selectedTargetJob.description && (
                <p className="line-clamp-4 text-[11px] leading-relaxed">
                  {selectedTargetJob.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Khối: Nội dung hiện tại (1 layer phẳng, bo góc nhẹ) */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <FileText className="size-3.5 text-slate-600" />
            <span>Nội dung hiện tại</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed whitespace-pre-line text-slate-700 shadow-2xs select-text">
            {suggestion.originalText ||
              "Mục này hiện chưa có nội dung trong CV."}
          </div>
        </div>

        {/* Khối: AI đề xuất (1 layer phẳng, bo góc nhẹ) */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-700">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>AI đề xuất</span>
          </div>
          <div className="rounded-lg border border-blue-200 bg-white p-3 text-xs leading-relaxed whitespace-pre-line text-slate-900 shadow-2xs select-text">
            {suggestion.suggestedText}
          </div>
        </div>

        {/* Banner: Đã thay đổi: ... (1 layer xanh lá mạ nhẹ) */}
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div className="leading-relaxed">
            <span className="font-semibold">Đã thay đổi: </span>
            <span>{mainImprovementText}</span>
          </div>
        </div>

        {/* Accordion: Cần bổ sung thông tin (1 layer phẳng) */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setIsAdditionalAccordionOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:text-slate-900"
          >
            <div className="flex items-center gap-2">
              <Info className="size-3.5 text-slate-500" />
              <span>Cần bổ sung thông tin</span>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 text-slate-400 transition-transform duration-200",
                isAdditionalAccordionOpen && "rotate-180",
              )}
            />
          </button>

          {isAdditionalAccordionOpen && (
            <div className="space-y-1.5 border-t border-slate-100 bg-slate-50/40 p-3 text-xs text-slate-600">
              {additionalList.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-[11px] text-slate-700">
                  {additionalList.map((item: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Không có yêu cầu bổ sung thêm cho mục này.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
