"use client";

/**
 * Cloudinary Upload Service
 * Reusable file upload utility for images and videos via Cloudinary.
 */

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

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
export async function uploadToCloudinary(file: File): Promise<FileAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const resourceType = file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("image/")
      ? "image"
      : "raw";
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

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
