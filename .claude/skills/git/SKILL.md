---
name: git
description: Git commands for branching, committing, merging, rebasing, and squashing. Use when developer needs to create branches, commit changes, merge or rebase branches, or squash commits.
user-invocable: true
argument-hint: <branch|commit|merge|rebase|squash> [args] [-y]
---

# /git $ARGUMENTS

Git workflow commands.

## Usage

```
/git
    branch [issue]        Create branch from GitHub issue
    commit                Smart commit with auto-grouping
    merge [branch]        Merge branch into current (default: main)
    rebase [branch]       Rebase current branch onto another (default: main)
    squash                Squash all branch commits into clean commit(s)

    -y, --yes             Skip confirmations
```

## Rules

See [rules.md](rules.md) — applies to ALL git operations.

## Instructions

Read the command-specific instruction file and follow it exactly:

- **branch** → Read `.claude/skills/git/branch.md` and follow all steps
- **commit** → Read `.claude/skills/git/commit.md` and follow all steps
- **merge** → Read `.claude/skills/git/merge.md` and follow all steps
- **rebase** → Read `.claude/skills/git/rebase.md` and follow all steps
- **squash** → Read `.claude/skills/git/squash.md` and follow all steps

If no command is provided, list the available commands and ask the user which one to run.
