import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { prismaMock } from '../../../../test/mocks/prisma'
import { DESCRIPTION_MAX_LENGTH } from '@/lib/validation/description'

const { mockAuth } = vi.hoisted(() => ({ mockAuth: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: mockAuth }))

import { POST } from '../route'

function post(body: object) {
  return POST(
    new NextRequest('http://localhost:3002/api/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
    undefined as never
  )
}

beforeEach(() => {
  mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
})

// An over-long description from the API/MCP is the caller's mistake: a 400
// with a readable message, never a 500 from the database column.
describe('POST /api/tasks description limit', () => {
  it('returns 400 with the limit in the message and writes nothing', async () => {
    const res = await post({
      projectId: 'project-1',
      name: 'Long task',
      description: 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1),
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Description must be 20,000 characters or fewer.' })
    expect(prismaMock.task.create).not.toHaveBeenCalled()
  })
})
