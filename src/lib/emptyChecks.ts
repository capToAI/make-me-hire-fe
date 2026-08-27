import type {
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CertificationsData,
  LanguagesData,
  CustomData,
  ExperienceEntry,
  EducationEntry,
  CertificationEntry,
  LanguageEntry,
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

export function isCertificationEntryEmpty(entry: CertificationEntry): boolean {
  return (
    blank(entry.name) &&
    blank(entry.issuer) &&
    blank(entry.date) &&
    blank(entry.url)
  );
}

export function isLanguageEntryEmpty(entry: LanguageEntry): boolean {
  return blank(entry.language) && blank(entry.proficiency);
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
    case "certifications":
      return (section.data as CertificationsData).entries.some(
        (e) => !isCertificationEntryEmpty(e)
      );
    case "languages":
      return (section.data as LanguagesData).entries.some(
        (e) => !isLanguageEntryEmpty(e)
      );
    case "custom":
      return (section.data as CustomData).entries.some(
        (e) => !isCustomEntryEmpty(e)
      );
    default:
      return false;
  }
}
