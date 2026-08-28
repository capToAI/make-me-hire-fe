import { makeId } from "./id";
import { createDefaultResume } from "./defaultResume";
import type {
  ResumeState,
  Section,
  SectionType,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CertificationsData,
  LanguagesData,
  CustomData,
} from "./types";

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? v : []);

/**
 * Validates and safely normalizes any raw or extracted ResumeState object.
 * Guarantees that all required properties exist, missing standard sections are supplemented,
 * and data structures match frontend expectations.
 */
export function normalizeResumeState(raw: unknown): ResumeState {
  const defaultState = createDefaultResume();

  if (!raw || typeof raw !== "object") {
    return defaultState;
  }

  const input = raw as Partial<ResumeState>;
  const rawSections = (input.sections && typeof input.sections === "object")
    ? (input.sections as Record<string, Partial<Section>>)
    : {};

  const normalizedSections: Record<string, Section> = {};
  const sectionOrder: string[] = [];

  // 1. Process provided sections
  for (const [id, rawSec] of Object.entries(rawSections)) {
    if (!rawSec || typeof rawSec !== "object") continue;

    const sectionId = rawSec.id || id || makeId("section");
    const type = (rawSec.type || "custom") as SectionType;
    const title = str(rawSec.title) || getFallbackTitle(type);
    const visible = typeof rawSec.visible === "boolean" ? rawSec.visible : true;
    const rawData = (rawSec.data && typeof rawSec.data === "object") ? rawSec.data : {};

    let normalizedData: Section["data"];

    switch (type) {
      case "basic": {
        const d = rawData as Partial<BasicData>;
        normalizedData = {
          name: str(d.name),
          jobTitle: str(d.jobTitle),
          email: str(d.email),
          phone: str(d.phone),
          location: str(d.location),
          linkedin: str(d.linkedin),
          website: str(d.website),
        };
        break;
      }
      case "summary": {
        const d = rawData as Partial<SummaryData>;
        normalizedData = {
          text: str(d.text),
        };
        break;
      }
      case "skills": {
        const d = rawData as Partial<SkillsData>;
        normalizedData = {
          categoryLabel: str(d.categoryLabel) || "Technical Skills",
          items: arr<string>(d.items).map((i) => str(i)).filter(Boolean),
        };
        break;
      }
      case "experience": {
        const d = rawData as Partial<ExperienceData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            company: str(e.company),
            role: str(e.role),
            start: str(e.start),
            end: str(e.end),
            current: Boolean(e.current),
            bullets: arr<string>(e.bullets).map((b) => str(b)),
          })),
        };
        break;
      }
      case "education": {
        const d = rawData as Partial<EducationData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            degree: str(e.degree),
            field: str(e.field),
            start: str(e.start),
            end: str(e.end),
          })),
        };
        break;
      }
      case "certifications": {
        const d = rawData as Partial<CertificationsData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            name: str(e.name),
            issuer: str(e.issuer),
            date: str(e.date),
            url: str(e.url),
          })),
        };
        break;
      }
      case "languages": {
        const d = rawData as Partial<LanguagesData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            language: str(e.language),
            proficiency: str(e.proficiency),
          })),
        };
        break;
      }
      case "custom":
      default: {
        const d = rawData as Partial<CustomData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            heading: str(e.heading),
            subheading: str(e.subheading),
            start: str(e.start),
            end: str(e.end),
            bullets: arr<string>(e.bullets).map((b) => str(b)),
          })),
        };
        break;
      }
    }

    normalizedSections[sectionId] = {
      id: sectionId,
      type,
      title,
      visible,
      data: normalizedData,
    };
  }

  // 2. Determine Section Order based on raw input or existing IDs
  if (Array.isArray(input.sectionOrder) && input.sectionOrder.length > 0) {
    for (const id of input.sectionOrder) {
      if (normalizedSections[id] && !sectionOrder.includes(id)) {
        sectionOrder.push(id);
      }
    }
  }

  // Add any sections that were in sections map but missing from sectionOrder
  for (const id of Object.keys(normalizedSections)) {
    if (!sectionOrder.includes(id)) {
      sectionOrder.push(id);
    }
  }

  // 3. Ensure all default core sections exist for complete editor experience
  const existingTypes = new Set(
    Object.values(normalizedSections).map((s) => s.type)
  );

  for (const defaultSecId of defaultState.sectionOrder) {
    const defaultSec = defaultState.sections[defaultSecId];
    if (defaultSec && !existingTypes.has(defaultSec.type)) {
      normalizedSections[defaultSec.id] = defaultSec;
      sectionOrder.push(defaultSec.id);
      existingTypes.add(defaultSec.type);
    }
  }

  return {
    sectionOrder,
    sections: normalizedSections,
  };
}

function getFallbackTitle(type: SectionType): string {
  switch (type) {
    case "basic":
      return "Personal Info";
    case "summary":
      return "Summary";
    case "skills":
      return "Skills";
    case "experience":
      return "Experience";
    case "education":
      return "Education";
    case "certifications":
      return "Certifications";
    case "languages":
      return "Languages";
    case "custom":
    default:
      return "Custom Section";
  }
}
