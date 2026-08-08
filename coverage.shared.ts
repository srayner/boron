import esbuild from 'esbuild'
import path from 'path'

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
  'routes.ts',
]

// Without monocart's `all` option, a report only contains entries for files
// some test actually executed — a file with zero coverage never produces a
// raw V8 entry, so it silently disappears from the report instead of
// showing up as 0% covered. `all` fixes that by scanning these dirs and
// synthesizing an empty-coverage entry for anything not already tested.
//
// `all`'s AST parser can't handle TS/JSX syntax directly (same reason
// vitest-monocart-coverage needs the v8 provider rather than istanbul for
// this project) — restrict the directory walk to files a transformer can
// actually make parseable.
export const untestedFileFilter = (filePath: string) => {
  const ext = path.extname(filePath)
  if (ext === '.ts' || ext === '.tsx' || ext === '.jsx') {
    return 'js'
  }
  return false
}

// Strips types/JSX to plain JS via esbuild so monocart's parser can build an
// empty-coverage entry, while the emitted sourcemap (esbuild includes
// sourcesContent by default) lets the report still display and attribute
// lines against the real original source.
export const untestedFileTransformer = async (entry: {
  source: string
  sourcePath: string
  sourceMap?: unknown
}) => {
  const ext = path.extname(entry.sourcePath)
  const loader = ext === '.tsx' ? 'tsx' : ext === '.jsx' ? 'jsx' : 'ts'
  const result = await esbuild.transform(entry.source, {
    loader,
    sourcemap: true,
    sourcefile: entry.sourcePath,
  })
  entry.source = result.code
  entry.sourceMap = JSON.parse(result.map)
}

export const unitAllOption = {
  dir: ['services', 'lib', 'actions', 'hooks', 'app/api', 'schemas', 'components'],
  filter: untestedFileFilter,
  transformer: untestedFileTransformer,
}

export const e2eAllOption = {
  dir: ['app', 'components', 'lib', 'services', 'actions', 'hooks', 'schemas'],
  filter: untestedFileFilter,
  transformer: untestedFileTransformer,
}
