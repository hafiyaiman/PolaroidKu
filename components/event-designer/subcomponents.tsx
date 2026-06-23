"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  CheckIcon,
  CalendarIcon,
  TrashIcon,
  UploadSimpleIcon,
  SpinnerGapIcon,
  CaretUpIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { templatesList } from "./types";

// --- TEMPLATE SELECTOR ---
interface TemplateSelectorProps {
  editTemplate: string;
  isPending: boolean;
  onTemplateChange: (tplId: string) => void;
  gridColsClass?: string;
  onSelectCallback?: () => void;
}

export function TemplateSelector({
  editTemplate,
  isPending,
  onTemplateChange,
  gridColsClass = "grid-cols-5",
  onSelectCallback,
}: TemplateSelectorProps) {
  return (
    <div className={`grid ${gridColsClass} gap-3`}>
      {templatesList.map((tpl) => (
        <div
          key={tpl.id}
          role="button"
          tabIndex={isPending ? -1 : 0}
          onClick={() => {
            if (!isPending) {
              onTemplateChange(tpl.id);
              if (onSelectCallback) onSelectCallback();
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isPending) {
              onTemplateChange(tpl.id);
              if (onSelectCallback) onSelectCallback();
            }
          }}
          className={`rounded-xl border text-left flex flex-col items-center gap-2 p-2 transition-all relative cursor-pointer select-none ${
            editTemplate === tpl.id
              ? "border-primary bg-primary/5 ring-2 ring-primary shadow-md"
              : "border-border/60 bg-muted/10 hover:bg-muted/30 hover:border-border"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="w-full aspect-[9/16] overflow-hidden rounded-lg border border-border/30">
            <img
              src={tpl.preview}
              alt={tpl.name}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          </div>

          <div className="w-full flex justify-between items-center px-0.5">
            <span className="text-[10px] font-bold text-foreground leading-tight">{tpl.name}</span>
            {editTemplate === tpl.id && (
              <Badge className="bg-primary hover:bg-primary text-[8px] px-1 py-0 h-4 flex items-center justify-center gap-0.5 rounded-full text-primary-foreground border-none shrink-0">
                <CheckIcon className="size-2.5" weight="bold" />
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- BUTTON SHAPE SELECTOR ---
interface ButtonShapeSelectorProps {
  editButtonShape: string;
  isPending: boolean;
  onButtonShapeChange: (shape: string) => void;
  isMobile?: boolean;
}

export function ButtonShapeSelector({
  editButtonShape,
  isPending,
  onButtonShapeChange,
  isMobile = false,
}: ButtonShapeSelectorProps) {
  const options = [
    { id: "square", name: "Square", radius: "rounded-none" },
    { id: "rounded", name: "Curved", radius: "rounded-lg" },
    { id: "pill", name: "Capsule", radius: "rounded-full" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((btn) => (
        <button
          key={btn.id}
          type="button"
          disabled={isPending}
          onClick={() => onButtonShapeChange(btn.id)}
          className={`rounded-lg border font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
            isMobile 
              ? "p-1.5 text-[9px] gap-1" 
              : "p-2 text-[10px] gap-1.5"
          } ${
            editButtonShape === btn.id
              ? "border-primary bg-primary/5 text-primary"
              : "border-border/60 bg-muted/10 text-muted-foreground hover:bg-muted/30"
          }`}
        >
          <div className={`bg-muted border border-muted-foreground/35 ${
            isMobile ? "w-6 h-2" : "w-8 h-3"
          } ${btn.radius}`} />
          {btn.name}
        </button>
      ))}
    </div>
  );
}

// --- COLOR PICKER INPUT ---
interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isPending: boolean;
  isMobile?: boolean;
}

export function ColorPickerInput({
  label,
  value,
  onChange,
  isPending,
  isMobile = false,
}: ColorPickerInputProps) {
  return (
    <div className="space-y-1.5">
      <span className={`font-bold text-muted-foreground uppercase tracking-wider block ${
        isMobile ? "text-[8.5px]" : "text-[9px]"
      }`}>
        {label}
      </span>
      <div className={`flex items-center bg-muted/20 border border-border/60 rounded-xl ${
        isMobile ? "gap-2 px-2.5 py-1.5" : "gap-3 px-3 py-2"
      }`}>
        <label
          className={`relative rounded-full cursor-pointer border border-border shadow-inner shrink-0 transition-transform active:scale-90 ${
            isMobile ? "size-5" : "size-6"
          }`}
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isPending}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            if (val && !val.startsWith("#")) val = "#" + val;
            onChange(val);
          }}
          disabled={isPending}
          className={`bg-transparent border-none font-mono focus:outline-none focus:ring-0 text-foreground w-full uppercase p-0 h-auto font-medium ${
            isMobile ? "text-[10px]" : "text-[11px]"
          }`}
          maxLength={7}
        />
      </div>
    </div>
  );
}

// --- DESIGN COLORS COLLAPSE ---
interface DesignColorsCollapseProps {
  designCardExpanded: boolean;
  onToggleExpanded: () => void;
  editBgColor: string;
  setEditBgColor: (val: string) => void;
  editTextColor: string;
  setEditTextColor: (val: string) => void;
  editButtonColor: string;
  setEditButtonColor: (val: string) => void;
  editButtonTextColor: string;
  setEditButtonTextColor: (val: string) => void;
  editPreheaderColor: string;
  setEditPreheaderColor: (val: string) => void;
  editSubheaderColor: string;
  setEditSubheaderColor: (val: string) => void;
  handleResetColors: () => void;
  isPending: boolean;
  isMobile?: boolean;
}

export function DesignColorsCollapse({
  designCardExpanded,
  onToggleExpanded,
  editBgColor,
  setEditBgColor,
  editTextColor,
  setEditTextColor,
  editButtonColor,
  setEditButtonColor,
  editButtonTextColor,
  setEditButtonTextColor,
  editPreheaderColor,
  setEditPreheaderColor,
  editSubheaderColor,
  setEditSubheaderColor,
  handleResetColors,
  isPending,
  isMobile = false,
}: DesignColorsCollapseProps) {
  if (isMobile) {
    return (
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-2 gap-3">
          <ColorPickerInput
            label="Background"
            value={editBgColor}
            onChange={setEditBgColor}
            isPending={isPending}
            isMobile={true}
          />
          <ColorPickerInput
            label="Text Color"
            value={editTextColor}
            onChange={setEditTextColor}
            isPending={isPending}
            isMobile={true}
          />
          <ColorPickerInput
            label="Button Fill"
            value={editButtonColor}
            onChange={setEditButtonColor}
            isPending={isPending}
            isMobile={true}
          />
          <ColorPickerInput
            label="Button Text"
            value={editButtonTextColor}
            onChange={setEditButtonTextColor}
            isPending={isPending}
            isMobile={true}
          />
          <ColorPickerInput
            label="Pre-header Text"
            value={editPreheaderColor || "#64748B"}
            onChange={setEditPreheaderColor}
            isPending={isPending}
            isMobile={true}
          />
          <ColorPickerInput
            label="Sub-header Text"
            value={editSubheaderColor || "#64748B"}
            onChange={setEditSubheaderColor}
            isPending={isPending}
            isMobile={true}
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleResetColors}
            disabled={isPending}
            className="bg-muted hover:bg-muted/80 text-foreground border border-border px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            Reset Preset Colors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/30 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Design</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Customize colors and language for your page</p>
        </div>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="size-7 rounded-full bg-background border border-border/80 flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer shadow transition-all active:scale-95 shrink-0"
        >
          {designCardExpanded ? (
            <CaretUpIcon className="size-4" weight="bold" />
          ) : (
            <CaretDownIcon className="size-4" weight="bold" />
          )}
        </button>
      </div>

      {designCardExpanded && (
        <>
          <div className="h-[1px] bg-border" />

          <div className="space-y-4">
            <ColorPickerInput
              label="Header Background"
              value={editBgColor}
              onChange={setEditBgColor}
              isPending={isPending}
            />
            <ColorPickerInput
              label="Header Text"
              value={editTextColor}
              onChange={setEditTextColor}
              isPending={isPending}
            />
            <ColorPickerInput
              label="Button Background"
              value={editButtonColor}
              onChange={setEditButtonColor}
              isPending={isPending}
            />
            <ColorPickerInput
              label="Button Text"
              value={editButtonTextColor}
              onChange={setEditButtonTextColor}
              isPending={isPending}
            />
            <ColorPickerInput
              label="Pre-header Text"
              value={editPreheaderColor || "#64748B"}
              onChange={setEditPreheaderColor}
              isPending={isPending}
            />
            <ColorPickerInput
              label="Sub-header Text"
              value={editSubheaderColor || "#64748B"}
              onChange={setEditSubheaderColor}
              isPending={isPending}
            />
          </div>

          <div className="h-[1px] bg-border" />

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetColors}
              disabled={isPending}
              className="bg-muted hover:bg-muted/80 text-foreground border border-border px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- TEXT FIELDS GROUP ---
interface TextFieldsGroupProps {
  eventName: string;
  setEventName: (val: string) => void;
  eventDate: string;
  setEventDate: (val: string) => void;
  editPreheader: string;
  setEditPreheader: (val: string) => void;
  editSubheader: string;
  setEditSubheader: (val: string) => void;
  isNewEvent: boolean;
  isPending: boolean;
  isMobile?: boolean;
}

export function TextFieldsGroup({
  eventName,
  setEventName,
  eventDate,
  setEventDate,
  editPreheader,
  setEditPreheader,
  editSubheader,
  setEditSubheader,
  isNewEvent,
  isPending,
  isMobile = false,
}: TextFieldsGroupProps) {
  return (
    <div className={`space-y-4 py-1 text-left`}>
      <div className="grid gap-1.5">
        <Label
          htmlFor={isMobile ? "mobile-name-input" : "event-name-input"}
          className="text-xs font-semibold text-foreground"
        >
          Header / Event Name <span className="text-primary">*</span>
        </Label>
        <Input
          id={isMobile ? "mobile-name-input" : "event-name-input"}
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="e.g. Sarah &amp; David's Wedding"
          required
          disabled={isPending}
          className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs h-9"
        />
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor={isMobile ? "mobile-preheader-input" : "preheader-input"}
          className="text-xs font-semibold text-foreground"
        >
          Landing Page Pre-header
        </Label>
        <Input
          id={isMobile ? "mobile-preheader-input" : "preheader-input"}
          value={editPreheader}
          onChange={(e) => setEditPreheader(e.target.value)}
          placeholder="e.g. Our Guestbook"
          maxLength={35}
          disabled={isPending}
          className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs h-9"
        />
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor={isMobile ? "mobile-subheader-input" : "subheader-input"}
          className="text-xs font-semibold text-foreground"
        >
          Landing Page Sub-header (Optional)
        </Label>
        <Input
          id={isMobile ? "mobile-subheader-input" : "subheader-input"}
          value={editSubheader}
          onChange={(e) => setEditSubheader(e.target.value)}
          placeholder="Falls back to date selection"
          maxLength={60}
          disabled={isPending}
          className="bg-muted/30 border-border/60 focus-visible:ring-primary text-xs h-9"
        />
      </div>

      {isNewEvent && (
        <div className="grid gap-1.5">
          <Label
            htmlFor={isMobile ? "mobile-date-input" : "event-date-input"}
            className="text-xs font-semibold text-foreground"
          >
            Event Date <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              id={isMobile ? "mobile-date-input" : "event-date-input"}
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              disabled={isPending}
              className="bg-muted/30 border-border/60 focus-visible:ring-primary pl-10 text-xs h-9"
            />
            <CalendarIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}

// --- COVER IMAGE UPLOAD ---
interface CoverImageUploadProps {
  coverImageUrl: string;
  isPending: boolean;
  isUploadingCover: boolean;
  coverUploadProgress: number;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCover: () => void;
}

export function CoverImageUpload({
  coverImageUrl,
  isPending,
  isUploadingCover,
  coverUploadProgress,
  coverInputRef,
  handleCoverChange,
  handleRemoveCover,
}: CoverImageUploadProps) {
  return (
    <div className="bg-muted/10 border border-border/30 rounded-xl p-3.5 space-y-2 text-left">
      <Label className="text-xs font-semibold text-foreground">
        Welcome Cover Photo Image
      </Label>
      <div className="space-y-3 flex flex-col items-start">
        {coverImageUrl ? (
          <div className="relative rounded-xl border border-border/60 overflow-hidden bg-muted/35 aspect-video flex items-center justify-center w-full max-w-[200px] group shadow-sm">
            <img
              src={coverImageUrl}
              alt="Cover preview"
              className="w-full h-full object-cover object-center"
            />
            <button
              type="button"
              onClick={handleRemoveCover}
              disabled={isPending}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors cursor-pointer"
              title="Remove cover"
            >
              <TrashIcon className="size-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !isPending && coverInputRef.current?.click()}
            className="border border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full max-w-[200px]"
          >
            <div className="p-1.5 bg-muted rounded-full text-primary">
              <UploadSimpleIcon className="size-3.5" />
            </div>
            <span className="text-[9px] font-medium text-foreground">Upload Image</span>
          </div>
        )}

        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverChange}
          accept="image/*"
          className="hidden"
          disabled={isUploadingCover || isPending}
        />

        {isUploadingCover && (
          <div className="space-y-1.5 w-full max-w-[200px]">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <SpinnerGapIcon className="size-3.5 animate-spin text-primary" />
                Uploading...
              </span>
              <span>{coverUploadProgress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${coverUploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
