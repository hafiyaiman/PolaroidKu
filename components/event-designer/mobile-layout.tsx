"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  SparkleIcon,
  PaletteIcon,
  ListBulletsIcon,
  UploadSimpleIcon,
  SpinnerGapIcon,
  XIcon,
} from "@phosphor-icons/react";
import { DesignerLayoutProps } from "./types";
import {
  TemplateSelector,
  ButtonShapeSelector,
  DesignColorsCollapse,
  TextFieldsGroup,
  CoverImageUpload,
} from "./subcomponents";
import { SmartphonePreview } from "./smartphone-preview";

export function MobileLayout({
  isNewEvent,
  isPending,
  isUploadingCover,
  onCancel,
  editTemplate,
  handleTemplateChange,
  editButtonShape,
  setEditButtonShape,
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
  eventName,
  setEventName,
  eventDate,
  setEventDate,
  editPreheader,
  setEditPreheader,
  editSubheader,
  setEditSubheader,
  coverImageUrl,
  coverUploadProgress,
  coverInputRef,
  handleCoverChange,
  handleRemoveCover,
  hasChanges,
  mobileTab,
  setMobileTab,
}: DesignerLayoutProps) {
  return (
    <div className="lg:hidden flex flex-col relative h-full w-full overflow-hidden bg-background text-foreground">
      {/* Canva-style Top Bar */}
      <div className="bg-card border-b border-border/40 py-2.5 px-4 flex justify-between items-center shrink-0 z-20">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending || isUploadingCover}
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 h-8"
          >
            Cancel
          </Button>
        ) : (
          <span className="text-[10px] text-muted-foreground">Editing Welcomer</span>
        )}

        <span className="font-bold text-xs tracking-tight text-foreground">
          {isNewEvent ? "Visual Designer" : "Visual Customizer"}
        </span>

        <Button
          type="submit"
          onClick={() => setMobileTab(null)}
          disabled={isPending || isUploadingCover || (!hasChanges && !isNewEvent)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer transition-all text-xs h-8 px-4 rounded-full shadow-md shadow-primary/15"
        >
          {isPending ? (
            <SpinnerGapIcon className="size-3.5 animate-spin" />
          ) : (
            isNewEvent ? "Launch" : "Save"
          )}
        </Button>
      </div>

      {/* Smartphone Simulator Preview Container */}
      <div
        onClick={() => setMobileTab(null)}
        className="flex-1 min-h-0 flex items-center justify-center p-6 bg-muted/5 relative cursor-pointer"
      >
        <SmartphonePreview
          editTemplate={editTemplate}
          editPreheader={editPreheader}
          eventName={eventName}
          editSubheader={editSubheader}
          eventDate={eventDate}
          coverImageUrl={coverImageUrl}
          editButtonShape={editButtonShape}
          editTextColor={editTextColor}
          editButtonColor={editButtonColor}
          editButtonTextColor={editButtonTextColor}
          editBgColor={editBgColor}
          editPreheaderColor={editPreheaderColor}
          editSubheaderColor={editSubheaderColor}
          isDesktop={false}
        />
      </div>

      {/* Drawer Background Overlay */}
      {mobileTab && (
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px] z-20 transition-opacity duration-300"
          onClick={() => setMobileTab(null)}
        />
      )}

      {/* Sliding Drawer Container */}
      <div
        className={`absolute bottom-[58px] left-0 right-0 z-30 bg-card border-t border-border rounded-t-2xl shadow-2xl p-5 transition-all duration-300 ease-in-out ${
          mobileTab ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Header of Drawer */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/20">
          <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            {mobileTab === "templates" && <><SparkleIcon className="size-4 text-primary" /> Choose Layout Theme</>}
            {mobileTab === "colors" && <><PaletteIcon className="size-4 text-primary" /> Theme Colors</>}
            {mobileTab === "text" && <><ListBulletsIcon className="size-4 text-primary" /> Edit Texts &amp; Shape</>}
            {mobileTab === "cover" && <><UploadSimpleIcon className="size-4 text-primary" /> Cover Image</>}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setMobileTab(null)}
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="max-h-[30vh] overflow-y-auto pr-1">
          {mobileTab === "templates" && (
            <TemplateSelector
              editTemplate={editTemplate}
              isPending={isPending}
              onTemplateChange={handleTemplateChange}
              gridColsClass="grid-cols-2 py-1"
              onSelectCallback={() => setMobileTab(null)}
            />
          )}

          {mobileTab === "colors" && (
            <DesignColorsCollapse
              designCardExpanded={true}
              onToggleExpanded={() => {}}
              editBgColor={editBgColor}
              setEditBgColor={setEditBgColor}
              editTextColor={editTextColor}
              setEditTextColor={setEditTextColor}
              editButtonColor={editButtonColor}
              setEditButtonColor={setEditButtonColor}
              editButtonTextColor={editButtonTextColor}
              setEditButtonTextColor={setEditButtonTextColor}
              editPreheaderColor={editPreheaderColor}
              setEditPreheaderColor={setEditPreheaderColor}
              editSubheaderColor={editSubheaderColor}
              setEditSubheaderColor={setEditSubheaderColor}
              handleResetColors={handleResetColors}
              isPending={isPending}
              isMobile={true}
            />
          )}

          {mobileTab === "text" && (
            <div className="space-y-3 py-1">
              <TextFieldsGroup
                eventName={eventName}
                setEventName={setEventName}
                eventDate={eventDate}
                setEventDate={setEventDate}
                editPreheader={editPreheader}
                setEditPreheader={setEditPreheader}
                editSubheader={editSubheader}
                setEditSubheader={setEditSubheader}
                isNewEvent={isNewEvent}
                isPending={isPending}
                isMobile={true}
              />

              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-semibold text-foreground">
                  CTA Button Shape
                </label>
                <ButtonShapeSelector
                  editButtonShape={editButtonShape}
                  isPending={isPending}
                  onButtonShapeChange={setEditButtonShape}
                  isMobile={true}
                />
              </div>
            </div>
          )}

          {mobileTab === "cover" && (
            <CoverImageUpload
              coverImageUrl={coverImageUrl}
              isPending={isPending}
              isUploadingCover={isUploadingCover}
              coverUploadProgress={coverUploadProgress}
              coverInputRef={coverInputRef}
              handleCoverChange={handleCoverChange}
              handleRemoveCover={handleRemoveCover}
            />
          )}
        </div>
      </div>

      {/* Canva-style bottom bar */}
      <div className="mt-auto bg-card border-t border-border/40 py-2 px-4 flex justify-around items-center gap-1 shrink-0 z-25 rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === "templates" ? null : "templates")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer p-1.5 flex-1 ${
            mobileTab === "templates" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SparkleIcon className="size-5" weight={mobileTab === "templates" ? "fill" : "regular"} />
          Layouts
        </button>
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === "colors" ? null : "colors")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer p-1.5 flex-1 ${
            mobileTab === "colors" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PaletteIcon className="size-5" weight={mobileTab === "colors" ? "fill" : "regular"} />
          Theme Colors
        </button>
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === "text" ? null : "text")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer p-1.5 flex-1 ${
            mobileTab === "text" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListBulletsIcon className="size-5" weight={mobileTab === "text" ? "fill" : "regular"} />
          Texts
        </button>
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === "cover" ? null : "cover")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer p-1.5 flex-1 ${
            mobileTab === "cover" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UploadSimpleIcon className="size-5" weight={mobileTab === "cover" ? "fill" : "regular"} />
          Cover Image
        </button>
      </div>
    </div>
  );
}
