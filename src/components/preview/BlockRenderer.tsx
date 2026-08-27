import React from "react";
import type { ResumeBlock } from "@/lib/pagination";
import { renderFormattedText } from "@/lib/renderFormattedText";

export function SingleBlockRenderer({
  block,
  isTopOfPage = false,
}: {
  block: ResumeBlock;
  isTopOfPage?: boolean;
}) {
  switch (block.type) {
    case "basic": {
      const { data } = block;
      const contactParts = [
        data.location,
        data.phone,
        data.email,
        data.linkedin,
        data.website,
      ].filter((p) => p && p.trim() !== "");

      return (
        <div className="text-center mb-2">
          {data.name && (
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {renderFormattedText(data.name)}
            </h1>
          )}
          {data.jobTitle && (
            <p className="text-sm font-medium text-black">
              {renderFormattedText(data.jobTitle)}
            </p>
          )}
          {contactParts.length > 0 && (
            <p className="mt-1 text-[11px] text-black">
              {contactParts.map((part, index) => (
                <React.Fragment key={index}>
                  {index > 0 && "  |  "}
                  {renderFormattedText(part)}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      );
    }

    case "heading": {
      return (
        <h2
          className={`mb-1.5 border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-wide text-black ${
            isTopOfPage ? "mt-0" : "mt-4"
          }`}
        >
          {renderFormattedText(block.title)}
        </h2>
      );
    }

    case "summary": {
      return (
        <p className="whitespace-pre-line text-[11.5px] leading-snug text-black">
          {renderFormattedText(block.text)}
        </p>
      );
    }

    case "skills": {
      return (
        <p className="text-[11.5px] leading-snug text-black">
          {block.categoryLabel && (
            <span className="font-semibold">
              {renderFormattedText(block.categoryLabel)}{" "}
            </span>
          )}
          {block.items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && ", "}
              {renderFormattedText(item)}
            </React.Fragment>
          ))}
        </p>
      );
    }

    case "exp_header": {
      return (
        <div className="flex items-baseline justify-between gap-2 mt-2">
          <p className="text-[12px] font-bold text-black">
            {renderFormattedText(block.company)}
            {block.role && (
              <span className="font-normal italic">
                {" "}
                — {renderFormattedText(block.role)}
              </span>
            )}
          </p>
          {block.dateRange && (
            <p className="whitespace-nowrap text-[11px] text-black">
              {block.dateRange}
            </p>
          )}
        </div>
      );
    }

    case "exp_bullet": {
      return (
        <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-snug text-black">
          <li>{renderFormattedText(block.text)}</li>
        </ul>
      );
    }

    case "edu_entry": {
      return (
        <div className="flex items-baseline justify-between gap-2 mt-1.5">
          <p className="text-[12px] font-bold text-black">
            {renderFormattedText(block.degree)}
            {block.field && (
              <span className="font-normal italic">
                {" "}
                — {renderFormattedText(block.field)}
              </span>
            )}
          </p>
          {block.dateRange && (
            <p className="whitespace-nowrap text-[11px] text-black">
              {block.dateRange}
            </p>
          )}
        </div>
      );
    }

    case "cert_entry": {
      return (
        <div className="flex items-baseline justify-between gap-2 mt-1.5">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-black">
              {renderFormattedText(block.name)}
              {block.issuer && (
                <span className="font-normal italic">
                  {" "}
                  — {renderFormattedText(block.issuer)}
                </span>
              )}
              {block.url && (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1.5 text-[11px] font-normal text-indigo-600 underline print:text-black print:no-underline"
                >
                  Link
                </a>
              )}
            </p>
          </div>
          {block.date && (
            <p className="whitespace-nowrap text-[11px] text-black">
              {renderFormattedText(block.date)}
            </p>
          )}
        </div>
      );
    }

    case "languages": {
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] leading-snug text-black mt-1">
          {block.entries.map((entry) => (
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
      );
    }

    case "custom_header": {
      return (
        <div className="flex items-baseline justify-between gap-2 mt-2">
          <p className="text-[12px] font-bold text-black">
            {renderFormattedText(block.heading)}
            {block.subheading && (
              <span className="font-normal italic">
                {" "}
                — {renderFormattedText(block.subheading)}
              </span>
            )}
          </p>
          {block.dateRange && (
            <p className="whitespace-nowrap text-[11px] text-black">
              {block.dateRange}
            </p>
          )}
        </div>
      );
    }

    case "custom_bullet": {
      return (
        <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-snug text-black">
          <li>{renderFormattedText(block.text)}</li>
        </ul>
      );
    }

    default:
      return null;
  }
}

export function PageBlocksRenderer({ blocks }: { blocks: ResumeBlock[] }) {
  if (blocks.length === 0) return null;

  // Group consecutive bullets belonging to the same entry
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const current = blocks[i];
    const isTopOfPage = i === 0;

    if (current.type === "exp_bullet" || current.type === "custom_bullet") {
      const bulletGroup: typeof current[] = [current];
      let j = i + 1;
      while (
        j < blocks.length &&
        blocks[j].type === current.type &&
        (blocks[j] as typeof current).entryId === current.entryId
      ) {
        bulletGroup.push(blocks[j] as typeof current);
        j++;
      }

      elements.push(
        <ul
          key={`bullet-group-${current.id}`}
          className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-snug text-black"
        >
          {bulletGroup.map((b) => (
            <li key={b.id}>{renderFormattedText(b.text)}</li>
          ))}
        </ul>
      );

      i = j;
    } else {
      elements.push(
        <div key={current.id} data-block-id={current.id}>
          <SingleBlockRenderer block={current} isTopOfPage={isTopOfPage} />
        </div>
      );
      i++;
    }
  }

  return <>{elements}</>;
}
