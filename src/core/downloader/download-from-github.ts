import type { GitHubSource } from './types'

const downloadFromGitHub = async (source: GitHubSource): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${source.owner}/${source.repository}/${source.ref}/${source.path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to download from GitHub: ${url} (${response.status} ${response.statusText})`,
    )
  }

  return response.text()
}

export { downloadFromGitHub }
