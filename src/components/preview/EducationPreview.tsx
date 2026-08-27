import type { EducationData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { formatDateRange } from "@/lib/formatDateRange";
import { isEducationEntryEmpty } from "@/lib/emptyChecks";

export function EducationPreview({
  title,
  data,
}: {
  title: string;
  data: EducationData;
}) {
  const entries = data.entries.filter((e) => !isEducationEntryEmpty(e));
  return (
    <div>
      <SectionHeading title={title} />
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const dateRange = formatDateRange(entry.start, entry.end);
          return (
            <div
              key={entry.id}
              className="flex items-baseline justify-between gap-2"
            >
              <p className="text-[12px] font-bold text-black">
                {entry.degree}
                {entry.field && (
                  <span className="font-normal italic"> — {entry.field}</span>
                )}
              </p>
              {dateRange && (
                <p className="whitespace-nowrap text-[11px] text-black">
                  {dateRange}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
