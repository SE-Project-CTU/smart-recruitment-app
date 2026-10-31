// ==========================================
// 1. Templates & Preview Workspace
// ==========================================
export {
  CvPreviewWorkspace,
  type CvPreviewWorkspaceProps,
} from "./templates/CvPreviewWorkspace";
export {
  ModernTwoColumnTemplate,
} from "./templates/ModernTwoColumn";
export {
  TEMPLATE_REGISTRY,
  getCvTemplateComponent,
} from "./templates/registry";
export type {
  CvTemplateProps,
  CvRenderData,
  CvFieldRenderer,
  CvFieldRenderProps,
  SectionItemEditorActions,
  CvSectionEditorsMap,
} from "./templates/types";

// ==========================================
// 2. Builder Components, Hooks & Form
// ==========================================
export {
  CVBuilderFormContainer,
} from "./builder/components/CVBuilderFormContainer";
export {
  default as CvBuilderWorkspace,
} from "./builder/components/CvBuilderWorkspace";
export {
  default as CvBuilderWysiwygToolbar,
} from "./builder/components/CvBuilderWysiwygToolbar";
export {
  CvPreviewModal,
} from "./builder/components/CvPreviewModal";
export {
  TiptapField,
} from "./builder/components/TiptapField";
export {
  CvTiptapReadOnlyView,
} from "./builder/components/CvTiptapReadOnlyView";
export {
  default as DraggableSectionActions,
} from "./builder/components/DraggableSectionActions";
export {
  default as ItemActions,
} from "./builder/components/ItemActions";
export {
  CvDateRangeFields,
} from "./builder/components/CvDateRangeFields";

export { useCvMutations } from "./builder/hooks/useCvMutations";
export {
  useCvSectionEditors,
  useExperienceSectionEditor,
  useEducationSectionEditor,
  useSkillsSectionEditor,
  useProjectsSectionEditor,
  useCertificationsSectionEditor,
  useAwardsSectionEditor,
} from "./builder/hooks/useSectionEditors";

// ==========================================
// 3. Schema & Validation
// ==========================================
export {
  richTextCvEditorSchema,
  type RichTextCvEditorValues,
} from "./builder/schema/richTextCvSchema";
export {
  cvEditorSchema,
  type CvEditorValues,
  type FixedSectionKey,
  FIXED_SECTION_KEYS,
} from "./builder/schema/cvSchema";

// ==========================================
// 4. Utilities
// ==========================================
export {
  buildRichTextCvInitialValues,
} from "./builder/utils/richTextInitialValues";
export {
  createEmptyTiptapDocument,
  createBulletListDocument,
  sanitizeTiptapDocument,
  normalizeCvContentFontSizes,
  extractTiptapPlainText,
} from "./builder/utils/tiptapJson";

// ==========================================
// 5. Constants & Fonts
// ==========================================
export {
  CV_FONT_OPTIONS,
  DEFAULT_CV_FONT_ID,
  getCvFontFamilyCss,
  type CvFontId,
  type CvFontOption,
} from "./constants/fonts";
