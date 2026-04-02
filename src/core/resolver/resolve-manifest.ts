import type {
  FileEntry,
  Manifest,
  ManifestComponent,
  ResolvedLocation,
} from './types'
import { posix } from 'node:path'
import { getManifestType } from './fetch-manifest'

const resolveSource = (
  source: string,
  manifestDir: string,
  location: ResolvedLocation,
): { owner: string; repository: string; basePath: string } => {
  if (source === './' || source === '.') {
    return {
      owner: location.owner,
      repository: location.repository,
      basePath: manifestDir,
    }
  }

  if (source.startsWith('./')) {
    const relativePath = source.slice(2).replace(/\/+$/, '')
    return {
      owner: location.owner,
      repository: location.repository,
      basePath: `${manifestDir}/${relativePath}`,
    }
  }

  if (source.startsWith('@')) {
    const parts = source.slice(1).split('/').filter(Boolean)
    if (parts.length < 3) {
      throw new Error(
        `Invalid source "${source}". Expected format: @owner/repo/path.`,
      )
    }
    return {
      owner: parts[0],
      repository: parts[1],
      basePath: parts.slice(2).join('/'),
    }
  }

  const normalized = source.replace(/^\/+/, '').replace(/\/+$/, '')

  if (normalized.includes('..')) {
    throw new Error(
      `Invalid source "${source}". Path traversal ("..") is not allowed.`,
    )
  }

  return {
    owner: location.owner,
    repository: location.repository,
    basePath: normalized,
  }
}

const resolveComponentEntries = (
  component: ManifestComponent,
  manifestDir: string,
  location: ResolvedLocation,
  packageType: FileEntry['type'],
): FileEntry[] => {
  const resolved = resolveSource(component.source, manifestDir, location)
  return component.files.map((file) => ({
    owner: resolved.owner,
    repository: resolved.repository,
    path: posix.join(resolved.basePath, file),
    type: packageType,
  }))
}

const resolveSetupFile = (
  setup: string | Record<string, string>,
  providerName?: string,
): string | undefined => {
  if (typeof setup === 'string') return setup
  if (providerName && setup[providerName]) return setup[providerName]
  return undefined
}

const resolveManifest = (
  manifest: Manifest,
  location: ResolvedLocation,
  providerName?: string,
): FileEntry[] => {
  const entries: FileEntry[] = []
  const manifestDir = location.path.replace(/\/install\.yml$/, '')
  const packageType = getManifestType(manifest)

  const setupFile = manifest.setup
    ? resolveSetupFile(manifest.setup, providerName)
    : undefined

  if (setupFile) {
    entries.push({
      owner: location.owner,
      repository: location.repository,
      path: `${manifestDir}/${setupFile}`,
      type: 'setup',
    })
  }

  if (packageType === 'skills' || packageType === 'hooks') {
    const content = manifest[packageType] as Record<string, ManifestComponent>
    Object.values(content).forEach((component) => {
      entries.push(
        ...resolveComponentEntries(
          component,
          manifestDir,
          location,
          packageType,
        ),
      )
    })
  } else {
    const content = manifest[packageType] as string[]
    content.forEach((file) => {
      entries.push({
        owner: location.owner,
        repository: location.repository,
        path: `${manifestDir}/${file}`,
        type: packageType,
      })
    })
  }

  return entries
}

export { resolveManifest }
