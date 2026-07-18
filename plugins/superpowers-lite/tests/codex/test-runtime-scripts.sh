#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIND_POLLUTER="$REPO_ROOT/skills/systematic-debugging/find-polluter.sh"
STOP_SERVER="$REPO_ROOT/skills/brainstorming/scripts/stop-server.sh"

FAILURES=0
TEST_ROOT="$(mktemp -d)"
TEMP_PATHS=()

cleanup() {
  local candidate
  for candidate in "${TEMP_PATHS[@]}"; do
    if [[ "$candidate" == /tmp/brainstorm-runtime-* || "$candidate" == /tmp/brainstorm-link-* ]]; then
      if node -e "const fs=require('fs'); const p=process.argv[1]; process.exit(fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink() ? 0 : 1)" "$candidate" 2>/dev/null; then
        node -e "require('fs').unlinkSync(process.argv[1])" "$candidate"
      else
        rm -rf -- "$candidate"
      fi
    fi
  done
  rm -rf -- "$TEST_ROOT"
}
trap cleanup EXIT

pass() {
  echo "  [通过] $1"
}

fail() {
  echo "  [失败] $1"
  FAILURES=$((FAILURES + 1))
}

assert_status() {
  local actual="$1"
  local expected="$2"
  local description="$3"
  if [[ "$actual" -eq "$expected" ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    期望退出码：$expected"
    echo "    实际退出码：$actual"
  fi
}

assert_nonzero() {
  local actual="$1"
  local description="$2"
  if [[ "$actual" -ne 0 ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    期望非零退出码，实际为 0"
  fi
}

assert_contains() {
  local actual="$1"
  local expected="$2"
  local description="$3"
  if [[ "$actual" == *"$expected"* ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    期望包含：$expected"
    printf '    实际输出：%s\n' "$actual"
  fi
}

assert_not_contains() {
  local actual="$1"
  local unexpected="$2"
  local description="$3"
  if [[ "$actual" != *"$unexpected"* ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    不应包含：$unexpected"
  fi
}

npm() {
  local test_file="${!#}"
  printf '%s\0' "$test_file" >> "$NPM_CALLS"
  if [[ -n "${POLLUTER_FILE:-}" && "$test_file" == "$POLLUTER_FILE" ]]; then
    : > "$POLLUTION_TARGET"
  fi
  return 0
}
export -f npm

run_find_polluter() {
  local case_dir="$1"
  local pollution_check="$2"
  local pattern="$3"
  local output_file="$case_dir/output.log"
  (
    cd "$case_dir" || exit 99
    "$FIND_POLLUTER" "$pollution_check" "$pattern"
  ) > "$output_file" 2>&1
  local status=$?
  FIND_OUTPUT="$(<"$output_file")"
  FIND_STATUS="$status"
}

echo "find-polluter.sh 真实行为测试"

zero_case="$TEST_ROOT/zero"
mkdir -p "$zero_case/tests"
export NPM_CALLS="$zero_case/npm-calls"
export POLLUTION_TARGET="$zero_case/pollution"
unset POLLUTER_FILE
run_find_polluter "$zero_case" "$POLLUTION_TARGET" 'tests/*.test.js'
assert_nonzero "$FIND_STATUS" "零匹配时失败"
assert_contains "$FIND_OUTPUT" "未找到匹配的测试文件" "零匹配给出中文原因"

initial_case="$TEST_ROOT/initial"
mkdir -p "$initial_case/tests"
: > "$initial_case/tests/a.test.js"
: > "$initial_case/pollution"
export NPM_CALLS="$initial_case/npm-calls"
export POLLUTION_TARGET="$initial_case/pollution"
unset POLLUTER_FILE
run_find_polluter "$initial_case" "$POLLUTION_TARGET" 'tests/*.test.js'
assert_nonzero "$FIND_STATUS" "启动前已污染时失败"
assert_contains "$FIND_OUTPUT" "测试开始前已经存在" "启动前污染给出中文原因"
if [[ ! -s "$NPM_CALLS" ]]; then
  pass "启动前污染不会执行测试"
else
  fail "启动前污染不会执行测试"
fi

polluter_case="$TEST_ROOT/polluter"
mkdir -p "$polluter_case/tests"
: > "$polluter_case/tests/a clean.test.js"
: > "$polluter_case/tests/b polluter.test.js"
export NPM_CALLS="$polluter_case/npm-calls"
export POLLUTION_TARGET="$polluter_case/pollution"
export POLLUTER_FILE='./tests/b polluter.test.js'
run_find_polluter "$polluter_case" "$POLLUTION_TARGET" 'tests/*.test.js'
assert_nonzero "$FIND_STATUS" "找到污染者时以非零退出"
assert_contains "$FIND_OUTPUT" "找到污染源" "找到污染者时给出中文结论"
assert_contains "$FIND_OUTPUT" "./tests/b polluter.test.js" "报告真实污染测试文件"
assert_not_contains "$FIND_OUTPUT" "未找到污染源" "找到污染者后不输出错误的全清洁结论"

clean_case="$TEST_ROOT/clean"
mkdir -p "$clean_case/tests"
: > "$clean_case/tests/a clean.test.js"
newline_file=$'b line\nbreak.test.js'
: > "$clean_case/tests/$newline_file"
export NPM_CALLS="$clean_case/npm-calls"
export POLLUTION_TARGET="$clean_case/pollution"
unset POLLUTER_FILE
run_find_polluter "$clean_case" "$POLLUTION_TARGET" 'tests/*.test.js'
assert_status "$FIND_STATUS" 0 "全清洁时成功"
assert_contains "$FIND_OUTPUT" "未找到污染源" "全清洁时给出中文结论"
call_count="$(python3 - "$NPM_CALLS" <<'PY'
import pathlib
import sys

calls_file = pathlib.Path(sys.argv[1])
data = calls_file.read_bytes() if calls_file.exists() else b''
print(len([entry for entry in data.split(b'\0') if entry]))
PY
)"
if [[ "$call_count" == 2 ]]; then
  pass "测试文件名按 NUL 安全边界逐个执行"
else
  fail "测试文件名按 NUL 安全边界逐个执行"
  echo "    期望调用数：2"
  echo "    实际调用数：$call_count"
fi

echo "stop-server.sh 路径安全测试"

outside="$TEST_ROOT/outside"
mkdir -p "$outside/state"
: > "$outside/marker"
symlink_path="/tmp/brainstorm-link-$$-$RANDOM"
TEMP_PATHS+=("$symlink_path")
if node -e "require('fs').symlinkSync(process.argv[1], process.argv[2], process.platform === 'win32' ? 'junction' : 'dir')" "$outside" "$symlink_path" 2>/dev/null; then
  symlink_output="$($STOP_SERVER "$symlink_path" 2>&1)"
  symlink_status=$?
  assert_nonzero "$symlink_status" "拒绝 /tmp 下的会话符号链接"
  assert_contains "$symlink_output" "不安全的临时会话目录" "符号链接拒绝原因使用中文"
  if [[ -e "$outside/marker" ]]; then
    pass "符号链接外部目标未被删除"
  else
    fail "符号链接外部目标未被删除"
  fi
else
  fail "创建符号链接测试前置条件"
fi

traversal_parent="/tmp/brainstorm-runtime-parent-$$-$RANDOM"
traversal_target="/tmp/brainstorm-runtime-target-$$-$RANDOM"
TEMP_PATHS+=("$traversal_parent" "$traversal_target")
mkdir -p "$traversal_parent" "$traversal_target/state"
: > "$traversal_target/marker"
traversal_path="$traversal_parent/../$(basename "$traversal_target")"
traversal_output="$($STOP_SERVER "$traversal_path" 2>&1)"
traversal_status=$?
assert_nonzero "$traversal_status" "拒绝包含 .. 的临时会话路径"
assert_contains "$traversal_output" "不安全的临时会话目录" "路径穿越拒绝原因使用中文"
if [[ -e "$traversal_target/marker" ]]; then
  pass "路径穿越目标未被删除"
else
  fail "路径穿越目标未被删除"
fi

if [[ "$FAILURES" -eq 0 ]]; then
  echo "全部运行脚本行为测试通过"
else
  echo "$FAILURES 项运行脚本行为测试失败"
  exit 1
fi
