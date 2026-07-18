#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_UNDER_TEST="$REPO_ROOT/scripts/package-codex-plugin.sh"

if [[ ! -x "$SCRIPT_UNDER_TEST" ]]; then
  echo "[失败] 缺少可执行打包脚本：$SCRIPT_UNDER_TEST" >&2
  exit 1
fi

FAILURES=0
TEST_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TEST_ROOT"
}
trap cleanup EXIT

pass() {
  echo "  [通过] $1"
}

fail() {
  echo "  [失败] $1"
  FAILURES=$((FAILURES + 1))
}

assert_equals() {
  local actual="$1"
  local expected="$2"
  local description="$3"

  if [[ "$actual" == "$expected" ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    期望值：$expected"
    echo "    实际值：$actual"
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local description="$3"

  if printf '%s' "$haystack" | grep -Fq -- "$needle"; then
    pass "$description"
  else
    fail "$description"
    echo "    期望包含：$needle"
  fi
}

list_archive() {
  local archive_path="$1"

  case "$archive_path" in
    *.tar.gz|*.tgz)
      tar -tzf "$archive_path"
      ;;
    *.zip)
      python3 - "$archive_path" <<'PY'
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    for name in archive.namelist():
        print(name)
PY
      ;;
  esac
}

normalize_top_level() {
  awk -F/ 'NF { print $1 (NF == 1 ? "" : "/") }' |
    LC_ALL=C sort -u
}

read_archive_file() {
  local archive_path="$1"
  local file_path="$2"

  case "$archive_path" in
    *.tar.gz|*.tgz)
      tar -xOf "$archive_path" "$file_path"
      ;;
    *.zip)
      python3 - "$archive_path" "$file_path" <<'PY'
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    sys.stdout.buffer.write(archive.read(sys.argv[2]))
PY
      ;;
  esac
}

echo "Codex-only 插件归档测试"

zip_archive="$TEST_ROOT/superpowers-lite.zip"
tar_archive="$TEST_ROOT/superpowers-lite.tar.gz"
second_zip_archive="$TEST_ROOT/superpowers-lite-second.zip"
second_tar_archive="$TEST_ROOT/superpowers-lite-second.tar.gz"

if zip_output="$($SCRIPT_UNDER_TEST --allow-dirty --output "$zip_archive" 2>&1)"; then
  pass "打包脚本生成 ZIP 归档"
else
  fail "打包脚本生成 ZIP 归档"
  printf '%s\n' "$zip_output" | sed 's/^/      /'
fi

if tar_output="$($SCRIPT_UNDER_TEST --allow-dirty --format tar.gz --output "$tar_archive" 2>&1)"; then
  pass "打包脚本生成 tar.gz 归档"
else
  fail "打包脚本生成 tar.gz 归档"
  printf '%s\n' "$tar_output" | sed 's/^/      /'
fi

for archive in "$zip_archive" "$tar_archive"; do
  [[ -f "$archive" ]] || { fail "归档存在：$(basename "$archive")"; continue; }
  top_level="$(list_archive "$archive" | normalize_top_level)"
  expected_top_level="$(printf '%s\n' '.codex-plugin/' 'LICENSE' 'README.md' 'assets/' 'skills/' | LC_ALL=C sort)"
  assert_equals "$top_level" "$expected_top_level" "$(basename "$archive") 根层严格匹配白名单"
  archive_paths="$(list_archive "$archive")"
  assert_contains "$archive_paths" ".codex-plugin/plugin.json" "$(basename "$archive") 包含插件清单"
  assert_contains "$archive_paths" "skills/brainstorming/SKILL.md" "$(basename "$archive") 包含技能"
  manifest_name="$(read_archive_file "$archive" '.codex-plugin/plugin.json' | node -e 'let data=""; process.stdin.on("data", chunk => data += chunk); process.stdin.on("end", () => console.log(JSON.parse(data).name));')"
  assert_equals "$manifest_name" "superpowers-lite" "$(basename "$archive") 保留插件身份"
done

zip_metadata="$(python3 - "$zip_archive" <<'PY'
import stat
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    times = {entry.date_time for entry in archive.infolist()}
    task_brief = archive.getinfo("skills/subagent-driven-development/scripts/task-brief")
    mode = (task_brief.external_attr >> 16) & 0o777
    print("fixed" if times == {(1980, 1, 1, 0, 0, 0)} else "variable", oct(mode))
PY
)"
assert_equals "$zip_metadata" "fixed 0o755" "ZIP 固定时间戳并保留可执行位"

tar_metadata="$(python3 - "$tar_archive" <<'PY'
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:gz") as archive:
    members = archive.getmembers()
    task_brief = archive.getmember("skills/subagent-driven-development/scripts/task-brief")
    print("fixed" if all(member.mtime == 0 for member in members) else "variable", oct(task_brief.mode))
PY
)"
assert_equals "$tar_metadata" "fixed 0o755" "tar.gz 固定时间戳并保留可执行位"

assert_contains "$zip_output" "SHA-256:" "ZIP 输出 SHA-256"
assert_contains "$tar_output" "SHA-256:" "tar.gz 输出 SHA-256"

"$SCRIPT_UNDER_TEST" --allow-dirty --output "$second_zip_archive" >/dev/null
"$SCRIPT_UNDER_TEST" --allow-dirty --format tar.gz --output "$second_tar_archive" >/dev/null
if cmp -s "$zip_archive" "$second_zip_archive"; then
  pass "相同提交生成相同 ZIP"
else
  fail "相同提交生成相同 ZIP"
fi
if cmp -s "$tar_archive" "$second_tar_archive"; then
  pass "相同提交生成相同 tar.gz"
else
  fail "相同提交生成相同 tar.gz"
fi

if [[ "$FAILURES" -eq 0 ]]; then
  echo "全部 Codex-only 插件归档测试通过"
else
  echo "$FAILURES 项 Codex-only 插件归档测试失败"
  exit 1
fi
