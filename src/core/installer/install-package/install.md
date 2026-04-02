# Package Integration

You are integrating a new package into the project. Analyze the existing project setup and intelligently integrate the new files.

## Context

- **Provider directory**: `{{providerDir}}`
- **Package**: `{{packageName}}` v`{{packageVersion}}`
- **Type**: {{packageType}}
- **Install directory**: `{{installDir}}`

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
  • hooks: retro-game-sounds (6 files)

Detecting conflicts...
  • No conflicts

Integrating...
  • hooks/retro-game-sounds/player.mjs
  • hooks/retro-game-sounds/complete.wav

Running setup...
  • Configured hook events

Done

{{embeddedSection}}

## Step 1: Analyzing existing setup

Review the existing files list above and catalog what is already in place: skills, rules, agents, hooks files.
Do NOT use Read or Glob to scan the provider directory — all information is provided above.

## Step 2: Analyzing downloaded files

Review the downloaded files listed above. These are the only files that need to be installed.
Do NOT use Read or Glob to scan the download directory — all file contents are provided above.

## Step 3: Detecting conflicts

Using the existing files list and downloaded files above, check if any downloaded file conflicts with an existing file.

- **No existing file** → install as new
- **Different content** → replace silently
- **Same content** → skip (should already be pruned)

If there is a real conflict (same path, user has customized the existing file):

Detecting conflicts...
  • rules/coding.md — local has custom rules
  • Choose: (r)eplace / (s)kip / (m)erge

Wait for response before proceeding.

## Step 4: Integrating

Write each downloaded file to `{{installDir}}` using the Write tool. Use the exact content provided above.

**Integrate, don't copy.** When a new file can leverage existing project conventions, adapt it:

- If the project has `rules/coding.md` with specific conventions → make new files follow those rules instead of their own defaults
- If existing skills handle branching or committing → reference them instead of duplicating instructions
- If the project has naming conventions, testing patterns, or architectural rules → align new files with them

{{setupSection}}

## Rules

- Setup files are NOT installed — they contain instructions to configure the project
- Do not delete or modify existing files in the provider directory unless resolving a conflict
- Do NOT read files from disk — all content is embedded in this prompt
- Do NOT delete the download folder — cleanup is handled externally
