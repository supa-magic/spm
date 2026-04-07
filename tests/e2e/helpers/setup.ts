import { execFile } from 'node:child_process'
import { existsSync, rmSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PROJECTS_DIR = process.env.E2E_PROJECTS_DIR ?? '/app/projects'
const SPM_BIN =
  process.env.SPM_BIN ?? resolve(__dirname, '../../../dist/bin/spm.js')

const projects = ['react-ts-app', 'express-app', 'django-app'] as const

type ProjectName = (typeof projects)[number]

const providers = [
  { name: 'claude', dir: '.claude' },
  { name: 'opencode', dir: '.opencode' },
  { name: 'cursor', dir: '.cursor/rules' },
] as const

type ProviderEntry = (typeof providers)[number]

const projectPath = (project: ProjectName) => resolve(PROJECTS_DIR, project)

const cleanSpmArtifacts = (projectDir: string) => {
  const spmYml = join(projectDir, '.spm.yml')
  if (existsSync(spmYml)) unlinkSync(spmYml)
  const spmDir = join(projectDir, '.spm')
  if (existsSync(spmDir)) rmSync(spmDir, { recursive: true, force: true })
  providers.forEach((p) => {
    const skillsDir = join(projectDir, p.dir, 'skills')
    if (existsSync(skillsDir))
      rmSync(skillsDir, { recursive: true, force: true })
  })
}

const resetProject = (projectDir: string) => {
  cleanSpmArtifacts(projectDir)
}

const runSpm = (cwd: string, args: string[], env?: Record<string, string>) =>
  new Promise<{ stdout: string; stderr: string; code: number }>((res) => {
    execFile(
      'node',
      [SPM_BIN, ...args],
      { cwd, env: { ...process.env, ...env } },
      (error, stdout, stderr) => {
        const code =
          error === null ? 0 : typeof error.code === 'number' ? error.code : 1
        res({ stdout, stderr, code })
      },
    )
  })

const hasApiKey = () => Boolean(process.env.ANTHROPIC_API_KEY)

const projectsExist = () =>
  projects.every((p) => existsSync(join(PROJECTS_DIR, p)))

export type { ProjectName, ProviderEntry }
export {
  hasApiKey,
  PROJECTS_DIR,
  projectPath,
  projects,
  projectsExist,
  providers,
  resetProject,
  runSpm,
}
