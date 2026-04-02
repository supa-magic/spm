import type { UrlSource } from './types'
import { isBinaryPath } from '@/utils/is-binary-path'

const downloadFromUrl = async (source: UrlSource): Promise<string | Buffer> => {
  const response = await fetch(source.url)

  if (!response.ok) {
    throw new Error(
      `Failed to download from URL: ${source.url} (${response.status} ${response.statusText})`,
    )
  }

  if (isBinaryPath(source.url)) {
    return Buffer.from(await response.arrayBuffer())
  }
  return response.text()
}

export { downloadFromUrl }
