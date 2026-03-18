const hasDefaultBranch = (
  value: unknown,
): value is { default_branch: string } =>
  typeof value === 'object' &&
  value !== null &&
  'default_branch' in value &&
  typeof (value as Record<string, unknown>).default_branch === 'string'

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
  const data: unknown = await response.json()
  return hasDefaultBranch(data) ? data.default_branch : 'main'
}

export { fetchDefaultBranch }
