# Git Commit

Smart commit with auto-grouping of changes.

## Commit Message Format

Structure: `<emoji><type>(<scope>): <description>`

| Emoji | Type | Use for |
|-------|------|---------|
| 📦 | feat | New feature |
| 🛠️ | fix | Bug fix |
| 🔨 | refactor | Code change that neither fixes bug nor adds feature |
| 🚀 | perf | Performance or optimization |
| 🧪 | test | Adding or updating tests |
| 🎨 | style | Formatting, whitespace (no code logic change) |
| 📃 | docs | Documentation only |
| 🧹 | chore | Maintenance, dependencies update |
| ✨ | ai | AI related changes |
| 🏗️ | build | Build system, external dependencies |
| ⚙️ | ci | CI/CD configuration |
| 🎏 | merge | Git branch merge |
| 🔙 | revert | Revert previous commit |

Rules:
- `<type>` = required, lowercase
- `<scope>` = optional, lowercase, component/feature name
- `<description>` = required, max 50 chars, imperative mood, lowercase start
- `<body>` = optional, explain what and why (not how)
- `<footer>` = optional, references (e.g., `Closes #123`)
- Breaking change: add `!` after type, e.g. `feat!: remove deprecated API`

Examples: `📦feat(auth): add login screen`, `🛠️fix(build): correct asset copy path`, `🧹chore: update lynx sdk to 3.7.0`

## Steps

### Step 1: Check branch name

Verify current branch follows naming convention (`<type>/<issue>/<description>`).
If invalid → warn user before proceeding.

### Step 2: Analyze changes

| Scenario | Action |
|----------|--------|
| Files already staged | Commit staged files only |
| No files staged | Analyze all changes, group, create separate commits |

Analyze git changes and create a commit message. Use present tense and explain "why" something has changed, not just "what" has changed.

### Step 3: Group changes by

- Feature/component
- Type (tests, styles, refactor)

### Step 4: Create commit(s)

Use the message format above.

**Confirmation gate:** Show the planned commit message(s) and files. If `-y` → proceed. Otherwise → ask "Proceed with commit?" and wait.

### Step 5: Report result

Show the developer the commit SHA(s) and message(s) created.
