import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../register'

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed_password_123') },
}))

// vi.hoisted ensures these variables are available when the vi.mock factory is hoisted
const { mockGetUserByEmail, mockCreateUser } = vi.hoisted(() => ({
  mockGetUserByEmail: vi.fn(),
  mockCreateUser: vi.fn(),
}))

vi.mock('@/services/user', () => ({
  getUserByEmail: mockGetUserByEmail,
  createUser: mockCreateUser,
}))

describe('register action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects invalid input and returns a field error', async () => {
    const result = await register({ email: 'not-an-email', password: '123456', name: 'Test' })
    expect(result.error).toBe('Invalid fields!')
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns error when email is already in use', async () => {
    mockGetUserByEmail.mockResolvedValue({ id: 'existing', email: 'taken@example.com' })

    const result = await register({ email: 'taken@example.com', password: '123456', name: 'Test' })

    expect(result.error).toBe('Email already in use!')
    expect(result.success).toBeUndefined()
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('returns error (not success) when user creation fails', async () => {
    mockGetUserByEmail.mockResolvedValue(null)
    mockCreateUser.mockRejectedValue(new Error('Database connection failed'))

    const result = await register({ email: 'new@example.com', password: '123456', name: 'New User' })

    // BUG 2.1 (audit): createUser is not awaited in register.ts (line 22)
    // The rejected promise is silently swallowed and register returns success anyway.
    // CURRENTLY FAILS: result.success is "User created!" even though the DB insert failed
    expect(result.success).toBeUndefined()
    expect(result.error).toBeDefined()
  })

  it('calls createUser with hashed password, not plaintext', async () => {
    mockGetUserByEmail.mockResolvedValue(null)
    mockCreateUser.mockResolvedValue({ id: 'new-user' })

    await register({ email: 'new@example.com', password: 'plaintext', name: 'New User' })

    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'hashed_password_123',
        email: 'new@example.com',
      })
    )
    expect(mockCreateUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ password: 'plaintext' })
    )
  })
})
