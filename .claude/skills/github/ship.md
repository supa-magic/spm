# Ship

Ship experimental changes by analyzing your diff, creating a GitHub issue, branching, committing, and opening a PR.

If `-y` is passed, all sub-skill invocations inherit `-y`.

### Step 1: Verify branch and analyze changes

Verify the current branch is `main`:

```bash
git branch --show-current
```

If not on `main` — stop and tell the developer: "/github ship works only from the main branch. Switch to main first or use the individual skills (/github create issue, /git branch, /git commit, /github create pr)."

Check for changes:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Read the key changed files to understand the implementation. Focus on:

- New files added
- Significant modifications
- Patterns in the changes (new feature? fix? refactor?)

If there are no changes (no uncommitted and no staged changes) — stop and tell the developer there's nothing to ship.

### Step 2: Summarize and gather context

Present a concise summary to the developer:

- What was added/changed/fixed (2-3 bullet points)
- Files affected
- Type assessment: feature / bug fix / chore

**Confirmation gate:** Say "Here's what I see in your changes: [summary]. I'll create a GitHub issue from this." If `-y` → proceed. Otherwise → ask "Anything you want to add or correct?" and wait.

### Step 3: Create issue

Invoke `/github create issue` — use the change summary and developer input from Step 2 as context. Skip the initial "What do you want to build?" question and go directly to drafting the issue.

Use `[x]` (checked) for acceptance criteria since the work is already done.

Capture the **issue number** from the output.

### Step 4: Create branch

Invoke `/git branch <issue-number>` with the issue number from Step 3.

This creates a properly named branch and switches to it — uncommitted changes carry over.

### Step 5: Commit

Invoke `/git commit` to commit the changes on the new branch.

### Step 6: Create PR

Invoke `/github create pr` — it reads the issue number from the branch name and generates the PR title and description.

### Step 7: Output

Show the results:

```
🚀 Shipped!

Issue:  <issue-url>
PR:     <pr-url>
Branch: <branch-name>
```
