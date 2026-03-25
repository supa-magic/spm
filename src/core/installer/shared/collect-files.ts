import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

type EmbeddedFile = { path: string; content: string }

const walkDir = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    return statSync(fullPath).isDirectory() ? walkDir(fullPath) : [fullPath]
  })

const collectRemainingFiles = (downloadDir: string): EmbeddedFile[] => {
  if (!existsSync(downloadDir)) return []
  return walkDir(downloadDir).map((fullPath) => ({
    path: relative(downloadDir, fullPath).replace(/\\/g, '/'),
    content: readFileSync(fullPath, 'utf-8'),
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
