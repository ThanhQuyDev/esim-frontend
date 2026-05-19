/**
 * Domain types for the Customer Support Ticket feature.
 *
 * Mirrors the contract documented in the support-form spec:
 *   POST {API_BASE}/api/v1/tickets   -> creates a ticket
 *   POST {API_BASE}/api/v1/files/upload -> uploads an attachment
 */

/** Payload posted to /api/v1/tickets */
export interface CreateTicketPayload {
  customerEmail: string;
  subject: string;
  description: string;
  orderId?: string;
  deviceModel?: string;
  iccid?: string;
  planDestination?: string;
  /** Mảng URL đã upload qua /api/v1/files/upload */
  attachments?: string[];
}

export type TicketStatus =
  | "open"
  | "pending"
  | "in_progress"
  | "resolved"
  | "closed";

/** Successful ticket creation response (HTTP 201) */
export interface Ticket {
  id: string | number;
  customerEmail: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  orderId?: string;
  deviceModel?: string;
  iccid?: string;
  planDestination?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

/** 422 validation error from the API */
export interface TicketValidationError {
  status: 422;
  /** Field-name → human-readable error message */
  errors: Record<string, string>;
}

/** Generic API error (anything non-422 / non-2xx) */
export interface ApiError {
  status: number;
  message: string;
}

/** Discriminated union returned by `submitTicket` */
export type SubmitTicketResult =
  | { ok: true; ticket: Ticket }
  | { ok: false; kind: "validation"; errors: Record<string, string> }
  | { ok: false; kind: "error"; status: number; message: string };

/** Local representation of a file in the upload queue */
export interface AttachmentItem {
  /** Stable client-side id (uuid) so React lists are keyed correctly */
  localId: string;
  file: File;
  /** Object URL for image previews (revoke on cleanup) */
  previewUrl?: string;
  /** Status of the upload pipeline for UX feedback */
  status: "queued" | "uploading" | "uploaded" | "error";
  /** Server-returned URL after a successful upload */
  uploadedUrl?: string;
  /** Error message when status === "error" */
  error?: string;
}

/** Response shape from POST /api/v1/files/upload */
export interface UploadFileResponse {
  file: {
    id: string | number;
    path: string; // Full URL
    url?: string;
    mimeType?: string;
    size?: number;
  };
}
