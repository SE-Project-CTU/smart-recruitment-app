import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button, UserAvatar } from "@/components/common";
import { useAuthStore } from "@/stores/authStore";
import { useMyCvs } from "@/hooks/queries/useCv";
import { useApplyJob } from "@/hooks/queries/useApplication";
import { mediaService } from "@/services/mediaService";
import { getApiErrorMessage } from "@/api/errorHandler";
import { toast } from "@/components/ui/toast";
import { PATHS } from "@/constants/paths";
import {
  useApplyJobModalStore,
  type ApplyTargetJob,
} from "@/stores/applyJobModalStore";

export interface ApplyJobModalProps {
  job?: ApplyTargetJob | null;
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function ApplyJobModal({
  job: propJob,
  open: propOpen,
  onClose: propOnClose,
  onSuccess,
}: ApplyJobModalProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Store toàn cục (nếu không truyền props)
  const globalStore = useApplyJobModalStore();
  const isControlled = propOpen !== undefined;
  const isOpen = isControlled ? propOpen : globalStore.isOpen;
  const currentJob = isControlled ? propJob : globalStore.job;

  const handleClose = () => {
    if (isControlled) {
      propOnClose?.();
    } else {
      globalStore.closeApplyModal();
    }
  };

  // 1. Dữ liệu CVs của ứng viên (chỉ query khi modal thực sự mở)
  const { data: myCvsData, isLoading: isLoadingCvs } = useMyCvs(undefined, {
    enabled: isOpen,
  });
  const cvList = myCvsData?.items ?? [];

  // 2. State hình thức nộp CV: 'online' | 'upload'
  const [cvMethod, setCvMethod] = useState<"online" | "upload">("online");
  const [selectedCvId, setSelectedCvId] = useState<string>("");

  // 3. State upload PDF
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. State thư giới thiệu (Cover letter)
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tự động chọn CV công khai hoặc CV đầu tiên khi có danh sách
  useEffect(() => {
    if (cvList.length > 0 && !selectedCvId) {
      const publicCv = cvList.find((c) => c.isPublic);
      const defaultCv = publicCv || cvList[0];
      if (defaultCv?.id) {
        setSelectedCvId(defaultCv.id);
      }
    }
  }, [cvList, selectedCvId]);

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setCoverLetter("");
      setUploadedFile(null);
      setUploadStatus("idle");
      if (cvList.length === 0) {
        setCvMethod("upload");
      } else {
        setCvMethod("online");
      }
    }
  }, [isOpen, cvList.length]);

  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  // Hook apply job
  const applyJobMutation = useApplyJob();

  // Xử lý kéo thả / chọn file PDF
  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.warning({ description: "Vui lòng chọn định dạng file PDF." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning({ description: "Dung lượng file tối đa là 10MB." });
      return;
    }
    setUploadedFile(file);
    setUploadStatus("done");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Xác nhận nộp hồ sơ
  const handleSubmitApplication = async () => {
    if (!currentJob?.id) {
      toast.warning({ description: "Không tìm thấy thông tin công việc." });
      return;
    }

    // Kiểm tra định dạng ID hợp lệ trước khi gửi
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(currentJob.id)) {
      toast.error({
        description:
          "Tin tuyển dụng này hiện không khả dụng để nộp hồ sơ trực tuyến.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let cvVersionId: string | undefined;
      let uploadedCvFileId: string | undefined;

      if (cvMethod === "online") {
        if (!selectedCvId) {
          toast.warning({ description: "Vui lòng chọn một CV để ứng tuyển." });
          setIsSubmitting(false);
          return;
        }
        cvVersionId = selectedCvId;
      } else {
        if (!uploadedFile) {
          toast.warning({
            description: "Vui lòng tải lên file CV định dạng PDF.",
          });
          setIsSubmitting(false);
          return;
        }

        setUploadStatus("uploading");
        const uploadRes = await mediaService.uploadPdf(uploadedFile);
        setUploadStatus("done");

        if (!uploadRes.data?.id) {
          throw new Error("Không thể tải lên file CV.");
        }
        uploadedCvFileId = uploadRes.data.id;
      }

      await applyJobMutation.mutateAsync({
        jobId: currentJob.id,
        payload: {
          cvVersionId,
          uploadedCvFileId,
          coverLetter: coverLetter.trim() || undefined,
        },
      });

      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      setUploadStatus("error");
      const errorMsg = getApiErrorMessage(err, "Nộp hồ sơ ứng tuyển thất bại.");
      toast.error({ description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !currentJob) return null;

  // Lương định dạng
  const salaryText = currentJob.salaryRange
    ? currentJob.salaryRange
    : currentJob.salaryNegotiable
      ? "Thỏa thuận"
      : currentJob.salaryMin && currentJob.salaryMax
        ? `$${currentJob.salaryMin} - $${currentJob.salaryMax}/tháng`
        : "Thỏa thuận";

  const modalNode = (
    <div className="fixed inset-0 z-10 flex items-center justify-center p-3 sm:p-4">
      {/* 1. LỚP PHỦ NỀN TRUYỀN THỐNG (HOÀN TOÀN KHÔNG CÓ BACKDROP-BLUR) */}
      <div
        onClick={!isSubmitting ? handleClose : undefined}
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
      />

      {/* 2. KHUNG HỘP THOẠI MODAL */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-job-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-white shadow-2xl transition-all sm:max-w-2xl"
      >
        {/* NÚT ĐÓNG GÓC PHẢI */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 z-20 flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
          aria-label="Đóng cửa sổ"
        >
          <X className="size-4" />
        </button>

        {/* HEADER MODAL */}
        <div className="border-b border-border p-4 pr-12 text-left sm:p-6 sm:pb-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-2xs">
              {currentJob.companyLogoUrl ? (
                <img
                  src={currentJob.companyLogoUrl}
                  alt={currentJob.companyName || "Logo"}
                  className="size-full object-contain"
                />
              ) : (
                <Building2 className="size-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="modal-job-title"
                className="line-clamp-1 text-base leading-snug font-semibold text-text-main sm:text-lg"
              >
                Ứng tuyển: {currentJob.title}
              </h2>
              <p className="mt-0.5 truncate text-xs font-medium text-text-muted">
                {currentJob.companyName}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {salaryText}
                </span>
                {(currentJob.location?.provinceName ||
                  currentJob.provinceName) && (
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin className="size-3.5" />
                    {currentJob.location?.provinceName ||
                      currentJob.provinceName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NỘI DUNG CUỘN */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {/* SECTION 1: XÁC NHẬN THÔNG TIN LIÊN HỆ */}
          <section className="rounded-xl border border-border bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Thông tin người ứng tuyển
              </h3>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate(PATHS.CANDIDATE.USER_PROFILE);
                }}
                className="cursor-pointer text-xs font-semibold text-primary hover:underline"
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <UserAvatar
                src={user?.avatarUrl || ""}
                name={user?.fullName || "Ứng viên"}
                className="size-11 rounded-full border border-border shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-main">
                  {user?.fullName || "Chưa cập nhật họ tên"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {user?.email || "Chưa có email"}
                    </span>
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: LỰA CHỌN PHƯƠNG THỨC NỘP CV */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Hồ sơ CV ứng tuyển <span className="text-rose-500">*</span>
            </h3>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-slate-100/70 p-1">
              <button
                type="button"
                onClick={() => setCvMethod("online")}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                  cvMethod === "online"
                    ? "bg-white text-text-main shadow-2xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <FileCheck className="size-4 text-emerald-600" />
                <span>CV trực tuyến ({cvList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCvMethod("upload")}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                  cvMethod === "upload"
                    ? "bg-white text-text-main shadow-2xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <UploadCloud className="size-4 text-primary" />
                <span>Tải file PDF từ máy</span>
              </button>
            </div>

            {/* OPTION 1: CHỌN CV TRỰC TUYẾN */}
            {cvMethod === "online" && (
              <div className="space-y-2">
                {isLoadingCvs ? (
                  <div className="py-6 text-center text-xs text-text-muted">
                    Đang tải danh sách CV của bạn...
                  </div>
                ) : cvList.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {cvList.map((cv) => {
                      const isSelected = selectedCvId === cv.id;
                      return (
                        <div
                          key={cv.id}
                          onClick={() => setSelectedCvId(cv.id)}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                              : "border-border bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-primary bg-primary text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="size-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-text-main">
                                {cv.title || "CV chưa đặt tên"}
                              </p>
                              <p className="mt-0.5 text-[11px] text-text-muted">
                                Mẫu: {cv.template?.name || "Mẫu chuẩn ATS"} •
                                Cập nhật:{" "}
                                {new Date(cv.updatedAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {cv.isPublic && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Công khai
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `/candidate/cv-builder/${cv.id}`,
                                  "_blank",
                                );
                              }}
                              className="cursor-pointer rounded-md p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-main"
                              title="Xem trước CV"
                            >
                              <Eye className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-5 text-center">
                    <p className="text-xs text-text-muted">
                      Bạn chưa tạo CV trực tuyến nào trong hệ thống.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        navigate(PATHS.CANDIDATE.CV_MANAGEMENT);
                      }}
                      className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      <Plus className="size-3.5" />
                      <span>Tạo CV mới ngay</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OPTION 2: UPLOAD FILE PDF (DÙNG ATTACHMENT SHADCN) */}
            {cvMethod === "upload" && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-slate-50/50 p-6 text-center transition-colors hover:border-primary/50 hover:bg-slate-50"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="size-5" />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-text-main">
                      Nhấn để tải lên hoặc kéo thả file CV vào đây
                    </p>
                    <p className="mt-1 text-[11px] text-text-muted">
                      Định dạng hỗ trợ: PDF (dung lượng tối đa 10MB)
                    </p>
                  </div>
                ) : (
                  /* THẺ TỆP ĐÍNH KÈM CHUẨN SHADCN ATTACHMENT */
                  <Attachment
                    state={uploadStatus === "uploading" ? "uploading" : "done"}
                    className="w-full rounded-xl border border-border bg-white p-3 shadow-2xs"
                  >
                    <AttachmentMedia className="rounded-lg bg-rose-50 text-rose-600">
                      <FileText className="size-5" />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle className="text-xs font-semibold text-text-main">
                        {uploadedFile.name}
                      </AttachmentTitle>
                      <AttachmentDescription className="text-[11px] text-text-muted">
                        {uploadStatus === "uploading"
                          ? "Đang chuẩn bị tải lên..."
                          : `${formatFileSize(uploadedFile.size)} • File PDF`}
                      </AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction
                        type="button"
                        variant="ghost"
                        className="size-7 cursor-pointer rounded-lg p-0 text-text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                        onClick={handleRemoveFile}
                        title="Gỡ file này"
                      >
                        <X className="size-4" />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                )}
              </div>
            )}
          </section>

          {/* SECTION 3: THƯ GIỚI THIỆU (COVER LETTER) */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="coverLetter"
                className="text-xs font-semibold tracking-wider text-text-muted uppercase"
              >
                Thư giới thiệu
              </label>
              <span className="text-[11px] text-text-muted">
                {coverLetter.length}/1000
              </span>
            </div>
            <textarea
              id="coverLetter"
              rows={3}
              maxLength={1000}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Viết lời chào ngắn hoặc chia sẻ lý do bạn là ứng viên phù hợp với vị trí này..."
              className="w-full resize-none rounded-xl border border-border bg-white p-3 text-xs text-text-main transition-colors outline-none placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </section>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:p-6 sm:pt-4">
          <Button
            variant="outline"
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>

          <Button
            variant="primary"
            className="rounded-xl px-5 py-2 text-xs font-semibold"
            onClick={handleSubmitApplication}
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              (cvMethod === "online" && !selectedCvId) ||
              (cvMethod === "upload" && !uploadedFile)
            }
          >
            <span>Nộp hồ sơ ngay</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalNode, document.body)
    : null;
}

export default ApplyJobModal;
