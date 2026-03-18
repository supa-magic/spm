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

export { fetchDefaultBranch }
