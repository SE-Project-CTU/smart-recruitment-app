import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, FileSearch, ArrowLeft, LayoutTemplate } from "lucide-react";
import { CVBuilderFormContainer } from "@/features/cv-builder/components/CVBuilderFormContainer";
import { useCvDetail } from "@/hooks/queries/useCv";
import { Button } from "@/components/common";
import { PATHS } from "@/constants/paths";
import { getApiErrorMessage } from "@/api/errorHandler";

export default function CVBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cvId = searchParams.get("id")?.trim() || "";

  // Lấy dữ liệu từ TanStack Query (hit cache khi vừa tạo mới, hoặc fetch API khi mở trực tiếp/F5)
  const {
    data: cvData,
    isLoading,
    isError,
    error,
  } = useCvDetail(cvId || undefined);

  // Trạng thái đang tải dữ liệu CV từ Backend
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-white-blue">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-text-muted">
            Đang nạp dữ liệu hồ sơ CV...
          </p>
        </div>
      </div>
    );
  }

  // 1. Không tìm thấy mã định danh trên URL
  if (!cvId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-white-blue p-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8 text-center shadow-md">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-status-warning/10 text-status-warning">
            <FileSearch className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-text-main">
            Không tìm thấy hồ sơ CV
          </h2>
          <p className="text-xs text-text-muted">
            Đường dẫn không hợp lệ hoặc thiếu mã định danh hồ sơ CV. Vui lòng chọn một CV từ danh sách hoặc tạo mới từ mẫu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
              className="rounded-xl! px-4! py-2! text-xs!"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Danh sách CV của tôi
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
              className="rounded-xl! px-4! py-2! text-xs!"
            >
              <LayoutTemplate className="mr-1.5 size-3.5" />
              Khám phá mẫu CV
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Không có dữ liệu hoặc API trả về lỗi (hiển thị thông báo theo mã lỗi Backend)
  if (isError || !cvData) {
    const errorMessage = getApiErrorMessage(
      error,
      "Không tìm thấy hồ sơ CV hoặc bạn không có quyền truy cập.",
    );

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-white-blue p-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-8 text-center shadow-md">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-status-error/10 text-status-error">
            <AlertCircle className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-text-main">
            Không tìm thấy hồ sơ CV
          </h2>
          <p className="text-xs text-text-muted">
            {errorMessage}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
              className="rounded-xl! px-4! py-2! text-xs!"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Danh sách CV của tôi
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
              className="rounded-xl! px-4! py-2! text-xs!"
            >
              <LayoutTemplate className="mr-1.5 size-3.5" />
              Tạo CV từ mẫu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Có dữ liệu CV hợp lệ -> Hiển thị CV Builder Form
  return (
    <div className="flex min-h-screen flex-col bg-bg-white-blue font-sans text-text-main">
      <CVBuilderFormContainer
        key={cvData.id}
        initialData={cvData}
        cvId={cvData.id}
      />
    </div>
  );
}
