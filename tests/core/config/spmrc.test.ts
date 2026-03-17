import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(() => {
    throw new Error('not found')
  }),
}))

import { parse, stringify } from 'yaml'
import {
  CONFIG_FILE,
  createDefaultConfig,
  getConfigPath,
  readConfig,
  writeConfig,
} from '@/core/config'

const createTmpDir = () => mkdtempSync(join(tmpdir(), 'spm-test-'))

describe('config', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = createTmpDir()
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('getConfigPath', () => {
    it('returns path with config file name', () => {
      const result = getConfigPath(tmpDir)
      expect(result).toBe(join(tmpDir, CONFIG_FILE))
    })
  })

  describe('readConfig', () => {
    it('creates default config with no providers when none detected', () => {
      const { config, created } = readConfig(tmpDir)
      expect(created).toBe(true)
      expect(config).toEqual({ version: 1, providers: {} })
      expect(existsSync(join(tmpDir, CONFIG_FILE))).toBe(true)
    })

    it('creates default config with detected providers', () => {
      mkdirSync(join(tmpDir, '.claude'), { recursive: true })
      mkdirSync(join(tmpDir, '.cursor', 'rules'), { recursive: true })

      const { config, created } = readConfig(tmpDir)
      expect(created).toBe(true)
      expect(config).toEqual({
        version: 1,
        providers: {
          claude: { path: '.claude' },
          cursor: { path: '.cursor/rules' },
        },
      })
    })

    it('reads existing config file', () => {
      const existing = {
        version: 1,
        providers: {
          claude: {
            path: '.claude',
            skillsets: {
              'nextjs-fsd': '@supa-magic/nextjs-fsd@1.0.0',
              'loop-dev': 'skillbox/loop-dev@2.0.0',
            },
            skills: {
              git: 'skillbox/git@1.1.0',
              react: 'skillbox/react@1.5',
            },
            agents: ['code-reviewer'],
            hooks: ['auto-format-files'],
            mcp: ['figma.md'],
            memory: ['lsp-rules.md'],
            rules: ['coding.md', 'testing.md'],
            'local-files': [
              '.claude/my-agent.md',
              '.claude/team-conventions.md',
            ],
          },
          cursor: {
            path: '.cursor/rules',
            skillsets: {
              'nextjs-fsd': '@supa-magic/nextjs-fsd@1.0.0',
            },
            skills: {
              git: 'skillbox/git@1.1.0',
            },
            'local-files': ['.cursor/rules/my-custom-rules.mdc'],
          },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(existing), 'utf-8')

      const { config, created } = readConfig(tmpDir)
      expect(created).toBe(false)
      expect(config).toEqual(existing)
    })
  })

  describe('writeConfig', () => {
    it('writes config as YAML', () => {
      const config = createDefaultConfig(tmpDir)
      writeConfig(config, tmpDir)

      const content = readFileSync(join(tmpDir, CONFIG_FILE), 'utf-8')
      expect(parse(content)).toEqual(config)
    })

    it('overwrites existing config', () => {
      const initial = createDefaultConfig(tmpDir)
      writeConfig(initial, tmpDir)
      const updated = {
        ...initial,
        providers: {
          cursor: {
            path: '.cursor/rules',
          },
        },
      }
      writeConfig(updated, tmpDir)

      const { config } = readConfig(tmpDir)
      expect(config.providers.cursor).toBeDefined()
      expect(config.providers.claude).toBeUndefined()
    })
  })
})
