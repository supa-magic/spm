import { describe, expect, it } from 'vitest'
import { resolveIdentifier } from '@/core/resolver'

describe('resolveIdentifier', () => {
  it('resolves to correct manifest path', () => {
    expect(resolveIdentifier('@supa-magic/skillbox/claude/fsd')).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'claude/fsd/skillset.yml',
      ref: 'main',
    })
  })

  it('resolves single path segment', () => {
    expect(resolveIdentifier('@supa-magic/skillset/nextjs')).toEqual({
      owner: 'supa-magic',
      repository: 'skillset',
      path: 'nextjs/skillset.yml',
      ref: 'main',
    })
  })

  it('resolves deep path', () => {
    expect(resolveIdentifier('@org/repo/a/b/c')).toEqual({
      owner: 'org',
      repository: 'repo',
      path: 'a/b/c/skillset.yml',
      ref: 'main',
    })
  })

  it('throws on invalid identifier', () => {
    expect(() => resolveIdentifier('bad-input')).toThrow('Must start with @')
  })
})
