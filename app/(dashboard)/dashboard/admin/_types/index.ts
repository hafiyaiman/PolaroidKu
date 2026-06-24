export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  eventsCount: number;
  bucketSize: string;
  r2ConsoleUrl: string;
}

export interface AdminSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface AuthAdminApi {
  admin: {
    banUser: (args: { userId: string; banReason: string }) => Promise<{ error?: { message?: string } }>;
    unbanUser: (args: { userId: string }) => Promise<{ error?: { message?: string } }>;
    setRole: (args: { userId: string; role: string }) => Promise<{ error?: { message?: string } }>;
  };
}
