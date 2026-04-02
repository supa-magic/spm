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

const mockState = { projectRoot: '' }
vi.mock('@/core/config/project-root', () => ({
  getProjectRoot: () => mockState.projectRoot,
}))

import { parse, stringify } from 'yaml'
import {
  CONFIG_FILE,
  createDefaultConfig,
  getConfigPath,
  readConfig,
  removeConfigEntry,
  writeConfig,
} from '@/core/config'

const createTmpDir = () => mkdtempSync(join(tmpdir(), 'spm-test-'))

describe('config', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = createTmpDir()
    mockState.projectRoot = tmpDir
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
            skills: {
              git: 'skillbox/git@1.1.0',
              react: 'skillbox/react@1.5',
            },
            agents: { 'code-reviewer': 'skillbox/code-reviewer@1.0.0' },
            hooks: { 'auto-format': 'skillbox/auto-format@1.0.0' },
            rules: { coding: 'skillbox/coding@1.0.0' },
            'local-files': [
              '.claude/my-agent.md',
              '.claude/team-conventions.md',
            ],
          },
          cursor: {
            path: '.cursor/rules',
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

  describe('removeConfigEntry', () => {
    it('removes a skill entry from config', () => {
      const config = {
        version: 1,
        providers: {
          claude: {
            path: '.claude',
            skills: {
              git: 'skillbox/git@1.0.0',
              react: 'skillbox/react@1.0.0',
            },
          },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(config), 'utf-8')

      removeConfigEntry({
        providerPath: '.claude',
        kind: 'skills',
        name: 'git',
      })

      const { config: updated } = readConfig(tmpDir)
      expect(updated.providers.claude.skills).toEqual({
        react: 'skillbox/react@1.0.0',
      })
    })

    it('removes skills map when last entry is removed', () => {
      const config = {
        version: 1,
        providers: {
          claude: {
            path: '.claude',
            skills: {
              git: 'skillbox/git@1.0.0',
            },
          },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(config), 'utf-8')

      removeConfigEntry({
        providerPath: '.claude',
        kind: 'skills',
        name: 'git',
      })

      const { config: updated } = readConfig(tmpDir)
      expect(updated.providers.claude.skills).toBeUndefined()
    })

    it('does nothing when skill does not exist', () => {
      const config = {
        version: 1,
        providers: {
          claude: {
            path: '.claude',
            skills: {
              git: 'skillbox/git@1.0.0',
            },
          },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(config), 'utf-8')

      removeConfigEntry({
        providerPath: '.claude',
        kind: 'skills',
        name: 'nonexistent',
      })

      const { config: updated } = readConfig(tmpDir)
      expect(updated.providers.claude.skills).toEqual({
        git: 'skillbox/git@1.0.0',
      })
    })

    it('throws when provider path not found', () => {
      const config = {
        version: 1,
        providers: {
          claude: { path: '.claude' },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(config), 'utf-8')

      expect(() =>
        removeConfigEntry({
          providerPath: '.unknown',
          kind: 'skills',
          name: 'git',
        }),
      ).toThrow('Provider with path ".unknown" not found in config')
    })

    it('removes a hooks entry from config', () => {
      const config = {
        version: 1,
        providers: {
          claude: {
            path: '.claude',
            hooks: {
              'retro-game': 'skillbox/retro-game@1.0.0',
              'auto-format': 'skillbox/auto-format@2.0.0',
            },
          },
        },
      }
      writeFileSync(join(tmpDir, CONFIG_FILE), stringify(config), 'utf-8')

      removeConfigEntry({
        providerPath: '.claude',
        kind: 'hooks',
        name: 'retro-game',
      })

      const { config: updated } = readConfig(tmpDir)
      expect(updated.providers.claude.hooks).toEqual({
        'auto-format': 'skillbox/auto-format@2.0.0',
      })
    })
  })
})
