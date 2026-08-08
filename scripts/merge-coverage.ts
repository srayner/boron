import MCR from "monocart-coverage-reports";
import { e2eCoverageOptions, entryFilter, sourceFilter } from "../e2e/coverage-options";
import { e2eAllOption } from "../coverage.shared";

async function main() {
  // Flush Playwright's multi-worker coverage cache (accumulated via add()
  // calls in e2e/fixtures.ts) to raw files on disk, and generate the
  // standalone e2e report.
  await MCR(e2eCoverageOptions).generate();

  // entryFilter/sourceFilter (allowlisting our own source out of everything
  // Playwright's browser coverage captures) and e2eAllOption (crediting
  // files with zero coverage instead of omitting them) are reused from
  // e2eCoverageOptions so the merged report's rules stay identical to the
  // e2e-only report's.
  const merged = MCR({
    name: "Boron Coverage Report",
    inputDir: ["coverage/vitest/raw", "coverage/playwright/raw"],
    outputDir: "coverage/merged",
    entryFilter,
    sourceFilter,
    all: e2eAllOption,
    reports: ["v8", "console-details"],
  });
  await merged.generate();
}

main();
