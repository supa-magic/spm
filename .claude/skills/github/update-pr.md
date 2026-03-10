# GitHub Update PR

Update an existing PR's title and description from GitHub issue.

## Steps

### Step 1: Resolve PR number

- If provided as argument → use it
- If not provided → detect from current branch: `gh pr view --json number 2>/dev/null`
- If no PR found → prompt user and **wait for response**

### Step 2: Resolve issue number

Extract from PR branch name (see [rules.md](rules.md) > Resolving Issue Number).

### Step 3: Fetch GitHub issue

```bash
gh issue view <number>
```

Get issue title, description, and labels.

### Step 4: Analyze current branch

```bash
git log main..HEAD --oneline
git diff main..HEAD --stat
```

### Step 5: Generate PR title

See [rules.md](rules.md) > PR Title Format.

### Step 6: Generate PR description

Use [pull_request_template.md](../../../.github/pull_request_template.md) as the structure.

Fill in each section based on the GitHub issue and branch analysis.

### Step 7: Confirm and update PR

**Confirmation gate:** Show the new PR title and summary of changes. If `-y` → proceed. Otherwise → ask "Update PR #<number>?" and wait.

```bash
gh pr edit <pr-number> --title "<title>" --body "<description>"
```

### Step 8: Output the PR URL

Show the PR URL returned by `gh pr edit` to the developer.
