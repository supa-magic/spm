---
name: implement
description: Feature implementation workflow. Use when developer wants to implement a feature or fix - creates branch, plans, and implements.
user-invocable: true
argument-hint: <issue-number> [-y]
---

# /implement $ARGUMENTS

Feature implementation workflow — from issue to PR.

## Usage

```
/implement
    <issue-number>        Implement GitHub issue (e.g., /implement 12)
    <issue-number> -y     Implement with auto-confirm (auto-commit and PR)

    -y, --yes             Skip confirmations
```

**If no issue number provided:** Ask the developer for the issue number. Do not proceed without one.

If `-y` is active, all sub-skill invocations inherit auto-confirm.

---

## Resume Detection

Before starting the workflow, check if a progress file exists:

```
.claude/progress/<feature-slug>.md
```

**If progress file exists:**

1. Read the progress file
2. Ensure the current branch matches the branch in the progress file. If not, switch to it.
3. Show the developer a summary:
   > "Found progress for `<feature>`:
   >
   > - Completed: <list completed plan items>
   > - Remaining: <list incomplete plan items>
   >   Continue?"
4. Wait for developer response
5. If confirmed → recreate todo list from the progress file (mark completed items as done), continue from the first unchecked plan item in Step 4. If all plan items are done, go to Step 5.
6. If declined → ask if they want to start fresh (this deletes the progress file)

**If no progress file exists**, check git history for prior session work:

1. If the current branch has relevant commits, run `git log main..HEAD --oneline` and `git diff main..HEAD --stat`
2. If there are commits (especially "wip" commits) with relevant changes, summarize what was already done
3. Show the developer a summary and ask which workflow step to resume from
4. If no prior work is found → proceed with Step 1.

---

## Instructions

### Step 1: Understand Requirements

Fetch the issue details:

```bash
gh issue view <issue-number>
```

Extract requirements and acceptance criteria.

### Step 2: Setup Branch

Check current branch:

```bash
git branch --show-current
```

**If already on a feature branch for this work** → skip to Step 3.

**Otherwise:**

1. Check for uncommitted changes:

   ```bash
   git status
   ```

2. If changes exist, stash them:

   ```bash
   git stash -u
   ```

3. Create new branch using `/git branch`

4. If changes were stashed, restore them:

   ```bash
   git stash pop
   ```

### Step 3: Plan

1. Create todo list using TaskCreate tool
2. Share plan with developer and ask:

> "Before I start:
>
> 1. Any specific instructions or context? (approach, files to reference, constraints)
> 2. How would you like to work?
>    - **Auto** — I implement all plan items, then ask you to verify
>    - **Pair programming** — I implement one plan item at a time, you review each before I continue"

**Confirmation gate:** If `-y` → default to Auto mode and proceed. Otherwise → wait for response before continuing.

#### Save Progress

After the developer responds, create the progress file at `.claude/progress/<feature-slug>.md`.

The plan items are the **implementation tasks** from the todo list — the actual work items, not the workflow steps.

```markdown
# Progress: <feature>

## Mode

<auto | pair>

## Branch

<current-branch-name>

## Requirements

<requirements summary>

## Plan

- [ ] <plan item 1>
- [ ] <plan item 2>
- [ ] <plan item 3>
- ...

## Developer Notes

<any instructions or context the developer provided>
```

### Step 4: Implement

- Use context7 MCP for current library documentation when needed
- Implement feature/fix based on requirements
- Follow `.claude/rules/coding.md` for all coding conventions

#### Auto Mode

Implement all plan items sequentially without pausing. After each item, update the progress file — mark the plan item as `[x]`. After all items are done, proceed to Step 5.

#### Pair Programming Mode

For each plan item:

1. Implement the plan item
2. Show the developer what was done
3. **Wait for developer confirmation** before continuing
4. If developer requests changes → refine, then ask again
5. If confirmed → update the progress file — mark item as `[x]`, move to the next plan item

After all items are done, proceed to Step 5.

### Step 5: Developer Verification

**Confirmation gate:** If `-y` → proceed to Step 6. Otherwise → ask:

> "All plan items are implemented. Please test the feature and let me know:
>
> 1. **All good** — continue to commit
> 2. **Needs changes** — describe what to fix/refine"

Wait for response. If needs changes → apply fixes, update progress file, ask again.

### Step 6: Commit & PR

**Confirmation gate:** If `-y` → invoke `/git commit` and `/github create pr`, then proceed to Step 7. Otherwise → ask:

> "Would you like to commit the changes and create a PR?"

- **If yes** → invoke `/git commit`, then `/github create pr`
- **If no** → proceed to Cleanup

### Cleanup

After all steps are complete, **delete** the progress file:

```
.claude/progress/<feature-slug>.md
```
