const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/** Body of `POST /api/v1/partners/apply`. */
export interface PartnerApplyPayload {
  /**
   * Always `kol` from this page: it is the affiliate programme. Resellers and
   * travel agencies (`distribution`) join through a different flow — see #094.
   */
  partnerType: "kol";
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
  | { ok: true; partnerId: number; userId: number }
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
    } | null;
    return {
      ok: true,
      partnerId: body?.partnerId ?? 0,
      userId: body?.userId ?? 0,
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
