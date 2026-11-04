import type { CVLayoutDocument } from "@/types/cv";
import type { CvCommand, CvSetValueFn } from "./types";

/**
 * ReorderAreaSectionsCommand:
 * Đổi thứ tự section trong cùng một layout area.
 */
export class ReorderAreaSectionsCommand implements CvCommand {
  readonly areaId: string;
  readonly oldLayout: CVLayoutDocument;
  readonly newLayout: CVLayoutDocument;
  private readonly setValue: CvSetValueFn;
  readonly description: string;

  constructor(
    areaId: string,
    oldLayout: CVLayoutDocument,
    newLayout: CVLayoutDocument,
    setValue: CvSetValueFn,
  ) {
    this.areaId = areaId;
    this.oldLayout = oldLayout;
    this.newLayout = newLayout;
    this.setValue = setValue;
    this.description = `Sắp xếp thứ tự section vùng ${areaId}`;
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
