import { useState } from "react";
import { FilePlus2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, CVCard } from "@/components/common";
import { PATHS } from "@/constants/paths";
import type { CVItem } from "@/types/cv";
import { useDeleteCv } from "@/hooks/queries/useCv";
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

interface CandidateCVSectionProps {
  cvList?: CVItem[];
  isLoading?: boolean;
  onEdit?: (cv: CVItem) => void;
  onDownload?: (cv: CVItem) => void;
  onDelete?: (cv: CVItem) => void;
}

export function CandidateCVSection({
  cvList = [],
  isLoading = false,
  onEdit,
  onDownload,
  onDelete,
}: CandidateCVSectionProps) {
  const navigate = useNavigate();
  const [cvToDelete, setCvToDelete] = useState<CVItem | null>(null);
  const { mutateAsync: deleteCv, isPending: isDeletingCv } = useDeleteCv();

  const handleConfirmDelete = async () => {
    if (!cvToDelete) return;
    try {
      if (onDelete) {
        onDelete(cvToDelete);
      } else {
        await deleteCv(cvToDelete.id);
      }
      setCvToDelete(null);
    } catch {
      // Đã xử lý ở hook
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-bg p-6">
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
          onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
          className="w-full px-4! py-2.5! text-xs! sm:w-auto"
        >
          Tạo CV mới chuẩn ATS
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-3/4 animate-pulse rounded-2xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : cvList.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cvList.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onEdit={onEdit || ((item) => navigate(`${PATHS.EDIT_CV}?id=${item.id}`))}
              onDownload={onDownload}
              onDelete={(item) => setCvToDelete(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-96 w-fit flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center transition-all hover:border-primary/50 hover:bg-slate-50/80">
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
              onClick={() => navigate(PATHS.CANDIDATE.CV_TEMPLATES)}
              className="rounded-xl! px-5! py-2.5! text-xs!"
            >
              Tạo CV mới
            </Button>
          </div>
        </div>
      )}

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
              <strong className="text-text-main font-semibold">
                "{cvToDelete?.title}"
              </strong>
              ? Hành động này không thể hoàn tác và CV sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCv}>
              Hủy
            </AlertDialogCancel>
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
