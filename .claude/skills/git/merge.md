# Git Merge

Merge a branch into the current branch.

## Steps

### Step 1: Fetch and confirm

```bash
git fetch origin
```

**Confirmation gate:** Show which branch will be merged into the current branch. If `-y` → proceed. Otherwise → ask "Merge `origin/<branch>` into `<current>`?" and wait.

### Step 2: Merge

```bash
git merge origin/<branch-name>   # default: main
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
   git commit
   ```

4. **If stuck:** `git merge --abort` and ask for help.

### Step 4: Report result

Inform the developer whether the merge succeeded or if conflicts were resolved. Show the current branch status.
