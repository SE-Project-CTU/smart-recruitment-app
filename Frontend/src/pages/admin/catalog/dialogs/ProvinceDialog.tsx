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
  useCreateProvince,
  useUpdateProvince,
} from "@/hooks/queries/useAdmin";
import type { AdminProvince } from "@/types/admin";

interface ProvinceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province?: AdminProvince | null;
  onSuccess?: () => void;
}

interface ProvinceFormProps {
  province?: AdminProvince | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function ProvinceForm({ province, onClose, onSuccess }: ProvinceFormProps) {
  const isEditing = Boolean(province);
  const [name, setName] = useState(province?.name ?? "");
  const [isCentrallyGoverned, setIsCentrallyGoverned] = useState(
    province?.isCentrallyGoverned ?? false,
  );
  const [isActive, setIsActive] = useState(
    province?.status?.toUpperCase() === "ACTIVE" || !province,
  );
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProvince();
  const updateMutation = useUpdateProvince();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Vui lòng nhập tên Tỉnh / Thành phố");
      return;
    }
    if (trimmed.length < 2) {
      setError("Tên Tỉnh / Thành phố phải có ít nhất 2 ký tự");
      return;
    }

    if (isEditing && province) {
      updateMutation.mutate(
        {
          id: province.id,
          payload: {
            name: trimmed,
            isCentrallyGoverned,
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
          name: trimmed,
          isCentrallyGoverned,
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
          {isEditing
            ? "Chỉnh sửa Tỉnh / Thành phố"
            : "Thêm Tỉnh / Thành phố mới"}
        </DialogTitle>
        <DialogDescription className="text-xs text-text-muted">
          {isEditing
            ? "Cập nhật tên, phân cấp quản lý hoặc trạng thái hoạt động"
            : "Thêm đơn vị hành chính cấp tỉnh vào danh mục hệ thống"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-main">
            Tên Tỉnh / Thành phố <span className="text-status-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ví dụ: TP. Hà Nội, TP. Hồ Chí Minh, Bình Dương..."
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main transition-colors focus:border-primary focus:bg-surface focus:outline-none"
            autoFocus
          />
          {error && <p className="text-[11px] text-status-error">{error}</p>}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
          <div>
            <p className="text-xs font-semibold text-text-main">
              Thành phố trực thuộc Trung ương
            </p>
            <p className="text-[11px] text-text-muted">
              Bật nếu đây là đô thị đặc biệt/loại 1 do Trung ương trực tiếp quản
              lý
            </p>
          </div>
          <Switch
            checked={isCentrallyGoverned}
            onCheckedChange={setIsCentrallyGoverned}
          />
        </div>

        {isEditing && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3.5 py-2.5">
            <div>
              <p className="text-xs font-semibold text-text-main">
                Trạng thái hoạt động
              </p>
              <p className="text-[11px] text-text-muted">
                Khi tắt, địa bàn này sẽ tạm ẩn khỏi bộ lọc việc làm và ứng viên
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
            {isEditing ? "Lưu thay đổi" : "Tạo Tỉnh / Thành"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ProvinceDialog({
  open,
  onOpenChange,
  province,
  onSuccess,
}: ProvinceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md p-5 sm:p-6 shadow-none">
        {open && (
          <ProvinceForm
            key={province?.id || "create"}
            province={province}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
