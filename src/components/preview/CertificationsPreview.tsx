import type { CertificationsData } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";
import { isCertificationEntryEmpty } from "@/lib/emptyChecks";

export function CertificationsPreview({
  title,
  data,
}: {
  title: string;
  data: CertificationsData;
}) {
  const entries = data.entries.filter((e) => !isCertificationEntryEmpty(e));
  return (
    <div>
      <SectionHeading title={title} />
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-baseline justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-black">
                {entry.name}
                {entry.issuer && (
                  <span className="font-normal italic"> — {entry.issuer}</span>
                )}
                {entry.url && (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1.5 text-[11px] font-normal text-indigo-600 underline print:text-black print:no-underline"
                  >
                    Link
                  </a>
                )}
              </p>
            </div>
            {entry.date && (
              <p className="whitespace-nowrap text-[11px] text-black">
                {entry.date}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
