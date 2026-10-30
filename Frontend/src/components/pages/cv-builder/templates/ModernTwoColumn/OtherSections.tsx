import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { RichTextCVAwardItem, RichTextCVCertificationItem, RichTextCVItemSection, RichTextCVTextSection } from "@/types/cv";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import { createEmptyTiptapDocument } from "@/features/cv-builder/utils/tiptapJson";
import { TiptapField } from "../../components/TiptapField";
import ItemActions from "../../components/ItemActions";
import { SectionTitle } from "./SectionTitle";

interface ItemSectionProps<T> { section: RichTextCVItemSection<T>; primaryColor?: string; isReadOnly?: boolean }

export const CertificationsSection: React.FC<ItemSectionProps<RichTextCVCertificationItem>> = ({ section, primaryColor, isReadOnly = false }) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({ control, name: "content.sections.certifications.items", keyName: "_fieldKey" });
  if (!section.visible) return null;
  return <section className="section-certifications mb-3 group relative"><SectionTitle placeholder="CHỨNG CHỈ" formFieldName="content.sections.certifications.title" primaryColor={primaryColor} isReadOnly={isReadOnly} />
    <div className="space-y-1.5">{fields.map((item, index) => <div key={item._fieldKey} className="group/item relative flex items-center justify-between gap-2 rounded-sm p-1 hover:bg-slate-50/60">
      {!isReadOnly && <ItemActions isFirst={index === 0} isLast={index === fields.length - 1} onMoveUp={() => move(index, index - 1)} onMoveDown={() => move(index, index + 1)} onAddAfter={() => insert(index + 1, { id: `cert_${crypto.randomUUID()}`, name: createEmptyTiptapDocument(), issueDate: createEmptyTiptapDocument() })} onDelete={() => remove(index)} />}
      <div className="font-medium text-slate-800"><TiptapField name={`content.sections.certifications.items.${index}.name`} placeholder="Tên chứng chỉ" isReadOnly={isReadOnly} /></div><div className="text-slate-500"><TiptapField name={`content.sections.certifications.items.${index}.issueDate`} placeholder="Thời gian" isReadOnly={isReadOnly} /></div>
    </div>)}{fields.length === 0 && <p className="py-1 text-center cv-text-meta italic text-slate-400">Chưa có chứng chỉ.</p>}</div>
  </section>;
};

export const AwardsSection: React.FC<ItemSectionProps<RichTextCVAwardItem>> = ({ section, primaryColor, isReadOnly = false }) => {
  const { control } = useFormContext<RichTextCvEditorValues>();
  const { fields, insert, move, remove } = useFieldArray({ control, name: "content.sections.awards.items", keyName: "_fieldKey" });
  if (!section.visible) return null;
  return <section className="section-awards mb-3 group relative"><SectionTitle placeholder="GIẢI THƯỞNG" formFieldName="content.sections.awards.title" primaryColor={primaryColor} isReadOnly={isReadOnly} />
    <div className="space-y-1.5">{fields.map((item, index) => <div key={item._fieldKey} className="group/item relative flex items-center justify-between gap-2 rounded-sm p-1 hover:bg-slate-50/60">
      {!isReadOnly && <ItemActions isFirst={index === 0} isLast={index === fields.length - 1} onMoveUp={() => move(index, index - 1)} onMoveDown={() => move(index, index + 1)} onAddAfter={() => insert(index + 1, { id: `award_${crypto.randomUUID()}`, awardName: createEmptyTiptapDocument(), date: createEmptyTiptapDocument() })} onDelete={() => remove(index)} />}
      <div className="font-medium text-slate-800"><TiptapField name={`content.sections.awards.items.${index}.awardName`} placeholder="Tên giải thưởng" isReadOnly={isReadOnly} /></div><div className="text-slate-500"><TiptapField name={`content.sections.awards.items.${index}.date`} placeholder="Thời gian" isReadOnly={isReadOnly} /></div>
    </div>)}{fields.length === 0 && <p className="py-1 text-center cv-text-meta italic text-slate-400">Chưa có giải thưởng.</p>}</div>
  </section>;
};

interface TextSectionProps { section: RichTextCVTextSection; sectionKey: "interests" | "additionalInfo"; defaultTitle: string; primaryColor?: string; isReadOnly?: boolean }
export const TextSection: React.FC<TextSectionProps> = ({ section, sectionKey, defaultTitle, primaryColor, isReadOnly = false }) => {
  if (!section.visible) return null;
  return <section className={`section-${sectionKey} mb-3 group relative`}>
    <SectionTitle placeholder={defaultTitle} formFieldName={`content.sections.${sectionKey}.title`} primaryColor={primaryColor} isReadOnly={isReadOnly} />
    <div className="min-h-5 text-slate-700"><TiptapField name={`content.sections.${sectionKey}.content`} placeholder={`Nhập nội dung cho mục ${defaultTitle}...`} multiline isReadOnly={isReadOnly} /></div>
  </section>;
};
