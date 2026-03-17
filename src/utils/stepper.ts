import { cyan, dim, green, hideCursor, red, reset, showCursor } from './ansi'

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

type FunCategory = 'packages' | 'skills' | 'generic'

const funMessages: Record<FunCategory, readonly string[]> = {
  packages: [
    'Resolving dependency tree...',
    'Negotiating versions...',
    'Cross-referencing package manifests...',
    'Validating checksums...',
    'Flattening nested dependencies...',
    'Fetching metadata from the registry...',
    'Comparing lockfile with remote...',
    'Deduplicating shared packages...',
    // ~20% worried
    'This package has 47 peer deps. Deep breath...',
    'The lockfile disagrees. The lockfile is wrong...',
  ],
  skills: [
    'Loading skill into working memory...',
    'Parsing skill metadata...',
    'Checking for skill conflicts...',
    'Mapping skill dependencies...',
    'Indexing knowledge base...',
    'Verifying skill signatures...',
    'Wiring skills into a blockchain...',
    'Calibrating expertise level...',
    'Cross-referencing existing skills...',
    'Analyzing project conventions...',
    'Merging skill definitions...',
    'Resolving naming conflicts...',
    'Adapting skills to project rules...',
    'Aligning intentions with context...',
    'Validating output structure...',
    'Making sure skills actually work...',
    'Mapping file dependencies...',
    'Warming up the tubes and transistors...',
    'Reading configuration files...',
    'Scanning project structure...',
    'Writing changes to disk...',
    // ~20% worried
    'Something looks off in the skill graph...',
    'Skill definition is ambiguous. Guessing...',
    'Agent returned something weird. Reading it charitably...',
    'The agent went off-script. Gently correcting...',
  ],
  generic: [
    'Warming up the tubes and transistors...',
    'Reading configuration files...',
    'Scanning project structure...',
    'Writing changes to disk...',
    'Tidying up temporary files...',
    'Verifying file integrity...',
    'Syncing state...',
    'Finishing up loose ends...',
    // ~20% worried
    "This should've worked. Looking into it...",
    'That took longer than expected. Moving on...',
  ],
}

type StepItem = {
  text: string
  done: boolean
  renderedDone: boolean
}

type Stepper = {
  start: (text: string, category?: FunCategory) => void
  item: (text: string) => void
  succeed: (text: string, dimText?: string) => void
  fail: (text: string) => void
  stop: () => void
}

const write = (s: string) => process.stdout.write(s)

const createStepper = (): Stepper => {
  let frameIndex = 0
  let currentText = ''
  let currentCategory: FunCategory = 'generic'
  let items: StepItem[] = []
  let interval: ReturnType<typeof setInterval> | undefined
  let renderedLineCount = 0
  let renderedItemCount = 0
  let prevKeptCount = 0
  let spinnerRendered = false
  let startTime = 0
  let funIndex = 0
  let lastFunSwap = 0
  let cursorHidden = false
  let funLineRendered = false
  let currentFunText = ''

  const writeCursorHide = () => {
    if (!cursorHidden) {
      write(hideCursor)
      cursorHidden = true
    }
  }

  const writeCursorShow = () => {
    if (cursorHidden) {
      write(showCursor)
      cursorHidden = false
    }
  }

  const clearRendered = () => {
    if (renderedLineCount > 0) {
      write(`\x1b[${renderedLineCount}A\r\x1b[J`)
      renderedLineCount = 0
      renderedItemCount = 0
      prevKeptCount = 0
      spinnerRendered = false
      funLineRendered = false
      currentFunText = ''
    }
  }

  const donePrefix = `  ${green}•${reset} `
  const pendingPrefix = `  ${dim}•${reset} `

  const render = () => {
    const elapsed = Date.now() - startTime
    const frame = frames[frameIndex % frames.length]

    if (!spinnerRendered) {
      write(`${cyan}${frame}${reset} ${currentText}\x1b[K\n`)
      renderedLineCount++
      spinnerRendered = true
    } else {
      const dist = renderedLineCount - prevKeptCount
      write(
        `\x1b[${dist}A\r${cyan}${frame}${reset} ${currentText}\x1b[K\x1b[${dist}B\r`,
      )
    }

    items.forEach((it, i) => {
      if (i < renderedItemCount && it.done && !it.renderedDone) {
        const linesUp = renderedLineCount - prevKeptCount - 1 - i
        write(
          `\x1b[${linesUp}A\r${donePrefix}${it.text}\x1b[K\x1b[${linesUp}B\r`,
        )
        it.renderedDone = true
      }
    })

    if (renderedItemCount < items.length && funLineRendered) {
      write('\x1b[1A\r\x1b[K')
      renderedLineCount--
      funLineRendered = false
    }

    while (renderedItemCount < items.length) {
      const it = items[renderedItemCount]
      const prefix = it.done ? donePrefix : pendingPrefix
      write(`${prefix}${it.text}\x1b[K\n`)
      if (it.done) it.renderedDone = true
      renderedItemCount++
      renderedLineCount++
    }

    if (elapsed > 10_000) {
      const msgs = funMessages[currentCategory]
      if (lastFunSwap === 0 || Date.now() - lastFunSwap > 10_000) {
        funIndex = (funIndex + 1) % msgs.length
        lastFunSwap = Date.now()
      }
      const newFunText = msgs[funIndex]
      const funLine = `  └ ${dim}${newFunText}${reset}`

      if (!funLineRendered) {
        write(`${funLine}\x1b[K\n`)
        renderedLineCount++
        funLineRendered = true
        currentFunText = newFunText
      } else if (newFunText !== currentFunText) {
        write(`\x1b[1A\r${funLine}\x1b[K\x1b[1B\r`)
        currentFunText = newFunText
      }
    }

    frameIndex++
  }

  const stopInterval = () => {
    if (interval) {
      clearInterval(interval)
      interval = undefined
    }
  }

  const startInterval = () => {
    stopInterval()
    interval = setInterval(render, 80)
    render()
  }

  const onExit = () => writeCursorShow()
  process.on('exit', onExit)

  return {
    start: (text, category) => {
      writeCursorHide()
      currentText = text
      currentCategory = category ?? 'generic'
      items = []
      renderedItemCount = 0
      spinnerRendered = false
      funLineRendered = false
      currentFunText = ''
      startTime = Date.now()
      lastFunSwap = 0
      funIndex = Math.floor(Math.random() * funMessages[currentCategory].length)
      startInterval()
    },

    item: (text) => {
      const last = items.at(-1)
      if (last && !last.done) last.done = true
      items.push({
        text: text.replace(/^• /, ''),
        done: false,
        renderedDone: false,
      })
    },

    succeed: (text, dimText) => {
      stopInterval()
      clearRendered()
      const dimPart = dimText ? ` ${dim}${dimText}${reset}` : ''
      write(`${green}✔${reset} ${text}${dimPart}\n`)

      const keptItems = items.length <= 1 ? [] : items
      keptItems.forEach((it) => {
        write(`${donePrefix}${it.text}\x1b[K\n`)
      })

      prevKeptCount = keptItems.length
      renderedLineCount = prevKeptCount
      renderedItemCount = 0
      items = []
      spinnerRendered = false
    },

    fail: (text) => {
      stopInterval()
      clearRendered()
      write(`${red}✖${reset} ${text}\n`)
      writeCursorShow()
    },

    stop: () => {
      stopInterval()
      clearRendered()
      writeCursorShow()
      process.removeListener('exit', onExit)
    },
  }
}

export { createStepper }
export type { FunCategory, Stepper }
