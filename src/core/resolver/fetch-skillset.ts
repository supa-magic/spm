import type { ResolvedLocation, Skillset } from './types'
import { parse } from 'yaml'

const requiredFields = ['name', 'version', 'description', 'provider'] as const

const validateSkillset = (data: unknown): Skillset => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid skillset: expected a YAML object.')
  }

  const record = data as Record<string, unknown>
  const missing = requiredFields.filter(
    (field) => typeof record[field] !== 'string',
  )

  if (missing.length > 0) {
    throw new Error(
      `Invalid skillset: missing required fields: ${missing.join(', ')}.`,
    )
  }

  return record as unknown as Skillset
}

const fetchSkillset = async (location: ResolvedLocation): Promise<Skillset> => {
  const url = `https://raw.githubusercontent.com/${location.owner}/${location.repository}/${location.ref}/${location.path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch skillset from ${url} (${response.status} ${response.statusText})`,
    )
  }

  const text = await response.text()
  return validateSkillset(parse(text))
}

export { fetchSkillset, validateSkillset }
