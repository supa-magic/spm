# Coding Conventions

## Scope

These rules apply to ALL code in the repository.

## General Principles

- Prioritize readability, maintainability, and simplicity
- Prefer concise solutions: less code, fewer abstractions
- Favor functional and declarative patterns; avoid classes
- Keep functions under 200 lines; split into smaller units
- Avoid deep nesting (3+ levels)
- Avoid over-engineering: unnecessary abstractions, premature generalization
- Windows compatibility: use forward slashes in glob patterns — `path.join` produces backslashes on Windows which breaks glob libraries. Use `path.join` only for non-glob filesystem paths

## TypeScript

- Strict mode enabled
- Use `type` over `interface`
- Avoid `any`, type assertions (`as`, `!`), and enums (use objects or maps)
- `unknown` is acceptable only at system boundaries (user input, external APIs)

### Type Safety

**NEVER use type assertions (`as`, `!`)** — they bypass type checking.

When TypeScript complains about types:

1. Don't force it with `as` — the error is telling you something
2. Fix the root cause: use correct types from the source
3. Create typed helpers if needed, but use proper types in the signature

## Code Style

- Use `const` and immutability; avoid `let`
- Always use arrow functions — avoid `function` declarations
- Use implicit return (no `return` keyword) when the body is a single expression
- Arrow functions (`const`) don't hoist — declare before use
- Avoid `for`/`for...of` loops — prefer chaining array methods (`.map`, `.filter`, `.reduce`, `Object.fromEntries`, etc.)
- Minimize `if-else` and `switch`; prefer early returns
- No comments unless explaining workarounds or non-obvious logic
- Use descriptive naming instead of comments

## Imports

- Never use file extensions in imports — write `'./foo'` not `'./foo.js'` or `'./foo.ts'`
- All source code is TypeScript — the bundler resolves `.ts`/`.tsx` files without extensions

## Naming Conventions

- **Files/folders**: kebab-case (`user-profile.ts`)
- **Variables**: descriptive with auxiliary verbs (`isLoaded`, `hasError`)
- **Exports**: favor named exports
- Avoid redundant naming: `user.id` not `user.userId`

## Examples

### Arrow Functions

```ts
// Prefer
const getUser = (id: string) => users.find(u => u.id === id)

// Avoid
function getUser(id: string) {
  return users.find(u => u.id === id)
}

const getUser = (id: string) => {
  return users.find(u => u.id === id)
}
```
