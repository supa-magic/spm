import type { ProjectName, ProviderEntry } from './helpers/setup'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  projectPath,
  projects,
  projectsExist,
  providers,
  resetProject,
  runSpm,
} from './helpers/setup'

const shouldRun = projectsExist()

const initSpmConfig = (projectDir: string, provider: ProviderEntry) => {
  const config = `version: 1\nproviders:\n  ${provider.name}:\n    path: ${provider.dir}\n`
  writeFileSync(join(projectDir, '.spm.yml'), config, 'utf-8')
}

describe.skipIf(!shouldRun)('spm install', () => {
  describe.each(
    projects.flatMap((project) =>
      providers.map((provider) => ({ project, provider })),
    ),
  )('$project with $provider.name', ({ project, provider }) => {
    const dir = projectPath(project as ProjectName)

    beforeEach(() => {
      resetProject(dir)
      initSpmConfig(dir, provider)
    })

    afterAll(() => resetProject(dir))

    it('installs git skill into correct provider directory', async () => {
      const { stdout, stderr, code } = await runSpm(
        dir,
        ['install', 'https://github.com/supa-magic/skillbox/blob/main/skills/git/SKILL.md'],
      )

      expect(code, `spm failed.\nstdout: ${stdout}\nstderr: ${stderr}`).toBe(0)
      expect(stdout).toContain('git')

      const skillDir = join(dir, provider.dir, 'skills', 'git')
      expect(existsSync(skillDir)).toBe(true)

      const spmYml = join(dir, '.spm.yml')
      expect(existsSync(spmYml)).toBe(true)
    })
  })
})
