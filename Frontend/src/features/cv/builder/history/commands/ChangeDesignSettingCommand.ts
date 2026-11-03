import type { FieldPath } from "react-hook-form";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import type { CvCommand, CvSetValueFn } from "./types";

/**
 * ChangeDesignSettingCommand:
 * Đổi font, tỉ lệ chữ, khoảng cách dòng hoặc màu chủ đạo.
 */
export class ChangeDesignSettingCommand implements CvCommand {
  readonly settingName:
    | "fontFamily"
    | "fontScale"
    | "lineHeight"
    | "primaryColors";
  readonly path: FieldPath<RichTextCvEditorValues>;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  private readonly setValue: CvSetValueFn;
  readonly description: string;

  constructor(
    settingName:
      | "fontFamily"
      | "fontScale"
      | "lineHeight"
      | "primaryColors",
    path: FieldPath<RichTextCvEditorValues>,
    oldValue: unknown,
    newValue: unknown,
    setValue: CvSetValueFn,
  ) {
    this.settingName = settingName;
    this.path = path;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.setValue = setValue;
    this.description = `Đổi thiết kế: ${settingName}`;
  }

  execute(): void {
    this.setValue(this.path as never, this.newValue as never, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  undo(): void {
    this.setValue(this.path as never, this.oldValue as never, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  redo(): void {
    this.execute();
  }
}
