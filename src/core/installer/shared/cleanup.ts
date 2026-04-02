import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const IGNORED_ENTRIES = new Set(['.gitignore', '.setup-output'])

const cleanupSpmDir = async (projectRoot: string): Promise<void> => {
  const spmDir = join(projectRoot, '.spm')
  await rm(join(spmDir, '.setup-output'), { recursive: true, force: true })
  const remaining = await readdir(spmDir).catch(() => [])
  const isEmpty = remaining.every((entry) => IGNORED_ENTRIES.has(entry))
  if (isEmpty) await rm(spmDir, { recursive: true, force: true })
}

const cleanupDownloadDir = async (
  projectRoot: string,
  downloadDir: string,
): Promise<void> => {
  await rm(downloadDir, { recursive: true, force: true })
  await cleanupSpmDir(projectRoot)
}

const cleanupBeforeInstall = async (
  projectRoot: string,
  downloadDir: string,
): Promise<void> => {
  await rm(downloadDir, { recursive: true, force: true })
  await rm(join(projectRoot, '.spm', '.setup-output'), {
    recursive: true,
    force: true,
  })
}

export { cleanupBeforeInstall, cleanupDownloadDir }
