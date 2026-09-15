import { test, expect, type Page } from "@playwright/test";
import {
  checkSubmission,
  loadHistory,
  MAX_PER_WINDOW,
  MIN_FILL_MS,
  pruneHistory,
  RATE_WINDOW_MS,
  recordSubmission,
  retryAfterMinutes,
  retryAfterSeconds,
  STORAGE_KEY,
  submissionFingerprint,
  type SubmissionRecord,
} from "../lib/support-anti-spam";

/**
 * #075 — spam guard on the support form.
 *
 * `POST /api/v1/tickets` takes anyone's request with no login and no captcha,
 * so the form is trivial for a bot to loop over. The guard is four checks that
 * a real customer cannot trip by accident: honeypot, fill-time trap, a
 * per-browser rate limit and a duplicate check.
 *
 * The real support page is a server component whose SSR fetch throws with no
 * backend, so the real form is mounted through the client harness
 * (`/esim-noi-dia/test?view=support-form`) against a mocked tickets endpoint.
 */

const API_BASE = "http://localhost:3001";
const HARNESS = "/esim-noi-dia/test?view=support-form&lang=vi";

const VALID = {
  email: "khach@example.com",
  subject: "eSIM không kích hoạt được",
  description:
    "Tôi đã mua gói eSIM Nhật Bản hôm qua nhưng máy báo không kích hoạt được, mong được hỗ trợ.",
};

function record(at: number, fingerprint = "abc"): SubmissionRecord {
  return { at, fingerprint };
}

/** Accept every ticket; `onPost` counts what actually reached the server. */
async function mockTickets(page: Page, onPost?: () => void) {
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
  await page.route(`${API_BASE}/api/v1/tickets`, async (route) => {
    onPost?.();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: 4321, subject: VALID.subject }),
    });
  });
}

async function fillValidRequest(page: Page) {
  await page.getByLabel(/email/i).first().fill(VALID.email);
  await page.locator("input[name='subject']").fill(VALID.subject);
  await page.locator("textarea[name='description']").fill(VALID.description);
}

test.describe("support form spam guard — rules", () => {
  test("lets an ordinary request through", () => {
    const verdict = checkSubmission({
      honeypot: "",
      elapsedMs: 30_000,
      fingerprint: "f1",
      history: [],
    });

    expect(verdict.ok).toBe(true);
  });

  test("blocks anything that filled the hidden field", () => {
    const verdict = checkSubmission({
      honeypot: "http://spam.example",
      elapsedMs: 60_000,
      fingerprint: "f1",
      history: [],
    });

    expect(verdict).toMatchObject({ ok: false, reason: "honeypot" });
  });

  test("blocks a request written faster than a human could type it", () => {
    const verdict = checkSubmission({
      honeypot: "",
      elapsedMs: 800,
      fingerprint: "f1",
      history: [],
    });

    expect(verdict).toMatchObject({ ok: false, reason: "tooFast" });
    if (!verdict.ok) {
      expect(verdict.retryAfterMs).toBe(MIN_FILL_MS - 800);
      expect(retryAfterSeconds(verdict.retryAfterMs)).toBe(4);
    }
  });

  test("blocks the same request sent twice and says how long to wait", () => {
    const now = 1_000_000;
    const verdict = checkSubmission({
      honeypot: "",
      elapsedMs: 30_000,
      fingerprint: "same",
      history: [record(now - 60_000, "same")],
      now,
    });

    expect(verdict).toMatchObject({ ok: false, reason: "duplicate" });
    if (!verdict.ok) expect(retryAfterMinutes(verdict.retryAfterMs)).toBe(9);
  });

  test("allows a different request while a recent one is still on record", () => {
    const now = 1_000_000;
    const verdict = checkSubmission({
      honeypot: "",
      elapsedMs: 30_000,
      fingerprint: "other",
      history: [record(now - 60_000, "same")],
      now,
    });

    expect(verdict.ok).toBe(true);
  });

  test(`stops after ${MAX_PER_WINDOW} requests in the window`, () => {
    const now = 1_000_000;
    const history = Array.from({ length: MAX_PER_WINDOW }, (_, i) =>
      record(now - (i + 1) * 1000, `f${i}`),
    );

    const verdict = checkSubmission({
      honeypot: "",
      elapsedMs: 30_000,
      fingerprint: "new",
      history,
      now,
    });

    expect(verdict).toMatchObject({ ok: false, reason: "rateLimited" });
  });

  test("forgets submissions once the window has passed", () => {
    const now = 1_000_000;
    const stale = Array.from({ length: MAX_PER_WINDOW }, (_, i) =>
      record(now - RATE_WINDOW_MS - (i + 1) * 1000, `f${i}`),
    );

    expect(pruneHistory(stale, now)).toEqual([]);
    expect(
      checkSubmission({
        honeypot: "",
        elapsedMs: 30_000,
        fingerprint: "new",
        history: stale,
        now,
      }).ok,
    ).toBe(true);
  });

  test("fingerprints the content, not the incidental formatting", () => {
    const a = submissionFingerprint({
      customerEmail: "Khach@Example.com ",
      subject: " Lỗi eSIM",
      description: "Không vào được mạng",
    });
    const b = submissionFingerprint({
      customerEmail: "khach@example.com",
      subject: "lỗi esim",
      description: "Không vào được mạng",
    });
    const c = submissionFingerprint({
      customerEmail: "khach@example.com",
      subject: "lỗi esim",
      description: "Máy báo hết dung lượng",
    });

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  test("never blocks the customer because storage misbehaved", () => {
    const throwing = {
      getItem: () => {
        throw new Error("storage disabled");
      },
    };

    expect(loadHistory(throwing)).toEqual([]);
    expect(loadHistory(undefined)).toEqual([]);
    expect(loadHistory({ getItem: () => "not json" })).toEqual([]);
    expect(loadHistory({ getItem: () => '[{"nope":1}]' })).toEqual([]);
  });

  test("keeps the history in storage across page loads", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };

    recordSubmission(storage, "f1", 1000);
    recordSubmission(storage, "f2", 2000);

    expect(JSON.parse(store.get(STORAGE_KEY) ?? "[]")).toHaveLength(2);
    expect(loadHistory(storage, 2000).map((r) => r.fingerprint)).toEqual(["f1", "f2"]);
  });
});

test.describe("support form spam guard — in the browser", () => {
  test("sends an ordinary request", async ({ page }) => {
    let posted = 0;
    await mockTickets(page, () => {
      posted += 1;
    });

    await page.goto(HARNESS);
    await fillValidRequest(page);
    // Past the fill-time trap, the way a real customer would be.
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText(/Đã gửi yêu cầu thành công/).first()).toBeVisible({
      timeout: 15_000,
    });
    expect(posted).toBe(1);
  });

  test("never reaches the server when the honeypot is filled", async ({ page }) => {
    let posted = 0;
    await mockTickets(page, () => {
      posted += 1;
    });

    await page.goto(HARNESS);
    await fillValidRequest(page);
    // A bot fills every input it finds, including the off-screen one.
    await page.getByTestId("support-honeypot").fill("https://spam.example");
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText("Chưa gửi được yêu cầu")).toBeVisible();
    expect(posted).toBe(0);
  });

  test("holds back a request submitted within a second of loading", async ({ page }) => {
    let posted = 0;
    await mockTickets(page, () => {
      posted += 1;
    });

    await page.goto(HARNESS);
    await fillValidRequest(page);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText("Chưa gửi được yêu cầu")).toBeVisible();
    await expect(page.getByText(/Vui lòng đợi \d+ giây/)).toBeVisible();
    expect(posted).toBe(0);
  });

  test("refuses the same request twice, using the stored history", async ({ page }) => {
    let posted = 0;
    await mockTickets(page, () => {
      posted += 1;
    });

    // Seed the history as though this exact request was just sent.
    const fingerprint = submissionFingerprint({
      customerEmail: VALID.email,
      subject: VALID.subject,
      description: VALID.description,
    });
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [STORAGE_KEY, JSON.stringify([{ at: Date.now(), fingerprint }])] as const,
    );

    await page.goto(HARNESS);
    await fillValidRequest(page);
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText(/vừa được gửi rồi/)).toBeVisible();
    expect(posted).toBe(0);
  });

  test("stops a browser that has already opened several tickets", async ({ page }) => {
    let posted = 0;
    await mockTickets(page, () => {
      posted += 1;
    });

    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [
        STORAGE_KEY,
        JSON.stringify(
          Array.from({ length: MAX_PER_WINDOW }, (_, i) => ({
            at: Date.now() - i * 1000,
            fingerprint: `seed${i}`,
          })),
        ),
      ] as const,
    );

    await page.goto(HARNESS);
    await fillValidRequest(page);
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText(/thử lại sau \d+ phút/)).toBeVisible();
    expect(posted).toBe(0);
  });
});

/**
 * #033 — the server now enforces the same limits, so a request can get past the
 * browser (another device, cleared storage) and still be refused. The form must
 * then speak the same language as its own check, not "Request failed (429)".
 */
test.describe("support form spam guard — refused by the server", () => {
  async function mockRefusal(page: Page, status: number, body: object) {
    const seen: Array<Record<string, unknown>> = [];
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
    );
    await page.route(`${API_BASE}/api/v1/tickets`, async (route) => {
      seen.push(route.request().postDataJSON() as Record<string, unknown>);
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    return seen;
  }

  test("explains a server rate limit with the minutes to wait", async ({ page }) => {
    const seen = await mockRefusal(page, 429, {
      status: 429,
      errors: { ticket: "tooManyTickets" },
      retryAfterSeconds: 7 * 60,
    });

    await page.goto(HARNESS);
    await fillValidRequest(page);
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText("Chưa gửi được yêu cầu")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/thử lại sau 7 phút/)).toBeVisible();
    await expect(page.getByText(/Request failed/)).toHaveCount(0);
    // An honest customer never fills the honeypot, so it is not sent at all.
    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toHaveProperty("website");
  });

  test("explains a duplicate the server caught", async ({ page }) => {
    await mockRefusal(page, 409, {
      status: 409,
      errors: { ticket: "duplicateTicket" },
    });

    await page.goto(HARNESS);
    await fillValidRequest(page);
    await page.waitForTimeout(MIN_FILL_MS);
    await page.getByRole("button", { name: /Gửi yêu cầu/ }).click();

    await expect(page.getByText(/vừa được gửi rồi/)).toBeVisible({ timeout: 15_000 });
  });
});
