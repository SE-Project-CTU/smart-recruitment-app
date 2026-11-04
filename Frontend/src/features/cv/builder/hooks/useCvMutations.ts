import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import type { FixedSectionKey } from "../../types";
import {
  useCvHistory,
  ReorderAreaSectionsCommand,
  SetSectionVisibilityCommand,
  MoveSectionBetweenAreasCommand,
} from "../history";

/**
 * Hook quản lý các thao tác mutation nghiệp vụ trên CV:
 * - Đổi thứ tự sections theo layout.areas
 * - Đổi visibility của section
 * - Phân bố sections vào areas
 * Đã tích hợp Command Pattern (CvCommandHistory) hỗ trợ Undo/Redo.
 */
export function useCvMutations() {
  const { getValues, setValue } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  /**
   * Thay đổi thứ tự sections trong 1 area cụ thể của layout
   */
  const reorderAreaSections = useCallback(
    (areaId: string, newSections: (FixedSectionKey | string)[]) => {
      const currentLayout = getValues("layout");
      const areas = currentLayout?.areas || [];
      const typedSections = newSections as FixedSectionKey[];
      const updatedAreas = areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            sections: typedSections,
          };
        }
        return area;
      });

      const updatedLayout = {
        ...currentLayout,
        areas: updatedAreas,
      };

      const command = new ReorderAreaSectionsCommand(
        areaId,
        currentLayout,
        updatedLayout,
        setValue,
      );
      executeCommand(command);
    },
    [getValues, setValue, executeCommand],
  );

  /**
   * Thay đổi thứ tự sections legacy (cho main area)
   */
  const reorderSections = useCallback(
    (newOrder: (FixedSectionKey | string)[]) => {
      reorderAreaSections("main", newOrder);
    },
    [reorderAreaSections],
  );

  /**
   * Cập nhật trạng thái hiển thị (visible) của 1 section
   */
  const toggleSectionVisibility = useCallback(
    (sectionKey: FixedSectionKey) => {
      const current = getValues(`content.sections.${sectionKey}.visible`);
      const isCurrentlyVisible = current !== false;

      const command = new SetSectionVisibilityCommand(
        sectionKey,
        isCurrentlyVisible,
        !isCurrentlyVisible,
        setValue,
      );
      executeCommand(command);
    },
    [getValues, setValue, executeCommand],
  );

  /**
   * Di chuyển 1 section sang 1 layout area khác
   */
  const moveSectionToArea = useCallback(
    (sectionKey: string, targetAreaId: string) => {
      const typedKey = sectionKey as FixedSectionKey;
      const currentLayout = getValues("layout");
      const areas = currentLayout?.areas || [];
      const updatedAreas = areas.map((area) => {
        const filtered = area.sections.filter((s) => s !== typedKey);
        if (area.id === targetAreaId) {
          return {
            ...area,
            sections: [...filtered, typedKey],
          };
        }
        return {
          ...area,
          sections: filtered,
        };
      });

      const updatedLayout = {
        ...currentLayout,
        areas: updatedAreas,
      };

      const command = new MoveSectionBetweenAreasCommand(
        currentLayout,
        updatedLayout,
        setValue,
      );
      executeCommand(command);
    },
    [getValues, setValue, executeCommand],
  );

  /**
   * Di chuyển 1 section giữa 2 areas tại index cụ thể
   */
  const moveSectionBetweenAreas = useCallback(
    (
      sourceAreaId: string,
      destAreaId: string,
      sourceIndex: number,
      destIndex: number,
    ) => {
      const currentLayout = getValues("layout");
      const areas = currentLayout?.areas || [];
      const sourceArea = areas.find((a) => a.id === sourceAreaId);
      const destArea = areas.find((a) => a.id === destAreaId);
      if (!sourceArea || !destArea) return;

      if (sourceAreaId === destAreaId) {
        const newSections = Array.from(sourceArea.sections);
        const [removed] = newSections.splice(sourceIndex, 1);
        if (removed) {
          newSections.splice(destIndex, 0, removed);
          reorderAreaSections(sourceAreaId, newSections);
        }
        return;
      }

      const sourceSections = Array.from(sourceArea.sections);
      const [moved] = sourceSections.splice(sourceIndex, 1);
      if (!moved) return;

      const destSections = Array.from(destArea.sections);
      destSections.splice(destIndex, 0, moved);

      const updatedAreas = areas.map((area) => {
        if (area.id === sourceAreaId) {
          return { ...area, sections: sourceSections as FixedSectionKey[] };
        }
        if (area.id === destAreaId) {
          return { ...area, sections: destSections as FixedSectionKey[] };
        }
        return area;
      });

      const updatedLayout = {
        ...currentLayout,
        areas: updatedAreas,
      };

      const command = new MoveSectionBetweenAreasCommand(
        currentLayout,
        updatedLayout,
        setValue,
      );
      executeCommand(command);
    },
    [getValues, setValue, reorderAreaSections, executeCommand],
  );

  return {
    reorderAreaSections,
    reorderSections,
    toggleSectionVisibility,
    moveSectionToArea,
    moveSectionBetweenAreas,
  };
}
