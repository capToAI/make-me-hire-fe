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

export interface SavedResume {
  id: string;
  userId: number;
  name: string;
  position: string;
  data: ResumeState;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItem {
  id: string;
  userId: number;
  name: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export type AtsMatchRank =
  | "Excellent Match"
  | "Strong Match"
  | "Good Match"
  | "Moderate Match"
  | "Low Match";

export interface AtsScoreData {
  score: number;
  rank: AtsMatchRank;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  resumeId: string;
  resumeName: string;
  position: string;
  analyzedAt: string;
}

export type SkillRelevance = "high" | "medium" | "low";
export type SkillStatus = "pending" | "confirmed" | "rejected";

export interface SuggestedSkill {
  name: string;
  reason: string;
  relevance: SkillRelevance;
  status: SkillStatus;
}

export interface TailorChangeItem {
  title: string;
  description: string;
  impact: string;
}

export interface TailorChangesGroup {
  summary: TailorChangeItem[];
  experience: TailorChangeItem[];
  keywords: TailorChangeItem[];
  skills: TailorChangeItem[];
}

export interface TailoredResumeResponse {
  originalScore: number;
  originalRank: AtsMatchRank;
  tailoredScore: number;
  tailoredRank: AtsMatchRank;
  scoreDifference: number;
  originalResumeData: ResumeState;
  tailoredResumeData: ResumeState;
  changes: TailorChangesGroup;
  suggestedSkills: SuggestedSkill[];
  resumeId: string;
  resumeName: string;
  position: string;
  tailoredAt: string;
}


