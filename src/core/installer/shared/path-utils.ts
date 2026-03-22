import { normalize, resolve } from 'node:path'

const safePath = (baseDir: string, filePath: string): string => {
  const resolved = resolve(baseDir, normalize(filePath))

  if (!resolved.startsWith(baseDir)) {
    throw new Error(`Path traversal detected: "${filePath}"`)
  }

  return resolved
}

const stripProviderPrefix = (file: string, prefix: string): string => {
  const norm = prefix.replace(/\\/g, '/').replace(/^\.\//, '')
  if (file.startsWith(`${norm}/`)) return file.slice(norm.length + 1)
  const bare = norm.replace(/^\./, '')
  if (bare && file.startsWith(`${bare}/`)) return file.slice(bare.length + 1)
  return file
}

export { safePath, stripProviderPrefix }
