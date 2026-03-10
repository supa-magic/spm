# spm - Skill Package Manager

## Project Overview
CLI tool for installing and managing AI skillsets in software projects.
Published as `@supa-magic/spm` on npm.

## Tech Stack
- TypeScript (strict, ES2022, Node16 modules)
- Biome for linting & formatting
- Source in `src/`, output in `dist/`
- CLI entry point: `src/bin/spm.ts` → `dist/bin/spm.js`

## Commands
- `spm install <skillset>` - Install a skillset into the project

## Scripts
- `npm run build` - Compile TypeScript
- `npm run dev` - Watch mode
- `npm run lint` - Check with Biome
- `npm run format` - Format with Biome

## Related
- Skillsets use skills from the skillbox repository
- Part of the Supa Magic ecosystem
