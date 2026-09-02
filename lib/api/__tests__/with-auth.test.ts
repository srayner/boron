import { describe, it, expect, vi, afterEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { withAuth } from '../with-auth'
import { AppError } from '../error'

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

function makeReq(authorization?: string): NextRequest {
  return {
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'authorization' ? authorization ?? null : null,
    },
  } as unknown as NextRequest
}

const originalApiKey = process.env.BORON_API_KEY

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.BORON_API_KEY
  } else {
    process.env.BORON_API_KEY = originalApiKey
  }
  vi.clearAllMocks()
})

describe('withAuth', () => {
  it('throws a 401 AppError and does not call the handler when there is no session', async () => {
    mockAuth.mockResolvedValue(null)
    const handler = vi.fn()
    const wrapped = withAuth(handler)

    await expect(
      wrapped(makeReq(), {})
    ).rejects.toMatchObject(new AppError('Unauthorized', 401))
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls the handler with the session and returns its result when authenticated', async () => {
    const session = { user: { id: 'user_1' } }
    mockAuth.mockResolvedValue(session)
    const handler = vi.fn().mockResolvedValue('handler result')
    const wrapped = withAuth(handler)
    const req = makeReq()
    const context = { params: { id: '1' } }

    const result = await wrapped(req, context)

    expect(handler).toHaveBeenCalledWith(req, context, session)
    expect(result).toBe('handler result')
  })

  describe('API key auth', () => {
    it('calls the handler with a null session when a valid API key is provided', async () => {
      process.env.BORON_API_KEY = 'secret-key'
      const handler = vi.fn().mockResolvedValue('handler result')
      const wrapped = withAuth(handler)
      const req = makeReq('Bearer secret-key')
      const context = { params: {} }

      const result = await wrapped(req, context)

      expect(handler).toHaveBeenCalledWith(req, context, null)
      expect(result).toBe('handler result')
      expect(mockAuth).not.toHaveBeenCalled()
    })

    it('falls through to session auth when the API key is wrong', async () => {
      process.env.BORON_API_KEY = 'secret-key'
      mockAuth.mockResolvedValue(null)
      const handler = vi.fn()
      const wrapped = withAuth(handler)

      await expect(
        wrapped(makeReq('Bearer wrong-key'), {})
      ).rejects.toMatchObject(new AppError('Unauthorized', 401))
      expect(handler).not.toHaveBeenCalled()
      expect(mockAuth).toHaveBeenCalled()
    })

    it('falls through to session auth when a key differing only in length is provided', async () => {
      process.env.BORON_API_KEY = 'secret-key'
      mockAuth.mockResolvedValue(null)
      const handler = vi.fn()
      const wrapped = withAuth(handler)

      await expect(
        wrapped(makeReq('Bearer secret-key-longer'), {})
      ).rejects.toMatchObject(new AppError('Unauthorized', 401))
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not throw on a multi-byte token of matching string length', async () => {
      process.env.BORON_API_KEY = 'abcde'
      mockAuth.mockResolvedValue(null)
      const handler = vi.fn()
      const wrapped = withAuth(handler)

      // "café×" has 5 code units but more than 5 UTF-8 bytes
      await expect(
        wrapped(makeReq('Bearer café×'), {})
      ).rejects.toMatchObject(new AppError('Unauthorized', 401))
      expect(handler).not.toHaveBeenCalled()
    })

    it('falls through to session auth when BORON_API_KEY is not set', async () => {
      delete process.env.BORON_API_KEY
      mockAuth.mockResolvedValue(null)
      const handler = vi.fn()
      const wrapped = withAuth(handler)

      await expect(
        wrapped(makeReq('Bearer anything'), {})
      ).rejects.toMatchObject(new AppError('Unauthorized', 401))
      expect(handler).not.toHaveBeenCalled()
    })

    it('falls through to session auth when the Authorization header is not a Bearer token', async () => {
      process.env.BORON_API_KEY = 'secret-key'
      const session = { user: { id: 'user_1' } }
      mockAuth.mockResolvedValue(session)
      const handler = vi.fn().mockResolvedValue('ok')
      const wrapped = withAuth(handler)
      const req = makeReq('Basic secret-key')

      await wrapped(req, {})

      expect(handler).toHaveBeenCalledWith(req, {}, session)
    })
  })
})
