import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'

const { mockAuth, mockOverTime } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockOverTime: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/services/tasks', () => ({
  getCreatedAndCompletedTasksOverTime: mockOverTime,
}))

import { GET } from '../route'

function get(params: Record<string, string>) {
  const url = new URL('http://localhost:3002/api/tasks/completed-over-time')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return GET(new NextRequest(url), undefined as never)
}

let consoleError: MockInstance<typeof console.error>

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
  mockOverTime.mockResolvedValue([{ date: '2026-11-01', created: 2, completed: 1 }])
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
})

// The validation error the route threw, as logged by handleAppError.
function loggedZodMessages(field: string) {
  const err = consoleError.mock.calls.map((call) => call[1]).find((e) => e instanceof ZodError)
  expect(err, 'expected a ZodError to be logged').toBeInstanceOf(ZodError)
  return (err as ZodError).issues
    .filter((issue) => issue.path[0] === field)
    .map((issue) => issue.message)
}

// Valid queries: defaults applied and values passed through to the service.
describe('GET /api/tasks/completed-over-time with a valid query', () => {
  it('defaults groupBy to day and timezone to UTC', async () => {
    const res = await get({ start: '2026-11-01', end: '2026-11-14' })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: [{ date: '2026-11-01', created: 2, completed: 1 }],
    })
    expect(mockOverTime).toHaveBeenCalledWith(
      'day',
      new Date('2026-11-01'),
      new Date('2026-11-14'),
      'UTC'
    )
  })

  it('passes groupBy and timezone through when given', async () => {
    await get({ start: '2026-01-01', end: '2026-06-30', groupBy: 'month', timezone: 'Europe/London' })

    expect(mockOverTime).toHaveBeenCalledWith(
      'month',
      new Date('2026-01-01'),
      new Date('2026-06-30'),
      'Europe/London'
    )
  })
})

// Invalid queries. A ZodError is not an AppError, so handleAppError returns
// a 500 and the message only reaches the server log. This documents current
// behaviour; the Zod upgrade must not change it.
describe('GET /api/tasks/completed-over-time with an invalid query', () => {
  it.each([
    ['a missing start', { end: '2026-11-14' }, 'start', 'Invalid start date format, expected YYYY-MM-DD'],
    ['an unparseable start', { start: 'yesterday', end: '2026-11-14' }, 'start', 'Invalid start date format, expected YYYY-MM-DD'],
    ['a missing end', { start: '2026-11-01' }, 'end', 'Invalid end date format, expected YYYY-MM-DD'],
    ['an unparseable end', { start: '2026-11-01', end: '14/13/2026' }, 'end', 'Invalid end date format, expected YYYY-MM-DD'],
  ])('rejects %s with a 500 and the date message', async (_label, params, field, message) => {
    const res = await get(params)

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Internal Server Error' })
    expect(loggedZodMessages(field)).toEqual([message])
    expect(mockOverTime).not.toHaveBeenCalled()
  })

  it('rejects a groupBy outside day and month', async () => {
    const res = await get({ start: '2026-11-01', end: '2026-11-14', groupBy: 'week' })

    expect(res.status).toBe(500)
    expect(loggedZodMessages('groupBy')).toHaveLength(1)
    expect(mockOverTime).not.toHaveBeenCalled()
  })
})
