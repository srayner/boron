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
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
  },
  // With port 3002 free: seed, build and start a production server, run the
  // tests, then stop it. With a server already running there, use it as it is
  // (no seed, no build). See "End-to-end tests" in README.md.
  // For coverage, run with COVERAGE=true: the build inherits it and emits the
  // browser sourcemaps the report needs (see next.config.ts).
  webServer: {
    command: "npm run seed && npm run build && npm start",
    url: "http://localhost:3002",
    reuseExistingServer: true,
    timeout: 300_000, // the production build takes a while
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
