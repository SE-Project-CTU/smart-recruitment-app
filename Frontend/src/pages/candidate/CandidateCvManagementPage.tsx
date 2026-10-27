import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Plus, AlertCircle, Eye, X, ArrowRight } from "lucide-react";
import { Button, CVCard, CVTemplateCard } from "@/components/common";
import {
  useMyCvs,
  useCvTemplates,
  useToggleCvPublic,
  useDeleteCv,
  useCreateCv,
  useUpdateCv,
} from "@/hooks/queries/useCv";
import { imageSlide } from "@/constants/LandingpageConsts";
import { PATHS } from "@/constants/paths";
import { useToast } from "@/hooks/use-toast";
import type { CVItem } from "@/types/cv";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";

export default function CandidateCvManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cvData, isLoading: isLoadingCvs } = useMyCvs();
  const cvs = cvData?.items ?? [];

  const { data: templateData, isLoading: isLoadingTemplates } =
    useCvTemplates();
  const templates = useMemo(() => templateData?.items ?? [], [templateData?.items]);

  const { mutateAsync: togglePublic, isPending: isTogglingPublic } =
    useToggleCvPublic();
  const { mutateAsync: deleteCv, isPending: isDeletingCv } = useDeleteCv();
  const { mutateAsync: createCv, isPending: isCreatingCv } = useCreateCv();
  const { mutateAsync: updateCv, isPending: isUpdatingCv } = useUpdateCv();

  // State modals
  const [selectedTemplate, setSelectedTemplate] =
    useState<CVTemplateItemData | null>(null);
  const [newCvTitle, setNewCvTitle] = useState("");
  const [newCvLanguage, setNewCvLanguage] = useState<"vi" | "en">("vi");

  const [cvToDelete, setCvToDelete] = useState<CVItem | null>(null);

  const [cvToRename, setCvToRename] = useState<CVItem | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [previewItem, setPreviewItem] = useState<{
    title: string;
    imageUrl?: string;
  } | null>(null);

  // Danh sách template kết hợp từ API và LandingPageConsts imageSlide
  const templateList: CVTemplateItemData[] = useMemo(() => {
    if (templates && templates.length > 0) {
      return templates.map((t, idx) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        description: t.description,
        thumbnailUrl:
          t.thumbnailUrl || imageSlide[idx % imageSlide.length]?.src,
        badge: imageSlide[idx % imageSlide.length]?.badge || "Chuẩn ATS",
      }));
    }
    return imageSlide.map((slide, idx) => ({
      id: `template-mock-${idx + 1}`,
      code: slide.subtitle.toLowerCase(),
      name: slide.title,
      description: slide.title,
      thumbnailUrl: slide.src,
      badge: slide.badge,
    }));
  }, [templates]);

  // Xử lý bật/tắt công khai (nhận giá trị sau debounce 0.2s từ CVCard)
  const handleTogglePublic = async (cv: CVItem, nextIsPublic: boolean) => {
    try {
      await togglePublic({ id: cv.id, isPublic: nextIsPublic });
    } catch {
      // Đã bắt và hiển thị lỗi qua errorHandler trong hook useToggleCvPublic
    }
  };

  // Mở modal tạo CV từ mẫu
  const handleOpenUseTemplate = (template: CVTemplateItemData) => {
    setSelectedTemplate(template);
    setNewCvTitle(`CV ${template.name}`);
    setNewCvLanguage("vi");
  };

  // Xác nhận tạo CV mới
  const handleConfirmCreateCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !newCvTitle.trim()) return;

    try {
      await createCv({
        templateId: selectedTemplate.id,
        title: newCvTitle.trim(),
        language: newCvLanguage,
      });
      setSelectedTemplate(null);
      navigate(PATHS.CREATE_CV);
    } catch {
      // Đã xử lý lỗi ở hook
    }
  };

  // Xác nhận xóa CV
  const handleConfirmDelete = async () => {
    if (!cvToDelete) return;
    try {
      await deleteCv(cvToDelete.id);
      setCvToDelete(null);
    } catch {
      // Đã xử lý lỗi ở hook
    }
  };

  // Xác nhận đổi tên CV
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvToRename || !renameTitle.trim()) return;
    try {
      await updateCv({
        id: cvToRename.id,
        payload: { title: renameTitle.trim() },
      });
      setCvToRename(null);
    } catch {
      // Đã xử lý lỗi ở hook
    }
  };

  // Tải file CV
  const handleDownloadCv = (cv: CVItem) => {
    if (cv.previewFile?.fileUrl) {
      window.open(cv.previewFile.fileUrl, "_blank");
    } else {
      toast({
        title: "Tải file CV",
        description:
          "Hệ thống đang đồng bộ định dạng PDF. Bạn có thể xem trước nội dung trực tiếp.",
      });
    }
  };

  return (
    <div className="min-h-full space-y-8 pb-12">
      {/* Section 1: Danh sách CV của bạn */}
      <section className="flex flex-col gap-6 rounded-2xl bg-bg p-6">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-text-main">
              Danh sách CV của bạn
            </h2>
            <p className="text-sm text-text-muted">
              Tạo mới, chỉnh sửa và quản lý hồ sơ của bạn
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            iconSize={16}
            onClick={() => {
              const el = document.getElementById("template-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full px-4! py-2.5! text-xs! sm:w-auto"
          >
            Tạo CV mới chuẩn ATS
          </Button>
        </div>

        {isLoadingCvs ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-3/4 animate-pulse rounded-2xl border border-border bg-surface/50"
              />
            ))}
          </div>
        ) : cvs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {cvs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onTogglePublic={handleTogglePublic}
                isTogglingPublic={isTogglingPublic}
                onDownload={handleDownloadCv}
                onEdit={(item) => {
                  setCvToRename(item);
                  setRenameTitle(item.title);
                }}
                onDelete={(item) => setCvToDelete(item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-96 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition-all hover:border-primary/50 hover:bg-slate-50/80">
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-indigo-100/80 text-primary">
                <FilePlus2 className="size-6" />
              </div>

              <h4 className="text-sm font-semibold text-text-main">
                Thêm CV mới, thêm cơ hội mới!
              </h4>

              <Button
                variant="secondary"
                icon={Plus}
                iconSize={14}
                onClick={() => {
                  const el = document.getElementById("template-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl! px-5! py-2.5! text-xs!"
              >
                Tạo CV mới
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Section: Kho mẫu CV chuyên nghiệp (Templates) */}
      <section id="template-section" className="space-y-4 p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-main">
              Khám phá kho CV mẫu chuẩn tuyển dụng
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Được thiết kế tối ưu hóa cho hệ thống tự động quét hồ sơ (ATS) và
            thu hút ánh nhìn của nhà tuyển dụng.
          </p>
        </div>

        {isLoadingTemplates ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-3/4 animate-pulse rounded-2xl border border-border bg-surface/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templateList.map((tpl) => (
              <CVTemplateCard
                key={tpl.id}
                template={tpl}
                onUseTemplate={handleOpenUseTemplate}
                onPreview={(item) =>
                  setPreviewItem({
                    title: item.name,
                    imageUrl: item.thumbnailUrl,
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal: Khởi tạo CV mới từ Mẫu */}
      {selectedTemplate && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-main">
                  Tạo CV từ mẫu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="cursor-pointer rounded-lg p-1 text-text-muted hover:bg-bg hover:text-text-main"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateCv} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-text-muted">Mẫu đã chọn</span>
                <p className="font-semibold text-text-main">
                  {selectedTemplate.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-main">
                  Đặt tên cho CV <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CV Lập trình viên Frontend 2026"
                  value={newCvTitle}
                  onChange={(e) => setNewCvTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-main focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-main">
                  Ngôn ngữ soạn thảo
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCvLanguage("vi")}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-all ${
                      newCvLanguage === "vi"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-bg text-text-muted hover:text-text-main"
                    }`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCvLanguage("en")}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-all ${
                      newCvLanguage === "en"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-bg text-text-muted hover:text-text-main"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedTemplate(null)}
                  disabled={isCreatingCv}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isCreatingCv}
                  icon={ArrowRight}
                >
                  Bắt đầu tạo CV
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đổi tên CV */}
      {cvToRename && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-base font-bold text-text-main">Đổi tên CV</h3>
            <p className="mt-1 text-xs text-text-muted">
              Nhập tên mới để bạn dễ dàng quản lý các phiên bản CV.
            </p>

            <form onSubmit={handleConfirmRename} className="mt-4 space-y-4">
              <input
                type="text"
                required
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-main focus:border-primary focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setCvToRename(null)}
                  disabled={isUpdatingCv}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isUpdatingCv}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa CV */}
      {cvToDelete && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="text-base font-bold text-text-main">
              Xóa CV này vĩnh viễn?
            </h3>
            <p className="mt-1.5 text-xs text-text-muted">
              Bạn có chắc chắn muốn xóa CV "
              <strong className="text-text-main">{cvToDelete.title}</strong>"?
              Hành động này không thể hoàn tác.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <Button
                variant="secondary"
                onClick={() => setCvToDelete(null)}
                disabled={isDeletingCv}
              >
                Giữ lại
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                isLoading={isDeletingCv}
                className="bg-rose-600! hover:bg-rose-700!"
              >
                Xác nhận xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xem trước Mẫu CV */}
      {previewItem && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-primary" />
                <h3 className="text-sm font-bold text-text-main">
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="cursor-pointer rounded-lg p-1 text-text-muted hover:bg-bg hover:text-text-main"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {previewItem.imageUrl ? (
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  className="w-full rounded-2xl border border-border object-contain shadow-sm"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-xs text-text-muted">
                  Không có hình ảnh xem trước
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
