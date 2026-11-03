import React from "react";
import { AlertTriangle } from "lucide-react";
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

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onStay,
  onLeave,
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onStay();
        }
      }}
    >
      <AlertDialogContent size="default" className="max-w-md">
        <AlertDialogHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 sm:mx-0 mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-base font-semibold text-text-main">
            Rời khỏi trang khi chưa lưu thay đổi?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-text-muted mt-1 leading-relaxed">
            Bạn có các chỉnh sửa chưa được lưu trên CV. Nếu rời khỏi trang bây giờ, tất cả các thay đổi vừa thực hiện sẽ bị mất vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-3">
          <AlertDialogCancel
            onClick={onStay}
            className="cursor-pointer font-medium"
          >
            Ở lại chỉnh sửa
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onLeave}
            className="cursor-pointer font-medium"
          >
            Rời khỏi trang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
