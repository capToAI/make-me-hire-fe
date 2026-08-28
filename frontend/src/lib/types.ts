export type SectionType =
  | "basic"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "languages"
  | "custom";

export interface BasicData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface SummaryData {
  text: string;
}

export interface SkillsData {
  categoryLabel?: string;
  items: string[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string[];
}

export interface ExperienceData {
  entries: ExperienceEntry[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  field: string;
  start: string;
  end: string;
}

export interface EducationData {
  entries: EducationEntry[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CertificationsData {
  entries: CertificationEntry[];
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface LanguagesData {
  entries: LanguageEntry[];
}

export interface CustomEntry {
  id: string;
  heading: string;
  subheading?: string;
  start?: string;
  end?: string;
  bullets: string[];
}

export interface CustomData {
  entries: CustomEntry[];
}

export type SectionData =
  | BasicData
  | SummaryData
  | SkillsData
  | ExperienceData
  | EducationData
  | CertificationsData
  | LanguagesData
  | CustomData;

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  data: SectionData;
}

export interface ResumeState {
  sectionOrder: string[];
  sections: Record<string, Section>;
}
