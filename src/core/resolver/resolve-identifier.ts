import type { ResolvedLocation } from './types'
import { fetchDefaultBranch } from './fetch-default-branch'
import { parseIdentifier } from './parse-identifier'

const resolveIdentifier = async (input: string): Promise<ResolvedLocation> => {
  const parsed = parseIdentifier(input)
  const { identifier } = parsed
  const ref =
    identifier.ref ??
    (await fetchDefaultBranch(identifier.owner, identifier.repository))

  return {
    owner: identifier.owner,
    repository: identifier.repository,
    path: `${identifier.path}/skillset.yml`,
    ref,
  }
}

export { resolveIdentifier }
