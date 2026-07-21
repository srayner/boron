import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportOnFailure: true,
      include: [
        'services/**',
        'lib/**',
        'actions/**',
        'hooks/**',
        'app/api/**',
        'schemas/**',
        'auth.ts',
        'auth.config.ts',
        'middleware.ts',
        'routes.ts',
      ],
      exclude: [
        '**/*.test.*',
        '**/seed*',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/context/**',
        'components/**',
        'types/**',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
