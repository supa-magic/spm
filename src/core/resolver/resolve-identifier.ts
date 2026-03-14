import type { ResolvedLocation } from './types'
import { parseIdentifier } from './parse-identifier'

const fetchDefaultBranch = async (
  owner: string,
  repository: string,
): Promise<string> => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}`,
  )
  if (!response.ok) {
    return 'main'
  }
  const data = (await response.json()) as { default_branch?: string }
  return data.default_branch ?? 'main'
}

const resolveIdentifier = async (input: string): Promise<ResolvedLocation> => {
  const identifier = parseIdentifier(input)
  const ref = await fetchDefaultBranch(identifier.owner, identifier.repository)

  return {
    owner: identifier.owner,
    repository: identifier.repository,
    path: `${identifier.path}/skillset.yml`,
    ref,
  }
}

export { resolveIdentifier }
