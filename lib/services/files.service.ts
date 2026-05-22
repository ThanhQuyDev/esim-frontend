import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * Maximum size per individual file (5MB).
 * Mirrors the spec: "mỗi file ≤ 5MB".
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum number of attachments per ticket. */
export const MAX_ATTACHMENTS = 5;

/** Whitelist of accepted MIME types and extensions for the upload zone. */
export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/** `accept` attribute string for `<input type="file">`. */
export const ACCEPT_ATTRIBUTE = "image/*,.pdf,.doc,.docx";

/**
 * Validate an incoming File against the ticket-attachment policy.
 * Returns null on success, or an error key when invalid.
 */
export type FileValidationError = "tooLarge" | "invalidType";

export function validateAttachment(file: File): FileValidationError | null {
  if (file.size > MAX_FILE_SIZE_BYTES) return "tooLarge";

  const lowerName = file.name.toLowerCase();
  const matchesMime = (ACCEPTED_MIME_TYPES as readonly string[]).includes(
    file.type
  );
  const matchesExt =
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".doc") ||
    lowerName.endsWith(".docx") ||
    file.type.startsWith("image/");

  if (!matchesMime && !matchesExt) return "invalidType";
  return null;
}

/**
 * Upload a single file to Cloudinary.
 * Returns the public secure URL of the uploaded file.
 *
 * Throws on failure so callers can show a generic error toast.
 */
export async function uploadFile(file: File): Promise<string> {
  const result = await uploadToCloudinary(file);
  return result.fileUrl;
}
