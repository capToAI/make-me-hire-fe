import type { ProjectsData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { isProjectEntryEmpty } from "@/lib/emptyChecks";
import { renderFormattedText } from "@/lib/renderFormattedText";

export function ProjectsPreview({
  title,
  data,
}: {
  title: string;
  data: ProjectsData;
}) {
  const entries = data.entries.filter((e) => !isProjectEntryEmpty(e));
  return (
    <div>
      <SectionHeading title={title} />
      <div className="space-y-2">
        {entries.map((entry) => {
          const bullets = entry.bullets.filter((b) => b.trim() !== "");
          const techText =
            entry.technologies && entry.technologies.length > 0
              ? ` - ${entry.technologies.join(", ")}`
              : "";

          return (
            <div key={entry.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12px] text-black">
                  <span className="font-bold">
                    {entry.link ? (
                      <a
                        href={
                          entry.link.startsWith("http://") ||
                          entry.link.startsWith("https://")
                            ? entry.link
                            : `https://${entry.link}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-black print:no-underline"
                      >
                        {renderFormattedText(entry.name)}
                      </a>
                    ) : (
                      renderFormattedText(entry.name)
                    )}
                  </span>
                  {techText && (
                    <span className="font-normal text-[11.5px]">
                      {techText}
                    </span>
                  )}
                </p>
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
