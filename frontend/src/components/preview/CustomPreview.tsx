import type { CustomData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { formatDateRange } from "@/lib/formatDateRange";
import { isCustomEntryEmpty } from "@/lib/emptyChecks";
import { renderFormattedText } from "@/lib/renderFormattedText";

export function CustomPreview({
  title,
  data,
}: {
  title: string;
  data: CustomData;
}) {
  const entries = data.entries.filter((e) => !isCustomEntryEmpty(e));
  return (
    <div>
      <SectionHeading title={title} />
      <div className="space-y-2">
        {entries.map((entry) => {
          const dateRange = formatDateRange(entry.start, entry.end);
          const bullets = entry.bullets.filter((b) => b.trim() !== "");
          return (
            <div key={entry.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12px] font-bold text-black">
                  {renderFormattedText(entry.heading)}
                  {entry.subheading && (
                    <span className="font-normal italic">
                      {" "}
                      — {renderFormattedText(entry.subheading)}
                    </span>
                  )}
                </p>
                {dateRange && (
                  <p className="whitespace-nowrap text-[11px] text-black">
                    {dateRange}
                  </p>
                )}
              </div>
              {bullets.length > 0 && (
                <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-snug text-black">
                  {bullets.map((bullet, i) => (
                    <li key={i}>{renderFormattedText(bullet)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
