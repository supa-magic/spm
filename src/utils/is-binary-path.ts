const BINARY_EXTENSIONS = new Set([
  '.wav',
  '.mp3',
  '.ogg',
  '.flac',
  '.aac',
  '.m4a',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.ico',
  '.webp',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.rar',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.mp4',
  '.webm',
  '.avi',
  '.mov',
  '.mkv',
  '.bin',
  '.dat',
])

const isBinaryPath = (filePath: string): boolean => {
  const cleaned = filePath.split(/[?#]/)[0]
  const dot = cleaned.lastIndexOf('.')
  if (dot === -1) return false
  return BINARY_EXTENSIONS.has(cleaned.slice(dot).toLowerCase())
}

export { isBinaryPath }
