import { describe, expect, it } from 'vitest'
import { parseIdentifier } from '@/core/resolver'

describe('parseIdentifier', () => {
  it('parses @owner/repo/path correctly', () => {
    expect(parseIdentifier('@supa-magic/skillbox/claude/fsd')).toEqual({
      kind: 'package',
      identifier: {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd',
      },
    })
  })

  it('parses identifier with single path segment', () => {
    expect(parseIdentifier('@supa-magic/skillbox/git')).toEqual({
      kind: 'package',
      identifier: {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'git',
      },
    })
  })

  it('parses identifier with deep path', () => {
    expect(parseIdentifier('@org/repo/a/b/c')).toEqual({
      kind: 'package',
      identifier: {
        owner: 'org',
        repository: 'repo',
        path: 'a/b/c',
      },
    })
  })

  it('trims whitespace', () => {
    expect(parseIdentifier('  @supa-magic/skillbox/claude/fsd  ')).toEqual({
      kind: 'package',
      identifier: {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd',
      },
    })
  })

  it('parses GitHub URL with tree/branch/path', () => {
    expect(
      parseIdentifier(
        'https://github.com/supa-magic/skillbox/tree/main/claude/skill-creator',
      ),
    ).toEqual({
      kind: 'package',
      identifier: {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/skill-creator',
        ref: 'main',
      },
    })
  })

  it('parses GitHub URL with non-main branch', () => {
    expect(
      parseIdentifier('https://github.com/org/repo/tree/develop/path/to/skill'),
    ).toEqual({
      kind: 'package',
      identifier: {
        owner: 'org',
        repository: 'repo',
        path: 'path/to/skill',
        ref: 'develop',
      },
    })
  })

  it('parses GitHub blob URL as skill', () => {
    expect(
      parseIdentifier(
        'https://github.com/owner/repo/blob/main/skills/SKILL.md',
      ),
    ).toEqual({
      kind: 'skill',
      identifier: {
        owner: 'owner',
        repository: 'repo',
        path: 'skills/SKILL.md',
        ref: 'main',
      },
    })
  })

  it('parses raw.githubusercontent.com URL', () => {
    expect(
      parseIdentifier(
        'https://raw.githubusercontent.com/owner/repo/main/skills/SKILL.md',
      ),
    ).toEqual({
      kind: 'skill',
      identifier: {
        owner: 'owner',
        repository: 'repo',
        path: 'skills/SKILL.md',
        ref: 'main',
      },
    })
  })

  it('detects .md path as skill kind', () => {
    expect(parseIdentifier('@org/repo/skills/git/SKILL.md')).toEqual({
      kind: 'skill',
      identifier: {
        owner: 'org',
        repository: 'repo',
        path: 'skills/git/SKILL.md',
      },
    })
  })

  it('detects .MD path as skill kind (case insensitive)', () => {
    expect(parseIdentifier('@org/repo/skills/git/SKILL.MD')).toEqual({
      kind: 'skill',
      identifier: {
        owner: 'org',
        repository: 'repo',
        path: 'skills/git/SKILL.MD',
      },
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
      kind: 'package',
      identifier: {
        owner: 'owner',
        repository: 'repo',
        path: 'path',
      },
    })
  })
})
