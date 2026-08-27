import { makeId } from "./id";
import type {
  ResumeState,
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CertificationsData,
  LanguagesData,
} from "./types";

export function createDefaultResume(): ResumeState {
  const basicId = makeId("section");
  const summaryId = makeId("section");
  const skillsId = makeId("section");
  const experienceId = makeId("section");
  const educationId = makeId("section");
  const certificationsId = makeId("section");
  const languagesId = makeId("section");

  const basic: Section = {
    id: basicId,
    type: "basic",
    title: "Basic",
    visible: true,
    data: {
      name: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    } satisfies BasicData,
  };

  const summary: Section = {
    id: summaryId,
    type: "summary",
    title: "Professional Summary",
    visible: true,
    data: { text: "" } satisfies SummaryData,
  };

  const skills: Section = {
    id: skillsId,
    type: "skills",
    title: "Skills",
    visible: true,
    data: { categoryLabel: "", items: [] } satisfies SkillsData,
  };

  const experience: Section = {
    id: experienceId,
    type: "experience",
    title: "Professional Experience",
    visible: true,
    data: {
      entries: [
        {
          id: makeId("entry"),
          company: "",
          role: "",
          start: "",
          end: "",
          current: false,
          bullets: [],
        },
      ],
    } satisfies ExperienceData,
  };

  const education: Section = {
    id: educationId,
    type: "education",
    title: "Education",
    visible: true,
    data: {
      entries: [
        {
          id: makeId("entry"),
          degree: "",
          field: "",
          start: "",
          end: "",
        },
      ],
    } satisfies EducationData,
  };

  const certifications: Section = {
    id: certificationsId,
    type: "certifications",
    title: "Certifications",
    visible: true,
    data: {
      entries: [
        {
          id: makeId("entry"),
          name: "",
          issuer: "",
          date: "",
          url: "",
        },
      ],
    } satisfies CertificationsData,
  };

  const languages: Section = {
    id: languagesId,
    type: "languages",
    title: "Languages",
    visible: true,
    data: {
      entries: [
        {
          id: makeId("entry"),
          language: "",
          proficiency: "",
        },
      ],
    } satisfies LanguagesData,
  };

  return {
    sectionOrder: [
      basicId,
      summaryId,
      skillsId,
      experienceId,
      educationId,
      certificationsId,
      languagesId,
    ],
    sections: {
      [basicId]: basic,
      [summaryId]: summary,
      [skillsId]: skills,
      [experienceId]: experience,
      [educationId]: education,
      [certificationsId]: certifications,
      [languagesId]: languages,
    },
  };
}
