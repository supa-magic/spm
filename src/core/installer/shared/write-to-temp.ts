import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { safePath } from './path-utils'

type TempFileEntry = { relativePath: string; content: string | Buffer }

const ensureGitignore = async (downloadDir: string): Promise<void> => {
  const spmDir = dirname(downloadDir)
  const gitignorePath = join(spmDir, '.gitignore')
  if (!existsSync(gitignorePath)) {
    await mkdir(spmDir, { recursive: true })
    await writeFile(gitignorePath, '*\n*/\n')
  }
}

const writeFilesToTemp = async (
  downloadDir: string,
  files: TempFileEntry[],
  onFile?: (relativePath: string) => void,
): Promise<void> => {
  await ensureGitignore(downloadDir)
  await Promise.all(
    files.map(async ({ relativePath, content }) => {
      const filePath = safePath(downloadDir, relativePath)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, content)
      onFile?.(relativePath)
    }),
  )
}

export type { TempFileEntry }
export { writeFilesToTemp }
