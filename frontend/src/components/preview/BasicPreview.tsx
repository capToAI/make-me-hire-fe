import React from "react";
import type { BasicData } from "@/lib/types";
import { renderFormattedText } from "@/lib/renderFormattedText";

export function BasicPreview({ data }: { data: BasicData }) {
  const contactParts = [
    data.location,
    data.phone,
    data.email,
    data.linkedin,
    data.website,
  ].filter((p) => p && p.trim() !== "");

  return (
    <div className="text-center">
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
