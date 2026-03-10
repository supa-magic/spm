# Skill Creation Rules

## Structure

Each skill lives in `.claude/skills/<skill-name>/` with `SKILL.md` as the entry point.

### Simple skill (no subcommands)

Everything lives in a single file — frontmatter, usage, and all instruction steps.

```
.claude/skills/<skill-name>/
  SKILL.md              # Entry point + full instructions
```

### Multi-subcommand skill

Split into separate files to save context — only the relevant subcommand file is loaded.

```
.claude/skills/<skill-name>/
  SKILL.md              # Entry point — frontmatter + routing only
  <subcommand>.md       # Instruction file per subcommand
  <shared-rules>.md     # Shared rules across subcommands (optional)
```

## SKILL.md Format — Simple Skill

```markdown
---
name: <skill-name>
description: <short description for skill registry>
user-invocable: true
argument-hint: [--flag]
---

# /<skill-name> $ARGUMENTS

<One-line description.>

## Usage

\```
/<skill-name>          Description
/<skill-name> --flag   Description
    --flag             Description of what the flag does
\```

## Instructions

### Step 1: <action>

...

### Step 2: <action>

...
```

## SKILL.md Format — Multi-Subcommand Skill

```markdown
---
name: <skill-name>
description: <short description for skill registry>
user-invocable: true
argument-hint: <action> [--flag]
---

# /<skill-name> $ARGUMENTS

<One-line description.>

## Usage

\```
/<skill-name>
    arg1                  Description
    arg1 --flag           Description
    arg2                  Description

    --flag                Global flag description
\```

## Instructions

Read the subcommand-specific instruction file and follow it exactly:

- **arg1** → Read `<path>` and follow all steps
- **arg2** → Read `<path>` and follow all steps

If no argument is provided, list available commands and ask the user.
```

## Confirmations

Skills must confirm before performing critical actions. The developer can bypass confirmations with `-y`.

### Auto-confirm check

Before every confirmation gate, check if `-y` was passed to the current skill invocation. If true → skip confirmation and proceed. Otherwise → show what will happen and wait for developer approval.

### Critical actions (require confirmation)

- `git commit` — committing changes
- `git push` — pushing to remote
- `git merge` — merging branches
- `git rebase` — rebasing branches
- `git reset` — resetting commits
- `gh issue create` — creating GitHub issues
- `gh pr create` — creating pull requests
- `gh pr edit` — updating pull requests

### The `-y` flag

All skills that perform critical actions accept `-y` (long form: `--yes`). Composite skills (`/github ship`, `/dev`) pass auto-confirm through to all sub-skill invocations.

### Confirmation gate format

```
Show: concise summary of what will happen
Ask: "Proceed?"
Wait for response.
```

## Instruction Steps Format

- Steps start at **Step 1** (no Step 0)
- Each step has a clear heading: `### Step N: <action>` (must be `###` h3, not `##` h2)
- Include bash commands in fenced code blocks
- Keep steps atomic — one action per step
- Don't duplicate setup covered by `/project init`
- End with a user-facing result or prompt (e.g., report output, ask to deploy)

## Registration

After creating a skill, register it in:

1. **CLAUDE.md > Skills** — add `/<skill-name> <args>` with description
2. **CLAUDE.md > Project Structure** — add the skill folder under `.claude/skills/`

## Principles

- Skills are token-efficient — no redundant context, no prerequisites covered elsewhere
- Simple skills keep everything in SKILL.md — no separate files for a single command
- Multi-subcommand skills split into files — SKILL.md routes, subcommand files execute
- Subcommand instruction files are self-contained — readable and executable without SKILL.md context
- Shared rules go in separate files (e.g., `rules.md`) referenced from SKILL.md
