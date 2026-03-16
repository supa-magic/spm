import type { UrlSource } from './types'

const downloadFromUrl = async (source: UrlSource): Promise<string> => {
  const response = await fetch(source.url)

  if (!response.ok) {
    throw new Error(
      `Failed to download from URL: ${source.url} (${response.status} ${response.statusText})`,
    )
  }

  return response.text()
}

export { downloadFromUrl }
