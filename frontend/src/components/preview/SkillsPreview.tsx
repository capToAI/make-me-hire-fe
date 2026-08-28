import React from "react";
import type { SkillsData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { renderFormattedText } from "@/lib/renderFormattedText";

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
          <span className="font-semibold">
            {renderFormattedText(data.categoryLabel)}{" "}
          </span>
        )}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && ", "}
            {renderFormattedText(item)}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
