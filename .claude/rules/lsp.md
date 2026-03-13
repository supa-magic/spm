# LSP for Code Navigation (MANDATORY)

## Code Symbols — ALWAYS use LSP, NEVER Grep/Glob

- **goToDefinition** — find where a symbol is defined
- **findReferences** — find all usages of a symbol
- **hover** — check types, signatures, or documentation
- **goToImplementation** — find concrete implementations
- **documentSymbol** — list all symbols in a file
- **workspaceSymbol** — search for a symbol across the workspace
- **incomingCalls / outgoingCalls** — trace call chains
- **prepareCallHierarchy** — entry point for call hierarchy analysis

### Fallback chain (stay within LSP)

1. `goToDefinition` → `workspaceSymbol` → `documentSymbol`
2. `findReferences` → `workspaceSymbol`

### Practical rules

- Always use absolute paths — LSP rejects relative paths
- Line and character are 1-based
- Use `hover` before changing function signatures
- Use `findReferences` before renaming or removing exports

## Grep/Glob — ONLY for non-code text

String literals, comments, config values, file name patterns, error messages.
