import React, { useState, useRef, useEffect } from "react";
import { ModernTwoColumnTemplate } from "@/components/pages/cv-builder/templates/ModernTwoColumn";
import { MOCK_CV_DETAIL } from "@/constants/mockCvData";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { useReactToPrint } from "react-to-print";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  GripVertical,
  CheckCircle2,
  Download,
  Edit3,
  Palette,
  Type,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileCheck,
  Undo,
  Redo,
  SeparatorHorizontal,
} from "lucide-react";

// ==========================================
// 1. TYPES & INITIAL DATA
// ==========================================
interface CVSection {
  id: string;
  title: string;
  content: string;
  pageBreakBefore?: boolean; // Cho phép người dùng chủ động đẩy mục này sang trang mới
}

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

const INITIAL_SECTIONS: CVSection[] = [
  {
    id: "sec-summary",
    title: "MỤC TIÊU NGHỀ NGHIỆP",
    content: `<p>Kỹ sư Phần mềm Full-stack với hơn <strong>3 năm kinh nghiệm</strong> phát triển các ứng dụng web quy mô lớn trên nền tảng React, TypeScript và .NET Core. Mong muốn gia nhập hệ sinh thái <strong>SmartHire</strong> ở vị trí Senior Frontend Engineer để tối ưu hóa trải nghiệm người dùng và xây dựng các tính năng tích hợp AI đột phá.</p>`,
  },
  {
    id: "sec-experience",
    title: "KINH NGHIỆM LÀM VIỆC",
    content: `
      <h3><strong>Senior Frontend Developer | TechNova Solutions</strong> (06/2024 - Hiện tại)</h3>
      <ul>
        <li>Kiến trúc và phát triển hệ thống Quản trị Tuyển dụng thông minh phục vụ hơn <strong>50,000 người dùng</strong> hàng tháng bằng React 19, TypeScript và Tailwind CSS.</li>
        <li>Xây dựng trình tạo CV trực tuyến (WYSIWYG) tích hợp <em>Tiptap Editor</em> và kéo thả <em>Drag & Drop</em>, giúp tăng 45% tỷ lệ hoàn thành hồ sơ của ứng viên.</li>
        <li>Tối ưu hóa hiệu suất render và đóng gói với Vite, giảm thời gian tải trang lần đầu (FCP) từ 2.4s xuống 0.9s.</li>
      </ul>
      <p></p>
      <h3><strong>Full-stack Web Developer | CloudWorks Vietnam</strong> (03/2022 - 05/2024)</h3>
      <ul>
        <li>Phát triển RESTful APIs bằng ASP.NET Core và Entity Framework Core, thiết kế cơ sở dữ liệu PostgreSQL tối ưu cho các truy vấn tìm kiếm phức tạp.</li>
        <li>Tích hợp hệ thống thông báo thời gian thực (Realtime Notification) qua WebSocket/SignalR cho luồng cập nhật trạng thái duyệt CV.</li>
        <li>Phối hợp chặt chẽ với đội ngũ UI/UX để xây dựng Design System đồng nhất trên toàn bộ sản phẩm.</li>
      </ul>
    `,
  },
  {
    id: "sec-projects",
    title: "DỰ ÁN TIÊU BIỂU",
    content: `
      <h3><strong>SmartHire - Nền tảng Tuyển dụng & Đánh giá CV bằng AI</strong> (2025 - 2026)</h3>
      <p><em>Vai trò: Lead Frontend Developer | Công nghệ: React 19, Tiptap, Zustand, TanStack Query, .NET 8, pgvector</em></p>
      <ul>
        <li>Xây dựng giao diện phân tích và chấm điểm mức độ phù hợp giữa CV và JD theo thời gian thực dựa trên Vector Embedding.</li>
        <li>Thiết kế luồng tạo, quản lý phiên bản CV (CV Versioning) và xuất file PDF chuẩn kích thước A4 với độ nét cao.</li>
      </ul>
      <p></p>
      <h3><strong>E-Learning Interactive Platform</strong> (2023 - 2024)</h3>
      <p><em>Vai trò: Frontend Developer | Công nghệ: React, TypeScript, Framer Motion, Tailwind CSS</em></p>
      <ul>
        <li>Phát triển giao diện học trực tuyến tương tác cao, hỗ trợ ghi chú trực tiếp trên bài giảng và xuất tài liệu học tập cá nhân.</li>
      </ul>
    `,
  },
  {
    id: "sec-skills",
    title: "KỸ NĂNG CHUYÊN MÔN",
    content: `
      <ul>
        <li><strong>Ngôn ngữ lập trình:</strong> TypeScript, JavaScript (ES6+), C#, SQL, HTML5/CSS3.</li>
        <li><strong>Frontend Frameworks & Libraries:</strong> React 19, Next.js, Zustand, TanStack React Query, Tailwind CSS, Tiptap, Framer Motion.</li>
        <li><strong>Backend & Database:</strong> .NET Core, Entity Framework Core, PostgreSQL, Redis, RESTful API, WebSocket.</li>
        <li><strong>Công cụ & DevOps:</strong> Git, Docker, Vite, Figma, CI/CD (GitHub Actions).</li>
      </ul>
    `,
  },
  {
    id: "sec-education",
    title: "HỌC VẤN & CHỨNG CHỈ",
    content: `
      <h3><strong>Cử nhân Kỹ thuật Phần mềm - Đại học Công nghệ Thông tin</strong> (2018 - 2022)</h3>
      <ul>
        <li>Điểm trung bình (GPA): <strong>3.6/4.0</strong> - Tốt nghiệp loại Giỏi.</li>
        <li>Đề tài tốt nghiệp: <em>Ứng dụng xử lý ngôn ngữ tự nhiên (NLP) trong hệ thống gợi ý việc làm tự động (Đạt 9.5/10).</em></li>
      </ul>
      <p></p>
      <h3><strong>Chứng chỉ Quốc tế & Giải thưởng</strong></h3>
      <ul>
        <li>Chứng chỉ tiếng Anh <strong>IELTS 7.5</strong> (Giao tiếp và đọc hiểu tài liệu chuyên ngành thành thạo).</li>
        <li>Giải Nhì cuộc thi Hackathon Công nghệ Tuyển dụng số năm 2024.</li>
      </ul>
    `,
  },
];

// ==========================================
// 2. COMPONENT CON: TỪNG KHỐI TIPTAP TRÊN A4
// ==========================================
interface SectionEditorProps {
  section: CVSection;
  isEditable: boolean;
  themeColor: string;
  onUpdateContent: (id: string, html: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onTogglePageBreak: (id: string) => void;
  onFocusEditor: (editor: Editor) => void;
  onDeleteSection: (id: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const CVSectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isEditable,
  themeColor,
  onUpdateContent,
  onUpdateTitle,
  onTogglePageBreak,
  onFocusEditor,
  onDeleteSection,
  dragHandleProps,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color, FontFamily],
    content: section.content,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      onUpdateContent(section.id, editor.getHTML());
    },
    onFocus: ({ editor }) => {
      onFocusEditor(editor);
    },
    editorProps: {
      attributes: {
        class:
          "cv-prose prose prose-sm max-w-none focus:outline-none text-text-main leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-base [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:my-1",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  return (
    <div
      className={`group relative -mx-3 mb-5 rounded-xl px-3 py-1.5 transition-shadow duration-200 ${
        section.pageBreakBefore ? "print-page-break-before" : ""
      } ${
        isEditable
          ? "focus-within:ring-2 focus-within:ring-primary hover:ring-2 hover:ring-secondary"
          : ""
      }`}
    >
      {/* Badge báo hiệu mục này đã được gắn lệnh đẩy sang trang mới */}
      {section.pageBreakBefore && (
        <div className="no-print mb-2 flex items-center justify-between rounded bg-secondary-light px-2.5 py-1 text-[11px] font-medium text-primary">
          <span className="flex items-center gap-1.5">
            <SeparatorHorizontal className="h-3.5 w-3.5" />
            Mục này sẽ luôn bắt đầu ở đầu trang A4 mới khi in
          </span>
          {isEditable && (
            <button
              type="button"
              onClick={() => onTogglePageBreak(section.id)}
              className="underline hover:text-status-error"
            >
              Hủy ngắt trang
            </button>
          )}
        </div>
      )}

      {/* Nút điều khiển Kéo thả, Ngắt trang & Xóa mục */}
      {isEditable && (
        <div className="no-print absolute top-2 -left-10 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <div
            {...dragHandleProps}
            title="Kéo để đổi vị trí mục"
            className="cursor-grab rounded-lg border border-border bg-surface p-1.5 text-text-muted shadow-sm hover:text-primary active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={() => onTogglePageBreak(section.id)}
            title="Đẩy mục này sang đầu trang A4 tiếp theo"
            className={`rounded-lg border border-border p-1.5 shadow-sm transition-colors ${
              section.pageBreakBefore
                ? "bg-primary text-surface"
                : "bg-surface text-text-muted hover:text-primary"
            }`}
          >
            <SeparatorHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            title="Xóa mục này"
            className="rounded-lg border border-border bg-surface p-1.5 text-status-error shadow-sm hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tiêu đề mục: Giữ nguyên thẻ input (dùng readOnly khi khóa) để không bị lệch 1px chiều cao nào */}
      <div
        className="cv-section-header mb-2.5 flex items-center gap-2 border-b-2 pb-1.5"
        style={{ borderColor: themeColor }}
      >
        <input
          type="text"
          readOnly={!isEditable}
          value={section.title}
          onChange={(e) => onUpdateTitle(section.id, e.target.value)}
          className={`w-full bg-transparent text-base font-bold tracking-wide uppercase focus:outline-none ${
            !isEditable ? "pointer-events-none cursor-default" : ""
          }`}
          style={{ color: themeColor }}
        />
      </div>

      {/* Nội dung Tiptap Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

// ==========================================
// 3. COMPONENT CHÍNH: TRANG CV BUILDER
// ==========================================
export default function CVBuilder() {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"editor" | "preview-template">("preview-template");
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const [profile, setProfile] = useState({
    fullName: "NGUYỄN ĐỖ PHƯỚC LÊ",
    jobTitle: "Senior Full-stack Engineer",
    email: "lephuoc@smarthire.com",
    phone: "0987 461 234",
    location: "Quận Ninh Kiều, TP. Cần Thơ",
    website: "github.com/phuocle-smarthire",
  });

  const [sections, setSections] = useState<CVSection[]>(INITIAL_SECTIONS);
  const [presentation, setPresentation] = useState<CVPresentation>({
    themeColor: "#1B3B6F",
    fontFamily: "'Inter', sans-serif",
  });

  const cvPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = useReactToPrint({
    contentRef: cvPrintRef,
    documentTitle: `SmartHire_CV_${profile.fullName.replace(/\s+/g, "_")}`,
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isCompleted) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
  };

  const updateSectionContent = (id: string, html: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, content: html } : sec)),
    );
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, title } : sec)),
    );
  };

  const toggleSectionPageBreak = (id: string) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, pageBreakBefore: !sec.pageBreakBefore } : sec,
      ),
    );
  };

  const addNewSection = () => {
    const newSec: CVSection = {
      id: `sec-${Date.now()}`,
      title: "MỤC MỚI (NHẤP ĐỂ SỬA)",
      content:
        "<p>Nhập nội dung chi tiết cho mục này (Chứng chỉ, Hoạt động ngoại khóa, Người tham chiếu...)</p>",
    };
    setSections((prev) => [...prev, newSec]);
  };

  const deleteSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

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

      {/* ================= TOP NAVBAR ================= */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-secondary shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">SmartHire</span>
              <span className="rounded-full bg-secondary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                CV Studio
              </span>
              <div className="ml-4 flex items-center rounded-lg border border-border bg-bg p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode("preview-template")}
                  className={`rounded-md px-3 py-1 transition-all ${viewMode === "preview-template" ? "bg-primary text-white shadow-xs" : "text-text-muted hover:text-text-main"}`}
                >
                  Template Mẫu (Mock Data)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("editor")}
                  className={`rounded-md px-3 py-1 transition-all ${viewMode === "editor" ? "bg-primary text-white shadow-xs" : "text-text-muted hover:text-text-main"}`}
                >
                  Trình soạn thảo tự do (Hiện tại)
                </button>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              {isCompleted
                ? "Chế độ Xem trước bản in (Đã khóa chỉnh sửa)"
                : "Nhấp trực tiếp vào văn bản trên trang A4 để chỉnh sửa"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => setIsCompleted(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-md transition-all hover:bg-primary-dark"
            >
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              Xác nhận hoàn tất CV
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main transition-all hover:bg-bg"
              >
                <Edit3 className="h-4 w-4 text-text-muted" />
                Chỉnh sửa lại
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf()}
                className="flex animate-pulse cursor-pointer items-center gap-2 rounded-full bg-status-success px-6 py-2.5 text-sm font-semibold text-surface shadow-md transition-all hover:animate-none hover:bg-green-600"
              >
                <Download className="h-4 w-4" />
                Tải xuống PDF (A4)
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================= TIPTAP FLOATING TOOLBAR ================= */}
      {!isCompleted && (
        <div className="no-print sticky top-15.25 z-20 flex flex-wrap items-center justify-center gap-2 border-b border-border bg-bg/95 px-6 py-2 shadow-xs backdrop-blur-md">
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => activeEditor?.chain().focus().toggleBold().run()}
              disabled={!activeEditor}
              className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
                activeEditor?.isActive("bold")
                  ? "bg-secondary text-primary"
                  : "text-text-main"
              }`}
              title="In đậm (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
              disabled={!activeEditor}
              className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
                activeEditor?.isActive("italic")
                  ? "bg-secondary text-primary"
                  : "text-text-main"
              }`}
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                activeEditor?.chain().focus().toggleUnderline().run()
              }
              disabled={!activeEditor}
              className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
                activeEditor?.isActive("underline")
                  ? "bg-secondary text-primary"
                  : "text-text-main"
              }`}
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-border" />

            <button
              type="button"
              onClick={() =>
                activeEditor?.chain().focus().toggleBulletList().run()
              }
              disabled={!activeEditor}
              className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
                activeEditor?.isActive("bulletList")
                  ? "bg-secondary text-primary"
                  : "text-text-main"
              }`}
              title="Danh sách dấu chấm"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                activeEditor?.chain().focus().toggleOrderedList().run()
              }
              disabled={!activeEditor}
              className={`rounded p-1.5 transition-colors hover:bg-secondary-light ${
                activeEditor?.isActive("orderedList")
                  ? "bg-secondary text-primary"
                  : "text-text-main"
              }`}
              title="Danh sách đánh số"
            >
              <ListOrdered className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-border" />

            <button
              type="button"
              onClick={() => activeEditor?.chain().focus().undo().run()}
              disabled={!activeEditor?.can().undo()}
              className="rounded p-1.5 text-text-main hover:bg-secondary-light disabled:opacity-40"
              title="Hoàn tác"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => activeEditor?.chain().focus().redo().run()}
              disabled={!activeEditor?.can().redo()}
              className="rounded p-1.5 text-text-main hover:bg-secondary-light disabled:opacity-40"
              title="Làm lại"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Chọn Font chữ */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 shadow-2xs">
            <Type className="h-4 w-4 text-text-muted" />
            <select
              value={presentation.fontFamily}
              onChange={(e) =>
                setPresentation((prev) => ({
                  ...prev,
                  fontFamily: e.target.value,
                }))
              }
              className="bg-transparent text-xs font-medium text-text-main focus:outline-none"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Màu chủ đạo CV */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-2xs">
            <Palette className="h-4 w-4 text-text-muted" />
            <span className="text-xs text-text-muted">Màu CV:</span>
            {THEME_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() =>
                  setPresentation((prev) => ({ ...prev, themeColor: c.value }))
                }
                className={`h-5 w-5 rounded-full transition-transform ${
                  presentation.themeColor === c.value
                    ? "scale-125 ring-2 ring-primary ring-offset-1"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          {/* Thêm mục CV mới */}
          <button
            type="button"
            onClick={addNewSection}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-secondary-light px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            Thêm mục mới
          </button>
        </div>
      )}

      {/* Banner thông báo khi đã khóa CV */}
      {isCompleted && (
        <div className="no-print flex items-center justify-center gap-2 border-b border-secondary-dark bg-secondary-light px-6 py-2.5 text-sm font-medium text-primary-dark">
          <FileCheck className="h-4 w-4 text-primary" />
          <span>
            CV của bạn đã được khóa (bố cục giữ nguyên 100% so với lúc sửa)! Hãy
            bấm <strong>Tải xuống PDF</strong> để xuất file.
          </span>
        </div>
      )}

      {/* ================= WORKSPACE: TỜ GIẤY A4 LIÊN TỤC ================= */}
      <main className="flex flex-1 justify-center overflow-x-auto px-4 py-8">
        {viewMode === "preview-template" ? (
          <div className="w-full max-w-[850px]">
            <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
              <div>
                <span className="font-bold">Đang hiển thị Template: </span>
                {MOCK_CV_DETAIL.template.name} ({MOCK_CV_DETAIL.template.code})
              </div>
              <span className="text-text-muted">Dữ liệu từ: <code>mockCvData.ts</code></span>
            </div>
            // @ts-expect-error Mock data format difference
            <ModernTwoColumnTemplate data={MOCK_CV_DETAIL as any} />
          </div>
        ) : (
          <div
            ref={cvPrintRef}
            style={{ fontFamily: presentation.fontFamily }}
            className="print-container relative min-h-[566mm] w-[210mm] border border-border bg-surface px-[18mm] py-[16mm] shadow-xl"
          >
            {/* 
              Vạch kẻ báo hiệu ranh giới ngắt sang Trang 2:
              Trang 1 có chiều cao A4 là 297mm, trừ đi lề dưới khi in (14mm) => Điểm cắt thực tế nằm ở đúng 283mm!
            */}
            <div
              className="no-print pointer-events-none absolute top-[283mm] right-0 left-0 z-10 flex justify-end border-b-2 border-dashed border-secondary-dark pr-4"
              title="Vị trí cắt trang thực tế khi xuất PDF"
            >
              <span className="rounded-t-md border border-b-0 border-secondary-dark bg-secondary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                Ranh giới cắt Trang 1 &rarr; Trang 2 khi xuất PDF
              </span>
            </div>

            {/* 1. HEADER CV: Giữ nguyên thẻ input (dùng readOnly) để chiều cao không đổi 1px nào khi khóa */}
            <div
              className="mb-6 flex flex-col items-start justify-between gap-4 border-b-4 pb-6 md:flex-row"
              style={{ borderColor: presentation.themeColor }}
            >
              <div className="w-full flex-1">
                <input
                  type="text"
                  readOnly={isCompleted}
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  className={`-mx-1 w-full rounded bg-transparent px-1 text-3xl font-extrabold tracking-tight uppercase focus:outline-none ${
                    !isCompleted
                      ? "focus:ring-2 focus:ring-secondary"
                      : "pointer-events-none cursor-default"
                  }`}
                  style={{ color: presentation.themeColor }}
                />
                <input
                  type="text"
                  readOnly={isCompleted}
                  value={profile.jobTitle}
                  onChange={(e) =>
                    setProfile({ ...profile, jobTitle: e.target.value })
                  }
                  className={`-mx-1 mt-1 w-full rounded bg-transparent px-1 text-lg font-semibold text-primary-light focus:outline-none ${
                    !isCompleted
                      ? "focus:ring-2 focus:ring-secondary"
                      : "pointer-events-none cursor-default"
                  }`}
                />
              </div>

              {/* Thông tin liên hệ */}
              <div className="grid min-w-55 grid-cols-1 gap-1.5 text-xs text-text-main">
                <div className="flex items-center gap-2">
                  <Mail
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: presentation.themeColor }}
                  />
                  <input
                    readOnly={isCompleted}
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full bg-transparent focus:underline focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: presentation.themeColor }}
                  />
                  <input
                    readOnly={isCompleted}
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full bg-transparent focus:underline focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: presentation.themeColor }}
                  />
                  <input
                    readOnly={isCompleted}
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="w-full bg-transparent focus:underline focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: presentation.themeColor }}
                  />
                  <input
                    readOnly={isCompleted}
                    value={profile.website}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                    className="w-full bg-transparent focus:underline focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. BODY CV: DANH SÁCH MỤC KÉO THẢ & TIPTAP EDITOR */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="cv-sections" isDropDisabled={isCompleted}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {sections.map((sec, index) => (
                      <Draggable
                        key={sec.id}
                        draggableId={sec.id}
                        index={index}
                        isDragDisabled={isCompleted}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={
                              snapshot.isDragging
                                ? "z-50 rounded-xl bg-surface opacity-90 shadow-2xl ring-2 ring-primary"
                                : ""
                            }
                          >
                            <CVSectionEditor
                              section={sec}
                              isEditable={!isCompleted}
                              themeColor={presentation.themeColor}
                              onUpdateContent={updateSectionContent}
                              onUpdateTitle={updateSectionTitle}
                              onTogglePageBreak={toggleSectionPageBreak}
                              onFocusEditor={setActiveEditor}
                              onDeleteSection={deleteSection}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </main>
    </div>
  );
}
