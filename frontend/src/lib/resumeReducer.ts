import { makeId } from "./id";
import type {
  ResumeState,
  Section,
  SectionData,
  SectionType,
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

export type ResumeAction =
  | { type: "LOAD"; state: ResumeState }
  | { type: "UPDATE_SECTION_DATA"; sectionId: string; data: SectionData }
  | { type: "UPDATE_SECTION_TITLE"; sectionId: string; title: string }
  | { type: "REORDER_SECTIONS"; fromIndex: number; toIndex: number }
  | { type: "ADD_CUSTOM_SECTION" }
  | { type: "REMOVE_SECTION"; sectionId: string }
  | { type: "TOGGLE_SECTION_VISIBILITY"; sectionId: string }
  | { type: "ADD_ENTRY"; sectionId: string }
  | { type: "REMOVE_ENTRY"; sectionId: string; entryId: string }
  | {
      type: "REORDER_ENTRIES";
      sectionId: string;
      fromIndex: number;
      toIndex: number;
    }
  | { type: "ADD_BULLET"; sectionId: string; entryId: string }
  | {
      type: "UPDATE_BULLET";
      sectionId: string;
      entryId: string;
      bulletIndex: number;
      text: string;
    }
  | {
      type: "REMOVE_BULLET";
      sectionId: string;
      entryId: string;
      bulletIndex: number;
    }
  | {
      type: "REORDER_BULLETS";
      sectionId: string;
      entryId: string;
      fromIndex: number;
      toIndex: number;
    };

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

function makeEmptyEntry(
  type: SectionType
): ExperienceEntry | EducationEntry | CertificationEntry | LanguageEntry | CustomEntry {
  if (type === "experience") {
    return {
      id: makeId("entry"),
      company: "",
      role: "",
      start: "",
      end: "",
      current: false,
      bullets: [],
    };
  }
  if (type === "education") {
    return {
      id: makeId("entry"),
      degree: "",
      field: "",
      start: "",
      end: "",
    };
  }
  if (type === "certifications") {
    return {
      id: makeId("entry"),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
  }
  if (type === "languages") {
    return {
      id: makeId("entry"),
      language: "",
      proficiency: "",
    };
  }
  return {
    id: makeId("entry"),
    heading: "",
    subheading: "",
    start: "",
    end: "",
    bullets: [],
  };
}

function hasEntries(
  data: SectionData
): data is
  | ExperienceData
  | EducationData
  | CertificationsData
  | LanguagesData
  | CustomData {
  return Array.isArray((data as { entries?: unknown }).entries);
}

function hasBullets(
  entry: ExperienceEntry | EducationEntry | CertificationEntry | LanguageEntry | CustomEntry
): entry is ExperienceEntry | CustomEntry {
  return Array.isArray((entry as { bullets?: unknown }).bullets);
}

export function resumeReducer(
  state: ResumeState,
  action: ResumeAction
): ResumeState {
  switch (action.type) {
    case "LOAD":
      return action.state;

    case "UPDATE_SECTION_DATA": {
      const section = state.sections[action.sectionId];
      if (!section) return state;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data: action.data },
        },
      };
    }

    case "UPDATE_SECTION_TITLE": {
      const section = state.sections[action.sectionId];
      if (!section) return state;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, title: action.title },
        },
      };
    }

    case "REORDER_SECTIONS":
      return {
        ...state,
        sectionOrder: reorder(
          state.sectionOrder,
          action.fromIndex,
          action.toIndex
        ),
      };

    case "ADD_CUSTOM_SECTION": {
      const id = makeId("section");
      const existingCustomCount = Object.values(state.sections).filter(
        (s) => s.type === "custom"
      ).length;
      const section: Section = {
        id,
        type: "custom",
        title: `Custom Section ${existingCustomCount + 1}`,
        visible: true,
        data: { entries: [makeEmptyEntry("custom") as CustomEntry] },
      };
      return {
        sectionOrder: [...state.sectionOrder, id],
        sections: { ...state.sections, [id]: section },
      };
    }

    case "REMOVE_SECTION": {
      const sections = { ...state.sections };
      delete sections[action.sectionId];
      return {
        sectionOrder: state.sectionOrder.filter((id) => id !== action.sectionId),
        sections,
      };
    }

    case "TOGGLE_SECTION_VISIBILITY": {
      const section = state.sections[action.sectionId];
      if (!section) return state;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, visible: !section.visible },
        },
      };
    }

    case "ADD_ENTRY": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const newEntry = makeEmptyEntry(section.type);
      const data = {
        entries: [...section.data.entries, newEntry],
      } as SectionData;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data },
        },
      };
    }

    case "REMOVE_ENTRY": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const data = {
        entries: section.data.entries.filter((e) => e.id !== action.entryId),
      } as SectionData;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data },
        },
      };
    }

    case "REORDER_ENTRIES": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const entries = section.data.entries as Array<
        ExperienceEntry | EducationEntry | CertificationEntry | LanguageEntry | CustomEntry
      >;
      const data = {
        entries: reorder(entries, action.fromIndex, action.toIndex),
      } as SectionData;
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data },
        },
      };
    }

    case "ADD_BULLET": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const entries = section.data.entries.map((entry) => {
        if (entry.id !== action.entryId || !hasBullets(entry)) return entry;
        return { ...entry, bullets: [...entry.bullets, ""] };
      });
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data: { entries } as SectionData },
        },
      };
    }

    case "UPDATE_BULLET": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const entries = section.data.entries.map((entry) => {
        if (entry.id !== action.entryId || !hasBullets(entry)) return entry;
        const bullets = entry.bullets.slice();
        bullets[action.bulletIndex] = action.text;
        return { ...entry, bullets };
      });
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data: { entries } as SectionData },
        },
      };
    }

    case "REMOVE_BULLET": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const entries = section.data.entries.map((entry) => {
        if (entry.id !== action.entryId || !hasBullets(entry)) return entry;
        return {
          ...entry,
          bullets: entry.bullets.filter((_, i) => i !== action.bulletIndex),
        };
      });
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data: { entries } as SectionData },
        },
      };
    }

    case "REORDER_BULLETS": {
      const section = state.sections[action.sectionId];
      if (!section || !hasEntries(section.data)) return state;
      const entries = section.data.entries.map((entry) => {
        if (entry.id !== action.entryId || !hasBullets(entry)) return entry;
        return {
          ...entry,
          bullets: reorder(entry.bullets, action.fromIndex, action.toIndex),
        };
      });
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.sectionId]: { ...section, data: { entries } as SectionData },
        },
      };
    }

    default:
      return state;
  }
}
