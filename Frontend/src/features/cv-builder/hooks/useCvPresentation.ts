import { useFormContext } from "react-hook-form";
import type { CvEditorValues } from "@/features/cv-builder/schema/cvSchema";
import type { CVFieldStyle } from "@/types/cv";

/**
 * Hook chuyên biệt hỗ trợ cập nhật Presentation (Styles) cho từng Field hoặc Global Styles:
 * - updateFieldStyle: Cập nhật hoặc merge style cho 1 field cụ thể (ví dụ: 'profile.fullName', 'exp_01.position')
 * - setFieldStyleProperty: Đặt 1 thuộc tính đơn lẻ (color, fontSize, fontWeight,...)
 * - removeFieldStyle: Xóa cấu hình style của 1 field (đưa về mặc định)
 * - toggleFieldBold: Bật/tắt in đậm (bold / normal)
 * - toggleFieldItalic: Bật/tắt in nghiêng (italic / normal)
 * - toggleFieldUnderline: Bật/tắt gạch chân (underline / none)
 * - setFieldTextAlign: Căn lề văn bản (left | center | right | justify)
 * - updateGlobalStyle: Cập nhật font, primaryColor, baseFontSize, lineHeight
 */
export function useCvPresentation() {
  const { getValues, setValue } = useFormContext<CvEditorValues>();

  /**
   * Lấy style hiện tại của 1 field
   */
  const getFieldStyle = (fieldPath: string): CVFieldStyle | undefined => {
    const fields = getValues("presentation.styles.fields") || {};
    return fields[fieldPath];
  };

  /**
   * Cập nhật/Merge một tập thuộc tính style cho field
   * @param fieldPath Đường dẫn định danh field, ví dụ: 'profile.fullName', 'exp_01.position'
   * @param partialStyle Thuộc tính cần cập nhật
   */
  const updateFieldStyle = (fieldPath: string, partialStyle: Partial<CVFieldStyle>) => {
    const currentFields = getValues("presentation.styles.fields") || {};
    const existingStyle = currentFields[fieldPath] || {};

    const updatedFields = {
      ...currentFields,
      [fieldPath]: {
        ...existingStyle,
        ...partialStyle,
      },
    };

    setValue("presentation.styles.fields", updatedFields, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * Đặt giá trị cho 1 thuộc tính style cụ thể của field
   */
  const setFieldStyleProperty = <K extends keyof CVFieldStyle>(
    fieldPath: string,
    property: K,
    value: CVFieldStyle[K]
  ) => {
    updateFieldStyle(fieldPath, { [property]: value });
  };

  /**
   * Xóa toàn bộ style tùy chỉnh của 1 field (đưa về kế thừa mặc định)
   */
  const removeFieldStyle = (fieldPath: string) => {
    const currentFields = getValues("presentation.styles.fields") || {};
    if (!currentFields[fieldPath]) return;

    const updatedFields = { ...currentFields };
    delete updatedFields[fieldPath];

    setValue("presentation.styles.fields", updatedFields, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  /**
   * Bật/tắt in đậm (bold) cho field
   */
  const toggleFieldBold = (fieldPath: string) => {
    const current = getFieldStyle(fieldPath)?.fontWeight;
    const isBold = current === "bold" || current === "700" || current === "600";
    setFieldStyleProperty(fieldPath, "fontWeight", isBold ? "normal" : "bold");
  };

  /**
   * Bật/tắt in nghiêng (italic) cho field
   */
  const toggleFieldItalic = (fieldPath: string) => {
    const current = getFieldStyle(fieldPath)?.fontStyle;
    setFieldStyleProperty(fieldPath, "fontStyle", current === "italic" ? "normal" : "italic");
  };

  /**
   * Bật/tắt gạch chân (underline) cho field
   */
  const toggleFieldUnderline = (fieldPath: string) => {
    const current = getFieldStyle(fieldPath)?.textDecoration;
    setFieldStyleProperty(fieldPath, "textDecoration", current === "underline" ? "none" : "underline");
  };

  /**
   * Đặt căn lề (left | center | right | justify) cho field
   */
  const setFieldTextAlign = (
    fieldPath: string,
    align: "left" | "center" | "right" | "justify" | null
  ) => {
    setFieldStyleProperty(fieldPath, "textAlign", align);
  };

  /**
   * Cập nhật màu chữ cho field
   */
  const setFieldColor = (fieldPath: string, color: string) => {
    setFieldStyleProperty(fieldPath, "color", color);
  };

  /**
   * Cập nhật cỡ chữ (px) cho field
   */
  const setFieldFontSize = (fieldPath: string, fontSize: number) => {
    setFieldStyleProperty(fieldPath, "fontSize", fontSize);
  };

  return {
    getFieldStyle,
    updateFieldStyle,
    setFieldStyleProperty,
    removeFieldStyle,
    toggleFieldBold,
    toggleFieldItalic,
    toggleFieldUnderline,
    setFieldTextAlign,
    setFieldColor,
    setFieldFontSize,
  };
}
