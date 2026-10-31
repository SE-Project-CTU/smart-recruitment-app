import React, { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/common";
import { useCreateCv } from "@/hooks/queries/useCv";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";
import type { RichTextCVDetail } from "@/types/cv";

interface CreateCvFromTemplateModalProps {
  template: CVTemplateItemData | null;
  onClose: () => void;
  onSuccess: (createdCv: RichTextCVDetail) => void;
}

interface CreateCvModalFormProps {
  template: CVTemplateItemData;
  onClose: () => void;
  onSuccess: (createdCv: RichTextCVDetail) => void;
}

const CreateCvModalForm: React.FC<CreateCvModalFormProps> = ({
  template,
  onClose,
  onSuccess,
}) => {
  const [cvTitle, setCvTitle] = useState(`CV ${template.name}`);
  const [cvLanguage, setCvLanguage] = useState<"vi" | "en">("vi");

  const { mutateAsync: createCv, isPending: isCreatingCv } = useCreateCv();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvTitle.trim()) return;

    try {
      const createdCv = await createCv({
        templateId: template.id,
        title: cvTitle.trim(),
        language: cvLanguage,
      });
      onSuccess(createdCv);
    } catch {
      // Đã bắt và hiển thị toast trong hook useCreateCv
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-text-main">
          Tạo CV từ mẫu
        </h3>
        <button
          type="button"
          onClick={onClose}
          disabled={isCreatingCv}
          className="cursor-pointer rounded-lg p-1 text-text-muted hover:bg-bg hover:text-text-main"
          title="Đóng modal"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <span className="text-xs text-text-muted">Mẫu đã chọn</span>
          <p className="font-semibold text-text-main">{template.name}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main">
            Đặt tên cho CV <span className="text-status-error">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: CV Lập trình viên Frontend 2026"
            value={cvTitle}
            onChange={(e) => setCvTitle(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-text-main focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main">
            Ngôn ngữ soạn thảo
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCvLanguage("vi")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-all ${
                cvLanguage === "vi"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-bg text-text-muted hover:text-text-main"
              }`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => setCvLanguage("en")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-all ${
                cvLanguage === "en"
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-bg text-text-muted hover:text-text-main"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isCreatingCv}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isCreatingCv}
            icon={ArrowRight}
          >
            Bắt đầu tạo CV
          </Button>
        </div>
      </form>
    </>
  );
};

export const CreateCvFromTemplateModal: React.FC<
  CreateCvFromTemplateModalProps
> = ({ template, onClose, onSuccess }) => {
  if (!template) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-xl">
        <CreateCvModalForm
          key={template.id}
          template={template}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
};
