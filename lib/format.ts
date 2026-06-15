export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  
  if (seconds < 10) return "just now";
  return `${Math.floor(seconds)} seconds ago`;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
