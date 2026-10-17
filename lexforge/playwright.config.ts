import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// Cloud containers ship a pinned Chromium; locally Playwright uses its own download.
const preinstalled = "/opt/pw-browsers/chromium";
const executablePath = existsSync(preinstalled) ? preinstalled : undefined;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3123", launchOptions: { executablePath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } } },
    { name: "phone", use: { viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true, launchOptions: { executablePath } } },
  ],
  webServer: { command: "npx next start -p 3123", url: "http://localhost:3123", reuseExistingServer: false, timeout: 60_000 },
});
