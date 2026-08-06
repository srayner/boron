import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browser sourcemaps are needed to unpack Playwright's V8 e2e coverage
  // back to real source files (otherwise it falls back to minified/hashed
  // chunk names). Only enabled for coverage-collecting builds, not normal
  // production deploys, to avoid shipping sourcemaps by default.
  productionBrowserSourceMaps: process.env.COVERAGE === "true",
};

export default nextConfig;
