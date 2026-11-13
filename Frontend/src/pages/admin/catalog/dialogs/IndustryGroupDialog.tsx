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
import {
  useCreateIndustryGroup,
  useUpdateIndustryGroup,
} from "@/hooks/queries/useAdmin";
import type { AdminIndustryGroup } from "@/types/admin";

interface IndustryGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: AdminIndustryGroup | null;
  onSuccess?: () => void;
}

interface IndustryGroupFormProps {
  group?: AdminIndustryGroup | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function IndustryGroupForm({
  group,
  onClose,
  onSuccess,
}: IndustryGroupFormProps) {
  const isEditing = Boolean(group);
  const [name, setName] = useState(group?.name ?? "");
  const [isActive, setIsActive] = useState(group?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateIndustryGroup();
  const updateMutation = useUpdateIndustryGroup();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên nhóm ngành");
      return;
    }
    if (trimmed.length < 2) {
      setError("Tên nhóm ngành phải có ít nhất 2 ký tự");
      return;
    }

    if (isEditing && group) {
      updateMutation.mutate(
        {
          id: group.id,
          payload: {
            name: trimmed,
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
    } else {
      createMutation.mutate(
        { name: trimmed },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-semibold text-text-main">
          {isEditing ? "Chỉnh sửa nhóm ngành" : "Thêm nhóm ngành mới"}
        </DialogTitle>
        <DialogDescription className="text-xs text-text-muted">
          {isEditing
            ? "Cập nhật tên hoặc trạng thái hoạt động của nhóm ngành"
            : "Nhập thông tin nhóm ngành để phân loại các ngành nghề con"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Tên nhóm ngành <span className="text-status-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ví dụ: Công nghệ thông tin, Tài chính - Ngân hàng..."
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
            autoFocus
          />
          {error && <p className="text-[11px] text-status-error">{error}</p>}
        </div>

        {isEditing && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
            <div>
              <p className="text-xs font-semibold text-text-main">
                Trạng thái hoạt động
              </p>
              <p className="text-[11px] text-text-muted">
                Khi tắt, nhóm ngành và các ngành con sẽ tạm ẩn khỏi bộ lọc
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        )}

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
            {isEditing ? "Lưu thay đổi" : "Tạo nhóm ngành"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function IndustryGroupDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: IndustryGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md p-5 sm:p-6 shadow-none">
        {open && (
          <IndustryGroupForm
            key={group?.id || "create"}
            group={group}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
