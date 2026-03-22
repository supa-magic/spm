import type { FunCategory } from '@/utils/stepper'

const isNoise = (line: string): boolean =>
  line === '```' ||
  line.startsWith('```') ||
  /^(now |let me |the files? |i'll |i will |looking |checking )/i.test(line)

const isStepHeader = (raw: string, trimmed: string): boolean =>
  !raw.startsWith(' ') && !raw.startsWith('\t') && trimmed.endsWith('...')

const stepCategory = (header: string): FunCategory => {
  if (
    header.startsWith('Integrating') ||
    header.startsWith('Analyzing') ||
    header.startsWith('Detecting')
  )
    return 'skills'
  return 'generic'
}

const irregulars: Record<string, string> = {
  Running: 'Ran',
}

const toSuccessText = (header: string): string => {
  const text = header.replace(/\.{3}$/, '').trim()
  const firstWord = text.split(' ')[0]
  if (irregulars[firstWord]) {
    return text.replace(firstWord, irregulars[firstWord])
  }
  return text.replace(/^(\w+)ing\b/, '$1ed')
}

const toRelativePath = (filePath: string, providerDir: string): string => {
  const normalized = filePath.replace(/\\/g, '/')
  const base = providerDir.replace(/\\/g, '/')
  const marker = `${base}/`
  const idx = normalized.lastIndexOf(marker)
  if (idx !== -1) return normalized.slice(idx + marker.length)
  return normalized.split('/').pop() ?? normalized
}

export { isNoise, isStepHeader, stepCategory, toRelativePath, toSuccessText }
