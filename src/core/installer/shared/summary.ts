import { dim, green, reset } from '@/utils/ansi'
import { stripProviderPrefix } from './path-utils'

type TreeNode = {
  name: string
  children: TreeNode[]
}

const buildFileTree = (paths: string[]): TreeNode => {
  const root: TreeNode = { name: '', children: [] }
  paths.forEach((p) => {
    const parts = p.split('/')
    let current = root
    parts.forEach((part) => {
      const existing = current.children.find((c) => c.name === part)
      if (existing) {
        current = existing
      } else {
        const node: TreeNode = { name: part, children: [] }
        current.children.push(node)
        current = node
      }
    })
  })
  return root
}

const renderTree = (node: TreeNode, prefix = ''): string[] =>
  node.children.flatMap((child, i) => {
    const isLast = i === node.children.length - 1
    const connector = isLast ? '└─' : '├─'
    const childPrefix = prefix + (isLast ? '   ' : '│  ')
    const isDir = child.children.length > 0
    const name = isDir ? `${child.name}/` : child.name
    return [`${prefix}${connector} ${name}`, ...renderTree(child, childPrefix)]
  })

const printSummary = (files: string[], providerPath: string) => {
  if (files.length === 0) return
  const unique = [...new Set(files)].map((f) =>
    stripProviderPrefix(f, providerPath),
  )
  const tree = buildFileTree(unique)
  process.stdout.write(`\n📂${providerPath}\n`)
  renderTree(tree).forEach((line) => {
    process.stdout.write(`  ${dim}${line}${reset}\n`)
  })
}

const printCompleted = (startedAt: number) => {
  const elapsed = Math.round((Date.now() - startedAt) / 1000)
  const timeStr =
    elapsed >= 60
      ? `${Math.floor(elapsed / 60)}m${(elapsed % 60).toString().padStart(2, '0')}s`
      : `${elapsed}s`
  process.stdout.write(
    `${green}✔${reset} Installation completed ${dim}in ${timeStr}${reset}\n`,
  )
}

export type { TreeNode }
export { buildFileTree, printCompleted, printSummary, renderTree }
