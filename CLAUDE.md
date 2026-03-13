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

## Skills

- `/git <branch|commit|merge|rebase|squash> [-y]` — Git workflow commands
- `/github <create issue|create pr|create release|update pr|resolve cr|ship> [-y]` — GitHub operations
- `/implement <issue-number> [-y]` — Feature implementation workflow (issue → branch → plan → implement → PR)

## Mandatory Rules

- **CRITICAL**: `.claude/rules/lsp.md` — MUST be followed at all times. NEVER use Grep or Glob for code symbol navigation. ALWAYS use LSP.

## Related
- Skillsets use skills from the skillbox repository
- Part of the Supa Magic ecosystem
