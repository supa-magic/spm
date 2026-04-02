import type { LocalSource } from './types'
import { readFile } from 'node:fs/promises'
import { isBinaryPath } from '@/utils/is-binary-path'

const readLocalFile = async (source: LocalSource): Promise<string | Buffer> => {
  try {
    if (isBinaryPath(source.filePath)) {
      return await readFile(source.filePath)
    }
    return await readFile(source.filePath, 'utf-8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Failed to read local file: ${source.filePath} (${message})`,
    )
  }
}

export { readLocalFile }
