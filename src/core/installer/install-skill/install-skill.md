# Skill Integration

You are integrating a single skill into the project. Analyze the existing project setup and intelligently integrate the new files.

## Context

- **Downloaded files**: `{{downloadDir}}`
- **Provider directory**: `{{providerDir}}`
- **Skill**: `{{skillName}}`

Identical files have already been removed from the download folder. Only files that need action remain. If the download folder is empty, output `Done` immediately.

## Output Format

CRITICAL — follow exactly:
- NEVER wrap output in code blocks or backticks
- NEVER write conversational text ("Now let me...", "Let me check...", "The files are...")
- NEVER use emojis
- Output ONLY structured log lines
- Step headers are plain text ending with `...` — these are parsed by the CLI to drive spinner states
- Items below headers are indented with 2 spaces and use `• ` prefix
- File lists use ASCII tree: `├─`, `└─`, `│`
- End with `Done` on its own line

Step headers (use these exactly):

1. `Analyzing existing setup...`
2. `Analyzing downloaded files...`
3. `Detecting conflicts...`
4. `Integrating...`
5. `Done`

Example output:

Analyzing existing setup...
  • 4 skills, 2 rules, 1 hook

Analyzing downloaded files...
  • skill: git (3 files)

Detecting conflicts...
  • No conflicts

Integrating...
  • skills/git/SKILL.md
  • skills/git/branch.md

Done

## Step 1: Analyzing existing setup

Read the provider directory (`{{providerDir}}`) and catalog what is already in place: skills, rules, agents, hooks, mcp servers files.

## Step 2: Analyzing downloaded files

Read all files in `{{downloadDir}}`. Only files present in this folder need to be installed.

## Step 3: Detecting conflicts

For each downloaded file, check if a file with the same name exists in the provider directory.

- **No existing file** → install as new
- **Different content** → replace silently
- **Same content** → skip (should already be pruned)

Detecting conflicts...
  • rules/coding.md — local has custom rules
  • Choose: (r)eplace / (s)kip / (m)erge

Wait for response before proceeding.

## Step 4: Integrating

Install files into `{{providerDir}}/skills/{{skillName}}/`, following the directory structure from the download folder.

**Integrate, don't copy.** When a new skill can leverage existing project conventions, adapt it:

- If the project has `rules/coding.md` with specific conventions → make new skills follow those rules instead of their own defaults
- If existing skills handle branching or committing → reference them instead of duplicating instructions
- If the project has naming conventions, testing patterns, or architectural rules → align new skills with them

{{unresolvedSection}}

## Rules

- Do not delete or modify existing files in the provider directory unless resolving a conflict
- Do NOT delete the download folder — cleanup is handled externally
