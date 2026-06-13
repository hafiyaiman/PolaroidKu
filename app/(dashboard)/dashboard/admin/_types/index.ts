export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  eventsCount: number;
  bucketSize: string;
  r2ConsoleUrl?: string;
}
