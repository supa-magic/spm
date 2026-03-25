import { createHash } from 'node:crypto'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join, relative } from 'node:path'
import { walkDir } from './shared/collect-files'

const hash = (content: string): string =>
  createHash('sha256').update(content).digest('hex')

const pruneUnchanged = (downloadDir: string, providerDir: string): number => {
  const files = walkDir(downloadDir)
  let removed = 0

  files.forEach((downloadedFile) => {
    const relativePath = relative(downloadDir, downloadedFile)
    const existingFile = join(providerDir, relativePath)

    if (!existsSync(existingFile)) return

    const downloadedHash = hash(readFileSync(downloadedFile, 'utf-8'))
    const existingHash = hash(readFileSync(existingFile, 'utf-8'))

    if (downloadedHash === existingHash) {
      unlinkSync(downloadedFile)
      removed++
    }
  })

  return removed
}

export { pruneUnchanged }
