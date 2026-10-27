import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import type { CvEditorValues } from "../../schema/cvSchema";
import { useCvMutations } from "../../hooks/useCvMutations";

const SECTION_LABEL_MAP: Record<string, string> = {
  objective: "Mục tiêu nghề nghiệp",
  education: "Học vấn",
  experience: "Kinh nghiệm làm việc",
  skills: "Kỹ năng chuyên môn",
  projects: "Dự án nổi bật",
  certifications: "Chứng chỉ",
  awards: "Giải thưởng",
  interests: "Sở thích",
  additionalInfo: "Thông tin bổ sung",
};

interface SectionOrderEditorProps {
  isReadOnly?: boolean;
}

export const SectionOrderEditor: React.FC<SectionOrderEditorProps> = ({
  isReadOnly = false,
}) => {
  const { control } = useFormContext<CvEditorValues>();
  const order = useWatch({
    control,
    name: "content.sections.order",
  }) || [];

  const { reorderSections } = useCvMutations();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || isReadOnly) return;
    const reordered = Array.from(order);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    reorderSections(reordered);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <h3 className="mb-2 text-base font-semibold text-text-main">
        Thứ tự hiển thị các mục (Kéo thả để sắp xếp)
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Thay đổi thứ tự hiển thị của các section trên template CV
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="section-order-list" isDropDisabled={isReadOnly}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
            >
              {order.map((key, index) => (
                <Draggable
                  key={key}
                  draggableId={key}
                  index={index}
                  isDragDisabled={isReadOnly}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-xs font-medium text-text-main transition-all ${
                        snapshot.isDragging
                          ? "shadow-lg ring-2 ring-primary bg-surface z-50"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {!isReadOnly && (
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab text-text-muted hover:text-primary active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="truncate">{SECTION_LABEL_MAP[key] || key}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
