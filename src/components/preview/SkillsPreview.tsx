import type { SkillsData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

export function SkillsPreview({
  title,
  data,
}: {
  title: string;
  data: SkillsData;
}) {
  const items = data.items.filter((i) => i.trim() !== "");
  return (
    <div>
      <SectionHeading title={title} />
      <p className="text-[11.5px] leading-snug text-black">
        {data.categoryLabel && (
          <span className="font-semibold">{data.categoryLabel} </span>
        )}
        {items.join(", ")}
      </p>
    </div>
  );
}
