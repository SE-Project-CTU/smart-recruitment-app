import { useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { useReactToPrint } from "react-to-print";
import CvBuilderEditorToolbar from "@/components/pages/cv-builder/cv-builder-editor-toolbar";
import CvBuilderTopBar from "@/components/pages/cv-builder/cv-builder-top-bar";
import CvBuilderWorkspace from "@/components/pages/cv-builder/cv-builder-workspace";

// ==========================================
// 1. TYPES & INITIAL DATA
// ==========================================

interface CVPresentation {
  themeColor: string;
  fontFamily: string;
}

const THEME_COLORS = [
  { name: "SmartHire Navy (Primary)", value: "#1B3B6F", light: "#D6F1FC" },
  { name: "SmartHire Sky (Secondary)", value: "#0284C7", light: "#E0F2FE" },
  { name: "Emerald Professional", value: "#047857", light: "#D1FAE5" },
  { name: "Slate Minimal", value: "#334155", light: "#F1F5F9" },
];

const FONT_OPTIONS = [
  { name: "Inter (Hiện đại)", value: "'Inter', sans-serif" },
  { name: "Roboto (Tiêu chuẩn)", value: "'Roboto', sans-serif" },
  { name: "Merriweather (Cổ điển)", value: "'Merriweather', serif" },
];

export default function CVBuilder() {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const [profile, setProfile] = useState({
    fullName: "NGUYỄN ĐỖ PHƯỚC LÊ",
    jobTitle: "Senior Full-stack Engineer",
    email: "lephuoc@smarthire.com",
    phone: "0987 461 234",
    location: "Quận Ninh Kiều, TP. Cần Thơ",
    website: "github.com/phuocle-smarthire",
  });

  const [presentation, setPresentation] = useState<CVPresentation>({
    themeColor: "#1B3B6F",
    fontFamily: "'Inter', sans-serif",
  });

  const cvPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = useReactToPrint({
    contentRef: cvPrintRef,
    documentTitle: `SmartHire_CV_${profile.fullName.replace(/\s+/g, "_")}`,
  });

  void setActiveEditor;
  void setProfile;

  return (
    <div className="flex min-h-screen flex-col bg-bg-white-blue font-sans text-text-main">
      {/* 
        CSS ĐỒNG BỘ 1:1 GIỮA MÀN HÌNH VÀ KHI IN A4:
        - Đặt @page margin = 0mm ở chiều ngang và dùng padding của container
          để 297mm trên màn hình khớp chính xác với 1 trang A4 khi xuất PDF.
        - Chỉ chống cắt đứt dòng ở từng thẻ nhỏ (li, p, h3) thay vì khóa cứng cả khối lớn.
      */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm 0mm 14mm 0mm;
          }
          @page :first {
            margin-top: 0mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: var(--color-surface) !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            min-height: auto !important;
          }
          /* Giữ tiêu đề mục không bị nằm lẻ loi ở cuối trang 1 mà nội dung ở trang 2 */
          .cv-section-header,
          .cv-prose h3 {
            break-after: avoid-page;
            page-break-after: avoid;
          }
          /* Chống cắt đôi từng gạch đầu dòng hoặc đoạn văn */
          .cv-prose li,
          .cv-prose p,
          .cv-prose h3 {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Hỗ trợ ngắt trang chủ động do người dùng chọn */
          .print-page-break-before {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      <CvBuilderTopBar
        isCompleted={isCompleted}
        onComplete={() => setIsCompleted(true)}
        onEdit={() => setIsCompleted(false)}
        onDownload={handleDownloadPdf}
      />
      <CvBuilderEditorToolbar
        isCompleted={isCompleted}
        activeEditor={activeEditor}
        presentation={presentation}
        themeColors={THEME_COLORS}
        fontOptions={FONT_OPTIONS}
        onPresentationChange={setPresentation}
        onAddSection={() => {}}
      />
      <CvBuilderWorkspace />
    </div>
  );
}
