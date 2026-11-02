import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import type { FixedSectionKey } from "../../types";
import type { RichTextCVSections } from "@/types/cv";
import type { CvFieldRenderer, CvSectionEditorsMap } from "../types";
import { DraggableSectionCard } from "./DraggableSectionCard";
import { SectionRenderer } from "./SectionRenderer";

interface AreaSectionListProps {
  areaId: string;
  sectionsList: string[];
  sections: RichTextCVSections;
  primaryColor?: string;
  isReadOnly?: boolean;
  canDrag: boolean;
  renderField: CvFieldRenderer;
  sectionEditors?: Partial<CvSectionEditorsMap>;
  onMoveSectionInArea: (
    areaId: string,
    index: number,
    direction: "up" | "down",
  ) => void;
  onToggleSectionVisibility?: (sectionKey: FixedSectionKey) => void;
}

/**
 * AreaSectionList:
 * Danh sách kéo thả riêng biệt cho từng area (sidebar hoặc main).
 * Bọc Droppable và render các DraggableSectionCard.
 * Được bọc React.memo để tránh re-render khi area khác thay đổi.
 */
export const AreaSectionList = React.memo<AreaSectionListProps>(
  ({
    areaId,
    sectionsList,
    sections,
    primaryColor,
    isReadOnly = false,
    canDrag,
    renderField,
    sectionEditors,
    onMoveSectionInArea,
    onToggleSectionVisibility,
  }) => {
    const isSectionVisible = (key: string): boolean => {
      const sec = sections[key as keyof typeof sections];
      if (!sec || typeof sec !== "object") return true;
      return (sec as { visible?: boolean }).visible !== false;
    };

    if (canDrag) {
      return (
        <Droppable droppableId={areaId} isDropDisabled={isReadOnly}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-[120px]"
            >
              {sectionsList.map((sectionKey, index) => {
                const visible = isSectionVisible(sectionKey);
                return (
                  <DraggableSectionCard
                    key={sectionKey}
                    sectionKey={sectionKey}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === sectionsList.length - 1}
                    visible={visible}
                    isReadOnly={isReadOnly}
                    onMoveUp={() => onMoveSectionInArea(areaId, index, "up")}
                    onMoveDown={() =>
                      onMoveSectionInArea(areaId, index, "down")
                    }
                    onToggleVisibility={() =>
                      onToggleSectionVisibility?.(
                        sectionKey as FixedSectionKey,
                      )
                    }
                  >
                    <SectionRenderer
                      sectionKey={sectionKey}
                      sections={sections}
                      primaryColor={primaryColor}
                      isReadOnly={isReadOnly}
                      renderField={renderField}
                      sectionEditors={sectionEditors}
                    />
                  </DraggableSectionCard>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return (
      <div>
        {sectionsList
          .filter((sectionKey) => isSectionVisible(sectionKey))
          .map((sectionKey) => (
            <div key={sectionKey} className="relative rounded-sm">
              <SectionRenderer
                sectionKey={sectionKey}
                sections={sections}
                primaryColor={primaryColor}
                isReadOnly={isReadOnly}
                renderField={renderField}
                sectionEditors={sectionEditors}
              />
            </div>
          ))}
      </div>
    );
  },
);

AreaSectionList.displayName = "AreaSectionList";
