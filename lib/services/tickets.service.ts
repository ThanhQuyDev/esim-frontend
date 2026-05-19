import type {
  CreateTicketPayload,
  SubmitTicketResult,
  Ticket,
} from "@/lib/types/ticket";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Submit a customer support ticket.
 *
 * - Public endpoint (no auth required).
 * - Returns a discriminated union so callers can branch on validation errors
 *   (HTTP 422) vs. generic errors without throwing.
 */
export async function submitTicket(
  payload: CreateTicketPayload,
  signal?: AbortSignal
): Promise<SubmitTicketResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

  // 201 Created (or any 2xx)
  if (res.ok) {
    const ticket = (await res.json()) as Ticket;
    return { ok: true, ticket };
  }

  // Try to parse the error body once so we can branch on shape.
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore – body might be empty or non-JSON
  }

  if (res.status === 422 && isValidationErrorBody(body)) {
    return { ok: false, kind: "validation", errors: body.errors };
  }

  const message =
    (isObject(body) && typeof body.message === "string" && body.message) ||
    `Request failed (${res.status})`;
  return { ok: false, kind: "error", status: res.status, message };
}

// ===== Helpers =====

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isValidationErrorBody(
  v: unknown
): v is { status: 422; errors: Record<string, string> } {
  if (!isObject(v)) return false;
  if (!isObject(v.errors)) return false;
  return Object.values(v.errors).every((e) => typeof e === "string");
}
