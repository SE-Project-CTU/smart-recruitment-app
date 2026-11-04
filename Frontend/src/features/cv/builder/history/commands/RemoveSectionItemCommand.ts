import type { CvCommand, CvSetValueFn, CvGetValuesFn } from "./types";

/**
 * RemoveSectionItemCommand:
 * Xóa một item khỏi danh sách section, lưu lại dữ liệu và vị trí để Undo phục hồi.
 */
export class RemoveSectionItemCommand implements CvCommand {
  readonly sectionKey: string;
  readonly index: number;
  readonly item: unknown;
  private readonly setValue: CvSetValueFn;
  private readonly getValues: CvGetValuesFn;
  readonly description: string;

  constructor(
    sectionKey: string,
    index: number,
    item: unknown,
    setValue: CvSetValueFn,
    getValues: CvGetValuesFn,
  ) {
    this.sectionKey = sectionKey;
    this.index = index;
    this.item = item;
    this.setValue = setValue;
    this.getValues = getValues;
    this.description = `Xóa mục trong ${sectionKey} tại vị trí ${index}`;
  }

  execute(): void {
    const fieldPath = `content.sections.${this.sectionKey}.items`;
    const current =
      (this.getValues(fieldPath as any) as unknown as unknown[]) || [];
    const updated = [...current];
    updated.splice(this.index, 1);
    this.setValue(fieldPath as never, updated as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  undo(): void {
    const fieldPath = `content.sections.${this.sectionKey}.items`;
    const current =
      (this.getValues(fieldPath as any) as unknown as unknown[]) || [];
    const updated = [...current];
    updated.splice(this.index, 0, this.item);
    this.setValue(fieldPath as never, updated as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  redo(): void {
    this.execute();
  }
}
