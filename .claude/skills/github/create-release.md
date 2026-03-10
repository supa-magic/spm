# GitHub Create Release

Create a GitHub release with auto-generated notes from commits since the last tag.

## Steps

### Step 1: Validate

1. Ensure current branch is `main`:

```bash
git branch --show-current
```

If not on `main` → warn and abort.

2. Ensure working tree is clean:

```bash
git status --porcelain
```

If dirty → warn and abort.

### Step 2: Determine version

Read the current version from `package.json`:

```bash
node -p "require('./package.json').version"
```

If version is provided as argument → use it. Otherwise, calculate the next patch, minor, and major versions from the current version and ask the developer to choose:

> Current version: `<current>`
>
> 1. **Patch** → `<x.y.z+1>` (bug fixes)
> 2. **Minor** → `<x.y+1.0>` (new features)
> 3. **Major** → `<x+1.0.0>` (breaking changes)

**Wait for response.**

### Step 3: Bump version, commit, and push

```bash
npm version <patch|minor|major> --no-git-tag-version
```

Ensure tag doesn't already exist:

```bash
git tag -l "v<version>"
```

If tag exists → warn and abort.

**Confirmation gate:** Show the version bump (`<current>` → `<version>`). If `-y` → proceed. Otherwise → ask "Commit and push version bump?" and wait.

```bash
git add package.json package-lock.json
git commit -m "🧹chore: bump version to <version>"
git push
```

### Step 4: Find previous tag

```bash
git describe --tags --abbrev=0 2>/dev/null
```

If no previous tag → use first commit as base.

### Step 5: Analyze commits

```bash
git log <prev_tag>..HEAD --oneline
```

Categorize each commit by its emoji prefix into the matching section in the template below. For each commit, include the short description. If a commit references an issue or PR (e.g., `#12`, `Closes #12`), include the reference.

### Step 6: Get contributors

```bash
git log <prev_tag>..HEAD --format='%aN' | sort -u
```

### Step 7: Get repo info

```bash
gh repo view --json nameWithOwner --jq '.nameWithOwner'
```

### Step 8: Generate release notes

Write a short description (1-2 sentences) summarizing the release based on the commits.

Use this template:

```markdown
# Release v<version>

<short_description>

---

### ✨ Highlights

- <key highlight 1>
- <key highlight 2>

---

### 🚀 Features

- <description> (<ref>)

### 🐛 Bug Fixes

- <description> (<ref>)

### ⚡ Performance

- <description>

### ♻️ Refactoring

- <description>

### 🧪 Tests

- <description>

### 📑 Documentation

- <description>

### 🔧 Maintenance

- <description>

---

### 🧩 Contributors

Thanks to everyone who contributed ❤️

<contributors as @mentions>

---

### 🔗 Full Changelog

https://github.com/<owner>/<repo>/compare/<prev_tag>...v<version>
```

**Rules:**
- Only include sections that have entries — omit empty sections
- Highlights should summarize the most important 2-3 changes
- If this is the first release (no previous tag), use "Initial release" as the changelog link text

### Step 9: Confirm and create release

**Confirmation gate:** Show the full release notes to the developer. If `--draft` is passed, mention it will be created as a draft. If `-y` → proceed. Otherwise → ask "Create release?" and wait.

```bash
gh release create v<version> --title "v<version>" --notes "<notes>" [--draft]
```

If `--draft` is passed → add the `--draft` flag.

### Step 10: Output the release URL

Show the release URL returned by `gh release create` to the developer.
