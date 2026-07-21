import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

export const prismaMock = mockDeep<PrismaClient>()
export type MockPrismaClient = DeepMockProxy<PrismaClient>
