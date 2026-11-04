import type { CvCommand, CvSetValueFn, CvGetValuesFn } from "./types";

/**
 * MoveSectionItemCommand:
 * Đổi vị trí item trong danh sách section (move up/down).
 */
export class MoveSectionItemCommand implements CvCommand {
  readonly sectionKey: string;
  readonly fromIndex: number;
  readonly toIndex: number;
  private readonly setValue: CvSetValueFn;
  private readonly getValues: CvGetValuesFn;
  readonly description: string;

  constructor(
    sectionKey: string,
    fromIndex: number,
    toIndex: number,
    setValue: CvSetValueFn,
    getValues: CvGetValuesFn,
  ) {
    this.sectionKey = sectionKey;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.setValue = setValue;
    this.getValues = getValues;
    this.description = `Đổi vị trí mục trong ${sectionKey} từ ${fromIndex} sang ${toIndex}`;
  }

  execute(): void {
    const fieldPath = `content.sections.${this.sectionKey}.items`;
    const current =
      (this.getValues(fieldPath as any) as unknown as unknown[]) || [];
    if (
      this.fromIndex < 0 ||
      this.fromIndex >= current.length ||
      this.toIndex < 0 ||
      this.toIndex >= current.length
    ) {
      return;
    }
    const updated = [...current];
    const [moved] = updated.splice(this.fromIndex, 1);
    updated.splice(this.toIndex, 0, moved);
    this.setValue(fieldPath as never, updated as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  undo(): void {
    const fieldPath = `content.sections.${this.sectionKey}.items`;
    const current =
      (this.getValues(fieldPath as any) as unknown as unknown[]) || [];
    if (
      this.toIndex < 0 ||
      this.toIndex >= current.length ||
      this.fromIndex < 0 ||
      this.fromIndex >= current.length
    ) {
      return;
    }
    const updated = [...current];
    const [moved] = updated.splice(this.toIndex, 1);
    updated.splice(this.fromIndex, 0, moved);
    this.setValue(fieldPath as never, updated as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  redo(): void {
    this.execute();
  }
}
