import type { Command } from 'commander'
import type { GitHubSource } from '@/core/downloader'
import type { FileEntry, ResolvedLocation } from '@/core/resolver'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { readConfig } from '@/core/config'
import { downloadFile } from '@/core/downloader'
import {
  fetchSkillset,
  resolveIdentifier,
  resolveSkillset,
} from '@/core/resolver'
import { info, item, success } from '@/utils/log'

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
) => {
  const results = await Promise.all(
    entries.map((entry) => {
      const source = toGitHubSource(entry, location.ref)
      return downloadFile(source).then((result) => ({
        ...result,
        type: entry.type,
        path: entry.path,
      }))
    }),
  )
  return results
}

const registerInstallCommand = (program: Command) => {
  program
    .command('install <skillset>')
    .alias('i')
    .description('Install a skillset into the project')
    .action(async (input: string) => {
      readConfig()

      info(`Resolving ${input}...`)
      const location = await resolveIdentifier(input)
      item(
        'location',
        `${location.owner}/${location.repository}@${location.ref}`,
      )

      info('Fetching skillset manifest...')
      const skillset = await fetchSkillset(location)
      item('skillset', `${skillset.name} v${skillset.version}`)

      const entries = resolveSkillset(skillset, location)
      if (entries.length === 0) {
        info('No files to download.')
        return
      }

      const tmpDir = join(process.cwd(), '.tmp', skillset.name)

      info(`Downloading ${entries.length} file(s) to .tmp/${skillset.name}/...`)
      const results = await downloadEntries(entries, location)

      await Promise.all(
        results.map(async (result) => {
          const filePath = join(tmpDir, result.path)
          await mkdir(dirname(filePath), { recursive: true })
          await writeFile(filePath, result.content, 'utf-8')
          item(result.type, result.path)
        }),
      )

      success(`Downloaded ${results.length} file(s) from ${skillset.name}`)
    })
}

export { registerInstallCommand }
