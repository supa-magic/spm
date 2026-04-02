import type { GitHubSource } from './types'
import { isBinaryPath } from '@/utils/is-binary-path'

const downloadFromGitHub = async (
  source: GitHubSource,
): Promise<string | Buffer> => {
  const url = `https://raw.githubusercontent.com/${source.owner}/${source.repository}/${source.ref}/${source.path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to download from GitHub: ${url} (${response.status} ${response.statusText})`,
    )
  }

  if (isBinaryPath(source.path)) {
    return Buffer.from(await response.arrayBuffer())
  }
  return response.text()
}

export { downloadFromGitHub }
