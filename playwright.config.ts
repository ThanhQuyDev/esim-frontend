import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Topup frontend tests.
 *
 * These tests run the Next.js dev server and mock the topup API at the
 * network layer (page.route), so no backend / Postgres / OnePay is needed.
 * The dev server is required because the test harness page
 * (`/profile/topup-test`) is guarded to non-production only.
 */
const PORT = Number(process.env.PW_PORT ?? 3102);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    // Health-check the harness page, NOT `/` — the landing page is a server
    // component that throws when the backend (:3001) is down, which would make
    // the check never see a 200. The harness is a client component that renders
    // fine without a backend.
    url: `${BASE_URL}/profile/topup-test`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3001",
    },
  },
});
