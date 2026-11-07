import { useEffect, useState } from "react";
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
  useCreateSkill,
  useUpdateSkill,
} from "@/hooks/queries/useAdmin";
import type { AdminSkill } from "@/types/admin";

interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: AdminSkill | null;
  onSuccess?: () => void;
}

export function SkillDialog({
  open,
  onOpenChange,
  skill,
  onSuccess,
}: SkillDialogProps) {
  const isEditing = Boolean(skill);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (skill) {
        setName(skill.name);
        setIsActive(skill.isActive);
      } else {
        setName("");
        setIsActive(true);
      }
      setError(null);
    }
  }, [open, skill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên kỹ năng");
      return;
    }
    if (trimmed.length < 2) {
      setError("Tên kỹ năng phải có ít nhất 2 ký tự");
      return;
    }
    if (trimmed.length > 50) {
      setError("Tên kỹ năng không được vượt quá 50 ký tự");
      return;
    }

    if (isEditing && skill) {
      updateMutation.mutate(
        {
          id: skill.id,
          payload: {
            name: trimmed,
            isActive,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        },
      );
    } else {
      createMutation.mutate(
        { name: trimmed },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-text-main">
            {isEditing ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            {isEditing
              ? "Cập nhật tên hoặc trạng thái kích hoạt của kỹ năng trong hệ thống"
              : "Thêm kỹ năng chuẩn hóa vào ngân hàng kỹ năng để phục vụ Matching CV & JD"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main">
              Tên kỹ năng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ví dụ: React.js, Python, Figma, Quản lý dự án..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
              autoFocus
            />
            {error && <p className="text-[11px] text-rose-500">{error}</p>}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold text-text-main">
                  Trạng thái hoạt động
                </p>
                <p className="text-[11px] text-text-muted">
                  Khi tắt, kỹ năng sẽ tạm ẩn khỏi gợi ý chọn khi tạo tin và làm CV
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}

          <DialogFooter className="mt-6 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
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
              {isEditing ? "Lưu thay đổi" : "Tạo kỹ năng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

