import type { GitHubSource } from '@/core/downloader'
import type { FileEntry, ResolvedLocation } from '@/core/resolver'
import { downloadFile } from '@/core/downloader'

const toGitHubSource = (entry: FileEntry, ref: string): GitHubSource => ({
  kind: 'github',
  owner: entry.owner,
  repository: entry.repository,
  path: entry.path,
  ref,
})

const downloadEntries = async (
  entries: FileEntry[],
  location: ResolvedLocation,
  onFile: (type: string, path: string) => void,
) => {
  const results = await Promise.all(
    entries.map((entry) => {
      const source = toGitHubSource(entry, location.ref)
      return downloadFile(source).then((result) => {
        onFile(entry.type, entry.path)
        return {
          ...result,
          type: entry.type,
          path: entry.path,
          skillName: entry.skillName,
        }
      })
    }),
  )
  return results
}

export { downloadEntries, toGitHubSource }
