#!/bin/bash
fp=$(jq -r '.tool_input.file_path')

# Normalize backslashes to forward slashes (Windows paths)
fp="${fp//\\//}"

case "$fp" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.scss|*.json|*.graphql)
    npx biome check --fix "$fp"
    ;;
esac
true
