import MCR from "monocart-coverage-reports";
import minimatch from "minimatch";
import { e2eCoverageOptions } from "../e2e/coverage-options";
import { e2eSourceInclude } from "../coverage.shared";

async function main() {
  // Flush Playwright's multi-worker coverage cache (accumulated via add()
  // calls in e2e/fixtures.ts) to raw files on disk.
  await MCR(e2eCoverageOptions).generate();

  // Playwright's browser coverage captures every script the page loads —
  // Next.js/React/Radix internals from the bundle included — not just our
  // own source, so the merged report needs an explicit allowlist. The Vitest
  // side doesn't need this: it executes our source modules directly rather
  // than a bundled browser page, so it never picks up framework code.
  //
  // A plain function (rather than monocart's pattern-object shorthand) is
  // used deliberately: that shorthand does a literal substring check before
  // falling back to minimatch, which made a narrow pattern like 'routes.ts'
  // (meant to match this app's root routes.ts) also match unrelated files
  // like Next's own internal .../interception-routes.ts.
  const sourceFilter = (sourcePath: string) => {
    if (minimatch(sourcePath, "**/node_modules/**")) {
      return false;
    }
    return e2eSourceInclude.some((pattern) => minimatch(sourcePath, pattern));
  };

  // Next injects inline hydration <script> payloads on every page navigation
  // (no .js file, entry.url is just the page URL); they have no sourcemap to
  // unpack so sourceFilter never sees them. Drop non-.js entries so they
  // don't show up as repeated, unhelpful "dashboard" rows in the report.
  const entryFilter = (entry: { url: string }) => entry.url.endsWith(".js");

  const merged = MCR({
    name: "Boron Coverage Report",
    inputDir: ["coverage/vitest/raw", "coverage/playwright/raw"],
    outputDir: "coverage/merged",
    entryFilter,
    sourceFilter,
    reports: ["v8", "console-details"],
  });
  await merged.generate();
}

main();
