# Skillset Integration

You are integrating a new skillset into the project. Analyze the existing project setup and intelligently integrate the new files.

## Context

- **Provider directory**: `{{providerDir}}`
- **Skillset**: `{{skillsetName}}` v`{{skillsetVersion}}`

Identical files have already been removed. Only files that need action are listed below. If no downloaded files are listed, output `Done` immediately.

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
5. `Running setup...` (only if a setup file exists)
6. `Done`

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

Running setup...
  • Configured MCP server: biome

Done

{{embeddedSection}}

## Step 1: Analyzing existing setup

Review the existing files list above and catalog what is already in place: skills, rules, agents, hooks, mcp servers files.
Do NOT use Read or Glob to scan the provider directory — all information is provided above.

## Step 2: Analyzing downloaded files

Review the downloaded files listed above. These are the only files that need to be installed.
Do NOT use Read or Glob to scan the download directory — all file contents are provided above.

## Step 3: Detecting conflicts

Using the existing files list and downloaded files above, check if any downloaded file conflicts with an existing file.

- **No existing file** → install as new
- **Different skillset version** → replace silently (new version supersedes)
- **Same version or no version info** → conflict — ask the user:

Detecting conflicts...
  • rules/coding.md — local has custom rules
  • Choose: (r)eplace / (s)kip / (m)erge

Wait for response before proceeding.

## Step 4: Integrating

Write each downloaded file to `{{providerDir}}` using the Write tool, following the directory structure from the file paths. Use the exact content provided above.

**Integrate, don't copy.** When a new skill can leverage existing project conventions, adapt it:

- If the project has `rules/coding.md` with specific conventions → make new skills follow those rules instead of their own defaults
- If existing skills handle branching or committing → reference them instead of duplicating instructions
- If the project has naming conventions, testing patterns, or architectural rules → align new skills with them

{{setupSection}}

## Rules

- Setup files are NOT installed — they contain instructions to configure the project
- Do not delete or modify existing files in the provider directory unless resolving a conflict
- Do NOT read files from disk — all content is embedded in this prompt
- Do NOT delete the download folder — cleanup is handled externally
