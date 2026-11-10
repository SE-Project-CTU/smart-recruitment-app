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
import {
  useCreateWard,
  useUpdateWard,
} from "@/hooks/queries/useAdmin";
import type { AdminProvince, AdminWard } from "@/types/admin";

interface WardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ward?: AdminWard | null;
  defaultProvinceId?: string;
  provinces: AdminProvince[];
  onSuccess?: () => void;
}

interface WardFormProps {
  ward?: AdminWard | null;
  defaultProvinceId?: string;
  provinces: AdminProvince[];
  onClose: () => void;
  onSuccess?: () => void;
}

function WardForm({
  ward,
  defaultProvinceId,
  provinces,
  onClose,
  onSuccess,
}: WardFormProps) {
  const isEditing = Boolean(ward);
  const [provinceId, setProvinceId] = useState(
    ward?.provinceId ?? defaultProvinceId ?? provinces[0]?.id ?? "",
  );
  const [name, setName] = useState(ward?.name ?? "");
  const [isCommune, setIsCommune] = useState(ward?.isCommune ?? false);
  const [isActive, setIsActive] = useState(
    ward?.status?.toUpperCase() === "ACTIVE" || !ward,
  );
  const [errors, setErrors] = useState<{ provinceId?: string; name?: string }>({});

  const provinceOptions = useMemo(
    () =>
      provinces.map((p) => ({
        value: p.id,
        label: `${p.name}${p.status?.toUpperCase() !== "ACTIVE" ? " (Đã ẩn)" : ""}`,
      })),
    [provinces],
  );

  const createMutation = useCreateWard();
  const updateMutation = useUpdateWard();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { provinceId?: string; name?: string } = {};

    if (!provinceId) {
      newErrors.provinceId = "Vui lòng chọn Tỉnh / Thành phố";
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "Vui lòng nhập tên Phường / Xã";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Tên Phường / Xã phải có ít nhất 2 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing && ward) {
      updateMutation.mutate(
        {
          id: ward.id,
          payload: {
            provinceId,
            name: trimmedName,
            isCommune,
            status: isActive ? "Active" : "Inactive",
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
        {
          provinceId,
          name: trimmedName,
          isCommune,
          status: "Active",
        },
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
          {isEditing ? "Chỉnh sửa Phường / Xã" : "Thêm Phường / Xã mới"}
        </DialogTitle>
        <DialogDescription className="text-xs text-text-muted">
          {isEditing
            ? "Cập nhật tên, địa bàn trực thuộc hoặc trạng thái hoạt động"
            : "Thêm đơn vị hành chính cấp xã/phường vào tỉnh/thành phố đã chọn"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Thuộc Tỉnh / Thành phố <span className="text-rose-500">*</span>
          </label>
          <Select.Root
            items={provinceOptions}
            value={provinceId}
            onValueChange={(val) => {
              if (val) {
                setProvinceId(val);
                if (errors.provinceId) {
                  setErrors((prev) => ({ ...prev, provinceId: undefined }));
                }
              }
            }}
          >
            <Select.Trigger
              aria-label="Chọn Tỉnh / Thành phố"
              className="group flex h-9.5 w-full cursor-pointer items-center justify-between gap-1.5 rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-medium text-text-main transition-colors hover:bg-slate-100/60 focus:border-primary focus:bg-surface focus:outline-none"
            >
              <Select.Value placeholder="-- Chọn Tỉnh / Thành phố --" />
              <Select.Icon className="text-text-muted transition-transform duration-200 group-data-popup-open:rotate-180">
                <ChevronDown className="size-3.5" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Positioner
                alignItemWithTrigger={false}
                sideOffset={6}
                className="z-60"
              >
                <Select.Popup className="z-60 max-h-60 w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-md">
                  <Select.List>
                    {provinceOptions.map((opt) => (
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
          {errors.provinceId && (
            <p className="text-[11px] text-rose-500">{errors.provinceId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Tên Phường / Xã <span className="text-rose-500">*</span>
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
            placeholder="Ví dụ: Phường Bến Nghé, Xã An Khánh..."
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
            autoFocus
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500">{errors.name}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
          <div>
            <p className="text-xs font-semibold text-text-main">
              Phân loại loại hình: {isCommune ? "Xã" : "Phường / Thị trấn"}
            </p>
            <p className="text-[11px] text-text-muted">
              Bật nếu đây là Xã (nông thôn), tắt nếu là Phường hoặc Thị trấn (đô
              thị)
            </p>
          </div>
          <Switch checked={isCommune} onCheckedChange={setIsCommune} />
        </div>

        {isEditing && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
            <div>
              <p className="text-xs font-semibold text-text-main">
                Trạng thái hoạt động
              </p>
              <p className="text-[11px] text-text-muted">
                Khi tắt, địa bàn cơ sở này sẽ tạm ẩn khỏi gợi ý chọn địa chỉ
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
            {isEditing ? "Lưu thay đổi" : "Tạo Phường / Xã"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function WardDialog({
  open,
  onOpenChange,
  ward,
  defaultProvinceId,
  provinces,
  onSuccess,
}: WardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-none">
        {open && (
          <WardForm
            key={ward?.id || "create"}
            ward={ward}
            defaultProvinceId={defaultProvinceId}
            provinces={provinces}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
