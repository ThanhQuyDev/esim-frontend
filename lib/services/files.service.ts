import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * What a customer may attach to a support ticket (#076).
 *
 * Video was rejected outright, which is the one thing that actually settles an
 * activation problem: a 20-second screen recording of the phone saying "no
 * service" says more than three paragraphs. PDFs were allowed but shared the
 * 5MB photo limit, so an invoice export could bounce for no good reason.
 */

/** Per-file limit for images and documents (5MB). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Per-file limit for video (50MB) — the same ceiling the support chat uses, so
 * a customer who is told "send us a recording" gets the same answer in both
 * places. A phone screen recording of a minute or two fits comfortably.
 */
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

/** Maximum number of attachments per ticket. */
export const MAX_ATTACHMENTS = 5;

export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/**
 * Video containers phones actually produce: iPhone records .mov, Android .mp4
 * (some ship .3gp), screen-recorder apps and browsers produce .webm.
 */
export const ACCEPTED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/ogg",
  "video/3gpp",
  "video/x-matroska",
  "video/x-msvideo",
] as const;

export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  ...ACCEPTED_DOCUMENT_MIME_TYPES,
  ...ACCEPTED_VIDEO_MIME_TYPES,
] as const;

const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".webm",
  ".ogv",
  ".3gp",
  ".mkv",
  ".avi",
  ".m4v",
] as const;

/** `accept` attribute string for `<input type="file">`. */
export const ACCEPT_ATTRIBUTE = `image/*,video/*,.pdf,.doc,.docx,${VIDEO_EXTENSIONS.join(",")}`;

export type AttachmentKind = "image" | "video" | "document" | "unsupported";

function hasExtension(name: string, extensions: readonly string[]): boolean {
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

/**
 * Classify a file by MIME type, falling back to its extension.
 *
 * The fallback matters: Windows hands over `.mov` and `.mkv` with an empty
 * `type`, and a file picked from some Android file managers arrives as
 * `application/octet-stream`. Rejecting those would look like a broken form.
 */
export function attachmentKind(file: File): AttachmentKind {
  const type = file.type;

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if ((ACCEPTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(type)) {
    return "document";
  }

  if (hasExtension(file.name, VIDEO_EXTENSIONS)) return "video";
  if (hasExtension(file.name, DOCUMENT_EXTENSIONS)) return "document";

  return "unsupported";
}

/** Size ceiling that applies to this particular file. */
export function maxSizeForFile(file: File): number {
  return attachmentKind(file) === "video"
    ? MAX_VIDEO_SIZE_BYTES
    : MAX_FILE_SIZE_BYTES;
}

export type FileValidationError = "tooLarge" | "invalidType";

export interface AttachmentRejection {
  error: FileValidationError;
  /** Limit that was exceeded, in whole MB — for the "over NN MB" message. */
  limitMb: number;
}

/**
 * Check a file against the attachment policy.
 * `null` means it may be attached.
 */
export function validateAttachment(file: File): AttachmentRejection | null {
  const kind = attachmentKind(file);
  if (kind === "unsupported") {
    return { error: "invalidType", limitMb: bytesToMb(MAX_FILE_SIZE_BYTES) };
  }

  const limit = maxSizeForFile(file);
  if (file.size > limit) {
    return { error: "tooLarge", limitMb: bytesToMb(limit) };
  }

  return null;
}

export function bytesToMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
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
