import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { walkDir } from './collect-files'

const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...target }
  Object.keys(source).forEach((key) => {
    const targetVal = target[key]
    const sourceVal = source[key]
    if (
      targetVal &&
      sourceVal &&
      typeof targetVal === 'object' &&
      typeof sourceVal === 'object' &&
      !Array.isArray(targetVal) &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      )
    } else {
      result[key] = sourceVal
    }
  })
  return result
}

const deepUnmerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...target }
  Object.keys(source).forEach((key) => {
    if (!(key in result)) return
    const targetVal = result[key]
    const sourceVal = source[key]
    if (
      targetVal &&
      sourceVal &&
      typeof targetVal === 'object' &&
      typeof sourceVal === 'object' &&
      !Array.isArray(targetVal) &&
      !Array.isArray(sourceVal)
    ) {
      const unmerged = deepUnmerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      )
      if (Object.keys(unmerged).length === 0) {
        delete result[key]
      } else {
        result[key] = unmerged
      }
    } else if (JSON.stringify(targetVal) === JSON.stringify(sourceVal)) {
      delete result[key]
    }
  })
  return result
}

const SETUP_DIR = '.setup'

const mergeSetupConfigs = (
  outputDir: string,
  providerDir: string,
  packageDir: string,
): string[] => {
  if (!existsSync(outputDir)) return []

  const files = walkDir(outputDir)
  const merged: string[] = []
  const backupDir = join(packageDir, SETUP_DIR)

  files.forEach((srcPath) => {
    const fileName = srcPath.slice(outputDir.length + 1).replace(/\\/g, '/')
    const destPath = join(providerDir, fileName)
    const backupPath = join(backupDir, fileName)

    mkdirSync(dirname(backupPath), { recursive: true })
    writeFileSync(backupPath, readFileSync(srcPath))

    if (fileName.endsWith('.json') && existsSync(destPath)) {
      try {
        const existing = JSON.parse(readFileSync(destPath, 'utf-8'))
        const incoming = JSON.parse(readFileSync(srcPath, 'utf-8'))
        const result = deepMerge(existing, incoming)
        writeFileSync(destPath, JSON.stringify(result, null, 2) + '\n')
      } catch {
        mkdirSync(dirname(destPath), { recursive: true })
        writeFileSync(destPath, readFileSync(srcPath))
      }
    } else {
      mkdirSync(dirname(destPath), { recursive: true })
      writeFileSync(destPath, readFileSync(srcPath))
    }

    merged.push(fileName)
  })

  return merged
}

const unmergeSetupConfigs = (packageDir: string, providerDir: string): void => {
  const backupDir = join(packageDir, SETUP_DIR)
  if (!existsSync(backupDir)) return

  walkDir(backupDir).forEach((backupPath) => {
    const fileName = backupPath.slice(backupDir.length + 1).replace(/\\/g, '/')
    const targetPath = join(providerDir, fileName)
    if (!existsSync(targetPath)) return

    if (fileName.endsWith('.json')) {
      try {
        const current = JSON.parse(readFileSync(targetPath, 'utf-8'))
        const toRemove = JSON.parse(readFileSync(backupPath, 'utf-8'))
        const cleaned = deepUnmerge(current, toRemove)
        if (Object.keys(cleaned).length === 0) {
          writeFileSync(targetPath, '{}\n')
        } else {
          writeFileSync(targetPath, JSON.stringify(cleaned, null, 2) + '\n')
        }
      } catch {
        // skip malformed JSON
      }
    }
  })
}

export { mergeSetupConfigs, unmergeSetupConfigs }
