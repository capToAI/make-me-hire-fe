"use client";

import type { DragEvent } from "react";
import { useRef, useState } from "react";

export interface DragHandleProps {
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export interface CardDropProps {
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export interface UseDragReorderReturn {
  getHandleProps: (index: number) => DragHandleProps;
  getCardProps: (index: number) => CardDropProps;
  overIndex: number | null;
  isDragging: boolean;
}

export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void
): UseDragReorderReturn {
  // 1. Refs
  const dragIndexRef = useRef<number | null>(null);

  // 2. State
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 3. Helpers / Callbacks
  const getHandleProps = (index: number): DragHandleProps => ({
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
  });

  const getCardProps = (index: number): CardDropProps => ({
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
  });

  return { getHandleProps, getCardProps, overIndex, isDragging };
}


