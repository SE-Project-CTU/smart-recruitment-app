import React, { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  Edit3,
  Download,
  FolderKanban,
  AlertCircle,
  FileText,
  Calendar,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { useCvDetail } from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import { CvPreviewWorkspace } from "@/features/cv";
import { getTimeAgo } from "@/utils/helper";

export interface CandidateCvPreviewViewProps {
  mode?: "preview" | "save-success";
  cvId?: string;
}

export const CandidateCvPreviewView: React.FC<CandidateCvPreviewViewProps> = ({
  mode = "preview",
  cvId: propCvId,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cvId = propCvId || searchParams.get("id");

  const printRef = useRef<HTMLDivElement>(null);

  const {
    data: cvData,
    isLoading,
    isError,
    refetch,
  } = useCvDetail(cvId || undefined);

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: cvData?.title
      ? `SmartHire_CV_${cvData.title}`
      : "SmartHire_CV",
  });

  const isSaveSuccess = mode === "save-success";

  // 1. Không có cvId
  if (!cvId) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-error/10 text-status-error">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-text-main">
          Không tìm thấy mã CV
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Đường dẫn không hợp lệ hoặc thiếu thông tin định danh hồ sơ CV.
        </p>
        <button
          type="button"
          onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
          className="mt-6 flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-xs transition-colors hover:bg-primary-dark"
        >
          <FolderKanban className="size-4" />
          Quay lại danh sách CV
        </button>
      </div>
    );
  }

  // 2. Đang tải dữ liệu CV
  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center p-16 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-text-muted">
          {isSaveSuccess
            ? "Đang tải thông tin bản in CV..."
            : "Đang tải thông tin hồ sơ CV..."}
        </p>
      </div>
    );
  }

  // 3. Lỗi khi nạp dữ liệu CV
  if (isError || !cvData) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-status-error/10 text-status-error">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-text-main">
          Không thể tải dữ liệu CV
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Đã có lỗi xảy ra khi nạp dữ liệu hồ sơ. Vui lòng kiểm tra lại kết nối
          mạng.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main shadow-xs transition-colors hover:bg-bg"
          >
            <RotateCw className="size-4 text-text-muted" />
            Thử lại
          </button>
          <button
            type="button"
            onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-xs transition-colors hover:bg-primary-dark"
          >
            <FolderKanban className="size-4" />
            Danh sách CV
          </button>
        </div>
      </div>
    );
  }

  // 4. Hiển thị thông tin CV và khu vực xem trước A4
  return (
    <div className="space-y-6 pb-12">
      {/* Header Toolbar */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-xs md:p-6">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-3.5">
            <div>
              {isSaveSuccess && (
                <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-status-success/10 px-2.5 py-0.5 text-xs font-semibold text-status-success">
                  <CheckCircle2 className="size-3.5" />
                  Đã lưu thành công
                </div>
              )}

              <h1 className="text-lg font-bold tracking-tight text-text-main md:text-xl">
                {cvData.title || "Hồ sơ CV của bạn"}
              </h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <FileText className="size-3.5" />
                  Mẫu: {cvData.template?.name || "Modern Two Column"}
                </span>
                {cvData.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    Cập nhật {getTimeAgo(cvData.updatedAt)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span
                    className={`inline-block size-2 rounded-full ${
                      cvData.isPublic ? "bg-status-success" : "bg-text-muted"
                    }`}
                  />
                  {cvData.isPublic ? "Công khai" : "Riêng tư"}
                </span>
              </div>
            </div>
          </div>

          {/* Cụm 3 nút hành động chính */}
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`${PATHS.CANDIDATE.EDIT_CV}?id=${cvId}`)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main shadow-xs transition-all hover:border-primary/40 hover:bg-bg sm:flex-initial"
              title="Quay lại giao diện chỉnh sửa CV"
            >
              <Edit3 className="size-4 text-text-muted" />
              Chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-status-success px-5 py-2.5 text-sm font-semibold text-surface shadow-xs transition-all hover:bg-green-600 sm:flex-initial"
              title="Tải về máy định dạng bản in PDF chuẩn A4"
            >
              <Download className="size-4" />
              Tải về (PDF)
            </button>

            <button
              type="button"
              onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-xs transition-all hover:bg-primary-dark sm:flex-initial"
              title="Đi tới danh sách quản lý CV"
            >
              <FolderKanban className="size-4" />
              Quản lý CV
            </button>
          </div>
        </div>
      </div>

      {/* Khu vực trang giấy A4 trực quan */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <div className="flex items-center justify-start gap-2 border-b border-border px-6 py-3.5">
          <FileText className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-text-muted uppercase">
            {isSaveSuccess ? "Bản in CV vừa lưu" : "Bản xem trước CV"}
          </h2>
        </div>

        <div className="bg-slate-100 p-4 md:p-8">
          <CvPreviewWorkspace
            data={cvData}
            contentRef={printRef}
            className="bg-transparent! p-0!"
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateCvPreviewView;
