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
  useCreateIndustry,
  useUpdateIndustry,
} from "@/hooks/queries/useAdmin";
import type { AdminIndustry, AdminIndustryGroup } from "@/types/admin";

interface IndustryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry?: AdminIndustry | null;
  defaultGroupId?: string;
  groups: AdminIndustryGroup[];
  onSuccess?: () => void;
}

export function IndustryDialog({
  open,
  onOpenChange,
  industry,
  defaultGroupId,
  groups,
  onSuccess,
}: IndustryDialogProps) {
  const isEditing = Boolean(industry);
  const [groupId, setGroupId] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ groupId?: string; name?: string }>({});

  const createMutation = useCreateIndustry();
  const updateMutation = useUpdateIndustry();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      if (industry) {
        setGroupId(industry.groupId);
        setName(industry.name);
        setIsActive(industry.isActive);
      } else {
        setGroupId(defaultGroupId || groups[0]?.id || "");
        setName("");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, industry, defaultGroupId, groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { groupId?: string; name?: string } = {};

    if (!groupId) {
      newErrors.groupId = "Vui lòng chọn nhóm ngành";
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Vui lòng nhập tên ngành nghề";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Tên ngành nghề phải có ít nhất 2 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing && industry) {
      updateMutation.mutate(
        {
          id: industry.id,
          payload: {
            groupId,
            name: trimmedName,
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
        {
          groupId,
          name: trimmedName,
        },
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
            {isEditing ? "Chỉnh sửa ngành nghề" : "Thêm ngành nghề mới"}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            {isEditing
              ? "Cập nhật tên, nhóm ngành trực thuộc hoặc trạng thái hoạt động"
              : "Thêm ngành nghề con trực thuộc nhóm ngành đã chọn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main">
              Thuộc nhóm ngành <span className="text-rose-500">*</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                if (errors.groupId) {
                  setErrors((prev) => ({ ...prev, groupId: undefined }));
                }
              }}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
            >
              <option value="" disabled>
                -- Chọn nhóm ngành --
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {!g.isActive ? "(Đã ẩn)" : ""}
                </option>
              ))}
            </select>
            {errors.groupId && (
              <p className="text-[11px] text-rose-500">{errors.groupId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main">
              Tên ngành nghề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Ví dụ: Lập trình viên Frontend, Kiểm thử phần mềm..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500">{errors.name}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold text-text-main">
                  Trạng thái hoạt động
                </p>
                <p className="text-[11px] text-text-muted">
                  Khi tắt, ngành nghề sẽ không xuất hiện trong bộ chọn của việc làm
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
              {isEditing ? "Lưu thay đổi" : "Tạo ngành nghề"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

