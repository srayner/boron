import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./e2e",
  // Tests within a spec file share real DB state (e.g. "edits a cost" depends
  // on "adds a cost" having run first), so files run tests in declared order —
  // matches Cypress's default serial-within-spec behavior. Different spec
  // files still run concurrently across workers.
  globalSetup: "./e2e/global-setup.ts",
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // A production server is required whenever we're collecting coverage
    // (npm run build must run separately first, with COVERAGE=true so
    // browser sourcemaps are emitted — see next.config.ts) — the dev server
    // always inlines sourcemaps but its per-request chunk URLs churn on every
    // navigation, which fragments the coverage report into near-duplicate
    // entries per file.
    command: process.env.COVERAGE === "true" || process.env.CI ? "npm start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  // chromium is the default (npm run test:e2e / CI): it's the only browser
  // that contributes to coverage, and specs share one seeded MySQL database
  // rather than isolated fixtures per test — running multiple browser
  // projects concurrently causes cross-browser data races (e.g. two
  // "adds a milestone" tests both creating "New Milestone" at once). Firefox
  // and webkit are available for manual cross-browser spot-checks via
  // `npx playwright test --project=firefox` — run one at a time, against a
  // freshly seeded database, not alongside another project.
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
