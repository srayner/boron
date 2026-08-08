import { describe, it, expect, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { withAuth } from '../with-auth'
import { AppError } from '../error'

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

describe('withAuth', () => {
  it('throws a 401 AppError and does not call the handler when there is no session', async () => {
    mockAuth.mockResolvedValue(null)
    const handler = vi.fn()
    const wrapped = withAuth(handler)

    await expect(
      wrapped({} as NextRequest, {})
    ).rejects.toMatchObject(new AppError('Unauthorized', 401))
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls the handler with the session and returns its result when authenticated', async () => {
    const session = { user: { id: 'user_1' } }
    mockAuth.mockResolvedValue(session)
    const handler = vi.fn().mockResolvedValue('handler result')
    const wrapped = withAuth(handler)
    const req = {} as NextRequest
    const context = { params: { id: '1' } }

    const result = await wrapped(req, context)

    expect(handler).toHaveBeenCalledWith(req, context, session)
    expect(result).toBe('handler result')
  })
})
