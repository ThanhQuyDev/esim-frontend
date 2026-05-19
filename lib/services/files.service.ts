import type { UploadFileResponse } from "@/lib/types/ticket";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

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
 * Upload a single file to POST /api/v1/files/upload (multipart/form-data,
 * field name "file"). Returns the public URL stored in `file.path`.
 *
 * Throws on non-2xx responses so callers can show a generic error toast.
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/v1/files/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = String(body.message);
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(message);
  }

  const data = (await res.json()) as UploadFileResponse;
  const url = data?.file?.path ?? data?.file?.url;
  if (!url || typeof url !== "string") {
    throw new Error("Upload response did not include a file URL.");
  }
  return url;
}
