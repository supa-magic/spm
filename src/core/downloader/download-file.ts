import type { DownloadedFile, DownloadSource } from './types'
import { downloadFromGitHub } from './download-from-github'
import { downloadFromUrl } from './download-from-url'
import { readLocalFile } from './read-local-file'

const getContent = (source: DownloadSource): Promise<string | Buffer> => {
  if (source.kind === 'github') return downloadFromGitHub(source)
  if (source.kind === 'url') return downloadFromUrl(source)
  return readLocalFile(source)
}

const downloadFile = async (
  source: DownloadSource,
): Promise<DownloadedFile> => {
  const content = await getContent(source)
  return { content, source }
}

export { downloadFile }
