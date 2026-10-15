const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/** Body of `POST /api/v1/partners/apply`. */
export interface PartnerApplyPayload {
  /**
   * Always `kol` from this page: it is the affiliate programme. Resellers and
   * travel agencies (`distribution`) join through a different flow — see #094.
   */
  partnerType: "kol" | "distribution";
  /** The partnership picked on the form (#053, test round 4). */
  requestedType?: "kol" | "distribution" | "api";
  legalType: "individual" | "company";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  password: string;
  companyName?: string;
  taxCode?: string;
  businessAddress?: string;
  channelInfo?: Record<string, unknown>;
  notes?: string;
}

export type PartnerApplyResult =
  | {
      ok: true;
      partnerId: number;
      userId: number;
      /** Opens the document upload for this application, for an hour (doitac-1410 #013). */
      documentUploadToken?: string;
    }
  | { ok: false; kind: "validation"; errors: Record<string, string> }
  | { ok: false; kind: "error"; status: number; message: string };

/**
 * Send an affiliate application (#095).
 *
 * Public endpoint — the applicant does not have an account yet; this call
 * creates one (role `partner`, status inactive) alongside the pending partner
 * record. Errors come back as a union rather than thrown, so the form can put
 * a 422 on the field it belongs to — "email already registered" in particular,
 * which is the one people hit.
 */
export async function applyAsPartner(
  payload: PartnerApplyPayload,
  signal?: AbortSignal
): Promise<PartnerApplyResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/partners/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(stripUndefined({ ...payload })),
      signal,
    });
  } catch (err) {
    return {
      ok: false,
      kind: "error",
      status: 0,
      message: err instanceof Error ? err.message : "Network error",
    };
  }

  if (res.ok) {
    const body = (await res.json().catch(() => null)) as {
      partnerId?: number;
      userId?: number;
      documentUploadToken?: string;
    } | null;
    return {
      ok: true,
      partnerId: body?.partnerId ?? 0,
      userId: body?.userId ?? 0,
      documentUploadToken: body?.documentUploadToken,
    };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Empty or non-JSON body — fall through to the generic message.
  }

  if (res.status === 422 && isValidationErrorBody(body)) {
    return { ok: false, kind: "validation", errors: body.errors };
  }

  const message =
    (isObject(body) && typeof body.message === "string" && body.message) ||
    `Request failed (${res.status})`;
  return { ok: false, kind: "error", status: res.status, message };
}

/** What an applicant may attach (doitac-1410 #013) — the server checks it too. */
export const PARTNER_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const PARTNER_DOCUMENT_MAX_FILES = 5;
export const PARTNER_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Attach documents to the application just sent (doitac-1410 #013), with the
 * token that application returned. Resolves to an error message, or null.
 */
export async function uploadPartnerDocuments(
  token: string,
  files: File[]
): Promise<string | null> {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/partners/apply/documents`, {
      method: "POST",
      headers: { "x-application-token": token },
      body,
    });
    if (res.ok) return null;
    const data = (await res.json().catch(() => null)) as { message?: unknown } | null;
    return typeof data?.message === "string" ? data.message : `HTTP ${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.message : "Network error";
  }
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isValidationErrorBody(
  v: unknown
): v is { errors: Record<string, string> } {
  if (!isObject(v)) return false;
  if (!isObject(v.errors)) return false;
  return Object.values(v.errors).every((e) => typeof e === "string");
}
