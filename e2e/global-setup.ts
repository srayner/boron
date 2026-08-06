import MCR from "monocart-coverage-reports";
import { e2eCoverageOptions } from "./coverage-options";

export default function globalSetup() {
  if (process.env.COVERAGE === "true") {
    MCR(e2eCoverageOptions).cleanCache();
  }
}
