import type { CVLayoutDocument } from "@/types/cv";
import type { CvCommand, CvSetValueFn } from "./types";

/**
 * MoveSectionBetweenAreasCommand:
 * Chuyển section giữa hai area khác nhau.
 */
export class MoveSectionBetweenAreasCommand implements CvCommand {
  readonly oldLayout: CVLayoutDocument;
  readonly newLayout: CVLayoutDocument;
  private readonly setValue: CvSetValueFn;
  readonly description: string;

  constructor(
    oldLayout: CVLayoutDocument,
    newLayout: CVLayoutDocument,
    setValue: CvSetValueFn,
  ) {
    this.oldLayout = oldLayout;
    this.newLayout = newLayout;
    this.setValue = setValue;
    this.description = "Di chuyển section giữa các vùng bố cục";
  }

  execute(): void {
    this.setValue("layout" as never, this.newLayout as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    this.setValue("layout.areas" as never, this.newLayout.areas as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  undo(): void {
    this.setValue("layout" as never, this.oldLayout as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    this.setValue("layout.areas" as never, this.oldLayout.areas as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  redo(): void {
    this.execute();
  }
}
