const green = '\x1b[32m'
const cyan = '\x1b[36m'
const dim = '\x1b[2m'
const reset = '\x1b[0m'

const success = (msg: string) => console.log(`${green}✔${reset} ${msg}`)
const info = (msg: string) => console.log(`${cyan}ℹ${reset} ${msg}`)
const hint = (msg: string) => console.log(`  ${dim}${msg}${reset}`)
const item = (label: string, value: string) =>
  console.log(`  ${dim}•${reset} ${label} ${dim}${value}${reset}`)

export { hint, info, item, success }
