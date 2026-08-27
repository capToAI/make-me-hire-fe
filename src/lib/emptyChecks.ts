import type {
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CustomData,
  ExperienceEntry,
  EducationEntry,
  CustomEntry,
} from "./types";

const blank = (s: string | undefined) => !s || s.trim() === "";

export function isExperienceEntryEmpty(entry: ExperienceEntry): boolean {
  return (
    blank(entry.company) &&
    blank(entry.role) &&
    blank(entry.start) &&
    blank(entry.end) &&
    entry.bullets.every(blank)
  );
}

export function isEducationEntryEmpty(entry: EducationEntry): boolean {
  return (
    blank(entry.degree) &&
    blank(entry.field) &&
    blank(entry.start) &&
    blank(entry.end)
  );
}

export function isCustomEntryEmpty(entry: CustomEntry): boolean {
  return (
    blank(entry.heading) &&
    blank(entry.subheading) &&
    blank(entry.start) &&
    blank(entry.end) &&
    entry.bullets.every(blank)
  );
}

export function sectionHasContent(section: Section): boolean {
  switch (section.type) {
    case "basic": {
      const d = section.data as BasicData;
      return !(
        blank(d.name) &&
        blank(d.jobTitle) &&
        blank(d.email) &&
        blank(d.phone) &&
        blank(d.location) &&
        blank(d.linkedin) &&
        blank(d.website)
      );
    }
    case "summary":
      return !blank((section.data as SummaryData).text);
    case "skills":
      return (section.data as SkillsData).items.some((i) => !blank(i));
    case "experience":
      return (section.data as ExperienceData).entries.some(
        (e) => !isExperienceEntryEmpty(e)
      );
    case "education":
      return (section.data as EducationData).entries.some(
        (e) => !isEducationEntryEmpty(e)
      );
    case "custom":
      return (section.data as CustomData).entries.some(
        (e) => !isCustomEntryEmpty(e)
      );
    default:
      return false;
  }
}
