import type { ProjectConfig, SkillEntry } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dump, load } from 'js-yaml'
import { detectProjectRoot } from './project-root'

const CONFIG_FILE = '.spmrc.yml'

const defaultConfig: ProjectConfig = {
  provider: 'claude',
  skills: {},
}

const configPath = (root: string) => join(root, CONFIG_FILE)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseSourceVersion = (
  value: unknown,
): { source: string; version: number } | undefined => {
  if (!isRecord(value)) return undefined
  if (typeof value.source !== 'string' || typeof value.version !== 'number')
    return undefined
  return { source: value.source, version: value.version }
}

const parseSkills = (value: unknown): Record<string, SkillEntry> => {
  if (!isRecord(value)) return {}
  return Object.entries(value).reduce<Record<string, SkillEntry>>(
    (acc, [key, val]) => {
      const entry = parseSourceVersion(val)
      if (entry) acc[key] = entry
      return acc
    },
    {},
  )
}

const normalizeConfig = (raw: unknown): ProjectConfig => {
  if (!isRecord(raw)) return { ...defaultConfig }

  const skillset = parseSourceVersion(raw.skillset)

  return {
    provider:
      typeof raw.provider === 'string' ? raw.provider : defaultConfig.provider,
    ...(skillset ? { skillset } : {}),
    skills: parseSkills(raw.skills),
  }
}

const readConfig = (root?: string): ProjectConfig => {
  const projectRoot = root ?? detectProjectRoot()
  const filePath = configPath(projectRoot)

  try {
    const content = readFileSync(filePath, 'utf-8')
    const parsed = load(content)

    return normalizeConfig(parsed)
  } catch {
    return { ...defaultConfig }
  }
}

const writeConfig = (config: ProjectConfig, root?: string): void => {
  const projectRoot = root ?? detectProjectRoot()
  const filePath = configPath(projectRoot)

  writeFileSync(filePath, dump(config, { lineWidth: -1 }), 'utf-8')
}

const loadConfig = (root?: string): ProjectConfig => {
  const projectRoot = root ?? detectProjectRoot()
  const filePath = configPath(projectRoot)

  try {
    readFileSync(filePath)
  } catch {
    writeConfig({ ...defaultConfig }, projectRoot)
  }

  return readConfig(projectRoot)
}

export { CONFIG_FILE, defaultConfig, loadConfig, readConfig, writeConfig }
