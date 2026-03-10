import type { ProjectConfig } from '@/core/config/types'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  CONFIG_FILE,
  defaultConfig,
  loadConfig,
  readConfig,
  writeConfig,
} from '@/core/config/config'

const createTmpDir = () => {
  const dir = join(
    tmpdir(),
    `spm-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
  mkdirSync(dir, { recursive: true })
  return dir
}

describe('config', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = createTmpDir()
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('readConfig', () => {
    it('returns default config when file does not exist', () => {
      const config = readConfig(tmpDir)
      expect(config).toEqual(defaultConfig)
    })

    it('parses a valid .spmrc.yml file', () => {
      const yaml = [
        'provider: claude',
        'skillset:',
        '  source: skillset/nextjs-fsd',
        '  version: 1.0',
        'skills:',
        '  git:',
        '    source: skillbox/git',
        '    version: 1.1',
        '  react:',
        '    source: skillbox/react',
        '    version: 1.5',
      ].join('\n')

      writeFileSync(join(tmpDir, CONFIG_FILE), yaml, 'utf-8')

      const config = readConfig(tmpDir)
      expect(config.provider).toBe('claude')
      expect(config.skillset).toEqual({
        source: 'skillset/nextjs-fsd',
        version: 1.0,
      })
      expect(config.skills.git).toEqual({
        source: 'skillbox/git',
        version: 1.1,
      })
      expect(config.skills.react).toEqual({
        source: 'skillbox/react',
        version: 1.5,
      })
    })

    it('falls back to default provider when missing', () => {
      const yaml = 'skills: {}\n'
      writeFileSync(join(tmpDir, CONFIG_FILE), yaml, 'utf-8')

      const config = readConfig(tmpDir)
      expect(config.provider).toBe('claude')
    })

    it('returns empty skills when skills section is missing', () => {
      const yaml = 'provider: openai\n'
      writeFileSync(join(tmpDir, CONFIG_FILE), yaml, 'utf-8')

      const config = readConfig(tmpDir)
      expect(config.skills).toEqual({})
    })
  })

  describe('writeConfig', () => {
    it('writes config to .spmrc.yml', () => {
      const config: ProjectConfig = {
        provider: 'openai',
        skills: {
          git: { source: 'skillbox/git', version: 1.1 },
        },
      }

      writeConfig(config, tmpDir)

      const filePath = join(tmpDir, CONFIG_FILE)
      expect(existsSync(filePath)).toBe(true)

      const content = readFileSync(filePath, 'utf-8')
      expect(content).toContain('provider: openai')
      expect(content).toContain('source: skillbox/git')
    })

    it('round-trips config through write and read', () => {
      const config: ProjectConfig = {
        provider: 'claude',
        skillset: { source: 'skillset/nextjs-fsd', version: 1.0 },
        skills: {
          git: { source: 'skillbox/git', version: 1.1 },
          react: { source: 'skillbox/react', version: 1.5 },
        },
      }

      writeConfig(config, tmpDir)
      const loaded = readConfig(tmpDir)

      expect(loaded).toEqual(config)
    })
  })

  describe('loadConfig', () => {
    it('creates config file if missing and returns default', () => {
      const filePath = join(tmpDir, CONFIG_FILE)
      expect(existsSync(filePath)).toBe(false)

      const config = loadConfig(tmpDir)

      expect(existsSync(filePath)).toBe(true)
      expect(config).toEqual(defaultConfig)
    })

    it('returns existing config without overwriting', () => {
      const existing: ProjectConfig = {
        provider: 'openai',
        skills: {
          react: { source: 'skillbox/react', version: 2.0 },
        },
      }
      writeConfig(existing, tmpDir)

      const config = loadConfig(tmpDir)
      expect(config).toEqual(existing)
    })
  })
})
