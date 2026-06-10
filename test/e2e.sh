#!/usr/bin/env bash
# End-to-end tests for create-turbo-shadcn
# Usage: bash test/e2e.sh [scaffold|auto|all]

set -o pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIN="node $ROOT_DIR/bin/cli.js"
# Use $HOME instead of /tmp — /tmp is a small tmpfs (3.6GB) that runs out
# of space during full next.js / bun installs.
TEST_DIR="${TEST_DIR:-$HOME/.cache/create-turbo-shadcn-e2e}"
PASS=0
FAIL=0

green()  { printf "\033[32m  ✓ %s\033[0m\n" "$*"; }
red()    { printf "\033[31m  ✗ %s\033[0m\n" "$*"; }
header() { printf "\n\033[1;36m=== %s ===\033[0m\n" "$*"; }

check_file() {
  local name="$1" file="$2"
  if [ -f "$file" ]; then green "$name"; PASS=$((PASS + 1))
  else red "$name (missing: $file)"; FAIL=$((FAIL + 1)); fi
}

check_grep() {
  local name="$1" pattern="$2" file="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then green "$name"; PASS=$((PASS + 1))
  else red "$name"; FAIL=$((FAIL + 1)); fi
}

cleanup() { rm -rf "$TEST_DIR"; }

mkdir -p "$TEST_DIR"
cd "$TEST_DIR" || exit 1

run_bin() {
  $BIN "$@" 2>&1 | tail -3
}

# ── npm ──
test_npm() {
  header "npm"
  rm -rf test-npm
  run_bin test-npm -p npm
  check_file "package.json"              test-npm/package.json
  check_file "components.json"           test-npm/packages/ui/components.json
  check_grep "root ui script"            'npm -w @repo/ui run ui'   test-npm/package.json
  check_grep "shadcn-add uses npx"       'npx shadcn@latest'         test-npm/packages/ui/scripts/shadcn-add.mjs
  (cd test-npm && npm install --silent 2>&1 | tail -1)
  (cd test-npm && npm run ui accordion 2>&1 | tail -3)
  check_file "accordion.tsx created"     test-npm/packages/ui/src/components/ui/accordion.tsx
}

# ── pnpm ──
test_pnpm() {
  header "pnpm"
  rm -rf test-pnpm
  run_bin test-pnpm -p pnpm
  check_file "package.json"               test-pnpm/package.json
  check_file "components.json"            test-pnpm/packages/ui/components.json
  check_grep "root ui script"             'pnpm --filter @repo/ui ui' test-pnpm/package.json
  check_grep "shadcn-add uses pnpm dlx"   'pnpm dlx shadcn@latest'    test-pnpm/packages/ui/scripts/shadcn-add.mjs
  (cd test-pnpm && pnpm install --silent 2>&1 | tail -1)
  (cd test-pnpm && pnpm ui accordion 2>&1 | tail -3)
  check_file "accordion.tsx created"      test-pnpm/packages/ui/src/components/ui/accordion.tsx
}

# ── yarn ──
test_yarn() {
  header "yarn"
  rm -rf test-yarn
  run_bin test-yarn -p yarn
  check_file "package.json"               test-yarn/package.json
  check_file "components.json"            test-yarn/packages/ui/components.json
  check_grep "root ui script"             'yarn workspace @repo/ui ui' test-yarn/package.json
  check_grep "shadcn-add uses npx"        'npx shadcn@latest'          test-yarn/packages/ui/scripts/shadcn-add.mjs
  (cd test-yarn && yarn install --silent 2>&1 | tail -1)
  (cd test-yarn && yarn ui accordion 2>&1 | tail -3)
  check_file "accordion.tsx created"      test-yarn/packages/ui/src/components/ui/accordion.tsx
}

# ── bun ──
test_bun() {
  header "bun"
  rm -rf test-bun
  run_bin test-bun -p bun
  check_file "package.json"               test-bun/package.json
  check_file "components.json"            test-bun/packages/ui/components.json
  check_grep "root ui script"             'bun --filter @repo/ui ui'  test-bun/package.json
  check_grep "shadcn-add uses bunx --bun" 'bunx --bun shadcn@latest'  test-bun/packages/ui/scripts/shadcn-add.mjs
  (cd test-bun && bun install --silent 2>&1 | tail -1)
  (cd test-bun && bun ui accordion 2>&1 | tail -3)
  check_file "accordion.tsx created"      test-bun/packages/ui/src/components/ui/accordion.tsx
}

# ── auto-detect ──
test_auto() {
  header "auto-detect"

  rm -rf test-auto-pnpm
  env npm_config_user_agent="pnpm/11.5.2 npm/? node/v24.7.0 linux x64" \
    $BIN test-auto-pnpm --no-install > /dev/null 2>&1
  check_grep "pnpm detect"  'pnpm --filter @repo/ui ui'  test-auto-pnpm/package.json

  rm -rf test-auto-yarn
  env npm_config_user_agent="yarn/1.22.22 npm/? node/v24.7.0 linux x64" \
    $BIN test-auto-yarn --no-install > /dev/null 2>&1
  check_grep "yarn detect"  'yarn workspace @repo/ui ui'  test-auto-yarn/package.json

  rm -rf test-auto-bun
  env npm_config_user_agent="bun/1.2.21 npm/? node/v24.7.0 linux x64" \
    $BIN test-auto-bun --no-install > /dev/null 2>&1
  check_grep "bun detect"   'bun --filter @repo/ui ui'   test-auto-bun/package.json

  rm -rf test-auto-npm
  env npm_config_user_agent="npm/11.12.1 node/v24.7.0 linux x64" \
    $BIN test-auto-npm --no-install > /dev/null 2>&1
  check_grep "npm detect"   'npm -w @repo/ui run ui'     test-auto-npm/package.json
}

# ── runner ──
case "${1:-all}" in
  npm)   test_npm ;;
  pnpm)  test_pnpm ;;
  yarn)  test_yarn ;;
  bun)   test_bun ;;
  auto)  test_auto ;;
  scaffold) test_npm; test_pnpm; test_yarn; test_bun ;;
  all|*) test_npm; test_pnpm; test_yarn; test_bun; test_auto ;;
esac

# ── summary ──
echo ""
echo "=============================="
printf "Passed: %d  Failed: %d\n" "$PASS" "$FAIL"
if [ "$FAIL" -eq 0 ]; then
  green "All tests passed!"
  exit 0
fi
red "$FAIL test(s) failed"
exit 1
