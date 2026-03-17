import type { Stepper } from '@/utils/stepper'
import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}))

import { spawn } from 'node:child_process'
import { spawnClaude } from '@/core/installer'

const mockSpawn = vi.mocked(spawn)

const createMockChild = () => {
  const child = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter
    stderr: EventEmitter
  }
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  return child
}

const createMockStepper = (): Stepper => ({
  start: vi.fn(),
  item: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  stop: vi.fn(),
})

describe('spawnClaude', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves with output on success', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')

    child.stdout.emit('data', Buffer.from('Skill installed\n'))
    child.emit('close', 0)

    const result = await promise
    expect(result.success).toBe(true)
    expect(result.files).toEqual([])
  })

  it('rejects when Claude CLI is not found', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')
    child.emit(
      'error',
      Object.assign(new Error('not found'), { code: 'ENOENT' }),
    )

    await expect(promise).rejects.toThrow('Claude CLI not found')
  })

  it('rejects on non-zero exit code when Done was not received', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')
    child.emit('close', 1)

    await expect(promise).rejects.toThrow('exited with code 1')
  })

  it('passes correct arguments to spawn', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/install-git.md', stepper, '.claude')
    child.emit('close', 0)
    await promise

    expect(mockSpawn).toHaveBeenCalledWith(
      'claude',
      [
        '-p',
        'Install the skill as instructed.',
        '--append-system-prompt-file',
        '/tmp/install-git.md',
        '--verbose',
        '--output-format',
        'stream-json',
        '--allowedTools',
        'Read,Write,Edit,Bash,Glob,Grep',
      ],
      expect.objectContaining({ timeout: 120_000 }),
    )
  })

  it('starts stepper on spawn', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')
    child.emit('close', 0)
    await promise

    expect(stepper.start).toHaveBeenCalledWith(
      'Analyzing existing setup...',
      'skills',
    )
  })

  it('parses step headers from Claude output', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')

    const event = JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          {
            type: 'text',
            text: 'Analyzing existing setup...\n  4 skills, 2 rules\n',
          },
        ],
      },
    })
    child.stdout.emit('data', Buffer.from(`${event}\n`))
    child.emit('close', 0)

    await promise

    expect(stepper.start).toHaveBeenCalledWith(
      'Analyzing existing setup...',
      'skills',
    )
    expect(stepper.item).toHaveBeenCalledWith('4 skills, 2 rules')
  })

  it('tracks written files from tool_use events', async () => {
    const child = createMockChild()
    const stepper = createMockStepper()
    mockSpawn.mockReturnValue(child as never)

    const promise = spawnClaude('/tmp/instructions.md', stepper, '.claude')

    const stepEvent = JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'Integrating...\n' },
          {
            type: 'tool_use',
            name: 'Write',
            input: { file_path: '.claude/skills/git/SKILL.md' },
          },
        ],
      },
    })
    child.stdout.emit('data', Buffer.from(`${stepEvent}\n`))
    child.emit('close', 0)

    const result = await promise
    expect(result.files).toEqual(['skills/git/SKILL.md'])
    expect(stepper.item).toHaveBeenCalledWith('skills/git/SKILL.md')
  })
})
