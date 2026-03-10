# Git Rebase

Rebase current branch onto another branch.

## Steps

### Step 1: Fetch and confirm

```bash
git fetch origin
```

**Confirmation gate:** Show which branch the current branch will be rebased onto. If `-y` → proceed. Otherwise → ask "Rebase `<current>` onto `origin/<branch>`?" and wait.

### Step 2: Rebase

```bash
git rebase origin/<branch-name>   # default: main
```

### Step 3: Resolve conflicts (if any)

1. **Analyze both sides:**
   - Ours (HEAD) = your implemented changes
   - Theirs (incoming) = changes from target branch

2. **Resolve wisely:**
   - Keep your implementation logic intact
   - Integrate incoming changes (imports, renamed functions)
   - If code was refactored → apply your changes to new structure
   - If both modified same logic → combine intentions, prefer cleaner solution

3. **After resolving:**
   ```bash
   git add <resolved-file>
   git rebase --continue
   ```

4. **If stuck:** `git rebase --abort` and ask for help.

### Step 4: Report result

Inform the developer whether the rebase succeeded or if conflicts were resolved. Show the current branch status.
