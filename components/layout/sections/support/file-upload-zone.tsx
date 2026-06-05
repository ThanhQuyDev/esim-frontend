"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPT_ATTRIBUTE,
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE_BYTES,
  validateAttachment,
} from "@/lib/services/files.service";
import type { AttachmentItem } from "@/lib/types/ticket";
import { AttachmentPreview } from "./attachment-preview";

interface FileUploadZoneProps {
  items: AttachmentItem[];
  onChange: (items: AttachmentItem[]) => void;
  onValidationError?: (msg: string) => void;
  disabled?: boolean;
  /** i18n strings (already resolved on the parent) */
  labels: {
    title: string;
    helpText: string;
    acceptText: string;
    browse: string;
    remove: string;
    tooMany: string;
    tooLarge: (name: string) => string;
    invalidType: (name: string) => string;
  };
}

function makeLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Drag-drop + click-to-browse upload zone.
 *
 * Owns no upload state itself; it just appends/removes `AttachmentItem`s in
 * the parent-controlled list. The parent is responsible for kicking off the
 * actual upload (e.g. inside the form's submit handler).
 *
 * Object URLs for image previews are created here and revoked on cleanup so
 * we don't leak memory across re-renders.
 */
export function FileUploadZone({
  items,
  onChange,
  onValidationError,
  disabled,
  labels,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  // Revoke object URLs when items unmount/replace
  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportError = useCallback(
    (msg: string) => {
      onValidationError?.(msg);
    },
    [onValidationError]
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      const remainingSlots = MAX_ATTACHMENTS - items.length;
      if (remainingSlots <= 0) {
        reportError(labels.tooMany);
        return;
      }

      const accepted: AttachmentItem[] = [];
      let exceededTooMany = false;

      for (const file of incoming) {
        if (accepted.length >= remainingSlots) {
          exceededTooMany = true;
          break;
        }

        const validation = validateAttachment(file);
        if (validation === "tooLarge") {
          reportError(labels.tooLarge(file.name));
          continue;
        }
        if (validation === "invalidType") {
          reportError(labels.invalidType(file.name));
          continue;
        }

        accepted.push({
          localId: makeLocalId(),
          file,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          status: "queued",
        });
      }

      if (exceededTooMany || incoming.length > remainingSlots) {
        reportError(labels.tooMany);
      }

      if (accepted.length > 0) {
        onChange([...items, ...accepted]);
      }
    },
    [items, labels, onChange, reportError]
  );

  const handleRemove = useCallback(
    (localId: string) => {
      const target = items.find((it) => it.localId === localId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      onChange(items.filter((it) => it.localId !== localId));
    },
    [items, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const files = e.dataTransfer.files;
      if (files && files.length > 0) addFiles(files);
    },
    [addFiles, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleKeyActivate = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const atCapacity = items.length >= MAX_ATTACHMENTS;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled || atCapacity ? -1 : 0}
        aria-disabled={disabled || atCapacity}
        aria-label={labels.title}
        onClick={() => {
          if (disabled || atCapacity) return;
          inputRef.current?.click();
        }}
        onKeyDown={handleKeyActivate}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
          disabled || atCapacity
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "cursor-pointer border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50",
          isDragging &&
            !disabled &&
            !atCapacity &&
            "border-blue-500 bg-blue-50 text-blue-700"
        )}
      >
        <UploadCloud className="mb-2 h-8 w-8" aria-hidden="true" />
        <p className="text-base font-medium">{labels.helpText}</p>
        <p className="mt-1 text-sm text-gray-500">{labels.acceptText}</p>
        <p className="mt-1 text-sm text-gray-400">
          {(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB · {MAX_ATTACHMENTS} files max
        </p>
        <span
          className={cn(
            "mt-3 inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            disabled || atCapacity
              ? "border-gray-200 bg-gray-100 text-gray-400"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          {labels.browse}
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            // Reset so the same file can be re-selected after removing
            e.target.value = "";
          }}
          disabled={disabled || atCapacity}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-2 list-none p-0">
          {items.map((item) => (
            <AttachmentPreview
              key={item.localId}
              item={item}
              onRemove={handleRemove}
              removeLabel={labels.remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
