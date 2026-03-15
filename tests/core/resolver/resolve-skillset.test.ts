import type { ResolvedLocation, Skillset } from '@/core/resolver'
import { describe, expect, it } from 'vitest'
import { resolveSkillset } from '@/core/resolver'

const location: ResolvedLocation = {
  owner: 'supa-magic',
  repository: 'skillbox',
  path: 'claude/fsd/skillset.yml',
  ref: 'main',
}

describe('resolveSkillset', () => {
  it('builds skill entries from relative source', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      skills: {
        git: {
          source: './skills/git',
          files: ['SKILL.md', 'branch.md'],
        },
      },
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toEqual([
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/skills/git/SKILL.md',
        type: 'skill',
      },
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/skills/git/branch.md',
        type: 'skill',
      },
    ])
  })

  it('resolves cross-repo skill sources', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      skills: {
        linting: {
          source: '@ComposioHQ/awesome-claude-skills/lint',
          files: ['SKILL.md', 'eslint.md'],
        },
      },
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toEqual([
      {
        owner: 'ComposioHQ',
        repository: 'awesome-claude-skills',
        path: 'lint/SKILL.md',
        type: 'skill',
      },
      {
        owner: 'ComposioHQ',
        repository: 'awesome-claude-skills',
        path: 'lint/eslint.md',
        type: 'skill',
      },
    ])
  })

  it('includes setup file when present', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      setup: 'SETUP.md',
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toEqual([
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/SETUP.md',
        type: 'setup',
      },
    ])
  })

  it('handles all local file types', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      agents: ['agents/code-reviewer.md'],
      hooks: ['hooks/pre-commit.md'],
      mcp: ['mcp/nextjs-server.json'],
      memory: ['memory/project-patterns.md'],
      rules: ['rules/fsd-architecture.md'],
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toEqual([
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/agents/code-reviewer.md',
        type: 'agent',
      },
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/hooks/pre-commit.md',
        type: 'hook',
      },
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/mcp/nextjs-server.json',
        type: 'mcp',
      },
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/memory/project-patterns.md',
        type: 'memory',
      },
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/fsd/rules/fsd-architecture.md',
        type: 'rule',
      },
    ])
  })

  it('combines all entry types in a full manifest', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      setup: 'SETUP.md',
      skills: {
        git: {
          source: './skills/git',
          files: ['SKILL.md'],
        },
      },
      rules: ['rules/fsd-architecture.md'],
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toHaveLength(3)
    expect(entries[0].type).toBe('setup')
    expect(entries[1].type).toBe('skill')
    expect(entries[2].type).toBe('rule')
  })

  it('returns empty array for manifest with no files', () => {
    const manifest: Skillset = {
      name: 'empty',
      version: '1.0.0',
      description: 'Empty',
      provider: 'claude',
    }

    expect(resolveSkillset(manifest, location)).toEqual([])
  })

  it('resolves bare path as repo-root relative', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      skills: {
        skill: {
          source: 'claude/skill',
          files: ['SKILL.md'],
        },
      },
    }

    const entries = resolveSkillset(manifest, location)
    expect(entries).toEqual([
      {
        owner: 'supa-magic',
        repository: 'skillbox',
        path: 'claude/skill/SKILL.md',
        type: 'skill',
      },
    ])
  })

  it('rejects path traversal in bare source', () => {
    const manifest: Skillset = {
      name: 'fsd',
      version: '1.0.0',
      description: 'Test',
      provider: 'claude',
      skills: {
        bad: {
          source: '../../../etc',
          files: ['passwd'],
        },
      },
    }

    expect(() => resolveSkillset(manifest, location)).toThrow('Path traversal')
  })
})
