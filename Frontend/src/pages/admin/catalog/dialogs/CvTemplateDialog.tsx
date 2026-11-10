import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import { useUpdateCvTemplate } from "@/hooks/queries/useAdmin";
import type { AdminCvTemplateItem } from "@/types/admin";

interface CvTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AdminCvTemplateItem | null;
  onSuccess?: () => void;
}

interface CvTemplateFormProps {
  template: AdminCvTemplateItem;
  onClose: () => void;
  onSuccess?: () => void;
}

function CvTemplateForm({
  template,
  onClose,
  onSuccess,
}: CvTemplateFormProps) {
  const [name, setName] = useState(template.name ?? "");
  const [description, setDescription] = useState(template.description ?? "");
  const [isActive, setIsActive] = useState(template.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateCvTemplate();
  const isSubmitting = updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Vui lòng nhập tên mẫu CV");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Tên mẫu CV phải có ít nhất 2 ký tự");
      return;
    }

    updateMutation.mutate(
      {
        id: template.id,
        payload: {
          name: trimmedName,
          description: description.trim() || undefined,
          isActive,
        },
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-semibold text-text-main">
          Chỉnh sửa mẫu CV
        </DialogTitle>
        <DialogDescription className="text-xs text-text-muted">
          Cập nhật thông tin hiển thị và trạng thái kích hoạt của mẫu CV trên sàn
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Thông tin cố định của template */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-bg p-3 text-xs">
          <div>
            <span className="text-[11px] text-text-muted">Mã mẫu (Code):</span>
            <p className="font-semibold text-text-main">{template.code}</p>
          </div>
          <div>
            <span className="text-[11px] text-text-muted">Phiên bản:</span>
            <p className="font-semibold text-text-main">v{template.version}</p>
          </div>
        </div>

        {/* Tên mẫu CV */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Tên mẫu CV <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ví dụ: Mẫu CV Thanh lịch, Mẫu CV Kỹ thuật..."
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
            autoFocus
          />
          {error && <p className="text-[11px] text-rose-500">{error}</p>}
        </div>

        {/* Mô tả mẫu CV */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Mô tả giới thiệu
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả phong cách thiết kế, nhóm ngành nghề phù hợp..."
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
          />
        </div>

        {/* Công tắc Soft Hide */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
          <div>
            <p className="text-xs font-semibold text-text-main">
              Trạng thái kích hoạt
            </p>
            <p className="text-[11px] text-text-muted">
              Khi tắt, ứng viên sẽ tạm thời không thể chọn mẫu này để tạo CV mới
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <DialogFooter className="mt-6 flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl! text-xs! px-4! py-2! font-semibold!"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="rounded-xl! text-xs! px-4! py-2! font-semibold!"
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CvTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: CvTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-none">
        {open && template && (
          <CvTemplateForm
            key={template.id}
            template={template}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

