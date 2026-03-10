# GitHub Create PR

Create a new pull request with description from GitHub issue.

## Steps

### Step 1: Resolve issue number

See [rules.md](rules.md) > Resolving Issue Number.

### Step 2: Fetch GitHub issue

```bash
gh issue view <number>
```

Get issue title, description, and labels.

### Step 3: Analyze current branch

```bash
git log main..HEAD --oneline
git diff main..HEAD --stat
```

### Step 4: Generate PR title

See [rules.md](rules.md) > PR Title Format.

### Step 5: Generate PR description

Use [pull_request_template.md](../../../.github/pull_request_template.md) as the structure.

Fill in each section based on the GitHub issue and branch analysis.

### Step 6: Confirm and create PR

**Confirmation gate:** Show the PR title, target branch, and commit count. If `-y` → proceed. Otherwise → ask "Push and create PR?" and wait.

```bash
gh pr create --title "<title>" --body "<description>"
```

### Step 7: Output the PR URL

Show the PR URL returned by `gh pr create` to the developer.
