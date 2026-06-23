"use client";

import * as React from "react";

export interface SlotOffset { x: number; y: number }

interface UseSlotGesturesOptions {
  slotIdx: number;
  hasPhoto: boolean;
  zoom: number;
  offset: SlotOffset;
  onOffsetChange: (idx: number, offset: SlotOffset) => void;
  onZoomChange: (idx: number, zoom: number) => void;
  onSelect: (idx: number) => void;
}

export function useSlotGestures({
  slotIdx,
  hasPhoto,
  zoom,
  offset,
  onOffsetChange,
  onZoomChange,
  onSelect,
}: UseSlotGesturesOptions) {
  const isDraggingRef = React.useRef(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const baseOffsetRef = React.useRef<SlotOffset>({ x: 0, y: 0 });
  const touchStartDistRef = React.useRef<number | null>(null);
  const touchStartZoomRef = React.useRef<number>(1);
  const touchStartMidRef = React.useRef({ x: 0, y: 0 });

  // Mouse drag
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (!hasPhoto) return;
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      baseOffsetRef.current = { ...offset };
      onSelect(slotIdx);
    },
    [hasPhoto, offset, slotIdx, onSelect]
  );

  // Touch start (single or pinch)
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!hasPhoto) return;
      onSelect(slotIdx);

      if (e.touches.length === 2) {
        const p1 = e.touches[0];
        const p2 = e.touches[1];
        const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
        touchStartDistRef.current = dist;
        touchStartZoomRef.current = zoom;
        touchStartMidRef.current = {
          x: (p1.clientX + p2.clientX) / 2,
          y: (p1.clientY + p2.clientY) / 2,
        };
        dragStartRef.current = touchStartMidRef.current;
        baseOffsetRef.current = { ...offset };
        isDraggingRef.current = true;
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        isDraggingRef.current = true;
        dragStartRef.current = { x: t.clientX, y: t.clientY };
        baseOffsetRef.current = { ...offset };
        touchStartDistRef.current = null;
      }
    },
    [hasPhoto, zoom, offset, slotIdx, onSelect]
  );

  // Touch move
  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!hasPhoto || !isDraggingRef.current) return;
      e.preventDefault();

      if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        const p1 = e.touches[0];
        const p2 = e.touches[1];
        const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
        const mid = { x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 };
        const newZoom = Math.min(5, Math.max(1.0, touchStartZoomRef.current * (dist / touchStartDistRef.current)));
        onZoomChange(slotIdx, newZoom);
        const dx = mid.x - dragStartRef.current.x;
        const dy = mid.y - dragStartRef.current.y;
        onOffsetChange(slotIdx, { x: baseOffsetRef.current.x + dx, y: baseOffsetRef.current.y + dy });
      } else if (e.touches.length === 1 && touchStartDistRef.current === null) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        onOffsetChange(slotIdx, { x: baseOffsetRef.current.x + dx, y: baseOffsetRef.current.y + dy });
      }
    },
    [hasPhoto, slotIdx, onOffsetChange, onZoomChange]
  );

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        baseOffsetRef.current = { ...offset };
        touchStartDistRef.current = null;
      } else if (e.touches.length === 0) {
        isDraggingRef.current = false;
        touchStartDistRef.current = null;
      }
    },
    [offset]
  );

  // Scroll wheel zoom (desktop)
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      if (!hasPhoto) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      onZoomChange(slotIdx, Math.min(5, Math.max(1.0, zoom + delta)));
    },
    [hasPhoto, slotIdx, zoom, onZoomChange]
  );

  // Global mouse move/up
  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      onOffsetChange(slotIdx, { x: baseOffsetRef.current.x + dx, y: baseOffsetRef.current.y + dy });
    };
    const onMouseUp = () => { isDraggingRef.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [slotIdx, onOffsetChange]);

  return { handleMouseDown, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel };
}
