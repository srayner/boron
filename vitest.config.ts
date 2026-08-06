import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { coverageInclude, coverageExclude } from './coverage.shared'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      // Custom provider (not the default 'v8' provider) so unit/component
      // coverage is written in the same raw v8 format Playwright collects,
      // letting scripts/merge-coverage.ts combine both into one report.
      // `coverageReportOptions` is read at runtime by vitest-monocart-coverage
      // but isn't declared in Vitest's own coverage types, hence the cast.
      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',
      coverageReportOptions: {
        name: 'Boron Unit/Component Coverage',
        outputDir: './coverage/vitest',
        reports: ['v8', ['raw', { outputDir: 'raw' }]],
      },
      reportOnFailure: true,
      include: coverageInclude,
      exclude: coverageExclude,
    } as any,
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'services/**/*.test.*',
            'lib/**/*.test.*',
            'actions/**/*.test.*',
            'hooks/**/*.test.ts',
            'app/api/**/*.test.*',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['components/**/*.test.tsx', 'hooks/**/*.test.tsx'],
        },
      },
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
