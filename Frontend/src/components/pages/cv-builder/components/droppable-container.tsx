import {
  type DroppableProps,
  Droppable,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export interface DroppableContainerProps
  extends Omit<DroppableProps, "children"> {
  className?: string;
  children: DroppableProps["children"];
}

function DroppableContainer({
  className,
  children,
  ...props
}: DroppableContainerProps) {
  return (
    <Droppable {...props}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(className)}
        >
          {children(provided, snapshot)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default DroppableContainer;
