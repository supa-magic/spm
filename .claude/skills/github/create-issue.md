# Create Issue

Conversational workflow to create a well-structured GitHub issue. No arguments — guide the developer from rough idea to polished ticket.

### Step 1: Greet and ask

Say this (or similar):

> What do you want to build or fix? Just describe it in your own words — rough notes, bullet points, stream of consciousness — anything works. I'll shape it into a proper issue.

Wait for the developer's response. Do NOT proceed until they reply.

### Step 2: Refine and expand

Take the developer's raw input and:

- Fix grammar, spelling, phrasing
- Expand vague ideas into clear, specific acceptance criteria
- Identify potential implied requirements (edge cases, error handling, UX) and confirm with the developer
- Determine type: `feature` / `bug` / `chore`
- If the description is too vague to form acceptance criteria, ask targeted follow-up questions before proceeding

After processing the input, ask:

> Anything else you want to add before I put the issue together?

Wait for the developer's response. If they add more details, incorporate them and repeat this question. Once they confirm there's nothing else, proceed to Step 3.

### Step 3: Present draft and confirm

Show the fully formatted issue:

```
## Title
<noun phrase describing the subject, not a verb — e.g. "User profile validation" not "Implement user profile validation">

## Labels
<feature|bug|chore, plus any extras>

## Description
<clear summary of what and why>

## Acceptance Criteria
- [ ] <testable item>
- [ ] ...

## Technical Notes (optional)
<implementation hints, affected areas, or constraints>
```

**Confirmation gate:** If `-y` → proceed to create. Otherwise → ask "Want to change anything, or should I create it?" and wait. If the developer requests changes, apply them, re-present the draft, and ask again. Loop until confirmed.

### Step 4: Create issue

Create the issue using `gh`:

```bash
gh issue create --title "<title>" --body "$(cat <<'EOF'
## Description

<description>

## Acceptance Criteria

- [ ] <criteria>

## Technical Notes

<notes or "N/A">
EOF
)" --label "<labels>"
```

If label creation fails (label doesn't exist), create it first:

```bash
gh label create "<label>" --description "<description>"
```

Then retry the issue creation.

### Step 5: Output

Show the issue URL returned by `gh issue create`.
