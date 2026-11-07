import { CvPreviewModal } from "@/features/cv";
import { useApplicationDetail } from "@/hooks/queries/useApplication";
import type { RecruiterCandidateApplicationItem } from "@/types/application";
import type {
  CVLayoutDocument,
  RichTextCVContentDocument,
} from "@/types/cv";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApplicationCvPreviewDialogProps {
  application: RecruiterCandidateApplicationItem | null;
  onClose: () => void;
}

export function ApplicationCvPreviewDialog({
  application,
  onClose,
}: ApplicationCvPreviewDialogProps) {
  const {
    data: applicationDetail,
    isFetching,
    isError,
  } = useApplicationDetail(application?.id);
  const snapshot = applicationDetail?.cvSnapshot ?? application?.cvSnapshot;

  if (snapshot && !isFetching) {
    return (
      <CvPreviewModal
        isOpen={Boolean(application)}
        onClose={onClose}
        title={`CV của ứng viên ${application?.candidate?.fullName}`}
        content={snapshot.content as unknown as RichTextCVContentDocument}
        layout={snapshot.layout as unknown as CVLayoutDocument}
      />
    );
  }

  if (!application) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>CV hệ thống</DialogTitle>
          <DialogDescription>
            Bản CV được đính kèm trong hồ sơ ứng tuyển của ứng viên.
          </DialogDescription>
        </DialogHeader>
        {isFetching ? (
          <div className="flex min-h-36 items-center justify-center">
            <div className="size-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-status-error">
            Không thể tải dữ liệu CV của hồ sơ này.
          </p>
        ) : (
          <p className="py-6 text-center text-sm text-text-muted">
            Hồ sơ này không có dữ liệu bản xem trước CV.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
