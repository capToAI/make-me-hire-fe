import type { LanguagesData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { isLanguageEntryEmpty } from "@/lib/emptyChecks";
import { renderFormattedText } from "@/lib/renderFormattedText";

export function LanguagesPreview({
  title,
  data,
}: {
  title: string;
  data: LanguagesData;
}) {
  const entries = data.entries.filter((e) => !isLanguageEntryEmpty(e));
  return (
    <div>
      <SectionHeading title={title} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] leading-snug text-black">
        {entries.map((entry) => (
          <span key={entry.id} className="inline-flex items-center gap-1">
            <span className="font-semibold">
              {renderFormattedText(entry.language)}
            </span>
            {entry.proficiency && (
              <span className="text-[10.5px] text-zinc-600">
                ({renderFormattedText(entry.proficiency)})
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
