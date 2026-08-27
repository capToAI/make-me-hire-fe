import type {
  Section,
  BasicData,
  SummaryData,
  SkillsData,
  ExperienceData,
  EducationData,
  CustomData,
} from "@/lib/types";
import { BasicPreview } from "./BasicPreview";
import { SummaryPreview } from "./SummaryPreview";
import { SkillsPreview } from "./SkillsPreview";
import { ExperiencePreview } from "./ExperiencePreview";
import { EducationPreview } from "./EducationPreview";
import { CustomPreview } from "./CustomPreview";

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case "basic":
      return <BasicPreview data={section.data as BasicData} />;
    case "summary":
      return (
        <SummaryPreview title={section.title} data={section.data as SummaryData} />
      );
    case "skills":
      return (
        <SkillsPreview title={section.title} data={section.data as SkillsData} />
      );
    case "experience":
      return (
        <ExperiencePreview
          title={section.title}
          data={section.data as ExperienceData}
        />
      );
    case "education":
      return (
        <EducationPreview
          title={section.title}
          data={section.data as EducationData}
        />
      );
    case "custom":
      return (
        <CustomPreview title={section.title} data={section.data as CustomData} />
      );
    default:
      return null;
  }
}
