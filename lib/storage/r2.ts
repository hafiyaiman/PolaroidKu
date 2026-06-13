import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "polaroidku";

// 1. Initialize S3 client configured for Cloudflare R2 endpoint and credentials
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

/**
 * Generates a secure, temporary PUT URL so guests can upload directly to R2.
 * Key format: users/[userId]/events/[eventId]/uploads/[timestamp]-[filename]
 * URL is valid for 10 minutes (600 seconds).
 */
export async function getPresignedUploadUrl(
  userId: string,
  eventId: string,
  filename: string,
  contentType: string
) {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `users/${userId}/events/${eventId}/uploads/${Date.now()}-${sanitizedFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 600,
    signableHeaders: new Set(["host", "content-type"]),
  });
  return { uploadUrl, key };
}

/**
 * Generates a secure, temporary GET URL to retrieve the private image.
 * URL is valid for 1 hour (3600 seconds).
 */
export async function getPresignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return downloadUrl;
}

