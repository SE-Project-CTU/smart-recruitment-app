export const FIXED_SECTION_KEYS = [
  "objective",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "interests",
  "additionalInfo",
] as const;

export type FixedSectionKey = (typeof FIXED_SECTION_KEYS)[number];
