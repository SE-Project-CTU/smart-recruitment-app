import React from "react";
import { ColorPickerSection } from "./design/ColorPickerSection";
import { FontFamilySection } from "./design/FontFamilySection";
import { FontScaleSection } from "./design/FontScaleSection";
import { LineHeightSection } from "./design/LineHeightSection";

/**
 * CvBuilderDesignTab:
 * Component nội dung tab Thiết kế:
 * - Màu sắc chủ đạo (ColorPickerSection)
 * - Font chữ (FontFamilySection)
 * - Tỉ lệ kích thước chữ (FontScaleSection)
 * - Khoảng cách dòng (LineHeightSection)
 */
export const CvBuilderDesignTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Bảng màu chủ đạo */}
      <ColorPickerSection />

      {/* 2. Chọn Font chữ */}
      <FontFamilySection />

      {/* 3. Tỉ lệ cỡ chữ */}
      <FontScaleSection />

      {/* 4. Khoảng cách dòng */}
      <LineHeightSection />
    </div>
  );
};
