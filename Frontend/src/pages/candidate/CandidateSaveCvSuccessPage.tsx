import React, { useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  CheckCircle2,
  Edit3,
  Download,
  FolderKanban,
  ArrowLeft,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { useCvDetail } from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import { CvPreviewWorkspace } from "@/components/pages/cv-builder/CvPreviewWorkspace";
import { getTimeAgo } from "@/utils/helper";

export const CandidateSaveCvSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cvId = searchParams.get("id");

  const printRef = useRef<HTMLDivElement>(null);

  const { data: cvData, isLoading, isError } = useCvDetail(cvId || undefined);

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: cvData?.title
      ? `SmartHire_CV_${cvData.title}`
      : "SmartHire_CV",
  });

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

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center p-12 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-text-muted">
          Đang tải thông tin bản in CV...
        </p>
      </div>
    );
  }

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
          Đã có lỗi xảy ra khi nạp dữ liệu hồ sơ. Vui lòng thử lại sau.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${PATHS.CANDIDATE.EDIT_CV}?id=${cvId}`)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main shadow-xs transition-colors hover:bg-bg"
          >
            <Edit3 className="size-4 text-text-muted" />
            Thử chỉnh sửa lại
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

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner thông báo thành công */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-xs md:p-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div>
              <div className="text-md inline-flex items-center gap-1.5 font-semibold text-status-success">
                Đã lưu thành công
              </div>
              <h1 className="mt-1.5 text-xl font-bold tracking-tight text-text-main md:text-2xl">
                {cvData.title || "Hồ sơ CV của bạn"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
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

          {/* 2. Nhóm 3 nút hành động chính theo yêu cầu */}
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
              title="Đi tới trang danh sách quản lý CV"
            >
              <FolderKanban className="size-4" />
              Tới trang quản lý CV
            </button>
          </div>
        </div>
      </div>

      {/* 3. Khu vực xem trước trang giấy A4 trực quan */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
        <div className="flex items-center justify-start gap-2.5 border-b border-border px-6 py-4">
          <FileText className="size-4 text-primary" />
          <h2 className="text-sm font-bold text-text-main">
            Bản in CV vừa lưu
          </h2>
        </div>

        <div className="bg-slate-100 p-4 md:p-8">
          <CvPreviewWorkspace
            data={cvData}
            contentRef={printRef}
            className="bg-transparent!"
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateSaveCvSuccessPage;
