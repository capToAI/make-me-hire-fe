import React, { ReactNode } from "react";

/**
 * Parses markdown bold syntax `**text**` and renders `text` with bold styling.
 * Supports multiple occurrences and multi-line strings.
 */
export function renderFormattedText(
  text: string | undefined | null
): ReactNode {
  if (!text) return text;
  if (typeof text !== "string") return text;
  if (!text.includes("**")) return text;

  const parts: ReactNode[] = [];
  const regex = /\*\*([\s\S]*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
