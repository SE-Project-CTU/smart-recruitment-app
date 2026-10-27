import React from "react";
import {
  ProfileEditor,
  TextSectionEditor,
  ExperienceEditor,
  EducationEditor,
  SkillsEditor,
  ProjectsEditor,
  CertificationsAwardsEditor,
  SectionOrderEditor,
  PresentationEditor,
  CvMetaBar,
} from "./sections";

interface CvEditorPanelProps {
  isReadOnly?: boolean;
}

export const CvEditorPanel: React.FC<CvEditorPanelProps> = ({ isReadOnly = false }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Thanh tiêu đề và cài đặt cơ bản của CV */}
      <CvMetaBar isReadOnly={isReadOnly} />

      {/* 2. Cài đặt giao diện & font chữ & màu sắc */}
      <PresentationEditor isReadOnly={isReadOnly} />

      {/* 3. Thứ tự hiển thị các Section (Kéo thả reorder) */}
      <SectionOrderEditor isReadOnly={isReadOnly} />

      {/* 4. Thông tin cá nhân Profile */}
      <ProfileEditor isReadOnly={isReadOnly} />

      {/* 5. Mục tiêu nghề nghiệp */}
      <TextSectionEditor
        sectionKey="objective"
        defaultTitle="Mục tiêu nghề nghiệp"
        isReadOnly={isReadOnly}
      />

      {/* 6. Kinh nghiệm làm việc */}
      <ExperienceEditor isReadOnly={isReadOnly} />

      {/* 7. Học vấn */}
      <EducationEditor isReadOnly={isReadOnly} />

      {/* 8. Kỹ năng chuyên môn */}
      <SkillsEditor isReadOnly={isReadOnly} />

      {/* 9. Dự án tiêu biểu */}
      <ProjectsEditor isReadOnly={isReadOnly} />

      {/* 10. Chứng chỉ & Giải thưởng */}
      <CertificationsAwardsEditor isReadOnly={isReadOnly} />

      {/* 11. Sở thích */}
      <TextSectionEditor
        sectionKey="interests"
        defaultTitle="Sở thích"
        isReadOnly={isReadOnly}
      />

      {/* 12. Thông tin bổ sung */}
      <TextSectionEditor
        sectionKey="additionalInfo"
        defaultTitle="Thông tin bổ sung"
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
