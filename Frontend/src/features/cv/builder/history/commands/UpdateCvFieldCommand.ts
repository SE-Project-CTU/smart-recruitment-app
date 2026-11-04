import type { FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import type { CvCommand, CvSetValueFn } from "./types";

/**
 * UpdateCvFieldCommand:
 * Lưu giá trị trước và sau của một field rich text hoặc scalar.
 */
export class UpdateCvFieldCommand implements CvCommand {
  readonly fieldName: FieldPath<RichTextCvEditorValues>;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  private readonly setValue: CvSetValueFn;
  readonly description: string;

  constructor(
    fieldName: FieldPath<RichTextCvEditorValues>,
    oldValue: unknown,
    newValue: unknown,
    setValue: CvSetValueFn,
  ) {
    this.fieldName = fieldName;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.setValue = setValue;
    this.description = `Cập nhật trường: ${fieldName}`;
  }

  execute(): void {
    this.setValue(this.fieldName as never, this.newValue as never, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  undo(): void {
    this.setValue(this.fieldName as never, this.oldValue as never, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  redo(): void {
    this.execute();
  }
}
