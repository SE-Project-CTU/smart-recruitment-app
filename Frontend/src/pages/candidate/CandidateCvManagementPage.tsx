import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Plus } from "lucide-react";
import { Button, CVCard } from "@/components/common";
import {
  useMyCvs,
  useToggleCvPublic,
  useDeleteCv,
} from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import { useToast } from "@/hooks/use-toast";
import type { CVItem } from "@/types/cv";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CandidateCvManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: cvData, isLoading: isLoadingCvs } = useMyCvs();
  const cvs = cvData?.items ?? [];

  const { mutateAsync: togglePublic, isPending: isTogglingPublic } =
    useToggleCvPublic();
  const { mutateAsync: deleteCv, isPending: isDeletingCv } = useDeleteCv();

  // State modal xóa CV
  const [cvToDelete, setCvToDelete] = useState<CVItem | null>(null);

  // Xử lý bật/tắt công khai
  const handleTogglePublic = async (cv: CVItem, nextIsPublic: boolean) => {
    try {
      await togglePublic({ id: cv.id, isPublic: nextIsPublic });
    } catch {
      // Đã bắt và hiển thị lỗi qua errorHandler trong hook useToggleCvPublic
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

  // Tải file CV
  const handleDownloadCv = (cv: CVItem) => {
    const previewFileUrl = cv.previewFile?.url;

    if (previewFileUrl) {
      window.open(previewFileUrl, "_blank");
    } else {
      toast({
        title: "Tải file CV",
        description:
          "Hệ thống đang đồng bộ định dạng PDF. Bạn có thể xem trước nội dung trực tiếp.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Section: Danh sách CV của bạn */}
      <section className="flex flex-col gap-6 rounded-2xl bg-bg">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-text-main md:text-2xl">
              Danh sách CV của bạn
            </h1>
            <p className="text-xs text-text-muted md:text-sm">
              Tạo mới, chỉnh sửa và quản lý các phiên bản hồ sơ của bạn
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            iconSize={16}
            onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
            className="w-full px-4! py-2.5! text-xs! sm:w-auto"
          >
            Tạo CV mới chuẩn ATS
          </Button>
        </div>

        {isLoadingCvs ? (
          <div className="flex flex-wrap gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-3/4 w-full sm:w-[calc(50%-10px)] lg:w-[calc((100%-40px)/3)] xl:w-[calc(25%-15px)] animate-pulse rounded-2xl border border-border bg-surface/50"
              />
            ))}
          </div>
        ) : cvs.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {cvs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                className="w-full sm:w-[calc(50%-10px)] lg:w-[calc((100%-40px)/3)] xl:w-[calc(25%-15px)]"
                onClick={(item) => {
                  navigate(`${PATHS.CANDIDATE.PREVIEW_CV}?id=${item.id}`);
                }}
                onTogglePublic={handleTogglePublic}
                isTogglingPublic={isTogglingPublic}
                onDownload={handleDownloadCv}
                onEdit={(item) => {
                  navigate(`${PATHS.EDIT_CV}?id=${item.id}`);
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

              <h3 className="text-sm font-semibold text-text-main">
                Thêm CV mới, thêm cơ hội mới!
              </h3>
              <p className="max-w-md text-xs text-text-muted">
                Bạn chưa có bản CV nào. Hãy bắt đầu chọn một mẫu CV chuyên nghiệp để tạo ấn tượng với nhà tuyển dụng.
              </p>

              <Button
                variant="secondary"
                icon={Plus}
                iconSize={14}
                onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
                className="rounded-xl! px-5! py-2.5! text-xs!"
              >
                Khám phá kho mẫu CV
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* AlertDialog: Xác nhận xóa CV */}
      <AlertDialog
        open={!!cvToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeletingCv) {
            setCvToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa CV này vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa CV{" "}
              <strong className="font-semibold text-text-main">
                "{cvToDelete?.title}"
              </strong>
              ? Hành động này không thể hoàn tác và CV sẽ bị gỡ bỏ hoàn toàn
              khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCv}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingCv}
            >
              {isDeletingCv ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
