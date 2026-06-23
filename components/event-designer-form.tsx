"use client";

import * as React from "react";
import { toast } from "sonner";

import { requestCoverUploadUrl } from "@/app/(dashboard)/dashboard/events/_actions/event-actions";
import {
  EventDesignerFormValues,
  getTemplateColors,
} from "./event-designer/types";
import { DesktopLayout } from "./event-designer/desktop-layout";
import { MobileLayout } from "./event-designer/mobile-layout";

export type { EventDesignerFormValues };

interface EventDesignerFormProps {
  eventId: string;
  initialValues?: {
    name: string;
    date?: string;
    template?: string;
    coverImageKey?: string | null;
    coverImageUrl?: string | null;
    preheader?: string;
    subheader?: string | null;
    buttonShape?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    bgColor?: string;
    preheaderColor?: string | null;
    subheaderColor?: string | null;
  };
  isNewEvent?: boolean;
  isPending: boolean;
  onSubmit: (values: EventDesignerFormValues) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
}

export function EventDesignerForm({
  eventId,
  initialValues,
  isNewEvent = false,
  isPending = false,
  onSubmit,
  onCancel,
  submitButtonText = "Save Changes",
}: EventDesignerFormProps) {
  // Main designer tab selection: Layout Theme vs Text Content
  const [designerTab, setDesignerTab] = React.useState<"theme" | "content">("theme");

  // Basic & Customizer states
  const [eventName, setEventName] = React.useState(initialValues?.name || "");
  const [eventDate, setEventDate] = React.useState(initialValues?.date || "");
  const [editTemplate, setEditTemplate] = React.useState(initialValues?.template || "classic");
  const [coverImageKey, setCoverImageKey] = React.useState(initialValues?.coverImageKey || "");
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialValues?.coverImageUrl || "");
  const [editPreheader, setEditPreheader] = React.useState(initialValues?.preheader || "Our Guestbook");
  const [editSubheader, setEditSubheader] = React.useState(initialValues?.subheader || "");
  const [editButtonShape, setEditButtonShape] = React.useState(initialValues?.buttonShape || "rounded");

  const [editTextColor, setEditTextColor] = React.useState(initialValues?.textColor || "#0F172A");
  const [editButtonColor, setEditButtonColor] = React.useState(initialValues?.buttonColor || "#451A03");
  const [editButtonTextColor, setEditButtonTextColor] = React.useState(initialValues?.buttonTextColor || "#FFFFFF");
  const [editBgColor, setEditBgColor] = React.useState(initialValues?.bgColor || "#FAF9F5");
  const [editPreheaderColor, setEditPreheaderColor] = React.useState(initialValues?.preheaderColor || "");
  const [editSubheaderColor, setEditSubheaderColor] = React.useState(initialValues?.subheaderColor || "");

  // Visual collapse and upload helper states
  const [designCardExpanded, setDesignCardExpanded] = React.useState(true);
  const [isUploadingCover, setIsUploadingCover] = React.useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = React.useState(0);
  const [pendingCoverFile, setPendingCoverFile] = React.useState<File | null>(null);
  const [mobileTab, setMobileTab] = React.useState<"templates" | "colors" | "text" | "cover" | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state if initialValues changes from parents
  React.useEffect(() => {
    if (initialValues) {
      const timer = setTimeout(() => {
        setEventName(initialValues.name || "");
        setEventDate(initialValues.date || "");
        setEditTemplate(initialValues.template || "classic");
        setCoverImageKey(initialValues.coverImageKey || "");
        setCoverImageUrl(initialValues.coverImageUrl || "");
        setEditPreheader(initialValues.preheader || "Our Guestbook");
        setEditSubheader(initialValues.subheader || "");
        setEditButtonShape(initialValues.buttonShape || "rounded");
        setEditTextColor(initialValues.textColor || "#0F172A");
        setEditButtonColor(initialValues.buttonColor || "#451A03");
        setEditButtonTextColor(initialValues.buttonTextColor || "#FFFFFF");
        setEditBgColor(initialValues.bgColor || "#FAF9F5");
        setEditPreheaderColor(initialValues.preheaderColor || "");
        setEditSubheaderColor(initialValues.subheaderColor || "");
        setPendingCoverFile(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialValues]);

  // Preset switching helper
  const handleTemplateChange = (tplId: string) => {
    setEditTemplate(tplId);
    // Don't reset layout colors here per request: "just change the theme without changing color"
  };

  const handleResetColors = () => {
    const defaults = getTemplateColors(editTemplate);
    setEditTextColor(defaults.textColor);
    setEditButtonColor(defaults.buttonColor);
    setEditButtonTextColor(defaults.buttonTextColor);
    setEditBgColor(defaults.bgColor);
    setEditPreheaderColor("");
    setEditSubheaderColor("");
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be smaller than 10MB.");
      return;
    }

    setPendingCoverFile(selectedFile);
    const localUrl = URL.createObjectURL(selectedFile);
    setCoverImageUrl(localUrl);
    if (!isNewEvent) {
      toast.success("Cover photo selected! Save designer changes to apply.");
    }
  };

  const handleRemoveCover = () => {
    setPendingCoverFile(null);
    setCoverImageKey("");
    setCoverImageUrl("");
    if (!isNewEvent) {
      toast.success("Cover image removed! Save designer changes to apply.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      toast.error("Event Name is required.");
      return;
    }
    if (isNewEvent && !eventDate) {
      toast.error("Event Date is required.");
      return;
    }

    let finalCoverKey = coverImageKey;

    try {
      if (pendingCoverFile) {
        setIsUploadingCover(true);
        setCoverUploadProgress(15);

        const presignedRes = await requestCoverUploadUrl({
          eventId,
          filename: pendingCoverFile.name,
          contentType: pendingCoverFile.type,
          isNewEvent,
        });

        if (presignedRes.error) {
          toast.error(presignedRes.error);
          setIsUploadingCover(false);
          return;
        }

        const { uploadUrl, key } = presignedRes;
        setCoverUploadProgress(40);

        const uploadXhr = new XMLHttpRequest();
        uploadXhr.open("PUT", uploadUrl!, true);
        uploadXhr.setRequestHeader("Content-Type", pendingCoverFile.type);

        uploadXhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percentComplete = Math.round((evt.loaded / evt.total) * 45);
            setCoverUploadProgress(40 + percentComplete);
          }
        };

        const uploadResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
          uploadXhr.onload = () => {
            if (uploadXhr.status === 200) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: "Failed to upload cover image." });
            }
          };
          uploadXhr.onerror = () => resolve({ success: false, error: "Network error during cover photo upload." });
          uploadXhr.send(pendingCoverFile);
        });

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed uploading cover image.");
          setIsUploadingCover(false);
          return;
        }

        setCoverUploadProgress(100);
        setIsUploadingCover(false);
        finalCoverKey = key!;
        setCoverImageKey(key!);
        setPendingCoverFile(null);
      }

      await onSubmit({
        name: eventName.trim(),
        date: isNewEvent ? eventDate : undefined,
        template: editTemplate,
        coverImageKey: finalCoverKey || null,
        preheader: editPreheader.trim() || "Our Guestbook",
        subheader: editSubheader.trim() || null,
        buttonShape: editButtonShape,
        textColor: editTextColor,
        buttonColor: editButtonColor,
        buttonTextColor: editButtonTextColor,
        bgColor: editBgColor,
        preheaderColor: editPreheaderColor || null,
        subheaderColor: editSubheaderColor || null,
      });
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error(error.message || "An error occurred while saving configuration.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const hasChanges = React.useMemo(() => {
    if (isNewEvent) return true;
    if (!initialValues) return false;

    return (
      eventName.trim() !== (initialValues.name || "") ||
      (eventDate !== (initialValues.date || "")) ||
      editTemplate !== (initialValues.template || "classic") ||
      coverImageKey !== (initialValues.coverImageKey || "") ||
      pendingCoverFile !== null ||
      editPreheader !== (initialValues.preheader || "Our Guestbook") ||
      editSubheader !== (initialValues.subheader || "") ||
      editButtonShape !== (initialValues.buttonShape || "rounded") ||
      editTextColor !== (initialValues.textColor || "#0F172A") ||
      editButtonColor !== (initialValues.buttonColor || "#451A03") ||
      editButtonTextColor !== (initialValues.buttonTextColor || "#FFFFFF") ||
      editBgColor !== (initialValues.bgColor || "#FAF9F5") ||
      editPreheaderColor !== (initialValues.preheaderColor || "") ||
      editSubheaderColor !== (initialValues.subheaderColor || "")
    );
  }, [
    isNewEvent,
    initialValues,
    eventName,
    eventDate,
    editTemplate,
    coverImageKey,
    pendingCoverFile,
    editPreheader,
    editSubheader,
    editButtonShape,
    editTextColor,
    editButtonColor,
    editButtonTextColor,
    editBgColor,
    editPreheaderColor,
    editSubheaderColor,
  ]);

  const layoutProps = {
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
    mobileTab,
    setMobileTab,
    handleSubmit,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        <DesktopLayout {...layoutProps} />
        <MobileLayout {...layoutProps} />
      </form>
    </div>
  );
}
