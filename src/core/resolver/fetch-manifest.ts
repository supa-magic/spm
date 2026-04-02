import type { Manifest, PackageType, ResolvedLocation } from './types'
import { parse } from 'yaml'

const requiredFields = ['name', 'version', 'description'] as const
const contentKeys: PackageType[] = ['skills', 'hooks', 'agents', 'rules']

const hasContentKey = (record: Record<string, unknown>, key: string) =>
  record[key] != null &&
  (typeof record[key] === 'object' || Array.isArray(record[key]))

const validateManifest = (data: unknown): Manifest => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid manifest: expected a YAML object.')
  }

  const record = data as Record<string, unknown>
  const missing = requiredFields.filter(
    (field) => typeof record[field] !== 'string',
  )

  if (missing.length > 0) {
    throw new Error(
      `Invalid manifest: missing required fields: ${missing.join(', ')}.`,
    )
  }

  const present = contentKeys.filter((key) => hasContentKey(record, key))

  if (present.length === 0) {
    throw new Error(
      'Invalid manifest: must contain at least one content section (skills, hooks, agents, or rules).',
    )
  }

  if (present.length > 1) {
    throw new Error(
      `Invalid manifest: must contain exactly one content section, found: ${present.join(', ')}.`,
    )
  }

  return record as unknown as Manifest
}

const getManifestType = (manifest: Manifest): PackageType => {
  const record = manifest as unknown as Record<string, unknown>
  const found = contentKeys.find((key) => hasContentKey(record, key))
  if (!found) {
    throw new Error('Manifest has no content section.')
  }
  return found
}

const fetchManifest = async (location: ResolvedLocation): Promise<Manifest> => {
  const url = `https://raw.githubusercontent.com/${location.owner}/${location.repository}/${location.ref}/${location.path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch manifest from ${url} (${response.status} ${response.statusText})`,
    )
  }

  const text = await response.text()
  return validateManifest(parse(text))
}

export { fetchManifest, getManifestType, validateManifest }
