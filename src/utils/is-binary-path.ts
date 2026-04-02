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
  const dot = filePath.lastIndexOf('.')
  if (dot === -1) return false
  return BINARY_EXTENSIONS.has(filePath.slice(dot).toLowerCase())
}

export { isBinaryPath }
