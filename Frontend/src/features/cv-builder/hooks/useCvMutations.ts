import { useFormContext } from "react-hook-form";
import type { CvEditorValues } from "../schema/cvSchema";
import type { FixedSectionKey } from "../types";

/**
 * Hook quản lý các thao tác mutation nghiệp vụ trên CV:
 * - Đổi thứ tự sections (order)
 * - Đổi visibility của section
 * - Phân bố sections vào areas
 * - Dọn dẹp dynamic style keys khi xóa item
 */
export function useCvMutations() {
  const { getValues, setValue } = useFormContext<CvEditorValues>();

  /**
   * Xóa toàn bộ dynamic style key liên quan đến itemId vừa bị xóa
   */
  const cleanupItemStyles = (itemId: string) => {
    const currentFields = getValues("presentation.styles.fields") || {};
    const updatedFields = { ...currentFields };
    let hasChanged = false;

    for (const key of Object.keys(updatedFields)) {
      if (key.startsWith(`${itemId}.`)) {
        delete updatedFields[key];
        hasChanged = true;
      }
    }

    if (hasChanged) {
      setValue("presentation.styles.fields", updatedFields, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  /**
   * Thay đổi thứ tự sections
   */
  const reorderSections = (newOrder: string[]) => {
    setValue("content.sections.order", newOrder, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * Cập nhật trạng thái hiển thị (visible) của 1 section
   */
  const toggleSectionVisibility = (sectionKey: FixedSectionKey) => {
    const current = getValues(`content.sections.${sectionKey}.visible`);
    setValue(`content.sections.${sectionKey}.visible`, !current, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * Di chuyển 1 section sang 1 layout area khác
   */
  const moveSectionToArea = (sectionKey: string, targetAreaId: string) => {
    const areas = getValues("layout.areas") || [];
    const updatedAreas = areas.map((area) => {
      // Bỏ section khỏi các area khác
      const filtered = area.sections.filter((s) => s !== sectionKey);
      if (area.id === targetAreaId) {
        return {
          ...area,
          sections: [...filtered, sectionKey],
        };
      }
      return {
        ...area,
        sections: filtered,
      };
    });

    setValue("layout.areas", updatedAreas, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return {
    cleanupItemStyles,
    reorderSections,
    toggleSectionVisibility,
    moveSectionToArea,
  };
}
