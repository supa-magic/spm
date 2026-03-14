import type { ResolvedLocation, Skillset } from './types'
import { parse } from 'yaml'

const fetchSkillset = async (location: ResolvedLocation): Promise<Skillset> => {
  const url = `https://raw.githubusercontent.com/${location.owner}/${location.repository}/${location.ref}/${location.path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch skillset from ${url} (${response.status} ${response.statusText})`,
    )
  }

  const text = await response.text()
  return parse(text) as Skillset
}

export { fetchSkillset }
