# Skillset Integration

You are integrating a new skillset into the project. Analyze the existing project setup and intelligently integrate the new files.

## Context

- **Downloaded files**: `{{downloadDir}}`
- **Provider directory**: `{{providerDir}}`
- **Skillset**: `{{skillsetName}}` v`{{skillsetVersion}}`
- **Source**: `{{source}}`
- **Config file**: `{{configPath}}`

Identical files have already been removed from the download folder. Only files that need action remain. If the download folder is empty, skip to the config update step.

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
5. `Updating config...`
6. `Running setup...` (only if a setup file exists)
7. `Cleaning up...`
8. `Done`

Example output:

Analyzing existing setup...
  • 4 skills, 2 rules, 1 hook

Analyzing downloaded files...
  • skills: git, github, implement
  • rules: coding
  • hook: biome-format

Detecting conflicts...
  • No conflicts

Integrating...
  • skills/git/SKILL.md
  • skills/git/branch.md
  • skills/github/SKILL.md

Updating config...
  • skillset: skill-creator@1.0.0

Running setup...
  • Configured MCP server: biome

Cleaning up...
  • Removed .spm/skill-creator

Done

## Step 1: Analyzing existing setup

Read the provider directory (`{{providerDir}}`) and catalog what is already in place: skills, rules, agents, hooks, mcp servers, memory files.

## Step 2: Analyzing downloaded files

Read all files in `{{downloadDir}}`. Only files present in this folder need to be installed.

## Step 3: Detecting conflicts

For each downloaded file, check if a file with the same name exists in the provider directory.

- **No existing file** → install as new
- **Different skillset version** → replace silently (new version supersedes)
- **Same version or no version info** → conflict — ask the user:

Detecting conflicts...
  • rules/coding.md — local has custom rules
  • Choose: (r)eplace / (s)kip / (m)erge

Wait for response before proceeding.

## Step 4: Integrating

Install files into `{{providerDir}}`, following the directory structure from the download folder.

**Integrate, don't copy.** When a new skill can leverage existing project conventions, adapt it:

- If the project has `rules/coding.md` with specific conventions → make new skills follow those rules instead of their own defaults
- If existing skills handle branching or committing → reference them instead of duplicating instructions
- If the project has naming conventions, testing patterns, or architectural rules → align new skills with them

## Step 5: Updating config

Update `{{configPath}}`:

- Under the provider with path `{{providerDir}}`, add the skillset entry under `skillsets`:
  `{{skillsetName}}: "{{source}}@{{skillsetVersion}}"`
- Do NOT add individual skill, agent, or file names to the config
- The `skills` map is reserved for standalone skill installations

{{setupSection}}

## Step 7: Cleaning up (last step before Done)

Delete the download folder `{{downloadDir}}` and its contents.

## Rules

- Setup files are NOT installed — they contain instructions to configure the project
- Do not delete or modify existing files in the provider directory unless resolving a conflict
- Always delete the download folder when done
