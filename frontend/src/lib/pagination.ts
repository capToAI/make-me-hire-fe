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
  CustomData,
} from "./types";
import {
  sectionHasContent,
  isExperienceEntryEmpty,
  isEducationEntryEmpty,
  isCertificationEntryEmpty,
  isLanguageEntryEmpty,
  isCustomEntryEmpty,
} from "./emptyChecks";
import { formatDateRange } from "./formatDateRange";

export type PageFormat = "letter" | "a4";

export interface PageDimensions {
  id: PageFormat;
  label: string;
  widthCss: string;
  heightCss: string;
  aspectRatio: number;
}

export const PAGE_FORMATS: Record<PageFormat, PageDimensions> = {
  letter: {
    id: "letter",
    label: "Letter (8.5 × 11 in)",
    widthCss: "8.5in",
    heightCss: "11in",
    aspectRatio: 8.5 / 11,
  },
  a4: {
    id: "a4",
    label: "A4 (210 × 297 mm)",
    widthCss: "8.27in",
    heightCss: "11.69in",
    aspectRatio: 8.27 / 11.69,
  },
};

export type ResumeBlock =
  | {
      id: string;
      type: "basic";
      sectionId: string;
      data: BasicData;
    }
  | {
      id: string;
      type: "heading";
      sectionId: string;
      title: string;
    }
  | {
      id: string;
      type: "summary";
      sectionId: string;
      text: string;
    }
  | {
      id: string;
      type: "skills";
      sectionId: string;
      categoryLabel?: string;
      items: string[];
    }
  | {
      id: string;
      type: "exp_header";
      sectionId: string;
      entryId: string;
      company: string;
      role: string;
      dateRange: string;
    }
  | {
      id: string;
      type: "exp_bullet";
      sectionId: string;
      entryId: string;
      bulletIndex: number;
      text: string;
      isFirstBullet: boolean;
      isLastBullet: boolean;
    }
  | {
      id: string;
      type: "edu_entry";
      sectionId: string;
      entryId: string;
      degree: string;
      field: string;
      dateRange: string;
    }
  | {
      id: string;
      type: "cert_entry";
      sectionId: string;
      entryId: string;
      name: string;
      issuer: string;
      date: string;
      url: string;
    }
  | {
      id: string;
      type: "languages";
      sectionId: string;
      entries: Array<{ id: string; language: string; proficiency: string }>;
    }
  | {
      id: string;
      type: "custom_header";
      sectionId: string;
      entryId: string;
      heading: string;
      subheading?: string;
      dateRange: string;
    }
  | {
      id: string;
      type: "custom_bullet";
      sectionId: string;
      entryId: string;
      bulletIndex: number;
      text: string;
      isFirstBullet: boolean;
      isLastBullet: boolean;
    };

export function flattenStateToBlocks(state: ResumeState): ResumeBlock[] {
  const blocks: ResumeBlock[] = [];

  const visibleSections = state.sectionOrder
    .map((id) => state.sections[id])
    .filter(
      (section): section is Section =>
        Boolean(section) && section.visible && sectionHasContent(section)
    );

  for (const section of visibleSections) {
    switch (section.type) {
      case "basic": {
        blocks.push({
          id: `basic-${section.id}`,
          type: "basic",
          sectionId: section.id,
          data: section.data as BasicData,
        });
        break;
      }

      case "summary": {
        const data = section.data as SummaryData;
        if (data.text.trim()) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          blocks.push({
            id: `summary-${section.id}`,
            type: "summary",
            sectionId: section.id,
            text: data.text,
          });
        }
        break;
      }

      case "skills": {
        const data = section.data as SkillsData;
        const items = data.items.filter((i) => i.trim() !== "");
        if (items.length > 0 || (data.categoryLabel && data.categoryLabel.trim())) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          blocks.push({
            id: `skills-${section.id}`,
            type: "skills",
            sectionId: section.id,
            categoryLabel: data.categoryLabel,
            items,
          });
        }
        break;
      }

      case "experience": {
        const data = section.data as ExperienceData;
        const entries = data.entries.filter((e) => !isExperienceEntryEmpty(e));
        if (entries.length > 0) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          for (const entry of entries) {
            const dateRange = formatDateRange(
              entry.start,
              entry.end,
              entry.current
            );
            const bullets = entry.bullets.filter((b) => b.trim() !== "");
            blocks.push({
              id: `exp-header-${entry.id}`,
              type: "exp_header",
              sectionId: section.id,
              entryId: entry.id,
              company: entry.company,
              role: entry.role,
              dateRange,
            });
            bullets.forEach((bullet, bIdx) => {
              blocks.push({
                id: `exp-bullet-${entry.id}-${bIdx}`,
                type: "exp_bullet",
                sectionId: section.id,
                entryId: entry.id,
                bulletIndex: bIdx,
                text: bullet,
                isFirstBullet: bIdx === 0,
                isLastBullet: bIdx === bullets.length - 1,
              });
            });
          }
        }
        break;
      }

      case "education": {
        const data = section.data as EducationData;
        const entries = data.entries.filter((e) => !isEducationEntryEmpty(e));
        if (entries.length > 0) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          for (const entry of entries) {
            const dateRange = formatDateRange(entry.start, entry.end);
            blocks.push({
              id: `edu-entry-${entry.id}`,
              type: "edu_entry",
              sectionId: section.id,
              entryId: entry.id,
              degree: entry.degree,
              field: entry.field,
              dateRange,
            });
          }
        }
        break;
      }

      case "certifications": {
        const data = section.data as CertificationsData;
        const entries = data.entries.filter((e) => !isCertificationEntryEmpty(e));
        if (entries.length > 0) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          for (const entry of entries) {
            blocks.push({
              id: `cert-entry-${entry.id}`,
              type: "cert_entry",
              sectionId: section.id,
              entryId: entry.id,
              name: entry.name,
              issuer: entry.issuer,
              date: entry.date,
              url: entry.url,
            });
          }
        }
        break;
      }

      case "languages": {
        const data = section.data as LanguagesData;
        const entries = data.entries.filter((e) => !isLanguageEntryEmpty(e));
        if (entries.length > 0) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          blocks.push({
            id: `languages-${section.id}`,
            type: "languages",
            sectionId: section.id,
            entries,
          });
        }
        break;
      }

      case "custom": {
        const data = section.data as CustomData;
        const entries = data.entries.filter((e) => !isCustomEntryEmpty(e));
        if (entries.length > 0) {
          blocks.push({
            id: `heading-${section.id}`,
            type: "heading",
            sectionId: section.id,
            title: section.title,
          });
          for (const entry of entries) {
            const dateRange = formatDateRange(entry.start, entry.end);
            const bullets = entry.bullets.filter((b) => b.trim() !== "");
            blocks.push({
              id: `custom-header-${entry.id}`,
              type: "custom_header",
              sectionId: section.id,
              entryId: entry.id,
              heading: entry.heading,
              subheading: entry.subheading,
              dateRange,
            });
            bullets.forEach((bullet, bIdx) => {
              blocks.push({
                id: `custom-bullet-${entry.id}-${bIdx}`,
                type: "custom_bullet",
                sectionId: section.id,
                entryId: entry.id,
                bulletIndex: bIdx,
                text: bullet,
                isFirstBullet: bIdx === 0,
                isLastBullet: bIdx === bullets.length - 1,
              });
            });
          }
        }
        break;
      }
    }
  }

  return blocks;
}

export function paginateBlocks(
  blocks: ResumeBlock[],
  heightsMap: Record<string, number>,
  maxPageHeight: number
): ResumeBlock[][] {
  if (blocks.length === 0) return [[]];

  const pages: ResumeBlock[][] = [[]];
  let currentPageIndex = 0;
  let currentHeight = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockHeight = heightsMap[block.id] || 24;

    // Orphan check for heading: heading + next block must fit together
    if (block.type === "heading" && i + 1 < blocks.length) {
      const nextBlock = blocks[i + 1];
      const nextHeight = heightsMap[nextBlock.id] || 24;

      if (
        currentHeight > 0 &&
        currentHeight + blockHeight + nextHeight > maxPageHeight
      ) {
        currentPageIndex++;
        pages[currentPageIndex] = [block];
        currentHeight = blockHeight;
        continue;
      }
    }

    // Orphan check for entry headers: header + first bullet must fit together
    if (
      (block.type === "exp_header" || block.type === "custom_header") &&
      i + 1 < blocks.length
    ) {
      const nextBlock = blocks[i + 1];
      if (
        nextBlock.type === "exp_bullet" ||
        nextBlock.type === "custom_bullet"
      ) {
        const nextHeight = heightsMap[nextBlock.id] || 20;
        if (
          currentHeight > 0 &&
          currentHeight + blockHeight + nextHeight > maxPageHeight
        ) {
          currentPageIndex++;
          pages[currentPageIndex] = [block];
          currentHeight = blockHeight;
          continue;
        }
      }
    }

    if (currentHeight === 0 || currentHeight + blockHeight <= maxPageHeight) {
      pages[currentPageIndex].push(block);
      currentHeight += blockHeight;
    } else {
      currentPageIndex++;
      pages[currentPageIndex] = [block];
      currentHeight = blockHeight;
    }
  }

  return pages;
}
