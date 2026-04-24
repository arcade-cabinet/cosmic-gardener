import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"]] : [["list"]],
  use: {
    baseURL: "http://localhost:41732",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: "tablet",
      use: { viewport: { width: 834, height: 1194 } },
    },
    {
      name: "mobile-portrait",
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "pnpm preview --port 41732",
    url: "http://localhost:41732",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
