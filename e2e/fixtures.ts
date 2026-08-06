import { test as base, expect } from "@playwright/test";
import MCR from "monocart-coverage-reports";
import { e2eCoverageOptions } from "./coverage-options";

export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    const collectCoverage = process.env.COVERAGE === "true" && browserName === "chromium";

    if (collectCoverage) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }

    await use(page);

    if (collectCoverage) {
      const coverage = await page.coverage.stopJSCoverage();
      // Each worker is a separate process — add() writes into monocart's
      // shared on-disk cache under outputDir rather than an in-memory
      // instance, so this accumulates correctly across all workers.
      await MCR(e2eCoverageOptions).add(coverage);
    }
  },
});

export { expect };
