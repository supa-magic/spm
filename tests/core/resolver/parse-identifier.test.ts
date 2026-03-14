import { describe, expect, it } from 'vitest'
import { parseIdentifier } from '@/core/resolver'

describe('parseIdentifier', () => {
  it('parses @owner/repo/path correctly', () => {
    expect(parseIdentifier('@supa-magic/skillbox/claude/fsd')).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'claude/fsd',
    })
  })

  it('parses identifier with single path segment', () => {
    expect(parseIdentifier('@supa-magic/skillbox/git')).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'git',
    })
  })

  it('parses identifier with deep path', () => {
    expect(parseIdentifier('@org/repo/a/b/c')).toEqual({
      owner: 'org',
      repository: 'repo',
      path: 'a/b/c',
    })
  })

  it('trims whitespace', () => {
    expect(parseIdentifier('  @supa-magic/skillbox/claude/fsd  ')).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'claude/fsd',
    })
  })

  it('rejects identifiers without @ prefix', () => {
    expect(() => parseIdentifier('supa-magic/skillbox/fsd')).toThrow(
      'Must start with @',
    )
  })

  it('rejects bare names', () => {
    expect(() => parseIdentifier('fsd')).toThrow('Must start with @')
  })

  it('rejects @owner/repo without path', () => {
    expect(() => parseIdentifier('@supa-magic/skillbox')).toThrow(
      'Expected format: @owner/repo/path',
    )
  })
})
