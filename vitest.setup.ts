import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { mockReset } from 'vitest-mock-extended'
import { prismaMock } from './test/mocks/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

beforeEach(() => {
  mockReset(prismaMock)
})
