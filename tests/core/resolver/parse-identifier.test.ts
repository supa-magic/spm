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

  it('parses GitHub URL with tree/branch/path', () => {
    expect(
      parseIdentifier(
        'https://github.com/supa-magic/skillbox/tree/main/claude/skill-creator',
      ),
    ).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'claude/skill-creator',
    })
  })

  it('parses GitHub URL with non-main branch', () => {
    expect(
      parseIdentifier('https://github.com/org/repo/tree/develop/path/to/skill'),
    ).toEqual({
      owner: 'org',
      repository: 'repo',
      path: 'path/to/skill',
    })
  })

  it('rejects invalid GitHub URL without tree segment', () => {
    expect(() =>
      parseIdentifier('https://github.com/owner/repo/blob/main/file.md'),
    ).toThrow('Invalid GitHub URL')
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

  it('rejects empty segments like @owner/repo/', () => {
    expect(() => parseIdentifier('@owner/repo/')).toThrow(
      'Expected format: @owner/repo/path',
    )
  })

  it('rejects @/repo/path with empty owner', () => {
    expect(() => parseIdentifier('@/repo/path')).toThrow(
      'Expected format: @owner/repo/path',
    )
  })

  it('normalizes double slashes', () => {
    expect(parseIdentifier('@owner//repo/path')).toEqual({
      owner: 'owner',
      repository: 'repo',
      path: 'path',
    })
  })
})
