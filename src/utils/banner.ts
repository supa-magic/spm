const light = '\x1b[96m'
const shade = '\x1b[36m'
const dim = '\x1b[2m'
const reset = '\x1b[0m'

const banner = (version: string) =>
  [
    `${shade} ▐${light}▌ ▐▌    ${reset}AI Skill Package Manager`,
    `${shade} ▐${light}▛██▜▌   ${reset}install • compose • share`,
    `${shade}▝▜${light}████▛▘  ${reset}${dim}v${version} ✨ supa-magic${reset}`,
    `${shade}  ▘${light}  ▝`,
  ].join('\n')

export { banner }
