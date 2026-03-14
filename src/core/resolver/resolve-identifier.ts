import type { ResolvedLocation } from './types'
import { parseIdentifier } from './parse-identifier'

const resolveIdentifier = (input: string): ResolvedLocation => {
  const identifier = parseIdentifier(input)

  return {
    owner: identifier.owner,
    repository: identifier.repository,
    path: `${identifier.path}/skillset.yml`,
    ref: 'main',
  }
}

export { resolveIdentifier }
