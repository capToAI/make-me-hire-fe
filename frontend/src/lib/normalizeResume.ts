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
  ProjectsData,
  ProjectEntry,
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
    let type = (rawSec.type || "custom") as SectionType;
    let title = str(rawSec.title) || getFallbackTitle(type);
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
      case "projects": {
        const d = rawData as Partial<ProjectsData>;
        const rawEntries = arr<Record<string, unknown>>(d.entries);
        normalizedData = {
          entries: rawEntries.map((e) => ({
            id: str(e.id) || makeId("entry"),
            name: str(e.name),
            link: str(e.link),
            bullets: arr<string>(e.bullets).map((b) => str(b)),
            technologies: arr<string>(e.technologies)
              .map((t) => str(t))
              .filter(Boolean),
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
        const lowerTitle = title.toLowerCase();
        const hasProjectInTitle = lowerTitle.includes("project");
        const hasProjectInEntries = rawEntries.some((e) => {
          const h = str(e.heading).toLowerCase();
          const sub = str(e.subheading).toLowerCase();
          return h.includes("project") || sub.includes("project");
        });

        if (hasProjectInTitle || hasProjectInEntries) {
          type = "projects";
          title = "Projects";
          const convertedEntries: ProjectEntry[] = [];

          for (const e of rawEntries) {
            const h = str(e.heading);
            const sub = str(e.subheading);
            const entryBullets = arr<string>(e.bullets).map(str).filter(Boolean);

            if (/^projects?$/i.test(h.trim()) || h.trim() === "") {
              for (const bullet of entryBullets) {
                const colonIdx = bullet.indexOf(":");
                if (colonIdx > 0 && colonIdx < 80) {
                  const projName = bullet.slice(0, colonIdx).trim();
                  const desc = bullet.slice(colonIdx + 1).trim();

                  let extractedTechs: string[] = [];
                  const techMatch = desc.match(/technologies:\s*([^.\n]+)/i);
                  if (techMatch) {
                    extractedTechs = techMatch[1]
                      .split(/[,|]/)
                      .map((t) => t.trim())
                      .filter(Boolean);
                  }

                  const sentences = desc
                    .replace(/technologies:\s*[^.\n]+(\.|\n|$)/i, "")
                    .split(/(?<=\.)\s+(?=[A-Z])/)
                    .map((s) => s.trim())
                    .filter(Boolean);

                  convertedEntries.push({
                    id: makeId("entry"),
                    name: projName,
                    link: "",
                    bullets: sentences.length > 0 ? sentences : [desc],
                    technologies: extractedTechs,
                  });
                } else {
                  convertedEntries.push({
                    id: makeId("entry"),
                    name: bullet.slice(0, 50),
                    link: "",
                    bullets: [bullet],
                    technologies: [],
                  });
                }
              }
            } else {
              let extractedTechs: string[] = [];
              if (/technologies/i.test(sub)) {
                extractedTechs = sub
                  .replace(/^technologies:\s*/i, "")
                  .split(/[,|]/)
                  .map((t) => t.trim())
                  .filter(Boolean);
              }

              const cleanedBullets: string[] = [];
              for (const b of entryBullets) {
                if (/^technologies:\s*/i.test(b)) {
                  const techs = b
                    .replace(/^technologies:\s*/i, "")
                    .split(/[,|]/)
                    .map((t) => t.trim())
                    .filter(Boolean);
                  extractedTechs.push(...techs);
                } else {
                  cleanedBullets.push(b);
                }
              }

              convertedEntries.push({
                id: str(e.id) || makeId("entry"),
                name: h,
                link: "",
                bullets: cleanedBullets,
                technologies: Array.from(new Set(extractedTechs)),
              });
            }
          }

          normalizedData = {
            entries:
              convertedEntries.length > 0
                ? convertedEntries
                : [
                    {
                      id: makeId("entry"),
                      name: "",
                      link: "",
                      bullets: [""],
                      technologies: [],
                    },
                  ],
          } as ProjectsData;
        } else {
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
        }
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

  // Deduplicate: If there are multiple 'projects' sections (e.g. a converted custom section and an empty default section),
  // retain only the populated one.
  const projectSectionIds = Object.keys(normalizedSections).filter(
    (id) => normalizedSections[id].type === "projects"
  );
  if (projectSectionIds.length > 1) {
    const populatedId = projectSectionIds.find((id) => {
      const sec = normalizedSections[id];
      const d = sec.data as ProjectsData;
      return d.entries && d.entries.some((e) => e.name || (e.bullets && e.bullets.length > 0));
    });
    if (populatedId) {
      for (const id of projectSectionIds) {
        if (id !== populatedId) {
          delete normalizedSections[id];
        }
      }
    }
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
    case "projects":
      return "Projects";
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
