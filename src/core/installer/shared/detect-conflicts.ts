import type { EmbeddedFile } from './collect-files'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

type ConflictResult = {
  newFiles: EmbeddedFile[]
  conflictFiles: EmbeddedFile[]
}

const detectConflicts = (
  files: EmbeddedFile[],
  providerDir: string,
): ConflictResult => {
  const newFiles: EmbeddedFile[] = []
  const conflictFiles: EmbeddedFile[] = []

  files.forEach((file) => {
    const existing = join(providerDir, file.path)
    if (existsSync(existing)) {
      conflictFiles.push(file)
    } else {
      newFiles.push(file)
    }
  })

  return { newFiles, conflictFiles }
}

export type { ConflictResult }
export { detectConflicts }
