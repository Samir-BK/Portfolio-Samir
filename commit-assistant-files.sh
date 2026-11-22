#!/usr/bin/env bash
set -euo pipefail

mode=${1:---plan}
if [[ $# -gt 1 || ( "$mode" != --plan && "$mode" != --apply ) ]]; then
  printf 'Usage: bash %s [--plan|--apply]\n' "$0" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"
if [[ "$(git branch --show-current)" != main ]]; then
  printf 'Run this from the Portfolio repository on main.\n' >&2
  exit 1
fi
migration='prisma/migrations/20261120010000_portfolio_assistant/migration.sql'
staged=$(git diff --cached --name-only)
if [[ -n "$staged" ]] &&
   { [[ "$staged" != "$migration" ]] || ! git diff --quiet -- "$migration"; }; then
  printf 'The index has staged changes outside the expected resume state. Review them before running this script.\n' >&2
  exit 1
fi

check_whitespace() {
  local file=$1
  shift
  if [[ "$file" == "$migration" ]]; then
    # Preserve the applied migration checksum, including its final blank line.
    git -c core.whitespace=-blank-at-eof diff --check "$@" -- "$file"
  else
    git diff --check "$@" -- "$file"
  fi
}

pending_paths=()
pending_messages=()
while IFS='|' read -r path message; do
  if [[ ! -f "$path" || -L "$path" ]]; then
    printf 'Missing or unexpected file: %s\n' "$path" >&2
    exit 1
  fi
  if git ls-files --error-unmatch -- "$path" >/dev/null 2>&1; then
    if git diff --quiet HEAD -- "$path"; then
      continue
    fi
    check_whitespace "$path" HEAD
  elif git check-ignore -q -- "$path"; then
    printf 'Refusing to stage an ignored file: %s\n' "$path" >&2
    exit 1
  fi
  pending_paths+=("$path")
  pending_messages+=("$message")
  printf '%s  |  %s\n' "$path" "$message"
done <<'COMMITS'
prisma/schema.prisma|feat(db): define portfolio assistant models
prisma/migrations/20261120010000_portfolio_assistant/migration.sql|feat(db): add portfolio assistant migration
src/server/db.ts|refactor(db): expose a transaction helper for assistant writes
src/server/content.ts|refactor(content): share published content filters
src/lib/chat.ts|feat(chat): define chat events and citation paths
src/server/chat/retrieval.ts|feat(chat): rank published portfolio evidence
src/server/chat/profile.ts|feat(chat): define approved homepage knowledge sources
prisma/chat-profile.ts|feat(db): add approved profile sync command
src/server/chat/knowledge.ts|feat(chat): load approved portfolio knowledge
src/server/chat/config.ts|feat(chat): validate server-side assistant configuration
src/server/chat/limits.ts|feat(chat): enforce shared usage and concurrency limits
src/server/chat/answer.ts|feat(chat): validate grounded claims and citations
package.json|build: add Groq SDK and assistant commands
pnpm-lock.yaml|build: lock the Groq SDK dependency
src/server/chat/provider.ts|feat(chat): generate and verify answers with Groq
src/server/chat/handler.ts|feat(chat): validate requests and stream verified answers
src/app/api/chat/route.ts|feat(chat): expose the same-origin chat endpoint
src/components/sections/portfolio-chat.tsx|feat(ui): add the portfolio chat terminal
src/app/home.css|style(ui): style the responsive assistant terminal
src/components/sections/hero.tsx|feat(ui): integrate the assistant into the homepage
.env.example|docs: document server-side assistant environment variables
tests/chat-evaluation.mjs|test(chat): add representative portfolio questions
tests/chat.integration.mjs|test(chat): cover retrieval, Groq transport, and usage limits
.github/workflows/ci.yml|ci: run assistant integration checks
docs/assistant.md|docs: explain assistant setup and operating limits
README.md|docs: document the portfolio assistant
docs/architecture.md|docs: describe the assistant architecture
docs/development-roadmap.md|docs: update assistant milestone status
AGENTS.md|docs: update assistant milestone guidance
COMMITS

if [[ "$mode" == --plan ]]; then
  printf '\nPreview only. Run with --apply to create the commits.\n'
  exit 0
fi

for ((i = 0; i < ${#pending_paths[@]}; i++)); do
  path=${pending_paths[i]}
  git add -- "$path"
  check_whitespace "$path" --cached
  git commit -m "${pending_messages[i]}" -- "$path"
done

git status --short
