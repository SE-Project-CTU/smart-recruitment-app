import type {
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";

export interface CvCommand {
  readonly description?: string;
  execute(): void;
  undo(): void;
  redo(): void;
}

export type CvSetValueFn = UseFormSetValue<RichTextCvEditorValues>;
export type CvGetValuesFn = UseFormGetValues<RichTextCvEditorValues>;
