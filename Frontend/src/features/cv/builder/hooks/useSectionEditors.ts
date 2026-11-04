import { useFormContext } from "react-hook-form";
import type { FixedSectionKey, RichTextCvEditorValues } from "../schema/richTextCvSchema";
import {
  createEmptyTiptapDocument,
  createBulletListDocument,
} from "../utils/tiptapJson";
import type {
  SectionItemEditorActions,
  CvSectionEditorsMap,
} from "../../templates/types";
import {
  useCvHistory,
  AddSectionItemCommand,
  RemoveSectionItemCommand,
  MoveSectionItemCommand,
  type CvSetValueFn,
  type CvGetValuesFn,
  type CvCommand,
} from "../history";

function createSectionItemEditor(
  sectionKey: FixedSectionKey,
  createDefaultItem: () => unknown,
  setValue: CvSetValueFn,
  getValues: CvGetValuesFn,
  executeCommand: (cmd: CvCommand) => void,
): SectionItemEditorActions {
  return {
    onAddAfter: (index: number) => {
      const newItem = createDefaultItem();
      const command = new AddSectionItemCommand(
        sectionKey,
        index + 1,
        newItem,
        setValue,
        getValues,
      );
      executeCommand(command);
    },
    onDelete: (index: number) => {
      const currentList =
        (getValues(`content.sections.${sectionKey}.items` as any) as unknown as unknown[]) || [];
      const itemToDelete = currentList[index];
      if (!itemToDelete) return;

      const command = new RemoveSectionItemCommand(
        sectionKey,
        index,
        itemToDelete,
        setValue,
        getValues,
      );
      executeCommand(command);
    },
    onMoveUp: (index: number) => {
      if (index <= 0) return;
      const command = new MoveSectionItemCommand(
        sectionKey,
        index,
        index - 1,
        setValue,
        getValues,
      );
      executeCommand(command);
    },
    onMoveDown: (index: number) => {
      const currentList =
        (getValues(`content.sections.${sectionKey}.items` as any) as unknown as unknown[]) || [];
      if (index >= currentList.length - 1) return;

      const command = new MoveSectionItemCommand(
        sectionKey,
        index,
        index + 1,
        setValue,
        getValues,
      );
      executeCommand(command);
    },
  };
}

export function useExperienceSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "experience",
    () => ({
      id: `exp_${crypto.randomUUID()}`,
      company: createEmptyTiptapDocument(),
      position: createEmptyTiptapDocument(),
      startDate: createEmptyTiptapDocument(),
      endDate: createEmptyTiptapDocument(),
      description: createBulletListDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useEducationSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "education",
    () => ({
      id: `edu_${crypto.randomUUID()}`,
      school: createEmptyTiptapDocument(),
      title: createEmptyTiptapDocument(),
      start: createEmptyTiptapDocument(),
      end: createEmptyTiptapDocument(),
      details: createEmptyTiptapDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useSkillsSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "skills",
    () => ({
      id: `sk_${crypto.randomUUID()}`,
      name: createEmptyTiptapDocument(),
      description: createEmptyTiptapDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useProjectsSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "projects",
    () => ({
      id: `prj_${crypto.randomUUID()}`,
      projectName: createEmptyTiptapDocument(),
      role: createEmptyTiptapDocument(),
      start: createEmptyTiptapDocument(),
      end: createEmptyTiptapDocument(),
      description: createBulletListDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useCertificationsSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "certifications",
    () => ({
      id: `cert_${crypto.randomUUID()}`,
      name: createEmptyTiptapDocument(),
      issueDate: createEmptyTiptapDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useAwardsSectionEditor(): SectionItemEditorActions {
  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();
  const { executeCommand } = useCvHistory();

  return createSectionItemEditor(
    "awards",
    () => ({
      id: `award_${crypto.randomUUID()}`,
      awardName: createEmptyTiptapDocument(),
      date: createEmptyTiptapDocument(),
    }),
    setValue,
    getValues,
    executeCommand,
  );
}

export function useCvSectionEditors(): CvSectionEditorsMap {
  const experience = useExperienceSectionEditor();
  const education = useEducationSectionEditor();
  const skills = useSkillsSectionEditor();
  const projects = useProjectsSectionEditor();
  const certifications = useCertificationsSectionEditor();
  const awards = useAwardsSectionEditor();

  return {
    experience,
    education,
    skills,
    projects,
    certifications,
    awards,
  };
}
