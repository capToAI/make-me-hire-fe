"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";

export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  const dragIndexRef = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function getHandleProps(index: number) {
    return {
      draggable: true,
      onDragStart: (e: DragEvent) => {
        dragIndexRef.current = index;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
      },
      onDragEnd: () => {
        dragIndexRef.current = null;
        setOverIndex(null);
        setIsDragging(false);
      },
    };
  }

  function getCardProps(index: number) {
    return {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overIndex !== index) {
          setOverIndex(index);
        }
      },
      onDragLeave: (e: DragEvent) => {
        const currentTarget = e.currentTarget;
        const relatedTarget = e.relatedTarget as Node | null;
        if (!currentTarget.contains(relatedTarget)) {
          if (overIndex === index) {
            setOverIndex(null);
          }
        }
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const from = dragIndexRef.current;
        dragIndexRef.current = null;
        setOverIndex(null);
        setIsDragging(false);
        if (from !== null && from !== index) {
          onReorder(from, index);
        }
      },
    };
  }

  return { getHandleProps, getCardProps, overIndex, isDragging };
}

