import MCR from "monocart-coverage-reports";
import minimatch from "minimatch";
import { e2eSourceInclude, e2eAllOption } from "../coverage.shared";

// Playwright's browser coverage captures every script the page loads —
// Next.js/React/Radix internals from the bundle included — not just our
// own source, so the report needs an explicit allowlist. The Vitest side
// doesn't need this: it executes our source modules directly rather than a
// bundled browser page, so it never picks up framework code.
//
// A plain function (rather than monocart's pattern-object shorthand) is
// used deliberately: that shorthand does a literal substring check before
// falling back to minimatch, which made a narrow pattern like 'routes.ts'
// (meant to match this app's root routes.ts) also match unrelated files
// like Next's own internal .../interception-routes.ts.
export const sourceFilter = (sourcePath: string) => {
  if (minimatch(sourcePath, "**/node_modules/**")) {
    return false;
  }
  // Raw coverage data still includes test files themselves as covered
  // entries — this excludes them from every report built off it (e2e-only
  // and the later merge step alike).
  if (minimatch(sourcePath, "**/*.test.*")) {
    return false;
  }
  return e2eSourceInclude.some((pattern) => minimatch(sourcePath, pattern));
};

// Next injects inline hydration <script> payloads on every page navigation
// (no .js file, entry.url is just the page URL); they have no sourcemap to
// unpack so sourceFilter never sees them. Drop non-.js entries so they
// don't show up as repeated, unhelpful "dashboard" rows in the report.
export const entryFilter = (entry: { url: string }) => entry.url.endsWith(".js");

// Shared across the Playwright global setup, every test worker process, and
// the final merge script — monocart's multiprocessing support requires the
// same outputDir/options in each process so `add()` calls from different
// workers accumulate into one cache that a later `generate()` can flush.
export const e2eCoverageOptions: Parameters<typeof MCR>[0] = {
  name: "Boron E2E Coverage",
  outputDir: "coverage/playwright",
  reports: ["v8", "console-details", ["raw", { outputDir: "raw" }]],
  entryFilter,
  sourceFilter,
  all: e2eAllOption,
};
