"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";

export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  const dragIndexRef = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function getHandleProps(index: number) {
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        dragIndexRef.current = index;
        e.dataTransfer.effectAllowed = "move";
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        if (overIndex !== index) setOverIndex(index);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const from = dragIndexRef.current;
        dragIndexRef.current = null;
        setOverIndex(null);
        if (from !== null && from !== index) onReorder(from, index);
      },
      onDragEnd: () => {
        dragIndexRef.current = null;
        setOverIndex(null);
      },
    };
  }

  return { getHandleProps, overIndex };
}
