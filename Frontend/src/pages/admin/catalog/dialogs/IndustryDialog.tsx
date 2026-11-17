import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
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
import { useCreateIndustry, useUpdateIndustry } from "@/hooks/queries/useAdmin";
import type { AdminIndustry, AdminIndustryGroup } from "@/types/admin";

interface IndustryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry?: AdminIndustry | null;
  defaultGroupId?: string;
  groups: AdminIndustryGroup[];
  onSuccess?: () => void;
}

export function IndustryDialog(props: IndustryDialogProps) {
  const { open, industry, defaultGroupId, groups } = props;
  const formKey = industry
    ? `${open}-${industry.id}-${industry.groupId}-${industry.name}-${industry.isActive}`
    : `${open}-new-${defaultGroupId ?? ""}-${groups[0]?.id ?? ""}`;

  return <IndustryDialogForm key={formKey} {...props} />;
}

function IndustryDialogForm({
  open,
  onOpenChange,
  industry,
  defaultGroupId,
  groups,
  onSuccess,
}: IndustryDialogProps) {
  const isEditing = Boolean(industry);
  const [groupId, setGroupId] = useState(
    industry?.groupId ?? defaultGroupId ?? groups[0]?.id ?? "",
  );
  const [name, setName] = useState(industry?.name ?? "");
  const [isActive, setIsActive] = useState(industry?.isActive ?? true);
  const [errors, setErrors] = useState<{ groupId?: string; name?: string }>({});

  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: g.id,
        label: `${g.name}${!g.isActive ? " (Đã ẩn)" : ""}`,
      })),
    [groups],
  );

  const createMutation = useCreateIndustry();
  const updateMutation = useUpdateIndustry();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
      <DialogContent className="w-full sm:max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-none">
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
              Thuộc nhóm ngành <span className="text-status-error">*</span>
            </label>
            <Select.Root
              items={groupOptions}
              value={groupId}
              onValueChange={(val) => {
                if (val) {
                  setGroupId(val);
                  if (errors.groupId) {
                    setErrors((prev) => ({ ...prev, groupId: undefined }));
                  }
                }
              }}
            >
              <Select.Trigger
                aria-label="Chọn nhóm ngành"
                className="group flex h-9.5 w-full cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-medium text-text-main transition-colors hover:bg-bg/80 focus:border-primary focus:bg-surface focus:outline-none"
              >
                <Select.Value placeholder="-- Chọn nhóm ngành --" />
                <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                  <ChevronDown className="size-3.5" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Positioner
                  alignItemWithTrigger={false}
                  sideOffset={6}
                  className="z-[75]"
                >
                  <Select.Popup className="z-[75] max-h-60 w-(--anchor-width) overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-md">
                    <Select.List>
                      {groupOptions.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs text-text-main transition-colors hover:bg-bg data-highlighted:bg-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                        >
                          <Select.ItemText>{opt.label}</Select.ItemText>
                          <Select.ItemIndicator
                            animation="pop"
                            className="ml-2 text-xs text-primary"
                          >
                            ✓
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
            {errors.groupId && (
              <p className="text-[11px] text-status-error">{errors.groupId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main">
              Tên ngành nghề <span className="text-status-error">*</span>
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
              <p className="text-[11px] text-status-error">{errors.name}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold text-text-main">
                  Trạng thái hoạt động
                </p>
                <p className="text-[11px] text-text-muted">
                  Khi tắt, ngành nghề sẽ không xuất hiện trong bộ chọn của việc
                  làm
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          <DialogFooter className="mt-6 flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl! px-4! py-2! text-xs! font-semibold!"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="rounded-xl! px-4! py-2! text-xs! font-semibold!"
            >
              {isEditing ? "Lưu thay đổi" : "Tạo ngành nghề"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
