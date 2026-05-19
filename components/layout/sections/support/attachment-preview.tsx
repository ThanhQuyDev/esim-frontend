"use client";

import { useEffect, useState } from "react";
import { FileText, FileImage, File as FileIcon, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AttachmentItem } from "@/lib/types/ticket";

interface AttachmentPreviewProps {
  item: AttachmentItem;
  onRemove: (localId: string) => void;
  removeLabel: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(file: File) {
  if (file.type.startsWith("image/")) return FileImage;
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
    return FileText;
  if (
    file.type.includes("word") ||
    /\.(doc|docx)$/i.test(file.name)
  )
    return FileText;
  return FileIcon;
}

/**
 * Preview tile for a single attachment.
 *
 * - Image files render a thumbnail preview (object URL is owned by the parent
 *   so we don't double-create or leak URLs here).
 * - Non-image files render an icon + filename.
 * - Status badge reflects upload progress so the user gets immediate feedback.
 */
export function AttachmentPreview({ item, onRemove, removeLabel }: AttachmentPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = getIcon(item.file);
  const isImage = item.file.type.startsWith("image/") && item.previewUrl && !imageError;

  // Reset error if previewUrl changes
  useEffect(() => {
    setImageError(false);
  }, [item.previewUrl]);

  return (
    <li
      className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-gray-300"
    >
      {/* Thumbnail / Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Icon className="h-6 w-6 text-gray-500" aria-hidden="true" />
        )}
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium text-gray-900"
          title={item.file.name}
        >
          {item.file.name}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
          <span>{formatBytes(item.file.size)}</span>
          {item.status === "uploading" && (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span>Uploading…</span>
            </span>
          )}
          {item.status === "uploaded" && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              <span>Uploaded</span>
            </span>
          )}
          {item.status === "error" && (
            <span className="inline-flex items-center gap-1 text-red-600" title={item.error}>
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              <span>Failed</span>
            </span>
          )}
        </p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.localId)}
        className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 cursor-pointer"
        aria-label={`${removeLabel}: ${item.file.name}`}
        disabled={item.status === "uploading"}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}
