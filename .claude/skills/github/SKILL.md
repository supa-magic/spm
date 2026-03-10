---
name: github
description: GitHub commands (issues, PRs, ship). Use when developer needs to create issues, create/update PRs, address review comments, or ship experimental changes.
user-invocable: true
argument-hint: <action> [pr-number] [-y]
---

# /github $ARGUMENTS

GitHub commands using `gh` CLI.

## Usage

```
/github
    create issue              Conversational issue creation
    create pr                 Create PR from current branch
    update pr [number]        Update PR title and description
    resolve cr [number]       Resolve code review feedback
    ship                      Ship experimental changes (issue → branch → commit → PR)

    -y, --yes                 Skip confirmations
```

## Rules

See [rules.md](rules.md) — applies to ALL github operations.

## Instructions

Read the command-specific instruction file and follow it exactly:

- **create issue** → Read `.claude/skills/github/create-issue.md` and follow all steps
- **create pr** → Read `.claude/skills/github/create-pr.md` and follow all steps
- **update pr** → Read `.claude/skills/github/update-pr.md` and follow all steps
- **resolve cr** → Read `.claude/skills/github/resolve-cr.md` and follow all steps
- **ship** → Read `.claude/skills/github/ship.md` and follow all steps

If no command is provided, list the available commands and ask the user which one to run.
