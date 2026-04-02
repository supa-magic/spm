import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

type EmbeddedFile = { path: string; content: string | Buffer }

const walkDir = (dir: string, excludeDot = false): string[] =>
  readdirSync(dir).flatMap((entry) => {
    if (excludeDot && entry.startsWith('.')) return []
    const fullPath = join(dir, entry)
    return statSync(fullPath).isDirectory()
      ? walkDir(fullPath, excludeDot)
      : [fullPath]
  })

const collectRemainingFiles = (downloadDir: string): EmbeddedFile[] => {
  if (!existsSync(downloadDir)) return []
  return walkDir(downloadDir, true).map((fullPath) => ({
    path: relative(downloadDir, fullPath).replace(/\\/g, '/'),
    content: readFileSync(fullPath),
  }))
}

const listExistingFiles = (providerDir: string): string[] => {
  if (!existsSync(providerDir)) return []
  return walkDir(providerDir).map((fullPath) =>
    relative(providerDir, fullPath).replace(/\\/g, '/'),
  )
}

export type { EmbeddedFile }
export { collectRemainingFiles, listExistingFiles, walkDir }
