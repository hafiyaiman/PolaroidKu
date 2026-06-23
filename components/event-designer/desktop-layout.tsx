"use client";

import * as React from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaletteIcon, ListBulletsIcon, ShieldCheckIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { DesignerLayoutProps } from "./types";
import {
  TemplateSelector,
  ButtonShapeSelector,
  DesignColorsCollapse,
  TextFieldsGroup,
  CoverImageUpload,
} from "./subcomponents";
import { SmartphonePreview } from "./smartphone-preview";

export function DesktopLayout({
  isNewEvent,
  isPending,
  isUploadingCover,
  submitButtonText,
  onCancel,
  designerTab,
  setDesignerTab,
  editTemplate,
  handleTemplateChange,
  editButtonShape,
  setEditButtonShape,
  designCardExpanded,
  setDesignCardExpanded,
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
}: DesignerLayoutProps) {
  const renderDesignerPanel = () => (
    <Tabs
      value={designerTab}
      onValueChange={(value) => setDesignerTab(value as "theme" | "content")}
      className="space-y-5 flex flex-col h-full overflow-hidden"
    >
      <div className="pb-2 shrink-0">
        <TabsList variant={"line"} className="w-full">
          <TabsTrigger value="theme">
            <PaletteIcon className="size-4" />
            Layout &amp; Theme
          </TabsTrigger>
          <TabsTrigger value="content">
            <ListBulletsIcon className="size-4" />
            Text &amp; Cover Content
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
        <TabsContent value="theme" className="space-y-6 mt-0">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Guestbook Layout Theme
            </label>
            <TemplateSelector
              editTemplate={editTemplate}
              isPending={isPending}
              onTemplateChange={handleTemplateChange}
              gridColsClass="grid-cols-5"
            />
          </div>

          <div className="bg-muted/10 border border-border/30 rounded-xl p-3.5 space-y-2">
            <label className="text-xs font-semibold text-foreground">
              CTA Button Shape
            </label>
            <ButtonShapeSelector
              editButtonShape={editButtonShape}
              isPending={isPending}
              onButtonShapeChange={setEditButtonShape}
            />
          </div>

          <DesignColorsCollapse
            designCardExpanded={designCardExpanded}
            onToggleExpanded={() => setDesignCardExpanded(!designCardExpanded)}
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
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-0">
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
          />

          <CoverImageUpload
            coverImageUrl={coverImageUrl}
            isPending={isPending}
            isUploadingCover={isUploadingCover}
            coverUploadProgress={coverUploadProgress}
            coverInputRef={coverInputRef}
            handleCoverChange={handleCoverChange}
            handleRemoveCover={handleRemoveCover}
          />
        </TabsContent>
      </div>
    </Tabs>
  );

  return (
    <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-stretch h-full w-full overflow-hidden min-h-0">
      {/* Left Form controls (Col span 7) */}
      <div className="lg:col-span-7 h-full overflow-hidden flex flex-col min-h-0">
        <Card className="border-border hover:shadow-md transition-all overflow-hidden flex flex-col h-full text-white">
          <div className="flex-1 overflow-hidden p-6 pt-0 flex flex-col">
            {renderDesignerPanel()}
          </div>

          <CardFooter className="border-t border-border/40 pt-4 flex justify-between items-center gap-4 shrink-0 bg-card/10">
            {onCancel ? (
              <Button type="button" variant="ghost" disabled={isPending || isUploadingCover} onClick={onCancel} className="cursor-pointer text-xs h-9">
                Cancel
              </Button>
            ) : (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheckIcon className="size-4 text-primary" />
                Launched live immediately.
              </span>
            )}
            <Button
              type="submit"
              disabled={isPending || isUploadingCover || (!hasChanges && !isNewEvent)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-md shadow-primary/15 active:scale-95 transition-all text-xs h-9 gap-1.5"
            >
              {isPending ? (
                <>
                  <SpinnerGapIcon className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right side Visual Preview Phone mockup (Col span 5) */}
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
        isDesktop={true}
      />
    </div>
  );
}
