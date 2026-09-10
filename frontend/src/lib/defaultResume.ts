import { makeId } from "./id";
import type {
  ResumeState,
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  ProjectsData,
  EducationData,
  CertificationsData,
  LanguagesData,
} from "./types";

export function createDefaultResume(): ResumeState {
  const basicId = makeId("section");
  const summaryId = makeId("section");
  const skillsId = makeId("section");
  const experienceId = makeId("section");
  const projectsId = makeId("section");
  const educationId = makeId("section");
  const certificationsId = makeId("section");
  const languagesId = makeId("section");

  const basic: Section = {
    id: basicId,
    type: "basic",
    title: "Personal Info",
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
    title: "Summary",
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
    title: "Experience",
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

  const projects: Section = {
    id: projectsId,
    type: "projects",
    title: "Projects",
    visible: true,
    data: {
      entries: [
        {
          id: makeId("entry"),
          name: "",
          link: "",
          bullets: [],
          technologies: [],
        },
      ],
    } satisfies ProjectsData,
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
      projectsId,
      educationId,
      certificationsId,
      languagesId,
    ],
    sections: {
      [basicId]: basic,
      [summaryId]: summary,
      [skillsId]: skills,
      [experienceId]: experience,
      [projectsId]: projects,
      [educationId]: education,
      [certificationsId]: certifications,
      [languagesId]: languages,
    },
  };
}
