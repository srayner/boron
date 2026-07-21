import { describe, it, expect } from 'vitest'
import { parseQueryParams } from '../api/query'
import { parseEnumParam } from '../api/params'

function makeUrl(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/test')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url
}

describe('parseQueryParams', () => {
  it('returns defaults when no params are provided', () => {
    const result = parseQueryParams(makeUrl({}))
    expect(result.search).toBe('')
    expect(result.pagination).toEqual({ take: 20, skip: 0 })
    expect(result.ordering).toEqual({ createdAt: 'asc' })
  })

  it('parses the search param', () => {
    const result = parseQueryParams(makeUrl({ search: 'hello world' }))
    expect(result.search).toBe('hello world')
  })

  it('parses limit and skip for pagination', () => {
    const result = parseQueryParams(makeUrl({ limit: '5', skip: '20' }))
    expect(result.pagination).toEqual({ take: 5, skip: 20 })
  })

  it('uses asc when orderDir is not "desc"', () => {
    const result = parseQueryParams(makeUrl({ orderDir: 'sideways' }))
    expect(result.ordering).toEqual({ createdAt: 'asc' })
  })

  it('parses desc orderDir correctly', () => {
    const result = parseQueryParams(makeUrl({ orderBy: 'updatedAt', orderDir: 'desc' }))
    expect(result.ordering).toEqual({ updatedAt: 'desc' })
  })

  it('passes arbitrary orderBy field names through without validation (audit finding 1.6)', () => {
    // Documents the missing allowlist check — any field name reaches Prisma
    const result = parseQueryParams(makeUrl({ orderBy: 'nonExistentField' }))
    expect(result.ordering).toEqual({ nonExistentField: 'asc' })
  })
})

describe('parseEnumParam', () => {
  const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as const

  it('returns the value when it is in the allowed list', () => {
    expect(parseEnumParam('PLANNED', statuses)).toBe('PLANNED')
    expect(parseEnumParam('COMPLETED', statuses)).toBe('COMPLETED')
  })

  it('returns undefined for a value not in the list', () => {
    expect(parseEnumParam('INVALID', statuses)).toBeUndefined()
    expect(parseEnumParam('ACTIVE', statuses)).toBeUndefined()
  })

  it('returns undefined for null', () => {
    expect(parseEnumParam(null, statuses)).toBeUndefined()
  })
})
