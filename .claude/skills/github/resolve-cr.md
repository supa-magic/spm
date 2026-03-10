# GitHub Resolve CR

Address code review feedback on a pull request.

## Steps

### Step 1: Resolve PR number

- If provided as argument → use it
- If not provided → detect from current branch: `gh pr view --json number 2>/dev/null`
- If no PR found → prompt user and **wait for response**

### Step 2: Fetch PR review comments

```bash
gh pr view <pr-number> --json number,url,reviews,comments
gh api repos/{owner}/{repo}/pulls/<pr-number>/comments
```

Fetch thread resolution status to filter out already-resolved threads:

```bash
gh api graphql -f query='query { repository(owner: "<owner>", name: "<repo>") { pullRequest(number: <pr-number>) { reviewThreads(first: 50) { nodes { id isResolved comments(first: 5) { nodes { body author { login } } } } } } } }'
```

Only present **unresolved** top-level reviewer comments. Skip already-resolved threads and self-authored reply confirmations.

Identify automated reviewers (e.g., `copilot-pull-request-reviewer`, bots) vs human reviewers by checking the author login.

### Step 3: Evaluate each comment

Determine if comment should be fixed or skipped based on:

- Does it affect correctness, security, or architecture?
- Does it align with `.claude/rules/coding.md`?
- Is it a minor style preference with no impact? → skip

### Step 4: Present list to developer

Group comments by source: human reviewers first, then automated. Automated reviewer comments are typically lower priority.

Display all comments in this format:

```
👤 Human reviewers:

#1 👌[FIX] Use shared Button component
   Reviewer asks: Replace custom button with @repo/ui Button
   Reason: Aligns with reusability standards, shared components exist

#2 👌[FIX] Add error handling
   Reviewer asks: Handle API error case in fetchUser()
   Reason: Missing error handling could cause runtime crashes

🤖 Automated reviewers:

#3 👎[SKIP] Rename variable
   Reviewer asks: Rename 'x' to more descriptive name
   Reason: Minor naming preference, doesn't affect code quality
```

If there are no comments from one group, omit that section header.

**Wait for developer response.** Developer specifies which to fix or skip (e.g., "fix 1,3 skip 2" or "fix all" or "skip 1").

### Step 5: Implement fixes

**Confirmation gate:** Show the developer what changes you plan to make. If `-y` → proceed. Otherwise → wait for approval before committing or pushing.

### Step 6: Post replies and resolve threads

After fixes are committed, reply to every comment — both human and automated (Copilot, bots). Never resolve a thread without a reply.

#### Thread resolution rules

- **Human reviewer threads** → reply only, do **NOT** resolve. The reviewer resolves their own threads.
- **Automated reviewer threads** (Copilot, bots) → reply **and** resolve.

| Action   | Reply format                                                            |
| -------- | ----------------------------------------------------------------------- |
| **FIX**  | "Applied — fixed in `<sha>`: <what changed>"                           |
| **SKIP** | "Skipped — <reason why the suggestion doesn't apply or is unnecessary>" |

Reply to comment via API:

```bash
gh api repos/{owner}/{repo}/pulls/<pr-number>/comments -f body="<reply message>" -F in_reply_to=<comment-id>
```

Resolve automated thread via API:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<thread_id>"}) { thread { isResolved } } }'
```

### Step 7: Output summary

- Fixed: list with changes made and commit SHAs
- Skipped: list with reasons posted
- Resolved: count of automated threads resolved
