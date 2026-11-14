"use client";

/**
 * Cloudinary Upload Service
 * Reusable file upload utility for images and videos via Cloudinary.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Security 15/11/2026: no public upload preset any more. Each upload asks the
 * API for a signed ticket first — `chat` for a signed-in customer, `ticket`
 * for the support form (guests may attach files there too).
 */
export type CloudinaryPurpose = "chat" | "ticket";

type UploadTicket =
  | {
      mode: "signed";
      cloudName: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      folder: string;
    }
  | { mode: "unsigned"; cloudName: string; uploadPreset: string };

async function getUploadTicket(purpose: CloudinaryPurpose): Promise<UploadTicket> {
  let token: string | null = null;
  try {
    token = localStorage.getItem("esim_auth_token");
  } catch {
    token = null;
  }
  const res = await fetch(`${API_BASE_URL}/api/v1/files/cloudinary-signature/${purpose}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export interface FileAttachment {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

/**
 * Upload a file (image or video) to Cloudinary.
 * Returns the file metadata including the secure URL.
 */
export async function uploadToCloudinary(
  file: File,
  purpose: CloudinaryPurpose = "chat"
): Promise<FileAttachment> {
  const ticket = await getUploadTicket(purpose);
  const formData = new FormData();
  formData.append("file", file);
  if (ticket.mode === "signed") {
    formData.append("api_key", ticket.apiKey);
    formData.append("timestamp", String(ticket.timestamp));
    formData.append("signature", ticket.signature);
    formData.append("folder", ticket.folder);
  } else {
    formData.append("upload_preset", ticket.uploadPreset);
  }

  const resourceType = file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("image/")
      ? "image"
      : "raw";
  const url = `https://api.cloudinary.com/v1_1/${ticket.cloudName}/${resourceType}/upload`;

  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  return {
    fileUrl: data.secure_url,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

/** Validate that a file is an accepted type (image or video) and within size limit */
export function validateChatFile(file: File, maxSizeMb = 50): string | null {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return "Chỉ hỗ trợ file hình ảnh hoặc video.";
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `File vượt quá ${maxSizeMb}MB.`;
  }
  return null; // valid
}
