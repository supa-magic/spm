import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { safePath } from './path-utils'

type TempFileEntry = { relativePath: string; content: string }

const writeFilesToTemp = async (
  downloadDir: string,
  files: TempFileEntry[],
  onFile?: (relativePath: string) => void,
): Promise<void> => {
  await Promise.all(
    files.map(async ({ relativePath, content }) => {
      const filePath = safePath(downloadDir, relativePath)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, content, 'utf-8')
      onFile?.(relativePath)
    }),
  )
}

export type { TempFileEntry }
export { writeFilesToTemp }
