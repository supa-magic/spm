import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const cleanupDownloadDir = async (
  projectRoot: string,
  downloadDir: string,
): Promise<void> => {
  await rm(downloadDir, { recursive: true, force: true })
  const spmDir = join(projectRoot, '.spm')
  const remaining = await readdir(spmDir).catch(() => [])
  if (remaining.length === 0) await rm(spmDir, { recursive: true, force: true })
}

export { cleanupDownloadDir }
