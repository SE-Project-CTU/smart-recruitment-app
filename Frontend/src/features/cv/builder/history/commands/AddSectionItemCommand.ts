import type { CvCommand, CvSetValueFn, CvGetValuesFn } from "./types";

/**
 * AddSectionItemCommand:
 * Thêm một item vào danh sách section tại vị trí index.
 */
export class AddSectionItemCommand implements CvCommand {
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
    this.description = `Thêm mục mới vào ${sectionKey} tại vị trí ${index}`;
  }

  execute(): void {
    const fieldPath = `content.sections.${this.sectionKey}.items`;
    const current =
      (this.getValues(fieldPath as any) as unknown as unknown[]) || [];
    const updated = [...current];
    updated.splice(this.index, 0, this.item);
    this.setValue(fieldPath as never, updated as never, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  undo(): void {
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

  redo(): void {
    this.execute();
  }
}
