import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCvTemplates } from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import type { CVTemplateItemData } from "@/components/common/CVTemplateCard";
import type { RichTextCVDetail } from "@/types/cv";
import {
  CvTemplatesHeader,
  CvTemplatesGrid,
  CreateCvFromTemplateModal,
  PreviewTemplateModal,
} from "./components/cv-templates";

export default function CandidateCvTemplatesPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data: templateData, isLoading: isLoadingTemplates } = useCvTemplates({
    search: searchKeyword.trim() || undefined,
  });

  const templates = useMemo(
    () => templateData?.items ?? [],
    [templateData?.items],
  );

  // State modals
  const [selectedTemplate, setSelectedTemplate] =
    useState<CVTemplateItemData | null>(null);
  const [previewTemplate, setPreviewTemplate] =
    useState<CVTemplateItemData | null>(null);

  // Danh sách template map theo giao diện CVTemplateItemData
  const templateList: CVTemplateItemData[] = useMemo(() => {
    return templates.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      description: t.description,
      thumbnailUrl: t.thumbnailUrl,
      badge: "Chuẩn ATS",
    }));
  }, [templates]);

  // Sau khi tạo CV thành công từ template -> đóng modal và điều hướng sang trang /candidate/edit-cv
  const handleCreateSuccess = (createdCv: RichTextCVDetail) => {
    setSelectedTemplate(null);
    navigate(`${PATHS.CANDIDATE.EDIT_CV}?id=${createdCv.id}`);
  };

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Tiêu đề & Ô tìm kiếm */}
      <CvTemplatesHeader
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        onClearSearch={() => setSearchKeyword("")}
      />

      {/* Lưới hiển thị danh sách Templates */}
      <CvTemplatesGrid
        templates={templateList}
        isLoading={isLoadingTemplates}
        searchKeyword={searchKeyword}
        onClearSearch={() => setSearchKeyword("")}
        onUseTemplate={setSelectedTemplate}
        onPreview={setPreviewTemplate}
      />

      {/* Modal: Khởi tạo CV mới từ Mẫu */}
      <CreateCvFromTemplateModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal: Xem trước Mẫu CV (fetch detail và hiển thị qua component tương ứng) */}
      <PreviewTemplateModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={(tpl) => {
          setPreviewTemplate(null);
          setSelectedTemplate(tpl);
        }}
      />
    </div>
  );
}
