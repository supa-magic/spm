import { describe, expect, it } from 'vitest'
import { parseSetup } from '@/core/installer/shared/parse-setup'

describe('parseSetup', () => {
  it('parses both pre and post install sections', () => {
    const content = `# Pre Install
Run migrations.

# Post Install
Restart the server.`

    expect(parseSetup(content)).toEqual({
      preInstall: 'Run migrations.',
      postInstall: 'Restart the server.',
    })
  })

  it('parses only pre install section', () => {
    const content = `# Pre Install
Run migrations first.`

    expect(parseSetup(content)).toEqual({
      preInstall: 'Run migrations first.',
      postInstall: undefined,
    })
  })

  it('parses only post install section', () => {
    const content = `# Post Install
Restart the server.`

    expect(parseSetup(content)).toEqual({
      preInstall: undefined,
      postInstall: 'Restart the server.',
    })
  })

  it('treats content without headers as post install', () => {
    const content = 'Configure the environment variables.'

    expect(parseSetup(content)).toEqual({
      postInstall: 'Configure the environment variables.',
    })
  })

  it('returns undefined postInstall for empty content', () => {
    expect(parseSetup('')).toEqual({
      postInstall: undefined,
    })
  })

  it('returns undefined postInstall for whitespace-only content', () => {
    expect(parseSetup('   \n\n  ')).toEqual({
      postInstall: undefined,
    })
  })

  it('handles extra whitespace around sections', () => {
    const content = `
# Pre Install

  Set up database.


# Post Install

  Run seed script.

`

    expect(parseSetup(content)).toEqual({
      preInstall: 'Set up database.',
      postInstall: 'Run seed script.',
    })
  })

  it('handles multiline content in sections', () => {
    const content = `# Pre Install
Step 1: Run migrations.
Step 2: Seed database.

# Post Install
Step 1: Restart server.
Step 2: Verify health check.`

    const result = parseSetup(content)
    expect(result.preInstall).toContain('Step 1: Run migrations.')
    expect(result.preInstall).toContain('Step 2: Seed database.')
    expect(result.postInstall).toContain('Step 1: Restart server.')
    expect(result.postInstall).toContain('Step 2: Verify health check.')
  })
})
