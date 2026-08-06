// Source paths that count as "our app code" for coverage purposes. Shared
// between vitest.config.ts (unit/component coverage) and
// scripts/merge-coverage.ts (the e2e side needs this filter explicitly,
// since Playwright's browser coverage captures every script the page loads —
// including Next.js/React/Radix internals bundled in the dev server's output
// — not just our own source).
export const coverageInclude = [
  'services/**',
  'lib/**',
  'actions/**',
  'hooks/**',
  'app/api/**',
  'schemas/**',
  'components/**',
  'auth.ts',
  'auth.config.ts',
  'middleware.ts',
  'routes.ts',
]

export const coverageExclude = [
  '**/*.test.*',
  '**/seed*',
  'app/**/page.tsx',
  'app/**/layout.tsx',
  'app/context/**',
  'types/**',
]

// Broader than coverageInclude: e2e tests render real pages in a browser, so
// (unlike unit tests, which intentionally skip page.tsx/layout.tsx as thin
// route wrappers) the merged report's e2e side should credit that rendered
// coverage rather than filtering it out.
export const e2eSourceInclude = [
  'app/**',
  'components/**',
  'lib/**',
  'services/**',
  'actions/**',
  'hooks/**',
  'schemas/**',
  'auth.ts',
  'auth.config.ts',
  'middleware.ts',
  'routes.ts',
]
