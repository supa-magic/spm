import type { Stepper } from '@/utils/stepper'
import type { InstallResult } from '../types'
import type { EmbeddedFile } from './collect-files'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { safePath } from './path-utils'

const copyFilesToProvider = (
  files: EmbeddedFile[],
  targetDir: string,
  stepper: Stepper,
  entityLabel: string,
): InstallResult => {
  if (files.length === 0) {
    stepper.succeed(`${entityLabel} is up to date`)
    return { success: true, output: '', files: [] }
  }

  stepper.start('Integrating...', 'skills')

  const writtenFiles = files.map((file) => {
    const targetPath = safePath(targetDir, file.path)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, file.content, 'utf-8')
    stepper.item(file.path)
    return file.path
  })

  stepper.succeed(
    `${entityLabel} was integrated (${writtenFiles.length} file(s))`,
  )

  return { success: true, output: '', files: writtenFiles }
}

export { copyFilesToProvider }
