import { test, expect, type Page } from "@playwright/test";
import {
  ACCEPT_ATTRIBUTE,
  attachmentKind,
  bytesToMb,
  MAX_FILE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  maxSizeForFile,
  validateAttachment,
} from "../lib/services/files.service";

/**
 * #076 — video and PDF attachments on the support form.
 *
 * A screen recording of the phone saying "no service" settles an activation
 * ticket faster than any description, but video was rejected outright; PDFs
 * were allowed yet shared the 5MB photo limit, so an invoice export could
 * bounce for no reason.
 *
 * The real support page is a server component whose SSR fetch throws with no
 * backend, so the real form is mounted through the client harness
 * (`/esim-noi-dia/test?view=support-form`).
 */

const API_BASE = "http://localhost:3001";
const HARNESS = "/esim-noi-dia/test?view=support-form&lang=vi";

/** A File stand-in — only `name`, `type` and `size` are read by the policy. */
function file(name: string, type: string, size: number): File {
  return { name, type, size } as File;
}

async function mockApi(page: Page) {
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
}

test.describe("support attachments — policy", () => {
  test("accepts the video containers phones actually record", () => {
    for (const [name, type] of [
      ["clip.mp4", "video/mp4"],
      ["IMG_0421.mov", "video/quicktime"],
      ["screen.webm", "video/webm"],
      ["clip.3gp", "video/3gpp"],
    ] as const) {
      expect(attachmentKind(file(name, type, 1_000_000))).toBe("video");
      expect(validateAttachment(file(name, type, 1_000_000))).toBeNull();
    }
  });

  test("still accepts PDF and Word documents", () => {
    expect(attachmentKind(file("hoa-don.pdf", "application/pdf", 1000))).toBe("document");
    expect(
      attachmentKind(
        file(
          "bien-ban.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          1000,
        ),
      ),
    ).toBe("document");
  });

  test("falls back to the extension when the browser reports no MIME type", () => {
    // Windows hands over .mov and .mkv with an empty `type`, and some Android
    // file managers send application/octet-stream.
    expect(attachmentKind(file("IMG_0421.MOV", "", 1000))).toBe("video");
    expect(attachmentKind(file("clip.mkv", "application/octet-stream", 1000))).toBe("video");
    expect(attachmentKind(file("hoa-don.PDF", "", 1000))).toBe("document");
  });

  test("rejects what is neither picture, video nor document", () => {
    expect(attachmentKind(file("payload.exe", "application/x-msdownload", 10))).toBe(
      "unsupported",
    );
    expect(validateAttachment(file("payload.exe", "application/x-msdownload", 10))).toMatchObject(
      { error: "invalidType" },
    );
    expect(validateAttachment(file("data.zip", "application/zip", 10))).toMatchObject({
      error: "invalidType",
    });
  });

  test("gives video a bigger allowance than photos and documents", () => {
    expect(maxSizeForFile(file("clip.mp4", "video/mp4", 1))).toBe(MAX_VIDEO_SIZE_BYTES);
    expect(maxSizeForFile(file("anh.png", "image/png", 1))).toBe(MAX_FILE_SIZE_BYTES);

    // A 20MB recording is fine; a 20MB photo is not.
    expect(validateAttachment(file("clip.mp4", "video/mp4", 20 * 1024 * 1024))).toBeNull();
    expect(
      validateAttachment(file("anh.png", "image/png", 20 * 1024 * 1024)),
    ).toMatchObject({ error: "tooLarge", limitMb: bytesToMb(MAX_FILE_SIZE_BYTES) });
  });

  test("names the limit that was actually exceeded", () => {
    const rejection = validateAttachment(
      file("qua-dai.mp4", "video/mp4", MAX_VIDEO_SIZE_BYTES + 1),
    );

    expect(rejection).toMatchObject({ error: "tooLarge", limitMb: 50 });
  });

  test("offers video in the file picker", () => {
    expect(ACCEPT_ATTRIBUTE).toContain("video/*");
    expect(ACCEPT_ATTRIBUTE).toContain(".mov");
    expect(ACCEPT_ATTRIBUTE).toContain(".pdf");
  });
});

test.describe("support attachments — in the browser", () => {
  test("takes a video and a PDF together", async ({ page }) => {
    await mockApi(page);
    await page.goto(HARNESS);

    await page.locator("input[type='file']").setInputFiles([
      {
        name: "man-hinh-loi.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.alloc(2048, 1),
      },
      {
        name: "hoa-don.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      },
    ]);

    await expect(page.getByText("man-hinh-loi.mp4").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("hoa-don.pdf").first()).toBeVisible();
    // Both were accepted: no "unsupported format" complaint.
    await expect(page.getByText(/không được hỗ trợ/)).toHaveCount(0);
  });

  test("refuses an oversized photo and names the photo limit, not the video one", async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto(HARNESS);

    // 6MB image: over the 5MB picture limit. The 50MB video ceiling is covered
    // by the policy tests above — Playwright cannot hand over a 50MB buffer.
    await page.locator("input[type='file']").setInputFiles({
      name: "anh-qua-lon.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024 * 1024, 1),
    });

    await expect(page.getByText(/vượt quá 5MB/)).toBeVisible({ timeout: 15_000 });
  });

  test("still refuses a file type that is none of the three", async ({ page }) => {
    await mockApi(page);
    await page.goto(HARNESS);

    await page.locator("input[type='file']").setInputFiles({
      name: "khong-ho-tro.zip",
      mimeType: "application/zip",
      buffer: Buffer.alloc(64, 1),
    });

    await expect(page.getByText(/không được hỗ trợ/)).toBeVisible({ timeout: 15_000 });
  });
});
