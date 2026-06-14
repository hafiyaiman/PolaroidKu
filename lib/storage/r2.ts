import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
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
 * Calculates the total size of all objects under a prefix.
 * Used to check actual storage consumed by a user.
 */
export async function getUserStorageSize(userId: string): Promise<number> {
  let totalSize = 0;
  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  try {
    while (isTruncated) {
      const response: any = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: `users/${userId}/`,
          ContinuationToken: continuationToken,
        })
      );
      
      if (response.Contents) {
        for (const item of response.Contents) {
          totalSize += item.Size || 0;
        }
      }

      isTruncated = response.IsTruncated ?? false;
      continuationToken = response.NextContinuationToken;
    }
  } catch (error) {
    console.error(`Failed to calculate storage size for user ${userId}:`, error);
  }

  return totalSize;
}

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

/**
 * Deletes a single object from Cloudflare R2 by key.
 */
export async function deleteObjectFromR2(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
  } catch (error) {
    console.error(`Failed to delete object from R2 (key: ${key}):`, error);
    throw error;
  }
}

/**
 * Deletes all objects in an event folder on R2.
 */
export async function deleteEventFolderFromR2(userId: string, eventId: string) {
  try {
    const prefix = `users/${userId}/events/${eventId}/`;
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const listRes: any = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      if (listRes.Contents && listRes.Contents.length > 0) {
        const objectsToDelete = listRes.Contents.map((item: any) => ({ Key: item.Key }));
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: objectsToDelete,
            Quiet: true,
          },
        });
        await r2Client.send(deleteCommand);
      }

      isTruncated = listRes.IsTruncated ?? false;
      continuationToken = listRes.NextContinuationToken;
    }
  } catch (error) {
    console.error(`Failed to delete event folder from R2 (eventId: ${eventId}):`, error);
  }
}



