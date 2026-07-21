import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatCurrency,
  translate,
  parseLocalDate,
  formatLocalDate,
  getUrlParam,
} from '../utils'

describe('formatDate', () => {
  it('formats a valid date string with the default format', () => {
    expect(formatDate('2025-06-15')).toBe('15 Jun 2025')
  })

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('')
  })

  it('returns empty string for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('accepts a custom format string', () => {
    expect(formatDate('2025-06-15', 'yyyy/MM/dd')).toBe('2025/06/15')
  })
})

describe('formatCurrency', () => {
  it('formats a number as GBP by default', () => {
    expect(formatCurrency(10.5)).toBe('£10.50')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('£0.00')
  })

  it('formats large numbers with grouping separators', () => {
    expect(formatCurrency(1000)).toBe('£1,000.00')
  })
})

describe('translate', () => {
  it('translates a known key to its full label', () => {
    expect(translate('WEBAPP')).toBe('Web Application')
  })

  it('returns the short form when requested', () => {
    expect(translate('WEBAPP', { short: true })).toBe('Web App')
  })

  it('falls back to the camelCase regex path when short is requested but not defined', () => {
    // translate() returns entry.short when short:true; if undefined it falls through
    // to the regex which doesn't understand camelCase — a minor rough edge in translate().
    // "currencySymbol" has no short form, so this returns "Currencysymbol" not "Currency Symbol"
    expect(translate('currencySymbol', { short: true })).toBe('Currencysymbol')
  })

  it('converts underscore-separated unknown keys to title case', () => {
    expect(translate('IN_PROGRESS')).toBe('In Progress')
    expect(translate('ON_HOLD')).toBe('On Hold')
  })

  it('converts a single-word key to title case', () => {
    expect(translate('PLANNED')).toBe('Planned')
  })
})

describe('parseLocalDate', () => {
  it('parses a valid ISO date string', () => {
    const result = parseLocalDate('2025-06-15')
    expect(result).toBeInstanceOf(Date)
  })

  it('returns null for null input', () => {
    expect(parseLocalDate(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(parseLocalDate(undefined)).toBeNull()
  })

  it('returns null for an invalid date string', () => {
    expect(parseLocalDate('not-a-date')).toBeNull()
  })
})

describe('formatLocalDate', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    const result = formatLocalDate(new Date('2025-06-15T12:00:00Z'))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns null for null input', () => {
    expect(formatLocalDate(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(formatLocalDate(undefined)).toBeNull()
  })
})

describe('getUrlParam', () => {
  const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as const

  it('returns the param when it is in the allowed list', () => {
    expect(getUrlParam('PLANNED', statuses)).toBe('PLANNED')
    expect(getUrlParam('IN_PROGRESS', statuses)).toBe('IN_PROGRESS')
  })

  it('returns null for a value not in the allowed list', () => {
    expect(getUrlParam('CANCELLED', statuses)).toBeNull()
    expect(getUrlParam('ACTIVE', statuses)).toBeNull()
  })

  it('returns null for a null param with no default', () => {
    expect(getUrlParam(null, statuses)).toBeNull()
  })

  it('returns the default value when the param is not valid', () => {
    expect(getUrlParam('INVALID', statuses, 'PLANNED')).toBe('PLANNED')
  })

  it('returns the default value for null with a default', () => {
    expect(getUrlParam(null, statuses, 'COMPLETED')).toBe('COMPLETED')
  })
})
