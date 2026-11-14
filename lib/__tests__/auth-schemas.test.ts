import { describe, it, expect } from 'vitest'
import { LoginSchema, RegisterSchema } from '@/schemas'

// The login and register forms show these messages to the user, so each
// field must produce exactly the expected message and nothing else.
function messagesFor(
  schema: typeof LoginSchema | typeof RegisterSchema,
  input: Record<string, string>,
  field: string
) {
  const result = schema.safeParse(input)
  if (result.success) return []
  return result.error.issues
    .filter((issue) => issue.path[0] === field)
    .map((issue) => issue.message)
}

const validLogin = { email: 'ada.lovelace@example.com', password: 'secret' }
const validRegister = {
  email: 'ada.lovelace@example.com',
  password: 'secret1',
  name: 'Ada Lovelace',
}

describe('LoginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(LoginSchema.safeParse(validLogin).success).toBe(true)
  })

  it.each([
    ['an empty email', { email: '' }, 'email', ['Email is required']],
    ['an invalid email', { email: 'not-an-email' }, 'email', ['Email is required']],
    ['an empty password', { password: '' }, 'password', ['Password is required']],
  ])('rejects %s with the form message', (_label, override, field, expected) => {
    expect(messagesFor(LoginSchema, { ...validLogin, ...override }, field)).toEqual(expected)
  })
})

describe('RegisterSchema', () => {
  it('accepts a valid email, a 6-character password and a name', () => {
    expect(RegisterSchema.safeParse({ ...validRegister, password: 'abc123' }).success).toBe(true)
  })

  it.each([
    ['an empty email', { email: '' }, 'email', ['Email is required']],
    ['an invalid email', { email: 'ada@' }, 'email', ['Email is required']],
    ['a 5-character password', { password: 'abc12' }, 'password', ['Minimum 6 characters required']],
    ['an empty name', { name: '' }, 'name', ['Name is required']],
  ])('rejects %s with the form message', (_label, override, field, expected) => {
    expect(messagesFor(RegisterSchema, { ...validRegister, ...override }, field)).toEqual(expected)
  })
})
