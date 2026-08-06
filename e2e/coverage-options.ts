import MCR from "monocart-coverage-reports";

// Shared across the Playwright global setup, every test worker process, and
// the final merge script — monocart's multiprocessing support requires the
// same outputDir/options in each process so `add()` calls from different
// workers accumulate into one cache that a later `generate()` can flush.
export const e2eCoverageOptions: Parameters<typeof MCR>[0] = {
  name: "Boron E2E Coverage",
  outputDir: "coverage/playwright",
  reports: [["raw", { outputDir: "raw" }]],
};
