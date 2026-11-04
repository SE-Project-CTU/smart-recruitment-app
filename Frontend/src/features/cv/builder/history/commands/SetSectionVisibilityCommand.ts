import type { FixedSectionKey } from "../../../types";
import type { CvCommand, CvSetValueFn } from "./types";

/**
 * SetSectionVisibilityCommand:
 * Bật hoặc tắt trạng thái hiển thị của một section.
 */
export class SetSectionVisibilityCommand implements CvCommand {
  readonly sectionKey: FixedSectionKey;
  readonly oldVisible: boolean;
  readonly newVisible: boolean;
  private readonly setValue: CvSetValueFn;
  readonly description: string;

  constructor(
    sectionKey: FixedSectionKey,
    oldVisible: boolean,
    newVisible: boolean,
    setValue: CvSetValueFn,
  ) {
    this.sectionKey = sectionKey;
    this.oldVisible = oldVisible;
    this.newVisible = newVisible;
    this.setValue = setValue;
    this.description = `${newVisible ? "Hiện" : "Ẩn"} mục ${sectionKey}`;
  }

  execute(): void {
    this.setValue(
      `content.sections.${this.sectionKey}.visible` as never,
      this.newVisible as never,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  undo(): void {
    this.setValue(
      `content.sections.${this.sectionKey}.visible` as never,
      this.oldVisible as never,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  redo(): void {
    this.execute();
  }
}
