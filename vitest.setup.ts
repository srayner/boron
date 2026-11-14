import { afterEach, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { mockReset } from 'vitest-mock-extended'
import { prismaMock } from './test/mocks/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

beforeEach(() => {
  mockReset(prismaMock)
  // Interactive transactions run their callback against the same mock client.
  prismaMock.$transaction.mockImplementation(((arg: unknown) =>
    typeof arg === 'function' ? arg(prismaMock) : Promise.all(arg as Promise<unknown>[])) as never)
})

afterEach(() => {
  cleanup()
})
