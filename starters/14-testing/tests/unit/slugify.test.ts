import { describe, it, expect } from 'vitest'
import { slugify } from '~/utils/slugify'

describe('slugify', () => {
  it('converts spaces to dashes', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})
