# Git Squash

Squash all commits on the current branch into clean commit(s) via `/git commit`.

## Steps

### Step 1: Identify base branch

```bash
git branch --show-current
```

Determine the base branch by checking which branch the current branch diverged from:

```bash
git merge-base main HEAD
```

If `main` doesn't exist, try `master`. If neither works, ask the user.

### Step 2: Show what will be squashed

List all commits that will be squashed:

```bash
git log --oneline <merge-base>..HEAD
```

**Confirmation gate:** Show the commit count and list. If `-y` → proceed. Otherwise → ask "Squash these N commits?" and wait.

### Step 3: Soft reset to base

Reset all commits while keeping changes staged:

```bash
git reset --soft <merge-base>
```

This undoes all commits on the branch but preserves every change in the working tree as staged.

### Step 4: Unstage all files

```bash
git reset HEAD
```

This moves all changes from staged to unstaged, so `/git commit` can analyze and group them fresh.

### Step 5: Run `/git commit`

Invoke the `/git commit` skill to analyze all changes and create clean, well-grouped commit(s) with proper messages.
