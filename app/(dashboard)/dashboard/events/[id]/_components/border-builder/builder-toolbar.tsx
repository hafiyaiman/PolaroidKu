"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  TextTIcon,
  SquareIcon,
  CircleIcon,
  MinusIcon,
  ImageSquareIcon,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  ArrowLineUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLineDownIcon,
} from "@phosphor-icons/react";

interface BuilderToolbarProps {
  onAddText: () => void;
  onAddRect: () => void;
  onAddCircle: () => void;
  onAddLine: () => void;
  onImportImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onBringToFront?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onSendToBack?: () => void;
  opacity: number;
  onOpacityChange: (v: number) => void;
  hasSelection: boolean;
}

const ToolBtn = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "h-8 w-8 p-0 flex flex-col items-center justify-center gap-0.5",
      "text-foreground hover:text-foreground hover:bg-muted/60",
      "transition-all text-[8px] cursor-pointer disabled:opacity-40",
    )}
  >
    <Icon className="size-4" />
  </Button>
);

export function BuilderToolbar({
  onAddText,
  onAddRect,
  onAddCircle,
  onAddLine,
  onImportImage,
  onUndo,
  onRedo,
  onDeleteSelected,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  opacity,
  onOpacityChange,
  hasSelection,
}: BuilderToolbarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Add tools */}
      <ToolBtn icon={TextTIcon} label="Add Text" onClick={onAddText} />
      <ToolBtn icon={SquareIcon} label="Add Rectangle" onClick={onAddRect} />
      <ToolBtn icon={CircleIcon} label="Add Circle" onClick={onAddCircle} />
      <ToolBtn icon={MinusIcon} label="Add Line" onClick={onAddLine} />
      <ToolBtn
        icon={ImageSquareIcon}
        label="Import Image"
        onClick={onImportImage}
      />

      <div className="h-5 w-px bg-border/40 mx-1" />

      {/* History */}
      <ToolBtn icon={ArrowCounterClockwiseIcon} label="Undo" onClick={onUndo} />
      <ToolBtn icon={ArrowClockwiseIcon} label="Redo" onClick={onRedo} />

      <div className="h-5 w-px bg-border/40 mx-1" />

      {/* Delete */}
      <ToolBtn
        icon={TrashIcon}
        label="Delete Selected"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
      />

      {/* Layer controls */}
      {hasSelection && (
        <>
          <div className="h-5 w-px bg-border/40 mx-1" />
          <ToolBtn
            icon={ArrowLineUpIcon}
            label="Bring to Front"
            onClick={onBringToFront!}
          />
          <ToolBtn
            icon={ArrowUpIcon}
            label="Bring Forward"
            onClick={onBringForward!}
          />
          <ToolBtn
            icon={ArrowDownIcon}
            label="Send Backward"
            onClick={onSendBackward!}
          />
          <ToolBtn
            icon={ArrowLineDownIcon}
            label="Send to Back"
            onClick={onSendToBack!}
          />
        </>
      )}

      {/* Opacity (when selection active) */}
      {hasSelection && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
            Opacity
          </span>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[opacity]}
            onValueChange={([v]) => onOpacityChange(v)}
            className="w-24"
          />
          <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
