export interface UserSettings {
  userId: string;
  phoneNumber: string | null;
  defaultEventVisibility: "public" | "private";
  defaultTheme: "light" | "dark" | "system";
  notifyOnUpload: boolean;
  notifyOnLimit: boolean;
  notifyOnExpiry: boolean;
  notifyOnReceipt: boolean;
  updatedAt: Date | null;
}

export interface UserSession {
  id: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
}
