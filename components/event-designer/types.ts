export interface EventDesignerFormValues {
  name: string;
  date?: string;
  template: string;
  coverImageKey: string | null;
  preheader: string;
  subheader: string | null;
  buttonShape: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  bgColor: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  desc: string;
  preview: string;
}

export const templatesList: EventTemplate[] = [
  { id: "classic",    name: "Classic Polaroid",    desc: "Cream & polaroid frame",   preview: "/template-classic.png" },
  { id: "elegant",    name: "Elegant Minimalist",  desc: "Top banner, serif light",  preview: "/template-elegant.png" },
  { id: "cover",      name: "Cover Style",         desc: "Full bleed, light overlay", preview: "/template-cover.png" },
  { id: "dark-cover", name: "Dark Cover",          desc: "Full bleed, dark overlay",  preview: "/template-dark-cover.png" },
];

export const getTemplateColors = (tplId: string) => {
  switch (tplId) {
    case "classic":
      return { textColor: "#0F172A", buttonColor: "#451A03", buttonTextColor: "#FFFFFF", bgColor: "#FAF9F5" };
    case "elegant":
      return { textColor: "#1F2937", buttonColor: "#111827", buttonTextColor: "#FFFFFF", bgColor: "#FFFFFF" };
    case "cover":
    case "dark-cover":
    default:
      return { textColor: "#FFFFFF", buttonColor: "#FFFFFF", buttonTextColor: "#0F172A", bgColor: "#000000" };
  }
};

export interface DesignerLayoutProps {
  isNewEvent: boolean;
  isPending: boolean;
  isUploadingCover: boolean;
  submitButtonText: string;
  onCancel?: () => void;
  designerTab: "theme" | "content";
  setDesignerTab: (val: "theme" | "content") => void;
  editTemplate: string;
  handleTemplateChange: (tpl: string) => void;
  editButtonShape: string;
  setEditButtonShape: (val: string) => void;
  designCardExpanded: boolean;
  setDesignCardExpanded: (val: boolean) => void;
  editBgColor: string;
  setEditBgColor: (val: string) => void;
  editTextColor: string;
  setEditTextColor: (val: string) => void;
  editButtonColor: string;
  setEditButtonColor: (val: string) => void;
  editButtonTextColor: string;
  setEditButtonTextColor: (val: string) => void;
  handleResetColors: () => void;
  eventName: string;
  setEventName: (val: string) => void;
  eventDate: string;
  setEventDate: (val: string) => void;
  editPreheader: string;
  setEditPreheader: (val: string) => void;
  editSubheader: string;
  setEditSubheader: (val: string) => void;
  coverImageUrl: string;
  coverUploadProgress: number;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCover: () => void;
  hasChanges: boolean;
  mobileTab: "templates" | "colors" | "text" | "cover" | null;
  setMobileTab: (tab: "templates" | "colors" | "text" | "cover" | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
}
